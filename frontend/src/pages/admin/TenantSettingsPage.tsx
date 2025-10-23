import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: #ecf0f1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: #bdc3c7;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #2c3e50;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #ecf0f1;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${(props) => (props.active ? '#667eea' : 'transparent')};
  color: ${(props) => (props.active ? '#667eea' : '#7f8c8d')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #667eea;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
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

const ColorInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 50px;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Toggle = styled.div<{ checked: boolean }>`
  width: 50px;
  height: 26px;
  background: ${(props) => (props.checked ? '#667eea' : '#bdc3c7')};
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${(props) => (props.checked ? '26px' : '2px')};
    transition: left 0.2s;
  }
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

const SaveButton = styled(Button)`
  margin-top: 24px;
`;

const CodeBlock = styled.pre`
  background: #2c3e50;
  color: #ecf0f1;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  &:hover {
    background: #229954;
  }
`;

const HelperText = styled.span`
  font-size: 12px;
  color: #7f8c8d;
`;

const PreviewBox = styled.div<{ primary: string; secondary: string }>`
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${(props) => props.primary} 0%, ${(props) => props.secondary} 100%);
  color: white;
  margin-top: 16px;
`;

export default function TenantSettingsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { user } = useOutletContext<{ user: any }>();
  const [activeTab, setActiveTab] = useState<'appearance' | 'embed'>('appearance');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [embedCode, setEmbedCode] = useState('');

  // Check if user is admin (role === 1)
  const isAdmin = user?.user?.role === 1;

  const [settings, setSettings] = useState({
    brandColorPrimary: '#667eea',
    brandColorSecondary: '#764ba2',
    widgetPosition: 'bottom-right',
    chatTitle: 'Chat Asistanı',
    welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?',
    logoUrl: '',
    avatarUrl: '',
    autoOpen: false,
    autoOpenDelaySeconds: 3,
    showTypingIndicator: true,
    enableSoundNotifications: true,
    widgetSize: 'medium',
    language: 'tr',
    customCss: '',
  });

  useEffect(() => {
    loadSettings();
    loadTenant();
  }, [tenantId]);

  const loadTenant = async () => {
    try {
      const data = await api.getTenant(parseInt(tenantId!));
      setTenant(data);
    } catch (err) {
      console.error('Error loading tenant:', err);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getTenantSettings(parseInt(tenantId!));
      setSettings({
        brandColorPrimary: data.brandColorPrimary,
        brandColorSecondary: data.brandColorSecondary,
        widgetPosition: data.widgetPosition,
        chatTitle: data.chatTitle,
        welcomeMessage: data.welcomeMessage,
        logoUrl: data.logoUrl || '',
        avatarUrl: data.avatarUrl || '',
        autoOpen: data.autoOpen,
        autoOpenDelaySeconds: data.autoOpenDelaySeconds,
        showTypingIndicator: data.showTypingIndicator,
        enableSoundNotifications: data.enableSoundNotifications,
        widgetSize: data.widgetSize,
        language: data.language,
        customCss: data.customCss || '',
      });
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmbedCode = async () => {
    try {
      const data = await api.getEmbedCode(parseInt(tenantId!));
      setEmbedCode(data.embedCode);
    } catch (err) {
      console.error('Error loading embed code:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'embed') {
      loadEmbedCode();
    }
  }, [activeTab]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateTenantSettings(parseInt(tenantId!), settings);
      alert('Ayarlar kaydedildi!');
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed kodu kopyalandı!');
  };

  if (loading) {
    return <Container><Card>Yükleniyor...</Card></Container>;
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BackButton onClick={() => navigate('/admin/tenants')}>← Geri</BackButton>
          <Title>{tenant?.name} - Ayarlar</Title>
        </div>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
          🎨 Görünüm
        </Tab>
        {isAdmin && (
          <Tab active={activeTab === 'embed'} onClick={() => setActiveTab('embed')}>
            📜 Embed Kodu
          </Tab>
        )}
      </TabContainer>

      {activeTab === 'appearance' && (
        <Card>
          <Section>
            <SectionTitle>Marka Renkleri</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Ana Renk</Label>
                <ColorInput
                  type="color"
                  value={settings.brandColorPrimary}
                  onChange={(e) => setSettings({ ...settings, brandColorPrimary: e.target.value })}
                />
                <HelperText>{settings.brandColorPrimary}</HelperText>
              </FormGroup>
              <FormGroup>
                <Label>İkincil Renk</Label>
                <ColorInput
                  type="color"
                  value={settings.brandColorSecondary}
                  onChange={(e) => setSettings({ ...settings, brandColorSecondary: e.target.value })}
                />
                <HelperText>{settings.brandColorSecondary}</HelperText>
              </FormGroup>
            </FormGrid>
            <PreviewBox primary={settings.brandColorPrimary} secondary={settings.brandColorSecondary}>
              <h3 style={{ margin: '0 0 8px 0' }}>{settings.chatTitle}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>{settings.welcomeMessage}</p>
            </PreviewBox>
          </Section>

          <Section>
            <SectionTitle>Widget Ayarları</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Chat Başlığı</Label>
                <Input
                  type="text"
                  value={settings.chatTitle}
                  onChange={(e) => setSettings({ ...settings, chatTitle: e.target.value })}
                  placeholder="Chat Asistanı"
                />
              </FormGroup>
              <FormGroup>
                <Label>Widget Konumu</Label>
                <Select
                  value={settings.widgetPosition}
                  onChange={(e) => setSettings({ ...settings, widgetPosition: e.target.value })}
                >
                  <option value="bottom-right">Sağ Alt</option>
                  <option value="bottom-left">Sol Alt</option>
                  <option value="top-right">Sağ Üst</option>
                  <option value="top-left">Sol Üst</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Widget Boyutu</Label>
                <Select
                  value={settings.widgetSize}
                  onChange={(e) => setSettings({ ...settings, widgetSize: e.target.value })}
                >
                  <option value="small">Küçük</option>
                  <option value="medium">Orta</option>
                  <option value="large">Büyük</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Dil</Label>
                <Select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </Select>
              </FormGroup>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>Karşılama Mesajı</SectionTitle>
            <FormGroup>
              <TextArea
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                placeholder="Merhaba! Size nasıl yardımcı olabilirim?"
              />
              <HelperText>Kullanıcılar chat'i açtığında görecekleri ilk mesaj</HelperText>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Davranış Ayarları</SectionTitle>
            <FormGroup>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Label>Otomatik Aç</Label>
                  <HelperText>Widget sayfa yüklendiğinde otomatik açılsın mı?</HelperText>
                </div>
                <Toggle
                  checked={settings.autoOpen}
                  onClick={() => setSettings({ ...settings, autoOpen: !settings.autoOpen })}
                />
              </div>
            </FormGroup>
            {settings.autoOpen && (
              <FormGroup style={{ marginTop: '16px' }}>
                <Label>Otomatik Açılma Gecikmesi (saniye)</Label>
                <Input
                  type="number"
                  value={settings.autoOpenDelaySeconds}
                  onChange={(e) => setSettings({ ...settings, autoOpenDelaySeconds: parseInt(e.target.value) })}
                  min="0"
                  max="10"
                />
              </FormGroup>
            )}
            <FormGroup style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Label>Yazıyor Göstergesi</Label>
                  <HelperText>Asistan cevap yazarken animasyon göster</HelperText>
                </div>
                <Toggle
                  checked={settings.showTypingIndicator}
                  onClick={() => setSettings({ ...settings, showTypingIndicator: !settings.showTypingIndicator })}
                />
              </div>
            </FormGroup>
            <FormGroup style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Label>Ses Bildirimleri</Label>
                  <HelperText>Yeni mesaj geldiğinde ses çal</HelperText>
                </div>
                <Toggle
                  checked={settings.enableSoundNotifications}
                  onClick={() => setSettings({ ...settings, enableSoundNotifications: !settings.enableSoundNotifications })}
                />
              </div>
            </FormGroup>
          </Section>

          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </SaveButton>
        </Card>
      )}

      {activeTab === 'embed' && (
        <Card>
          <Section>
            <SectionTitle>Widget Embed Kodu</SectionTitle>
            <HelperText>
              Bu kodu kopyalayıp web sitenizin HTML koduna, {'</body>'} etiketinden hemen önce yapıştırın.
            </HelperText>
            {embedCode && (
              <>
                <CodeBlock>{embedCode}</CodeBlock>
                <CopyButton onClick={handleCopyEmbed}>📋 Kopyala</CopyButton>
              </>
            )}
          </Section>
        </Card>
      )}
    </Container>
  );
}
