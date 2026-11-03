/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Team } from '../game/twistRules';
import {
  Crown,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  SlidersHorizontal,
  Trophy,
  Zap,
  HelpCircle,
  Cloud,
  CloudUpload,
  CloudOff,
  Check,
  Save,
} from 'lucide-react';
import { getIsMuted, setMuted } from '../utils/soundEffects';

interface ScoreboardProps {
  teams: Team[];
  activeTeamId: string;
  onSelectActiveTeam: (teamId: string) => void;
  onAdjustScore: (teamId: string, delta: number) => void;
  onToggleFullscreen: () => void;
  onOpenSoundboard: () => void;
  onOpenDeckModal: () => void;
  onOpenAIControl: () => void;
  onOpenGuide: () => void;
  onEndGame: () => void;
  currentPackName: string;
  isHostXrayActive: boolean;
  syncStatus?: 'saved' | 'saving' | 'synced' | 'error' | 'idle';
  storageType?: 'cloud' | 'local';
  lastSavedAt?: string | null;
  onManualSave?: () => void;
  onOpenStorageModal?: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  teams,
  activeTeamId,
  onSelectActiveTeam,
  onAdjustScore,
  onToggleFullscreen,
  onOpenSoundboard,
  onOpenDeckModal,
  onOpenAIControl,
  onOpenGuide,
  onEndGame,
  currentPackName,
  isHostXrayActive,
  syncStatus = 'saved',
  storageType = 'local',
  lastSavedAt,
  onManualSave,
  onOpenStorageModal,
}) => {
  const [muted, setMutedState] = React.useState(getIsMuted());

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  // Find leader team
  const leader = [...teams].sort((a, b) => b.score - a.score)[0];
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  return (
    <header className="shrink-0 w-full bg-slate-950/90 border-b border-white/[0.08] backdrop-blur-xl z-30 shadow-2xl">
      {/* Upper Control Bar: Brand & Broadcast Host Tools */}
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border-b border-white/[0.05]">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-400">
                STAGEMASTER 16
              </span>
              <span className="text-slate-600 text-[10px]">·</span>
              
              {/* Storage & Sync Status Badge */}
              <button
                type="button"
                onClick={onOpenStorageModal || onManualSave}
                title={
                  syncStatus === 'saving'
                    ? 'Saving changes...'
                    : storageType === 'cloud'
                    ? 'Connected to Cloud Server. Click to view storage settings.'
                    : 'Saved to browser persistent storage. Survives page reloads. Click to view storage settings.'
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer border ${
                  syncStatus === 'saving'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shadow-sm'
                }`}
              >
                {syncStatus === 'saving' ? (
                  <>
                    <CloudUpload className="w-3 h-3 text-amber-400 animate-bounce" />
                    <span>Saving...</span>
                  </>
                ) : storageType === 'cloud' ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>Cloud Synced</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Auto-Saved</span>
                  </>
                )}
              </button>

              {isHostXrayActive && (
                <>
                  <span className="text-slate-600 text-[10px]">·</span>
                  <span className="text-[10px] font-semibold text-purple-300 tracking-wider">
                    X-RAY ACTIVE
                  </span>
                </>
              )}
            </div>
            <h1 className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight truncate max-w-[200px] sm:max-w-md">
              {currentPackName}
            </h1>
          </div>
        </div>

        {/* Host Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Manual Save Button */}
          {onManualSave && (
            <button
              onClick={onManualSave}
              title="Save current board, teams & score to permanent storage"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-white/[0.08] hover:border-emerald-500/40 text-slate-300 hover:text-emerald-200 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Save</span>
            </button>
          )}

          <button
            onClick={onOpenAIControl}
            title="Open AI Control Panel to edit questions & media"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span className="text-purple-400 text-xs">✦</span>
            <span className="hidden sm:inline">AI Studio</span>
          </button>

          <button
            onClick={onOpenDeckModal}
            title="Change or Edit Themes"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-amber-400/50 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400/90" />
            <span className="hidden sm:inline">Decks</span>
          </button>

          <button
            onClick={onOpenSoundboard}
            title="Stage SFX Soundboard"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-slate-600 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="hidden sm:inline">Sound FX</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          <button
            onClick={handleToggleMute}
            title={muted ? 'Unmute SFX' : 'Mute SFX'}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={onToggleFullscreen}
            title="Toggle Big Screen Fullscreen (F)"
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={onEndGame}
            title="End Game & Reveal Champions"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 hover:border-amber-400/60 text-amber-300 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Podium</span>
          </button>

          <button
            onClick={onOpenGuide}
            title="Open Event Host Quick Guide (? or H)"
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-amber-400/50 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            aria-label="Open Host User Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>

      {/* Lower Stage Scoreboard: Refined Team Stage Cards */}
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {teams.map((team) => {
            const isActive = team.id === activeTeamId;
            const isLeading = leader && leader.id === team.id && leader.score > 0;

            return (
              <div
                key={team.id}
                onClick={() => onSelectActiveTeam(team.id)}
                className={`relative flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-slate-900/95 border-amber-400/80 shadow-[0_0_24px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/30'
                    : 'bg-slate-900/40 border-white/[0.06] hover:bg-slate-900/70 hover:border-white/[0.12]'
                }`}
              >
                {/* Active Indicator Top Accent Bar */}
                {isActive && (
                  <div
                    className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                )}

                {/* Left: Avatar + Name */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-transform"
                    style={{
                      backgroundColor: `${team.color}18`,
                      border: `1.5px solid ${team.color}60`,
                    }}
                  >
                    <span>{team.avatarEmoji}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                        {team.name}
                      </span>
                      {isLeading && (
                        <Crown className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">
                      {isActive ? 'Turn Active' : 'Table'}
                    </span>
                  </div>
                </div>

                {/* Right: Score + Precision +/- micro-steppers */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <div className="text-right">
                    <span
                      className="text-lg sm:text-xl font-bold tabular-nums tracking-tight block"
                      style={{ color: team.color }}
                    >
                      {team.score}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-medium block -mt-1">
                      pts
                    </span>
                  </div>

                  {/* Micro Stepper */}
                  <div
                    className="flex flex-col gap-0.5 ml-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onAdjustScore(team.id, 10)}
                      title={`Add 10 pts to ${team.name}`}
                      className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                      aria-label="Add 10 points"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => onAdjustScore(team.id, -10)}
                      title={`Deduct 10 pts from ${team.name}`}
                      className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                      aria-label="Deduct 10 points"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
