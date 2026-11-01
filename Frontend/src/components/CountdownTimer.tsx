import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadlineAt: string | null;
  className?: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  deadlineAt,
  className = '',
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false,
  });

  useEffect(() => {
    if (!deadlineAt) return;

    const targetTime = new Date(deadlineAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({
          hours: '00',
          minutes: '00',
          seconds: '00',
          isExpired: true,
        });
        if (onExpire) onExpire();
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isExpired: false,
      });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [deadlineAt, onExpire]);

  if (!deadlineAt) {
    return <span className={`tabular-nums ${className}`}>--:--:--</span>;
  }

  if (timeLeft.isExpired) {
    return (
      <span className={`tabular-nums font-semibold text-rose-600 ${className}`}>
        Hết thời gian
      </span>
    );
  }

  return (
    <span className={`tabular-nums font-semibold tracking-tight ${className}`}>
      {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </span>
  );
};

