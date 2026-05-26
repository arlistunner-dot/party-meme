import ShopScreen from '@/components/shop/ShopScreen';
import { useNavigate } from 'react-router-dom';

export default function ShopPage() {
  const navigate = useNavigate();
  return <ShopScreen onNavigate={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />;
}
