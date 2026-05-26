import RedCard from './RedCard';

interface CardStackProps {
  text: string;
  isAd?: boolean;
  adBrand?: string;
  stackCount?: number; // Orqada ko'rinadigan karta soni
  roundNumber?: number;
  totalRounds?: number;
}

export default function CardStack({
  text,
  isAd = false,
  adBrand,
  stackCount = 2,
  roundNumber,
  totalRounds,
}: CardStackProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: 'var(--card-width)',
        height: 'var(--card-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Orqa fon kartalari */}
      {Array.from({ length: stackCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${-(i + 1) * 4}px`,
            left: `${(i + 1) * 4}px`,
            width: '100%',
            height: '100%',
            borderRadius: 'var(--card-radius)',
            background: isAd
              ? 'linear-gradient(145deg, rgba(255,215,0,0.3), rgba(184,134,11,0.3))'
              : 'linear-gradient(145deg, rgba(255,71,87,0.3), rgba(192,57,43,0.3))',
            border: '3px solid rgba(255,255,255,0.05)',
            transform: `rotate(${(i + 1) * 2}deg)`,
            zIndex: -(i + 1),
          }}
        />
      ))}

      {/* Asosiy karta */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <RedCard
          text={text}
          isAd={isAd}
          adBrand={adBrand}
          roundNumber={roundNumber}
          totalRounds={totalRounds}
        />
      </div>
    </div>
  );
}
