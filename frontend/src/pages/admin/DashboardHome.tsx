import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../../services/api';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
`;

const CardValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
`;

const Title = styled.h1`
  margin: 0 0 30px 0;
  color: #2c3e50;
`;

const Section = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export default function DashboardHome() {
  const { user } = useOutletContext<{ user: any }>();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.user?.role === 1;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/tenants');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      const tenantsData = await api.getTenants();
      setTenants(tenantsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeTenants = tenants.filter((t) => t.isActive).length;
  const totalProducts = tenants.reduce((sum, t) => sum + t.productCount, 0);

  return (
    <div>
      <Title>Dashboard</Title>

      <Grid>
        <Card>
          <CardTitle>Toplam Tenant</CardTitle>
          <CardValue>{tenants.length}</CardValue>
        </Card>
        <Card>
          <CardTitle>Aktif Tenant</CardTitle>
          <CardValue>{activeTenants}</CardValue>
        </Card>
        <Card>
          <CardTitle>Toplam Ürün</CardTitle>
          <CardValue>{totalProducts}</CardValue>
        </Card>
        <Card>
          <CardTitle>Durum</CardTitle>
          <CardValue style={{ fontSize: '20px', color: '#27ae60' }}>
            ✓ Çalışıyor
          </CardValue>
        </Card>
      </Grid>

      <Section>
        <h2 style={{ marginTop: 0 }}>Son Tenant'lar</h2>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : tenants.length === 0 ? (
          <p>Henüz tenant bulunmuyor.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ecf0f1', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>İsim</th>
                <th style={{ padding: '12px' }}>Slug</th>
                <th style={{ padding: '12px' }}>Ürün Sayısı</th>
                <th style={{ padding: '12px' }}>Durum</th>
                <th style={{ padding: '12px' }}>Son Sync</th>
              </tr>
            </thead>
            <tbody>
              {tenants.slice(0, 10).map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px' }}>{tenant.name}</td>
                  <td style={{ padding: '12px' }}>{tenant.slug}</td>
                  <td style={{ padding: '12px' }}>{tenant.productCount}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: tenant.isActive ? '#d4edda' : '#f8d7da',
                        color: tenant.isActive ? '#155724' : '#721c24',
                      }}
                    >
                      {tenant.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {tenant.lastProductSync
                      ? new Date(tenant.lastProductSync).toLocaleDateString('tr-TR')
                      : 'Hiçbir zaman'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
