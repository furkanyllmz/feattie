import { useEffect, useState } from 'react';
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

const TenantGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const TenantCard = styled(Card)`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: start;
`;

const TenantInfo = styled.div``;

const TenantName = styled.h3`
  margin: 0 0 8px 0;
  color: #2c3e50;
`;

const TenantMeta = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const Badge = styled.span<{ variant: 'success' | 'warning' | 'info' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.variant === 'success'
      ? '#d4edda'
      : props.variant === 'warning'
      ? '#fff3cd'
      : '#d1ecf1'};
  color: ${(props) =>
    props.variant === 'success'
      ? '#155724'
      : props.variant === 'warning'
      ? '#856404'
      : '#0c5460'};
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SmallButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  background: #ecf0f1;
  color: #2c3e50;
  &:hover {
    background: #bdc3c7;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: #333;
  }
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

const HelperText = styled.span`
  font-size: 12px;
  color: #666;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #e74c3c;
`;

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<number, any>>({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shopifyStoreUrl: '',
    shopifyAccessToken: '',
    maxProducts: 10000,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);

      // Load stats for each tenant
      const statsPromises = data.map((t: any) =>
        api.getTenantStats(t.id).then((s) => ({ id: t.id, stats: s }))
      );
      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { id, stats }) => {
        acc[id] = stats;
        return acc;
      }, {} as Record<number, any>);
      setStats(statsMap);
    } catch (err) {
      console.error('Error loading tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProducts = async (tenantId: number) => {
    try {
      const result = await api.syncProducts(tenantId, false);
      alert(`Sync tamamlandı!\nYeni: ${result.newProducts}, Güncellenen: ${result.updatedProducts}`);
      loadTenants();
    } catch (err: any) {
      alert('Sync hatası: ' + (err.response?.data?.errorMessage || err.message));
    }
  };

  const handleGenerateEmbeddings = async (tenantId: number) => {
    if (!confirm('Embeddings oluşturulsun mu? Bu işlem uzun sürebilir.')) return;

    try {
      const result = await api.generateEmbeddings(tenantId, false);
      alert(
        `Embeddings oluşturuldu!\nToplam: ${result.totalProducts}, Başarılı: ${result.embeddingsGenerated}, Hatalı: ${result.failedEmbeddings}\nSüre: ${result.timeElapsedSeconds.toFixed(2)}s`
      );
      loadTenants();
    } catch (err: any) {
      alert('Embedding hatası: ' + (err.response?.data?.errorMessage || err.message));
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name || !formData.slug || !formData.shopifyStoreUrl) {
        setFormError('İsim, slug ve Shopify URL zorunludur.');
        return;
      }

      // Create tenant
      const newTenant = await api.createTenant({
        name: formData.name,
        slug: formData.slug,
        shopifyStoreUrl: formData.shopifyStoreUrl,
        shopifyAccessToken: formData.shopifyAccessToken || undefined,
        maxProducts: formData.maxProducts,
      });

      alert(`Tenant oluşturuldu: ${newTenant.name}`);
      setShowModal(false);
      setFormData({
        name: '',
        slug: '',
        shopifyStoreUrl: '',
        shopifyAccessToken: '',
        maxProducts: 10000,
      });
      loadTenants();
    } catch (err: any) {
      setFormError(err.response?.data?.errorMessage || err.message || 'Tenant oluşturma hatası');
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Container>
      <Header>
        <h1 style={{ margin: 0 }}>Tenant Yönetimi</h1>
        <Button onClick={() => setShowModal(true)}>+ Yeni Tenant</Button>
      </Header>

      {tenants.length === 0 ? (
        <Card>
          <p>Henüz tenant bulunmuyor.</p>
        </Card>
      ) : (
        <TenantGrid>
          {tenants.map((tenant) => {
            const tenantStats = stats[tenant.id];
            return (
              <TenantCard key={tenant.id}>
                <TenantInfo>
                  <TenantName>{tenant.name}</TenantName>
                  <TenantMeta>
                    <strong>Slug:</strong> {tenant.slug}
                  </TenantMeta>
                  <TenantMeta>
                    <strong>Store:</strong> {tenant.shopifyStoreUrl}
                  </TenantMeta>
                  <TenantMeta>
                    <strong>Durum:</strong>{' '}
                    <Badge variant={tenant.isActive ? 'success' : 'warning'}>
                      {tenant.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                    {' '}
                    {tenantStats?.hasRAGConfiguration && (
                      <Badge variant="info">RAG Ayarlanmış</Badge>
                    )}
                  </TenantMeta>

                  {tenantStats && (
                    <StatsGrid>
                      <StatItem>
                        <StatValue>{tenantStats.productCount || 0}</StatValue>
                        <StatLabel>Ürün</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{tenantStats.productsWithEmbeddings || 0}</StatValue>
                        <StatLabel>Embedding</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{tenantStats.contextCount || 0}</StatValue>
                        <StatLabel>Context</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{tenantStats.chatSessionCount || 0}</StatValue>
                        <StatLabel>Session</StatLabel>
                      </StatItem>
                    </StatsGrid>
                  )}
                </TenantInfo>

                <Actions>
                  <SmallButton onClick={() => handleSyncProducts(tenant.id)}>
                    🔄 Sync Products
                  </SmallButton>
                  <SmallButton onClick={() => handleGenerateEmbeddings(tenant.id)}>
                    ⚡ Generate Embeddings
                  </SmallButton>
                  <SmallButton onClick={() => alert('Ayarlar yakında!')}>
                    ⚙️ Ayarlar
                  </SmallButton>
                </Actions>
              </TenantCard>
            );
          })}
        </TenantGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Yeni Tenant Oluştur</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleCreateTenant}>
              <FormGroup>
                <Label>İşletme Adı *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Les Benjamins"
                  required
                />
                <HelperText>İşletmenizin tam adı</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Slug *</Label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="les-benjamins"
                  required
                />
                <HelperText>URL-friendly benzersiz tanımlayıcı (otomatik oluşturuldu)</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Shopify Store URL *</Label>
                <Input
                  type="url"
                  value={formData.shopifyStoreUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shopifyStoreUrl: e.target.value }))}
                  placeholder="https://lesbenjamins.com"
                  required
                />
                <HelperText>Shopify mağazanızın tam URL'si</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Shopify Access Token (Opsiyonel)</Label>
                <Input
                  type="password"
                  value={formData.shopifyAccessToken}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shopifyAccessToken: e.target.value }))}
                  placeholder="shpat_..."
                />
                <HelperText>Private API için gerekli (public API için boş bırakın)</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Maksimum Ürün Sayısı</Label>
                <Input
                  type="number"
                  value={formData.maxProducts}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxProducts: parseInt(e.target.value) }))}
                  min="1"
                  required
                />
                <HelperText>Bu tenant için maksimum ürün limiti</HelperText>
              </FormGroup>

              {formError && <ErrorText>{formError}</ErrorText>}

              <Button type="submit" disabled={submitting}>
                {submitting ? 'Oluşturuluyor...' : 'Tenant Oluştur'}
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
