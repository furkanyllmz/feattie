import { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import api from '../../services/api';

const Container = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  height: calc(100vh - 60px);
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const ChatContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
`;

const Message = styled.div<{ isUser: boolean }>`
  margin-bottom: 16px;
  display: flex;
  justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${(props) => (props.isUser ? '#667eea' : 'white')};
  color: ${(props) => (props.isUser ? 'white' : '#333')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid #ecf0f1;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #5568d3;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TenantCard = styled.div<{ active: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${(props) => (props.active ? '#667eea' : '#f8f9fa')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  border: 2px solid ${(props) => (props.active ? '#667eea' : '#ecf0f1')};
  transition: all 0.3s;
  &:hover {
    border-color: #667eea;
  }
`;

const InfoBox = styled.div`
  padding: 12px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  margin-top: 20px;
  font-size: 13px;
`;

const ContextBox = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f0f0f0;
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  productsReferenced?: any[];
  contextsUsed?: string[];
  timestamp: Date;
}

export default function ChatTestPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTenants = async () => {
    try {
      const data = await api.getTenants({ isActive: true });
      setTenants(data);

      // Load last selected tenant from localStorage
      const savedTenantId = localStorage.getItem('selectedTenantId');
      if (savedTenantId) {
        const savedTenant = data.find((t: any) => t.id === parseInt(savedTenantId));
        if (savedTenant) {
          setSelectedTenant(savedTenant);
          return;
        }
      }

      // Default to first tenant if no saved selection
      if (data.length > 0) {
        setSelectedTenant(data[0]);
        localStorage.setItem('selectedTenantId', data[0].id.toString());
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedTenant || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(
        selectedTenant.id,
        input,
        sessionId || undefined
      );

      // Save session ID for context continuity
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        context: response.context,
        productsReferenced: response.productsReferenced,
        contextsUsed: response.contextsUsed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu: ' + (err.response?.data?.message || err.message),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId('');
  };

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 20 }}>Chat Test</h1>
      <Container>
        <Sidebar>
          <h3 style={{ marginTop: 0 }}>Tenant Seç</h3>
          {tenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              active={selectedTenant?.id === tenant.id}
              onClick={() => {
                setSelectedTenant(tenant);
                localStorage.setItem('selectedTenantId', tenant.id.toString());
                handleNewSession();
              }}
            >
              <div style={{ fontWeight: 600 }}>{tenant.name}</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                {tenant.productCount} ürün
              </div>
            </TenantCard>
          ))}

          {selectedTenant && (
            <InfoBox>
              <div><strong>Aktif Tenant:</strong></div>
              <div>{selectedTenant.name}</div>
              <div style={{ marginTop: 8 }}>
                <strong>Session ID:</strong>
                <div style={{ fontSize: '11px', wordBreak: 'break-all', marginTop: 4 }}>
                  {sessionId || 'Yeni session'}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Mesaj sayısı:</strong> {messages.length}
              </div>
              <Button
                onClick={handleNewSession}
                style={{ marginTop: 12, width: '100%', padding: '8px' }}
              >
                Yeni Konuşma
              </Button>
            </InfoBox>
          )}
        </Sidebar>

        <ChatContainer>
          <ChatHeader>
            <h2 style={{ margin: 0 }}>
              {selectedTenant ? selectedTenant.name : 'Tenant seçin'}
            </h2>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              Context tracking aktif - Her mesaj önceki mesajları hatırlar
            </div>
          </ChatHeader>

          <ChatMessages>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                Konuşmaya başlamak için bir mesaj gönderin
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx}>
                  <Message isUser={msg.role === 'user'}>
                    <MessageBubble isUser={msg.role === 'user'}>
                      {msg.content}
                      <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>
                        {msg.timestamp.toLocaleTimeString('tr-TR')}
                      </div>
                    </MessageBubble>
                  </Message>

                  {msg.context && (
                    <ContextBox>
                      <strong>Context kullanıldı:</strong>
                      {msg.contextsUsed && msg.contextsUsed.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          📋 {msg.contextsUsed.join(', ')}
                        </div>
                      )}
                      {msg.productsReferenced && msg.productsReferenced.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          🛍️ {msg.productsReferenced.length} ürün referanslandı
                        </div>
                      )}
                    </ContextBox>
                  )}

                  {msg.productsReferenced && msg.productsReferenced.length > 0 && (
                    <ProductsGrid>
                      {msg.productsReferenced.map((product) => (
                        <ProductCard key={product.id}>
                          {product.imageUrl && (
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.title}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <ProductInfo>
                            <ProductTitle>{product.title}</ProductTitle>
                            <ProductPrice>{product.price.toFixed(2)} TL</ProductPrice>
                          </ProductInfo>
                        </ProductCard>
                      ))}
                    </ProductsGrid>
                  )}
                </div>
              ))
            )}
            {loading && (
              <Message isUser={false}>
                <MessageBubble isUser={false}>
                  Düşünüyorum...
                </MessageBubble>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mesajınızı yazın..."
              disabled={!selectedTenant || loading}
            />
            <Button onClick={handleSendMessage} disabled={!selectedTenant || loading || !input.trim()}>
              Gönder
            </Button>
          </ChatInput>
        </ChatContainer>
      </Container>
    </div>
  );
}
