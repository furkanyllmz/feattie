import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AdminLayout user={user?.user}>
      <Outlet context={{ user }} />
    </AdminLayout>
  );
}
