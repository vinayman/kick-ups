'use client';

import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';

interface KickCounterProps {
  count: number;
  onReset: () => void;
}

export default function KickCounter({
  count,
  onReset
}: KickCounterProps) {
  return (
    <div className="absolute right-4 top-4 bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">Kick Ups</span>
          <span className="text-3xl font-bold">{count}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 