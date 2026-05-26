import HomeScreen from '@/components/home/HomeScreen';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <HomeScreen
      onPlay={() => navigate('/room')}
      onCreateRoom={() => navigate('/room?create=true')}
      onJoinRoom={() => navigate('/room?join=true')}
      onNavigate={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)}
    />
  );
}
