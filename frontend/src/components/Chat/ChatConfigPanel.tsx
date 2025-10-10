import React, { useState } from 'react';
import styled from '@emotion/styled';
import { HexColorPicker, RgbaColorPicker } from 'react-colorful';
import ChatLogo from '../ChatLogo';
import { ChatWidget } from '../ChatWidget/ChatWidget';

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

interface ChatConfigProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

const ConfigContainer = styled.div`
  padding: 0;
  background: transparent;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.75rem 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

const Option = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: white;
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
`;

const SaveButton = styled.button<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, ${props => props.bgColor} 0%, ${props => props.bgColor}dd 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  margin-top: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px ${props => props.bgColor}40;
  letter-spacing: -0.01em;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px ${props => props.bgColor}50;
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px ${props => props.bgColor}40;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #0f172a;
  font-size: 0.875rem;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  font-size: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  font-size: 0.9375rem;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: #fafbff;
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 100%;
  height: 56px;
  background: ${props => props.color};
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.15) 100%);
    pointer-events: none;
  }

  &::before {
    content: '🎨';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    border-color: rgba(0, 0, 0, 0.12);

    &::before {
      opacity: 0.8;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const ColorPickerContainer = styled.div`
  position: absolute;
  z-index: 1000;
  margin-top: 12px;
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04);
  width: 340px;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SaveColorButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  letter-spacing: -0.01em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ColorFormats = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 6px;
  background: #f8fafc;
  border-radius: 12px;
`;

const FormatButton = styled.button<{ active?: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0'};
    color: ${props => props.active ? 'white' : '#475569'};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ColorInputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  align-items: stretch;
`;

const ColorInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  font-size: 0.875rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  outline: none;
  background: #f8fafc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: white;
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    background: white;
  }
`;

const ColorPickerWrapper = styled.div`
  margin-bottom: 16px;

  .react-colorful {
    width: 100%;
    height: 220px;
    border-radius: 16px;
    box-shadow: none;
  }

  .react-colorful__saturation {
    border-radius: 16px 16px 0 0;
    border-bottom: none;
  }

  .react-colorful__hue,
  .react-colorful__alpha {
    height: 16px;
    border-radius: 8px;
    margin-top: 14px;
  }

  .react-colorful__pointer {
    width: 24px;
    height: 24px;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .react-colorful__saturation-pointer {
    width: 28px;
    height: 28px;
  }
`;

const PresetColorsSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(0, 0, 0, 0.04);
`;

const PresetColorsLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PresetColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
`;

const PresetColor = styled.button<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.color};
  border: 2px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &::after {
    content: '✓';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  &:hover {
    transform: scale(1.2);
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    z-index: 1;

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(1.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(0, 0, 0, 0.04);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  font-size: 0.9375rem;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23475569' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 3rem;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background-color: #fafbff;
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
  }
`;

interface ColorPickerState {
  isOpen: boolean;
  type: 'primary' | 'background' | 'text';
}

interface SavedColorsState {
  [key: string]: string[];
}

const ChatConfigPanel: React.FC<ChatConfigProps> = ({ config, onChange }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    isOpen: false,
    type: 'primary'
  });
  const [savedColors, setSavedColors] = useState<SavedColorsState>(() => {
    const saved = localStorage.getItem('savedColors');
    return saved ? JSON.parse(saved) : {
      primary: [],
      background: [],
      text: []
    };
  });
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgba'>('hex');

  // Preset colors
  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#1a1a1a', '#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0', '#e2e8f0', '#f7fafc',
    '#ff6b6b', '#ee5a6f', '#f06595', '#cc5de8', '#845ef7', '#5c7cfa', '#339af0', '#22b8cf',
    '#20c997', '#51cf66', '#94d82d', '#fcc419', '#ff922b', '#ff6b6b', '#fa5252', '#e03131',
  ];

  // Color conversion utility
  const parseRgbaColor = (color: string): { r: number; g: number; b: number; a: number } => {
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1
      };
    }
    // If it's a hex color, convert it
    const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (hex) {
      return {
        r: parseInt(hex[1], 16),
        g: parseInt(hex[2], 16),
        b: parseInt(hex[3], 16),
        a: 1
      };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  };

  const handleSaveColor = (color: string, type: ColorPickerState['type']) => {
    setSavedColors(prev => {
      const newColors = {
        ...prev,
        [type]: [...new Set([...prev[type], color])].slice(-10)
      };
      localStorage.setItem('savedColors', JSON.stringify(newColors));
      return newColors;
    });
  };
  
  const handleChange = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setIsDirty(true);
    onChange(newConfig);
  };

  const handleSave = () => {
    localStorage.setItem('chatTheme', JSON.stringify(config));
    setIsDirty(false);
  };

  const handleColorChange = (color: string, type: ColorPickerState['type']) => {
    switch (type) {
      case 'primary':
        handleChange('primaryColor', color);
        break;
      case 'background':
        handleChange('backgroundColor', color);
        break;
      case 'text':
        handleChange('textColor', color);
        break;
    }
  };

  const handleManualColorInput = (value: string, type: ColorPickerState['type']) => {
    // Validate and update color
    if (value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      handleColorChange(value, type);
    } else if (value.match(/^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/)) {
      handleColorChange(value, type);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        alert('Dosya boyutu çok büyük. Lütfen 500KB\'dan küçük bir dosya seçin.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleChange('buttonIcon', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const fontFamilies = [
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    '"Inter", sans-serif',
    '"SF Pro Display", sans-serif'
  ];

  return (
    <ConfigContainer>
      <Section>
        <SectionTitle>Temel Ayarlar</SectionTitle>
        <OptionGrid>
          <Option>
            <Label>Chat Başlığı</Label>
            <div>
              <Input
                type="text"
                value={config.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ör: AI Asistan, Ürün Danışmanı, Sohbet Robotu"
              />
              <div style={{ 
                marginTop: '8px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {['AI Asistan', 'Ürün Danışmanı', 'Sohbet Robotu', 'Feattie Bot'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => handleChange('title', suggestion)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: config.title === suggestion ? config.primaryColor : 'transparent',
                      color: config.title === suggestion ? 'white' : '#666',
                      border: `1px solid ${config.title === suggestion ? config.primaryColor : '#dee2e6'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </Option>

          <Option>
            <Label>Pozisyon</Label>
            <Select
              value={config.position}
              onChange={(e) => handleChange('position', e.target.value)}
            >
              <option value="bottom-right">Sağ Alt</option>
              <option value="bottom-left">Sol Alt</option>
            </Select>
          </Option>

          <Option>
            <Label>Buton İkonu</Label>
            <div>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '12px',
                flexWrap: 'wrap'
              }}>
                {/* Varsayılan Logo Seçeneği */}
                <div 
                  onClick={() => handleChange('buttonIcon', 'default')}
                  style={{ 
                    width: '80px',
                    height: '80px',
                    background: config.buttonIcon === 'default' ? config.primaryColor : '#f8f9fa',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: `2px solid ${config.buttonIcon === 'default' ? config.primaryColor : '#dee2e6'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <ChatLogo 
                    primaryColor={config.buttonIcon === 'default' ? 'white' : config.primaryColor} 
                    size={40} 
                  />
                </div>

                {/* Emoji Seçeneği */}
                <div 
                  onClick={() => {
                    const emoji = prompt('Emoji girin:');
                    if (emoji) handleChange('buttonIcon', emoji);
                  }}
                  style={{ 
                    width: '80px',
                    height: '80px',
                    background: config.buttonIcon !== 'default' && !config.buttonIcon.startsWith('data:') ? config.primaryColor : '#f8f9fa',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: `2px solid ${config.buttonIcon !== 'default' && !config.buttonIcon.startsWith('data:') ? config.primaryColor : '#dee2e6'}`,
                    fontSize: '32px',
                    transition: 'all 0.2s'
                  }}
                >
                  {config.buttonIcon !== 'default' && !config.buttonIcon.startsWith('data:') ? config.buttonIcon : '😊'}
                </div>

                {/* Resim Yükleme Seçeneği */}
                <div 
                  style={{ 
                    width: '80px',
                    height: '80px',
                    background: config.buttonIcon.startsWith('data:') ? config.primaryColor : '#f8f9fa',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: `2px solid ${config.buttonIcon.startsWith('data:') ? config.primaryColor : '#dee2e6'}`,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {config.buttonIcon.startsWith('data:') ? (
                    <img 
                      src={config.buttonIcon} 
                      alt="Custom Icon" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                marginTop: '12px', 
                fontSize: '13px', 
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px' 
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Varsayılan logo, emoji veya özel resim seçebilirsiniz (max: 500KB)
              </div>
            </div>
          </Option>
        </OptionGrid>
      </Section>

      <Section>
        <SectionTitle>Görünüm</SectionTitle>
        <OptionGrid>
          <Option>
            <Label>Ana Renk</Label>
            <div style={{ position: 'relative' }}>
              <ColorPreview
                color={config.primaryColor}
                onClick={() => setColorPicker({ isOpen: true, type: 'primary' })}
              />
              {colorPicker.isOpen && colorPicker.type === 'primary' && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 999, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setColorPicker({ isOpen: false, type: 'primary' })}
                  />
                  <ColorPickerContainer>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                    <ColorFormats>
                      <FormatButton
                        active={colorFormat === 'hex'}
                        onClick={() => setColorFormat('hex')}
                      >
                        HEX
                      </FormatButton>
                      <FormatButton
                        active={colorFormat === 'rgba'}
                        onClick={() => setColorFormat('rgba')}
                      >
                        RGBA
                      </FormatButton>
                    </ColorFormats>
                    
                    <ColorPickerWrapper>
                      {colorFormat === 'hex' ? (
                        <HexColorPicker
                          color={config.primaryColor}
                          onChange={(color) => handleColorChange(color, 'primary')}
                        />
                      ) : (
                        <RgbaColorPicker
                          color={parseRgbaColor(config.primaryColor)}
                          onChange={(color) => {
                            const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                            handleColorChange(rgba, 'primary');
                          }}
                        />
                      )}
                    </ColorPickerWrapper>

                    <ColorInputGroup>
                      <ColorInput
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => handleManualColorInput(e.target.value, 'primary')}
                        placeholder={colorFormat === 'hex' ? '#000000' : 'rgba(0,0,0,1)'}
                      />
                      <button
                        onClick={() => handleColorChange('#007AFF', 'primary')}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f8f9fa';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4M4 12C4 7.58172 7.58172 4 12 4M4 12H2M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Reset
                      </button>
                    </ColorInputGroup>

                    <PresetColorsSection>
                      <PresetColorsLabel>Hazır Renkler</PresetColorsLabel>
                      <PresetColorsGrid>
                        {presetColors.map((color, index) => (
                          <PresetColor
                            key={index}
                            color={color}
                            onClick={() => handleColorChange(color, 'primary')}
                            title={color}
                          />
                        ))}
                      </PresetColorsGrid>
                    </PresetColorsSection>

                    {savedColors.primary.length > 0 && (
                      <PresetColorsSection>
                        <PresetColorsLabel>Kaydedilen Renkler</PresetColorsLabel>
                        <PresetColorsGrid>
                          {savedColors.primary.map((color, index) => (
                            <PresetColor
                              key={index}
                              color={color}
                              onClick={() => handleColorChange(color, 'primary')}
                              title={color}
                            />
                          ))}
                        </PresetColorsGrid>
                      </PresetColorsSection>
                    )}

                    <ActionButtons>
                      <SaveColorButton
                        onClick={() => handleSaveColor(config.primaryColor, 'primary')}
                      >
                        💾 Rengi Kaydet
                      </SaveColorButton>
                    </ActionButtons>
                  </div>
                </ColorPickerContainer>
                </>
              )}
            </div>
          </Option>

          <Option>
            <Label>Arka Plan Rengi</Label>
            <div style={{ position: 'relative' }}>
              <ColorPreview
                color={config.backgroundColor}
                onClick={() => setColorPicker({ isOpen: true, type: 'background' })}
              />
              {colorPicker.isOpen && colorPicker.type === 'background' && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 999, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setColorPicker({ isOpen: false, type: 'background' })}
                  />
                  <ColorPickerContainer>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                    <ColorFormats>
                      <FormatButton
                        active={colorFormat === 'hex'}
                        onClick={() => setColorFormat('hex')}
                      >
                        HEX
                      </FormatButton>
                      <FormatButton
                        active={colorFormat === 'rgba'}
                        onClick={() => setColorFormat('rgba')}
                      >
                        RGBA
                      </FormatButton>
                    </ColorFormats>
                    
                    <ColorPickerWrapper>
                      {colorFormat === 'hex' ? (
                        <HexColorPicker
                          color={config.backgroundColor}
                          onChange={(color) => handleColorChange(color, 'background')}
                        />
                      ) : (
                        <RgbaColorPicker
                          color={parseRgbaColor(config.backgroundColor)}
                          onChange={(color) => {
                            const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                            handleColorChange(rgba, 'background');
                          }}
                        />
                      )}
                    </ColorPickerWrapper>

                    <ColorInputGroup>
                      <ColorInput
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => handleManualColorInput(e.target.value, 'background')}
                        placeholder={colorFormat === 'hex' ? '#FFFFFF' : 'rgba(255,255,255,1)'}
                      />
                      <button
                        onClick={() => handleColorChange('#F8F9FA', 'background')}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f8f9fa';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4M4 12C4 7.58172 7.58172 4 12 4M4 12H2M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Reset
                      </button>
                    </ColorInputGroup>

                    <PresetColorsSection>
                      <PresetColorsLabel>Hazır Renkler</PresetColorsLabel>
                      <PresetColorsGrid>
                        {presetColors.map((color, index) => (
                          <PresetColor
                            key={index}
                            color={color}
                            onClick={() => handleColorChange(color, 'background')}
                            title={color}
                          />
                        ))}
                      </PresetColorsGrid>
                    </PresetColorsSection>

                    {savedColors.background.length > 0 && (
                      <PresetColorsSection>
                        <PresetColorsLabel>Kaydedilen Renkler</PresetColorsLabel>
                        <PresetColorsGrid>
                          {savedColors.background.map((color, index) => (
                            <PresetColor
                              key={index}
                              color={color}
                              onClick={() => handleColorChange(color, 'background')}
                              title={color}
                            />
                          ))}
                        </PresetColorsGrid>
                      </PresetColorsSection>
                    )}

                    <ActionButtons>
                      <SaveColorButton
                        onClick={() => handleSaveColor(config.backgroundColor, 'background')}
                      >
                        💾 Rengi Kaydet
                      </SaveColorButton>
                    </ActionButtons>
                  </div>
                </ColorPickerContainer>
                </>
              )}
            </div>
          </Option>

          <Option>
            <Label>Yazı Rengi</Label>
            <div style={{ position: 'relative' }}>
              <ColorPreview
                color={config.textColor}
                onClick={() => setColorPicker({ isOpen: true, type: 'text' })}
              />
              {colorPicker.isOpen && colorPicker.type === 'text' && (
                <>
                <div
                  style={{ 
                    position: 'fixed', 
                    top: 0, 
                    right: 0, 
                    bottom: 0, 
                    left: 0, 
                    zIndex: 999,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)'
                  }}
                  onClick={() => setColorPicker({ isOpen: false, type: 'text' })}
                />
                <ColorPickerContainer>
                  <div style={{ position: 'relative', zIndex: 1000 }}>
                    <ColorFormats>
                      <FormatButton
                        active={colorFormat === 'hex'}
                        onClick={() => setColorFormat('hex')}
                      >
                        HEX
                      </FormatButton>
                      <FormatButton
                        active={colorFormat === 'rgba'}
                        onClick={() => setColorFormat('rgba')}
                      >
                        RGBA
                      </FormatButton>
                    </ColorFormats>
                    
                    <ColorPickerWrapper>
                      {colorFormat === 'hex' ? (
                        <HexColorPicker
                          color={config.textColor}
                          onChange={(color) => handleColorChange(color, 'text')}
                        />
                      ) : (
                        <RgbaColorPicker
                          color={parseRgbaColor(config.textColor)}
                          onChange={(color) => {
                            const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
                            handleColorChange(rgba, 'text');
                          }}
                        />
                      )}
                    </ColorPickerWrapper>

                    <ColorInputGroup>
                      <ColorInput
                        type="text"
                        value={config.textColor}
                        onChange={(e) => handleManualColorInput(e.target.value, 'text')}
                        placeholder={colorFormat === 'hex' ? '#000000' : 'rgba(0,0,0,1)'}
                      />
                      <button
                        onClick={() => handleColorChange('#212529', 'text')}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'transparent',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f8f9fa';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4M4 12C4 7.58172 7.58172 4 12 4M4 12H2M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Reset
                      </button>
                    </ColorInputGroup>

                    <PresetColorsSection>
                      <PresetColorsLabel>Hazır Renkler</PresetColorsLabel>
                      <PresetColorsGrid>
                        {presetColors.map((color, index) => (
                          <PresetColor
                            key={index}
                            color={color}
                            onClick={() => handleColorChange(color, 'text')}
                            title={color}
                          />
                        ))}
                      </PresetColorsGrid>
                    </PresetColorsSection>

                    {savedColors.text.length > 0 && (
                      <PresetColorsSection>
                        <PresetColorsLabel>Kaydedilen Renkler</PresetColorsLabel>
                        <PresetColorsGrid>
                          {savedColors.text.map((color, index) => (
                            <PresetColor
                              key={index}
                              color={color}
                              onClick={() => handleColorChange(color, 'text')}
                              title={color}
                            />
                          ))}
                        </PresetColorsGrid>
                      </PresetColorsSection>
                    )}

                    <ActionButtons>
                      <SaveColorButton
                        onClick={() => handleSaveColor(config.textColor, 'text')}
                      >
                        💾 Rengi Kaydet
                      </SaveColorButton>
                    </ActionButtons>
                  </div>
                </ColorPickerContainer>
                </>
              )}
            </div>
          </Option>

          <Option>
            <Label>Yazı Tipi</Label>
            <Select
              value={config.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>{font.split(',')[0].replace(/["']/g, '')}</option>
              ))}
            </Select>
          </Option>

          <Option>
            <Label>Köşe Yuvarlaklığı</Label>
            <Input
              type="text"
              value={config.borderRadius}
              onChange={(e) => handleChange('borderRadius', e.target.value)}
              placeholder="12px"
            />
          </Option>
        </OptionGrid>
      </Section>

      <Section>
        <SectionTitle>Model Seçimi ve Önizleme</SectionTitle>
        <OptionGrid>
          <Option>
            <Label>AI Modeli</Label>
            <Select
              value={config.model}
              onChange={(e) => handleChange('model', e.target.value)}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </Select>
          </Option>
        </OptionGrid>

        <div style={{ width: '320px' }}>
          <ChatWidget config={config} />
        </div>
      </Section>

      <SaveButton bgColor={config.primaryColor} onClick={handleSave}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        {isDirty ? 'Değişiklikleri Kaydet' : 'Kaydedildi'}
      </SaveButton>
    </ConfigContainer>
  );
};

export default ChatConfigPanel;