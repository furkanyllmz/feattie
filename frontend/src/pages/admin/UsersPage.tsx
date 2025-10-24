import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../../services/api';

const Container = styled.div`
  max-width: 1200px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background: #f8f9fa;
  }

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }

  th {
    font-weight: 600;
    color: #2c3e50;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }
`;

const Badge = styled.span<{ variant: 'success' | 'warning' | 'danger' | 'info' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => {
    switch (props.variant) {
      case 'success': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'danger': return '#f8d7da';
      case 'info': return '#d1ecf1';
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case 'success': return '#155724';
      case 'warning': return '#856404';
      case 'danger': return '#721c24';
      case 'info': return '#0c5460';
    }
  }};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button<{ variant?: 'danger' | 'info' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => props.variant === 'danger' ? '#e74c3c' : '#3498db'};
  color: white;
  &:hover {
    background: ${(props) => props.variant === 'danger' ? '#c0392b' : '#2980b9'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #e74c3c;
`;

const HelperText = styled.span`
  font-size: 12px;
  color: #7f8c8d;
`;

export default function UsersPage() {
  const { user } = useOutletContext<{ user: any }>();
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userTenants, setUserTenants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '0',
    firstName: '',
    lastName: '',
  });
  const [tenantFormData, setTenantFormData] = useState({
    tenantId: '',
    role: 'VIEWER',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.user?.role === 1;

  useEffect(() => {
    loadUsers();
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (!formData.email || !formData.password) {
        setFormError('Email ve şifre zorunludur.');
        return;
      }

      if (formData.password.length < 6) {
        setFormError('Şifre en az 6 karakter olmalıdır.');
        return;
      }

      // Register user
      const newUser = await api.register(formData.email, formData.password);
      
      // Update role if admin
      if (formData.role === '1' && isAdmin) {
        await api.updateUserRole(newUser.id, parseInt(formData.role));
      }

      alert(`Kullanıcı oluşturuldu: ${formData.email}`);
      setShowModal(false);
      setFormData({
        email: '',
        password: '',
        role: '0',
        firstName: '',
        lastName: '',
      });
      loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Kullanıcı oluşturma hatası');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanUser = async (userId: number) => {
    const reason = prompt('Yasaklama nedeni:');
    if (!reason) return;

    try {
      await api.banUser(userId, { reason, durationDays: 30 });
      alert('Kullanıcı yasaklandı');
      loadUsers();
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      await api.unbanUser(userId);
      alert('Yasak kaldırıldı');
      loadUsers();
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenTenantModal = async (u: any) => {
    setSelectedUser(u);
    try {
      const tenantUsers = await api.getTenantUsers(u.id);
      setUserTenants(tenantUsers);
    } catch (err) {
      console.error('Error loading tenant users:', err);
      setUserTenants([]);
    }
    setShowTenantModal(true);
  };

  const handleAddTenantToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantFormData.tenantId || !selectedUser) return;

    try {
      await api.addUserToTenant(parseInt(tenantFormData.tenantId), selectedUser.id, tenantFormData.role);
      alert('Kullanıcı tenant\'a eklendi');
      setTenantFormData({ tenantId: '', role: 'VIEWER' });
      // Reload tenant users
      const tenantUsers = await api.getTenantUsers(selectedUser.id);
      setUserTenants(tenantUsers);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      if (errorMsg === 'User already in tenant') {
        alert('Bu kullanıcı zaten bu tenant\'a atanmış.');
      } else {
        alert('Hata: ' + errorMsg);
      }
    }
  };

  const handleRemoveTenantFromUser = async (tenantId: number, tenantUserId: number) => {
    if (!selectedUser) return;
    try {
      await api.removeUserFromTenant(tenantId, tenantUserId);
      alert('Kullanıcı tenant\'dan kaldırıldı');
      const tenantUsers = await api.getTenantUsers(selectedUser.id);
      setUserTenants(tenantUsers);
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <Card>Yükleniyor...</Card>;
  }

  return (
    <Container>
      <Header>
        <h1 style={{ margin: 0 }}>Kullanıcı Yönetimi</h1>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)}>+ Yeni Kullanıcı</Button>
        )}
      </Header>

      {users.length === 0 ? (
        <Card>
          <p>Henüz kullanıcı bulunmuyor.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Ad Soyad</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Son Giriş</th>
                <th>Oluşturulma</th>
                {isAdmin && <th>İşlemler</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{u.email}</div>
                    {u.fullName && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {u.fullName}
                      </div>
                    )}
                  </td>
                  <td>{u.fullName || '-'}</td>
                  <td>
                    <Badge variant={u.roleNumber === 1 ? 'danger' : 'info'}>
                      {u.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.isBanned ? 'danger' : u.status === '✅ ACTIVE' ? 'success' : 'warning'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('tr-TR') : '-'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                  {isAdmin && (
                    <td>
                      <Actions>
                        <SmallButton onClick={() => handleOpenTenantModal(u)}>
                          🏢 Tenants
                        </SmallButton>
                        {u.isBanned ? (
                          <SmallButton variant="info" onClick={() => handleUnbanUser(u.id)}>
                            🔓 Aç
                          </SmallButton>
                        ) : (
                          <SmallButton variant="danger" onClick={() => handleBanUser(u.id)}>
                            🚫 Kapat
                          </SmallButton>
                        )}
                      </Actions>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Yeni Kullanıcı Oluştur</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleCreateUser}>
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="kullanici@example.com"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Şifre *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 karakter"
                  required
                />
                <HelperText>Minimum 6 karakter</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="0">Kullanıcı</option>
                  <option value="1">Admin</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Ad (Opsiyonel)</Label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Ad"
                />
              </FormGroup>

              <FormGroup>
                <Label>Soyad (Opsiyonel)</Label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Soyad"
                />
              </FormGroup>

              {formError && <ErrorText>{formError}</ErrorText>}

              <Button type="submit" disabled={submitting}>
                {submitting ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showTenantModal && selectedUser && (
        <Modal onClick={() => setShowTenantModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {selectedUser.fullName || selectedUser.email} - Tenant Atama
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontWeight: 'normal' }}>
                  {selectedUser.email}
                </div>
              </ModalTitle>
              <CloseButton onClick={() => setShowTenantModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleAddTenantToUser}>
              <FormGroup>
                <Label>Tenant Seçin *</Label>
                <Select
                  value={tenantFormData.tenantId}
                  onChange={(e) => setTenantFormData((prev) => ({ ...prev, tenantId: e.target.value }))}
                  required
                >
                  <option value="">-- Tenant Seçin --</option>
                  {tenants.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Rol</Label>
                <Select
                  value={tenantFormData.role}
                  onChange={(e) => setTenantFormData((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="VIEWER">👁️ Viewer (Sadece Görüntüleme)</option>
                  <option value="EDITOR">✏️ Editor (Düzenleme)</option>
                  <option value="ADMIN">👑 Admin (Tam Kontrol)</option>
                </Select>
              </FormGroup>

              <Button type="submit">Tenant Ekle</Button>
            </Form>

            {userTenants && userTenants.length > 0 && (
              <>
                <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>
                  Atanan Tenantlar ({userTenants.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userTenants.map((ut: any) => (
                    <div key={ut.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                    }}>
                      <div>
                        <strong>{ut.userEmail || ut.email}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Rol: {ut.role === 'VIEWER' ? '👁️ Viewer' : ut.role === 'EDITOR' ? '✏️ Editor' : '👑 Admin'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                          {new Date(ut.joinedAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <SmallButton 
                        variant="danger"
                        onClick={() => handleRemoveTenantFromUser(ut.tenantId, ut.id)}
                      >
                        ✕ Kaldır
                      </SmallButton>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
