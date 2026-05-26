import ProfileScreen from '@/components/profile/ProfileScreen';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  return <ProfileScreen onNavigate={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />;
}
