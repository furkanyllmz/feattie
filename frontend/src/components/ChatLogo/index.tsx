import React from 'react';

interface ChatLogoProps {
  primaryColor?: string;
  size?: number;
}

export const ChatLogo: React.FC<ChatLogoProps> = ({ 
  primaryColor = '#000000',
  size = 40 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M34 20C34 27.732 27.732 34 20 34C17.5229 34 15.1977 33.3649 13.1637 32.2412L6 34L7.75875 26.8363C6.63508 24.8023 6 22.4771 6 20C6 12.268 12.268 6 20 6C27.732 6 34 12.268 34 20Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="20" r="2" fill="white" />
      <circle cx="20" cy="20" r="2" fill="white" />
      <circle cx="26" cy="20" r="2" fill="white" />
    </svg>
  );
};

export default ChatLogo;