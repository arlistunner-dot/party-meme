import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onTimeUp?: () => void;
  onTick?: (secondsLeft: number) => void;
  warningAt?: number;      // Qachon qizil rangga o'tadi
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { fontSize: '16px', width: '40px', height: '40px' },
  md: { fontSize: '22px', width: '56px', height: '56px' },
  lg: { fontSize: '30px', width: '72px', height: '72px' },
};

export default function Timer({
  seconds,
  isRunning,
  onTimeUp,
  onTick,
  warningAt = 10,
  size = 'md',
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Vaqtni qayta o'rnatish
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  // Taymer ishlashi
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        onTick?.(next);

        if (next <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeUp?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onTimeUp, onTick]);

  const isWarning = timeLeft <= warningAt && timeLeft > 5;
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const isExpired = timeLeft <= 0;

  // Doira progress
  const progress = timeLeft / seconds;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  let strokeColor = 'var(--neon-green)';
  if (isWarning) strokeColor = 'var(--accent-warning)';
  if (isUrgent) strokeColor = 'var(--accent-danger)';
  if (isExpired) strokeColor = 'var(--text-muted)';

  const { fontSize, width, height } = sizeStyles[size];

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background doira */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(-90deg)',
        }}
      >
        <circle
          cx={parseInt(String(width)) / 2}
          cy={parseInt(String(height)) / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
        />
        <circle
          cx={parseInt(String(width)) / 2}
          cy={parseInt(String(height)) / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />
      </svg>

      {/* Raqam */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize,
          color: isUrgent ? 'var(--accent-danger)' : isExpired ? 'var(--text-muted)' : 'var(--text-primary)',
          animation: isUrgent ? 'timerPulse 0.6s ease-in-out infinite' : undefined,
          zIndex: 1,
        }}
      >
        {timeLeft}
      </span>
    </div>
  );
}
