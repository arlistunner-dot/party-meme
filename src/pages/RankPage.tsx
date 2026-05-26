import RankScreen from '@/components/rank/RankScreen';
import { useNavigate } from 'react-router-dom';

export default function RankPage() {
  const navigate = useNavigate();
  return <RankScreen onNavigate={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />;
}
