import { Box, Button, Container, Typography, Card, CardContent, AppBar, Toolbar, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import LoginIcon from '@mui/icons-material/Login';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ChatIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      title: 'AI Destekli Chat',
      description: 'OpenAI GPT teknolojisi ile müşterilerinize 7/24 anlık destek sağlayın.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      title: 'Hızlı Entegrasyon',
      description: 'Sadece birkaç satır kod ile web sitenize entegre edin ve kullanmaya başlayın.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      title: 'Güvenli & Ölçeklenebilir',
      description: 'Verileriniz güvende ve sistem ihtiyacınıza göre ölçeklenir.'
    },
    {
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      title: 'Kolay Yönetim',
      description: 'Modern admin paneli ile tüm ayarlarınızı kolayca yönetin.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header / Navbar */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#1976d2', fontWeight: 700 }}>
            🤖 Feattie Chat
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Giriş Yap
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
            Müşteri Deneyimini
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 4 }}>
            Yapay Zeka ile Geliştirin
          </Typography>
          <Typography variant="h5" sx={{ mb: 5, opacity: 0.95, fontWeight: 400 }}>
            Modern, AI destekli chat widget ile müşterilerinize anlık destek sağlayın
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Ücretsiz Başla
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700, color: '#333' }}>
          Neden Feattie?
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 8, color: '#666', fontWeight: 400 }}>
          Müşteri memnuniyetini artıran güçlü özellikler
        </Typography>

        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 4 
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Demo Section */}
      <Box sx={{ bgcolor: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700, color: '#333' }}>
            Canlı Demo
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 6, color: '#666', fontWeight: 400 }}>
            Sağ alttaki chat widget'ı ile hemen test edin
          </Typography>
          
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>
              👉 Web sitenize entegrasyon sadece 2 dakika!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sadece birkaç satır kod ile müşterilerinize AI destekli destek sağlayın
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
            Hemen Başlayın
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
            Ücretsiz hesap oluşturun ve müşteri deneyiminizi geliştirin
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Ücretsiz Dene
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2025 Feattie Chat. Tüm hakları saklıdır.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
