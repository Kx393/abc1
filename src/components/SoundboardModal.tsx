/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  playCorrectSound,
  playBuzzerSound,
  playDramaticTwistSound,
  playHeistSound,
  playJackpotChime,
  playTimerTickSound,
  playVictoryFanfare,
} from '../utils/soundEffects';
import { X, Volume2, Bell, AlertOctagon, Zap, Siren, Sparkles, Timer, Trophy, Keyboard } from 'lucide-react';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sfxButtons = [
    {
      label: 'Correct Chime',
      icon: <Bell className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 bg-emerald-950/30',
      action: playCorrectSound,
      hotkey: 'Key C',
    },
    {
      label: 'Wrong Buzzer',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      color: 'hover:border-rose-500/50 bg-rose-950/30',
      action: playBuzzerSound,
      hotkey: 'Key W',
    },
    {
      label: 'Dramatic Twist Sting',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      color: 'hover:border-purple-500/50 bg-purple-950/30',
      action: playDramaticTwistSound,
      hotkey: 'Key T',
    },
    {
      label: 'Heist Siren Alert',
      icon: <Siren className="w-5 h-5 text-amber-400" />,
      color: 'hover:border-amber-500/50 bg-amber-950/30',
      action: playHeistSound,
      hotkey: '',
    },
    {
      label: 'Jackpot Chime',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      color: 'hover:border-cyan-500/50 bg-cyan-950/30',
      action: playJackpotChime,
      hotkey: '',
    },
    {
      label: 'Countdown Tick',
      icon: <Timer className="w-5 h-5 text-blue-400" />,
      color: 'hover:border-blue-500/50 bg-blue-950/30',
      action: () => playTimerTickSound(true),
      hotkey: '',
    },
    {
      label: 'Victory Fanfare',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      color: 'hover:border-yellow-500/50 bg-yellow-950/30',
      action: playVictoryFanfare,
      hotkey: 'Key V',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-white/[0.1] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Volume2 className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Stage Audio Soundboard
              </h3>
              <p className="text-[10px] text-slate-400">Live sound cues & keyboard triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
            aria-label="Close soundboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SFX Quick Trigger Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {sfxButtons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className={`p-3 rounded-2xl border border-white/[0.06] ${btn.color} flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
            >
              {btn.icon}
              <span className="text-xs font-semibold text-slate-200">{btn.label}</span>
              {btn.hotkey && (
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/[0.08]">
                  {btn.hotkey}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Hotkeys reference */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <Keyboard className="w-3.5 h-3.5" />
            Keyboard Control Shortcuts
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-400">
            <div><span className="font-mono text-slate-200 bg-slate-800/90 px-1 py-0.5 rounded border border-white/[0.06]">F</span> : Fullscreen</div>
            <div><span className="font-mono text-slate-200 bg-slate-800/90 px-1 py-0.5 rounded border border-white/[0.06]">Space</span> : 30s Timer</div>
            <div><span className="font-mono text-slate-200 bg-slate-800/90 px-1 py-0.5 rounded border border-white/[0.06]">C</span> : Correct Chime</div>
            <div><span className="font-mono text-slate-200 bg-slate-800/90 px-1 py-0.5 rounded border border-white/[0.06]">W</span> : Wrong Buzzer</div>
            <div><span className="font-mono text-slate-200 bg-slate-800/90 px-1 py-0.5 rounded border border-white/[0.06]">T</span> : Twist Sting</div>
            <div><span className="font-mono text-slate-200 bg-slate-800/90 px-1 py-0.5 rounded border border-white/[0.06]">Esc</span> : Close Modal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
