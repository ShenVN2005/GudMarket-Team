import React from 'react';

export const AtmosphericBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 bg-zinc-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle paper grain / graphite atmosphere texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#18181b 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Atmospheric depth lighting gradient (soft graphite vignette) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-b from-zinc-200/40 via-zinc-100/20 to-transparent blur-3xl rounded-full" />
    </div>
  );
};

