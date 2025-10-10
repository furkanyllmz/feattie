import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import ChatPage from './components/Chat/ChatPage';
import ChatWidget from './components/Chat/ChatWidget';

import IntegrationPage from './components/Documentation/IntegrationPage';
import './App.css'

const Navigation = styled.nav`
  padding: 1.25rem 2.5rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 0.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: #000;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - 69px);
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 4rem 2.5rem;
  
  h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 1.25rem;
    color: #6c757d;
    max-width: 650px;
    line-height: 1.7;
    font-weight: 400;
  }
`;

const defaultTheme = {
  primaryColor: '#000000',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: '12px',
  backgroundColor: '#FFFFFF',
  textColor: '#333333',
  buttonIcon: '💬',
  buttonText: 'Yardım',
  title: 'Ürün Danışmanı',
  position: 'bottom-right' as 'bottom-right' | 'bottom-left',
  model: 'gpt-3.5-turbo' as 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo'
};

export function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('chatTheme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  // Tema değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('chatTheme', JSON.stringify(theme));
  }, [theme]);



  return (
    <Router>
      <Navigation>
        <NavList>
          <li><NavLink to="/">Ana Sayfa</NavLink></li>
          <li><NavLink to="/chat">Chat & Ayarlar</NavLink></li>
          <li><NavLink to="/docs">Entegrasyon</NavLink></li>
        </NavList>
      </Navigation>

      <Routes>
        <Route path="/" element={
          <MainContainer>
            <ContentWrapper>
              <h1>Hoş Geldiniz</h1>
              <p>Sol alttaki chat ikonuna tıklayarak ürün danışmanı ile konuşmaya başlayabilirsiniz.</p>
              <ChatWidget theme={theme} position={theme.position || 'bottom-right'} />
            </ContentWrapper>
          </MainContainer>
        } />
        <Route path="/chat" element={
          <ChatPage theme={theme} onThemeChange={setTheme} />
        } />
        <Route path="/docs" element={<IntegrationPage />} />
      </Routes>
    </Router>
  );
}
