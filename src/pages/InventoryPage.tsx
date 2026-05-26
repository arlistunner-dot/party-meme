import InventoryScreen from '@/components/inventory/InventoryScreen';
import { useNavigate } from 'react-router-dom';

export default function InventoryPage() {
  const navigate = useNavigate();
  return <InventoryScreen onNavigate={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />;
}
