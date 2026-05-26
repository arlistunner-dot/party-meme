import FriendsScreen from '@/components/friends/FriendsScreen';
import { useNavigate } from 'react-router-dom';

export default function FriendsPage() {
  const navigate = useNavigate();
  return <FriendsScreen onNavigate={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />;
}
