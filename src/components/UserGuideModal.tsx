/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Trophy,
  Zap,
  Sparkles,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Volume2,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gameplay' | 'twists' | 'host' | 'hotkeys'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-amber-500/10 blur-[80px] pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-5 sm:px-7 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-400">
                  EVENT ANCHOR HANDBOOK
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-400">StageMaster 16</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Event Host & Operator Quick Guide
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10 px-5 sm:px-7 py-2.5 border-b border-white/[0.06] bg-slate-950/30 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'overview', label: '1. Overview', icon: Sparkles },
            { id: 'gameplay', label: '2. Gameplay Flow', icon: Clock },
            { id: 'twists', label: '3. Hidden Twists', icon: Flame },
            { id: 'host', label: '4. AI & Host X-Ray', icon: Eye },
            { id: 'hotkeys', label: '5. Stage Hotkeys', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-slate-200">
                <h3 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> What is StageMaster 16?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  StageMaster 16 is a high-octane 4-team interactive stage gameshow designed for live corporate events, college fests, auditorium competitions, and private parties. A 4×4 grid of 16 tiles holds a strategic blend of high-value trivia questions and game-modifying <strong>Twists of Fate</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06]">
                  <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> 4 Competing Teams
                  </div>
                  <p className="text-xs text-slate-400">
                    Red Dragons, Blue Titans, Golden Lions, and Green Vipers battle in turns. Active teams are highlighted in real-time in the broadcast HUD.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06]">
                  <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Strategic Volatility
                  </div>
                  <p className="text-xs text-slate-400">
                    Teams pick tiles strategically. Unsuspecting teams can trigger massive point steals, score swaps, or instant doubling to reverse the leaderboard!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06]">
                <h4 className="font-bold text-white text-xs mb-2">Pre-Show Checklist for Anchors:</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Projector Mode:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-amber-300 font-mono text-[10px]">F</kbd> to enter full-screen presentation mode for auditoriums.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Select Theme Pack:</strong> Click <span className="text-amber-300 font-medium">Decks</span> to choose Bollywood, Hollywood, Tech, Sports, or load your custom pack.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Sound Check:</strong> Tap the Sound FX button or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-amber-300 font-mono text-[10px]">C</kbd> to test stage audio levels.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: GAMEPLAY FLOW */}
          {activeTab === 'gameplay' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1">Select Active Team</h4>
                  <p className="text-xs text-slate-400">
                    The top scoreboard indicates whose turn it is. You can click any team card in the header anytime to manually switch the active team.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1">Pick a Tile (01 – 16)</h4>
                  <p className="text-xs text-slate-400">
                    The active team calls out a grid number. Clicking the tile launches the dramatic reveal modal with cinematic sound effects.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1">Run 30-Second Stage Timer</h4>
                  <p className="text-xs text-slate-400">
                    Hit <strong className="text-slate-200">Start Timer</strong> (or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-amber-300 font-mono text-[10px]">Space</kbd>). Audiovisual media (photos, audio snippets, video clips) will play automatically inside the card.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1">Reveal Answer & Award Points</h4>
                  <p className="text-xs text-slate-400">
                    Click <strong className="text-slate-200">Reveal Answer</strong> to display the official verified answer. Award full points to the active team, or use the <em>Pass / Bonus</em> button to award points to any other team.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06] flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs mb-1">Grand Finale & Podium</h4>
                  <p className="text-xs text-slate-400">
                    When all 16 tiles are solved (or host presses <strong>Podium</strong>), the stage crowns the champions on an Olympic-style 3D podium with celebratory confetti!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TWISTS OF FATE */}
          {activeTab === 'twists' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20">
                <h3 className="font-bold text-purple-300 text-xs mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-400" /> The Secret Twist Engine
                </h3>
                <p className="text-xs text-slate-300">
                  Hidden behind certain tiles are automatic game modifications. When revealed, they immediately execute high-stakes rules that shock the arena!
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: 'Point Steal (e.g. +100 / -100)',
                    desc: 'Transfers points directly from the current leaderboard leader to the team that picked the tile.',
                    color: 'text-rose-400',
                  },
                  {
                    title: 'Double Trouble (2× Multiplier)',
                    desc: "Instantly doubles the picking team's total points, catapulting them into contention.",
                    color: 'text-amber-400',
                  },
                  {
                    title: 'Score Swap',
                    desc: 'Forces the picking team to trade their entire score with another team (e.g., swapping with the leader).',
                    color: 'text-cyan-400',
                  },
                  {
                    title: 'Jackpot Mystery Bonus',
                    desc: 'An outright point injection (e.g. +300 pts) awarded to the lucky team.',
                    color: 'text-emerald-400',
                  },
                  {
                    title: 'The Equalizer',
                    desc: 'Adjusts all teams or redistributes bonus points evenly across the room to keep the game nail-bitingly close.',
                    color: 'text-purple-400',
                  },
                ].map((twist, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.05] flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                    <div>
                      <span className={`font-bold text-xs ${twist.color}`}>{twist.title}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{twist.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AI & HOST X-RAY */}
          {activeTab === 'host' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06]">
                <h3 className="font-bold text-purple-300 text-xs mb-1 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-400" /> Host X-Ray Vision Mode
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inside the <strong>AI Studio</strong> control panel, toggle <span className="text-purple-300 font-semibold">Host X-Ray Mode</span>. This lets you discreetly see which tiles hide Twists vs Questions with discrete badge indicators on the board—without opening the tiles!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06]">
                <h3 className="font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" /> Live Question & Media Editor
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  Need to tailor the game to a bride & groom, corporate VIPs, or festival theme?
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li>• Edit any of the 16 tiles live from the AI Studio panel.</li>
                  <li>• Add custom <strong>Images</strong> (direct photo URLs or Unsplash links).</li>
                  <li>• Add custom <strong>Audio snippets</strong> (mp3 audio cues for name-that-tune rounds).</li>
                  <li>• Add custom <strong>Video clips</strong> (mp4 URLs for movie scene trivia).</li>
                  <li>• Configure point values from 100 to 500 points per question.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.06]">
                <h3 className="font-bold text-white text-xs mb-1">Manual Score Override (+ / -)</h3>
                <p className="text-xs text-slate-400">
                  Every team card in the top scoreboard features quick <span className="text-amber-300 font-bold">+</span> and <span className="text-rose-400 font-bold">-</span> buttons to add or deduct 10 points on the fly for audience participation or minor penalties.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: HOTKEYS */}
          {activeTab === 'hotkeys' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Control the whole show without moving your mouse by using these keyboard shortcuts:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'Ctrl + S', label: 'Save Show to Server', desc: 'Instantly persist board & scores to server' },
                  { key: 'F', label: 'Fullscreen Arena', desc: 'Toggle borderless auditorium view' },
                  { key: 'Space', label: 'Timer Toggle', desc: 'Start or pause 30s countdown' },
                  { key: 'C', label: 'Chime Sound', desc: 'Play triumphant correct sound' },
                  { key: 'W', label: 'Wrong Buzzer', desc: 'Play dramatic incorrect buzzer' },
                  { key: 'T', label: 'Twist Sting', desc: 'Play ominous mystery reveal sting' },
                  { key: 'V', label: 'Victory Fanfare', desc: 'Trigger champion fanfare' },
                  { key: 'Esc', label: 'Dismiss Modal', desc: 'Close any active popups or cards' },
                ].map((item) => (
                  <div key={item.key} className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-amber-300 font-mono text-xs font-bold shadow-inner">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.05] text-[11px] text-slate-500">
                💡 <em>Tip: Keyboard shortcuts work anytime you are not currently editing text inside an input field.</em>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 px-5 sm:px-7 py-3 border-t border-white/[0.08] bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            StageGrid AI · StageMaster 16 Event Suite
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-400/20"
          >
            Ready for Stage
          </button>
        </div>
      </div>
    </div>
  );
};
