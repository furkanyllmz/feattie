import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import ChatConfigPanel from './ChatConfigPanel';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant' | 'rag';
  timestamp: Date;
}

interface ThemeConfig {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
  backgroundColor: string;
  textColor: string;
  buttonIcon: string;
  buttonText: string;
  title: string;
  position: 'bottom-right' | 'bottom-left';
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
}

interface ChatPageProps {
  theme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

const PageContainer = styled.div`
  display: flex;
  padding: 2.5rem;
  gap: 2rem;
  height: calc(100vh - 69px);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const PreviewContainer = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ConfigContainer = styled.div`
  width: 450px;
  height: 100%;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }
`;

const ChatContainer = styled.div<{ theme: ChatPageProps['theme'] }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme?.backgroundColor || 'white'};
  font-family: ${props => props.theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
  color: ${props => props.theme?.textColor || '#1a1a1a'};
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const Header = styled.header<{ theme: ChatPageProps['theme'] }>`
  background: ${props => props.theme?.primaryColor || '#1a1a1a'};
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: -0.01em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }
`;

const Message = styled.div<{ type: string; theme: ChatPageProps['theme'] }>`
  max-width: 75%;
  padding: 1rem 1.25rem;
  border-radius: ${props => props.theme?.borderRadius || '12px'};
  line-height: 1.6;
  animation: messageSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes messageSlide {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${props => props.type === 'user' ? `
    align-self: flex-end;
    background: ${props.theme?.primaryColor || '#1a1a1a'};
    color: white;
    border-radius: 16px 16px 4px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  ` : props.type === 'rag' ? `
    align-self: flex-start;
    background: #f8f9fa;
    color: #495057;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px 16px 16px 4px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  ` : `
    align-self: flex-start;
    background: white;
    color: #495057;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  `}
`;

const InputArea = styled.div`
  padding: 1.25rem 1.5rem;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 1rem;
`;

const Input = styled.input<{ theme: ChatPageProps['theme'] }>`
  flex: 1;
  padding: 0.875rem 1.125rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${props => props.theme?.borderRadius || '12px'};
  font-size: 0.9375rem;
  outline: none;
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    border-color: ${props => props.theme?.primaryColor || '#1a1a1a'};
    box-shadow: 0 0 0 3px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}15` : 'rgba(0, 0, 0, 0.05)'};
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const SendButton = styled.button<{ theme: ChatPageProps['theme'] }>`
  background: ${props => props.theme?.primaryColor || '#1a1a1a'};
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: ${props => props.theme?.borderRadius || '12px'};
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}40` : 'rgba(0, 0, 0, 0.15)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}50` : 'rgba(0, 0, 0, 0.2)'};
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}40` : 'rgba(0, 0, 0, 0.15)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ChatPage: React.FC<ChatPageProps> = ({ theme, onThemeChange }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Size nasıl yardımcı olabilirim?',
      type: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call your API here
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.text }),
      });

      const data = await response.json();

      // Add RAG context as a separate message if available
      if (data.context) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-rag',
          text: data.context,
          type: 'rag',
          timestamp: new Date(),
        }]);
      }

      // Add assistant's response
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-assistant',
        text: data.response,
        type: 'assistant',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'assistant',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PageContainer>
      <PreviewContainer>
        <ChatContainer theme={theme}>
          <Header theme={theme}>
            <h1>{theme.title}</h1>
          </Header>
          
          <MessagesContainer>
            {messages.map(message => (
              <Message key={message.id} type={message.type} theme={theme}>
                {message.text}
              </Message>
            ))}
            {isLoading && (
              <Message type="assistant" theme={theme}>
                Düşünüyorum...
              </Message>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea>
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ürünler hakkında soru sorun..."
              disabled={isLoading}
              theme={theme}
            />
            <SendButton
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              theme={theme}
            >
              Gönder
            </SendButton>
          </InputArea>
        </ChatContainer>
      </PreviewContainer>

      <ConfigContainer>
        <ChatConfigPanel
          config={theme}
          onChange={onThemeChange}
        />
      </ConfigContainer>
    </PageContainer>
  );
};

export default ChatPage;