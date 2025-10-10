import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';

interface ChatWidgetProps {
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonIcon?: string;
    buttonText?: string;
    title?: string;
  };
}

const Widget = styled.div<{ position: string; isOpen: boolean }>`
  position: fixed;
  ${props => props.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
  bottom: 90px;
  width: 380px;
  max-width: calc(100vw - 40px);
  z-index: 99999;
  transition: all 0.3s ease;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(20px)'};

  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    bottom: 80px;
  }
`;

const ChatWindow = styled.div<{ theme: ChatWidgetProps['theme'] }>`
  background: ${props => props.theme?.backgroundColor || 'white'};
  border-radius: ${props => props.theme?.borderRadius || '16px'};
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  font-family: ${props => props.theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: calc(100vh - 120px);
  overflow: hidden;
`;

const Header = styled.div<{ theme: ChatWidgetProps['theme'] }>`
  background: ${props => props.theme?.primaryColor || '#000'};
  color: white;
  padding: 1rem 1.25rem;
  border-radius: ${props => props.theme?.borderRadius || '16px'} ${props => props.theme?.borderRadius || '16px'} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.span`
  font-weight: 600;
  font-size: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Message = styled.div<{ type: string; theme: ChatWidgetProps['theme'] }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.theme?.borderRadius || '12px'};
  font-size: 0.9375rem;
  line-height: 1.5;

  ${props => props.type === 'user' ? `
    align-self: flex-end;
    background: ${props.theme?.primaryColor || '#000'};
    color: white;
    border-bottom-right-radius: 4px;
  ` : props.type === 'rag' ? `
    align-self: flex-start;
    background: #e9ecef;
    color: #495057;
    border: 1px solid #dee2e6;
    border-bottom-left-radius: 4px;
    font-family: monospace;
    font-size: 0.875rem;
  ` : `
    align-self: flex-start;
    background: #f8f9fa;
    color: ${props.theme?.textColor || '#333'};
    border-bottom-left-radius: 4px;
  `}
`;

const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input<{ theme: ChatWidgetProps['theme'] }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #dee2e6;
  border-radius: ${props => props.theme?.borderRadius || '12px'};
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${props => props.theme?.primaryColor || '#000'};
    box-shadow: 0 0 0 3px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}20` : 'rgba(0,0,0,0.1)'};
  }
`;

const SendButton = styled.button<{ theme: ChatWidgetProps['theme'] }>`
  background: ${props => props.theme?.primaryColor || '#000'};
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: ${props => props.theme?.borderRadius || '12px'};
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}40` : 'rgba(0,0,0,0.2)'};
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ToggleButton = styled.button<{ position: string; theme: ChatWidgetProps['theme'] }>`
  position: fixed;
  ${props => props.position.includes('right') ? 'right: 20px;' : 'left: 20px;'};
  bottom: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme?.primaryColor || '#000'};
  color: white;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 99998;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px ${props => props.theme?.primaryColor ? `${props.theme.primaryColor}40` : 'rgba(0,0,0,0.2)'};
  }

  &:active {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl = 'http://localhost:8000',
  position = 'bottom-right',
  theme = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string; text: string; type: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: 'Merhaba! Size nasıl yardımcı olabilirim? Ürünler hakkında soru sorabilirsiniz.',
        type: 'assistant'
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.text, top_k: 3 })
      });

      const data = await response.json();

      // Add RAG context if available
      if (data.context) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-rag',
          text: data.context,
          type: 'rag'
        }]);
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-assistant',
        text: data.response,
        type: 'assistant'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'assistant'
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
    <>
      <Widget position={position} isOpen={isOpen}>
        <ChatWindow theme={theme}>
          <Header theme={theme}>
            <HeaderTitle>{theme.title || 'Ürün Danışmanı'}</HeaderTitle>
            <CloseButton onClick={() => setIsOpen(false)}>&times;</CloseButton>
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
        </ChatWindow>
      </Widget>

      <ToggleButton
        position={position}
        onClick={() => setIsOpen(true)}
        theme={theme}
      >
        {theme.buttonIcon || '💬'}
      </ToggleButton>
    </>
  );
};

export default ChatWidget;