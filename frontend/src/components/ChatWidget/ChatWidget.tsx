import React, { useState } from 'react';
import styled from '@emotion/styled';
import ChatLogo from '../ChatLogo';

interface ChatWidgetProps {
  config: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    title: string;
    buttonIcon: string;
    position: 'bottom-right' | 'bottom-left';
    model: string;
  };
}

const WidgetContainer = styled.div<{ position: 'bottom-right' | 'bottom-left' }>`
  position: fixed;
  bottom: 24px;
  ${props => props.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
  z-index: 1000;
`;

const WidgetIcon = styled.div<{ bgColor: string }>`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.bgColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 12px 48px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px) scale(1);
  }

  img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }

  svg {
    width: 30px;
    height: 30px;
    position: relative;
    z-index: 1;
  }
`;

const ChatWindow = styled.div<{ isOpen: boolean; position: string }>`
  position: fixed;
  bottom: 100px;
  ${props => props.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 16px 64px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: ${props => props.isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ChatHeader = styled.div<{ bgColor: string; textColor: string }>`
  padding: 20px;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .model-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    margin-left: 10px;
    letter-spacing: 0.5px;
  }

  .close-button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.8;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      opacity: 1;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

const ChatMessages = styled.div<{ bgColor: string }>`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: ${props => props.bgColor};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }
`;

const Message = styled.div<{ isUser: boolean; primaryColor: string; textColor: string }>`
  margin: 10px 0;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: ${props => props.isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${props => props.isUser ? props.primaryColor : '#f8f9fa'};
  color: ${props => props.isUser ? '#fff' : props.textColor};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-size: 0.9375rem;
  line-height: 1.5;
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
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatInput = styled.div<{ primaryColor: string; textColor: string }>`
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 12px;
  background: white;

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    outline: none;
    font-size: 14px;
    color: ${props => props.textColor};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      border-color: ${props => props.primaryColor};
      box-shadow: 0 0 0 3px ${props => props.primaryColor}15;
    }

    &:hover {
      border-color: rgba(0, 0, 0, 0.15);
    }

    &::placeholder {
      color: #adb5bd;
    }
  }

  button {
    padding: 12px 18px;
    background: ${props => props.primaryColor};
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px ${props => props.primaryColor}40;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${props => props.primaryColor}50;
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px ${props => props.primaryColor}40;
    }
  }
`;

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage('');
      // TODO: Implement API call to send message
    }
  };

  const renderIcon = () => {
    if (config.buttonIcon === 'default') {
      return <ChatLogo primaryColor="white" size={32} />;
    } else if (config.buttonIcon.startsWith('data:')) {
      return <img src={config.buttonIcon} alt="Chat Icon" />;
    } else {
      return config.buttonIcon;
    }
  };

  return (
    <WidgetContainer position={config.position}>
      <WidgetIcon
        bgColor={config.primaryColor}
        onClick={() => setIsOpen(!isOpen)}
      >
        {renderIcon()}
      </WidgetIcon>
      
      <ChatWindow isOpen={isOpen} position={config.position}>
        <ChatHeader bgColor={config.primaryColor} textColor="white">
          <div className="header-left">
            {config.title}
          </div>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </ChatHeader>
        <ChatMessages bgColor={config.backgroundColor}>
          <MessagesContainer>
            {messages.map((msg, index) => (
              <Message 
                key={index} 
                isUser={index % 2 === 1}
                primaryColor={config.primaryColor}
                textColor={config.textColor}
              >
                {msg}
              </Message>
            ))}
          </MessagesContainer>
        </ChatMessages>
        <ChatInput primaryColor={config.primaryColor} textColor={config.textColor}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Gönder
          </button>
        </ChatInput>
      </ChatWindow>
    </WidgetContainer>
  );
};