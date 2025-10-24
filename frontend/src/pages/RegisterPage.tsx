import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const RegisterBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  margin: 0 0 30px 0;
  color: #333;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #5568d3;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  padding: 12px;
  background: #efe;
  color: #3c3;
  border-radius: 6px;
  font-size: 14px;
`;

const LinkText = styled.p`
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 20px 0 0 0;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const HelperText = styled.span`
  font-size: 12px;
  color: #666;
`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Email ve şifre zorunludur.');
        return;
      }

      if (formData.password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Şifreler eşleşmiyor.');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Geçerli bir email adresi giriniz.');
        return;
      }

      // Register
      await api.register(formData.email, formData.password);
      
      setSuccess(`Kayıt başarılı! ${formData.email} ile giriş yapabilirsiniz.`);
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Kayıt başarılı, lütfen giriş yapınız.'
          }
        });
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Kayıt başarısız oldu';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <RegisterBox>
        <Title>Kayıt Ol</Title>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>✅ {success}</SuccessMessage>}

          <FormGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <HelperText>Geçerli bir email adresi giriniz</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Ad (Opsiyonel)</Label>
            <Input
              type="text"
              name="firstName"
              placeholder="Adınız"
              value={formData.firstName}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Soyad (Opsiyonel)</Label>
            <Input
              type="text"
              name="lastName"
              placeholder="Soyadınız"
              value={formData.lastName}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Şifre *</Label>
            <Input
              type="password"
              name="password"
              placeholder="Şifre"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <HelperText>Minimum 6 karakter</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Şifreyi Onayla *</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Şifreyi onayla"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>
        </Form>

        <LinkText>
          Zaten hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
        </LinkText>
      </RegisterBox>
    </Container>
  );
}
