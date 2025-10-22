import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../services/api';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #34495e;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const NavLink = styled(Link)`
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
  &:hover {
    background: #34495e;
  }
  &.active {
    background: #3498db;
  }
`;

const LogoutButton = styled.button`
  margin-top: auto;
  padding: 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: #c0392b;
  }
`;

const Main = styled.main`
  flex: 1;
  background: #ecf0f1;
  padding: 30px;
  overflow-y: auto;
`;

const UserInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #34495e;
  border-radius: 6px;
  font-size: 14px;
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (err) {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Container>
      <Sidebar>
        <Logo>Feattie Admin</Logo>
        <Nav>
          <NavLink to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/tenants">Tenant Yönetimi</NavLink>
          <NavLink to="/admin/chat-test">Chat Test</NavLink>
        </Nav>
        {user && (
          <UserInfo>
            <div><strong>{user.user?.email}</strong></div>
            <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
              Role: {user.user?.role === 1 ? 'Admin' : 'User'}
            </div>
          </UserInfo>
        )}
        <LogoutButton onClick={handleLogout} style={{ marginTop: '20px' }}>
          Çıkış Yap
        </LogoutButton>
      </Sidebar>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
}
