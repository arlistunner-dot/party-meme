import BlueCard from './BlueCard';

interface AdCardProps {
  cardId: number;
  text: string;
  brandName: string;
  brandLogo?: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  isWinner?: boolean;
  onSelect?: (cardId: number) => void;
}

export default function AdCard({
  cardId,
  text,
  brandName,
  isSelected,
  isRevealed,
  isWinner,
  onSelect,
}: AdCardProps) {
  return (
    <BlueCard
      cardId={cardId}
      text={text}
      isAd
      adBrand={brandName}
      isSelected={isSelected}
      isRevealed={isRevealed}
      isWinner={isWinner}
      onSelect={onSelect}
    />
  );
}
