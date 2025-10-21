// components/PerformanceArsenal/ui/HardwareWarning.tsx
import React from 'react';

interface HardwareWarningProps {
  hardwareInfo: {
    cores: number;
    isLowEnd: boolean;
    memory: string;
  };
}

export function HardwareWarning({ hardwareInfo }: HardwareWarningProps) {
  if (!hardwareInfo.isLowEnd) return null;

  return (
    <div className="hardware-warning">
      ⚠️ Low-end device detected ({hardwareInfo.cores} cores).
      Large benchmarks may freeze briefly.
    </div>
  );
}
