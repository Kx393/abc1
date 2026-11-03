/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Team, getLeaderboard } from '../game/twistRules';
import { playVictoryFanfare } from '../utils/soundEffects';
import { Trophy, Crown, Sparkles, RotateCcw, X, Medal } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  teams: Team[];
  onClose: () => void;
  onResetGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  teams,
  onClose,
  onResetGame,
}) => {
  if (!isOpen) return null;

  const leaderboard = getLeaderboard(teams);
  const winner = leaderboard[0]?.team;
  const runnerUp = leaderboard[1]?.team;
  const thirdPlace = leaderboard[2]?.team;

  useEffect(() => {
    playVictoryFanfare();

    // Double fire confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-white/[0.1] p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] text-center space-y-5">
        {/* Subtle radial backdrop glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
          aria-label="Close victory modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Celebration Subtitle */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
            Final Standings · Podium
          </span>
        </div>

        {/* Champion Trophy Showcase */}
        {winner && (
          <div className="space-y-3 pt-1">
            <div className="relative inline-block">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border shadow-xl"
                style={{
                  backgroundColor: `${winner.color}18`,
                  borderColor: `${winner.color}80`,
                  boxShadow: `0 0 35px ${winner.color}35`,
                }}
              >
                {winner.avatarEmoji}
              </div>
              <Crown className="w-8 h-8 text-amber-400 absolute -top-3 -right-2 rotate-12 drop-shadow-md" fill="currentColor" />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90">
                Champion
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mt-0.5">
                {winner.name}
              </h2>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-0.5 tabular-nums">
                {winner.score} <span className="text-xs font-semibold uppercase text-slate-400">pts</span>
              </div>
            </div>
          </div>
        )}

        {/* 3-Step Podium */}
        <div className="flex items-end justify-center gap-3 pt-2 max-w-sm mx-auto">
          {/* 2nd Place */}
          {runnerUp && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-lg mb-1">{runnerUp.avatarEmoji}</span>
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[80px]">
                {runnerUp.name}
              </span>
              <span className="text-xs font-bold text-slate-400 tabular-nums">
                {runnerUp.score} pts
              </span>
              <div className="w-full h-18 bg-slate-900 rounded-t-xl border-t border-slate-400 flex flex-col items-center justify-center mt-2 shadow-sm">
                <Medal className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">2ND</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {winner && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xl mb-1">{winner.avatarEmoji}</span>
              <span className="text-xs font-bold text-amber-300 truncate max-w-[90px]">
                {winner.name}
              </span>
              <span className="text-xs font-bold text-amber-400 tabular-nums">
                {winner.score} pts
              </span>
              <div className="w-full h-24 bg-gradient-to-t from-amber-500/20 to-amber-500/10 rounded-t-xl border-t-2 border-amber-400 flex flex-col items-center justify-center mt-2 shadow-lg shadow-amber-500/10">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300 tracking-wider mt-0.5">
                  1ST
                </span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-lg mb-1">{thirdPlace.avatarEmoji}</span>
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[80px]">
                {thirdPlace.name}
              </span>
              <span className="text-xs font-bold text-slate-400 tabular-nums">
                {thirdPlace.score} pts
              </span>
              <div className="w-full h-14 bg-slate-900/80 rounded-t-xl border-t border-amber-800 flex flex-col items-center justify-center mt-2 shadow-sm">
                <span className="text-[10px] font-bold text-amber-700">3RD</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onResetGame}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Game
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Review Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
