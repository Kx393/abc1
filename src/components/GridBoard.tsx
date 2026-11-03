/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TileData, Team } from '../game/twistRules';
import { playTileSelectSound } from '../utils/soundEffects';
import { Zap, CheckCircle2, Music, Film, Footprints, HelpCircle, Eye, MessageSquare, Timer } from 'lucide-react';

interface GridBoardProps {
  tiles: TileData[];
  teams: Team[];
  onTileClick: (tile: TileData) => void;
  activeTeam: Team;
  isHostXrayActive?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'twist':
      return <Zap className="w-5 h-5 text-amber-400" />;
    case 'song':
      return <Music className="w-5 h-5 text-pink-400" />;
    case 'movie':
      return <Film className="w-5 h-5 text-purple-400" />;
    case 'hook_step':
      return <Footprints className="w-5 h-5 text-emerald-400" />;
    case 'observation':
      return <Eye className="w-5 h-5 text-cyan-400" />;
    case 'dialogue':
      return <MessageSquare className="w-5 h-5 text-amber-300" />;
    case 'rapid_fire':
      return <Timer className="w-5 h-5 text-rose-400" />;
    default:
      return <HelpCircle className="w-5 h-5 text-blue-400" />;
  }
};

export const GridBoard: React.FC<GridBoardProps> = ({
  tiles,
  teams,
  onTileClick,
  activeTeam,
  isHostXrayActive = false,
}) => {
  const handleSelect = (tile: TileData) => {
    playTileSelectSound();
    onTileClick(tile);
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-0 p-1 sm:p-2">
      {/* Broadcast Active Turn Indicator */}
      <div className="mb-2 sm:mb-2.5 flex items-center justify-between w-full max-w-xl px-4 py-1.5 sm:py-2 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-md shadow-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-sm sm:text-base font-bold shadow-md shrink-0"
            style={{
              backgroundColor: `${activeTeam.color}20`,
              border: `1.5px solid ${activeTeam.color}70`,
            }}
          >
            {activeTeam.avatarEmoji}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Turn
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: activeTeam.color }}>
              {activeTeam.name}
            </span>
            <span className="hidden sm:inline text-slate-400 text-xs font-normal">
              selects a tile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-amber-300/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] tracking-wide">Stage Matrix</span>
        </div>
      </div>

      {/* 4x4 Stage Matrix - Fits 100% inside viewport on laptops and desktops */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3.5 w-full h-full max-h-[calc(100dvh-175px)] max-w-[min(100%,calc((100dvh-175px)*1.35))] select-none flex-1 min-h-0">
        {tiles.map((tile) => {
          const solvedTeam = tile.solvedByTeamId
            ? teams.find((t) => t.id === tile.solvedByTeamId)
            : null;

          return (
            <button
              key={tile.id}
              onClick={() => handleSelect(tile)}
              className={`group relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden transform active:scale-[0.98] ${
                tile.isOpened
                  ? 'bg-slate-950/70 border border-white/[0.06] shadow-inner opacity-80 hover:opacity-100 hover:border-white/[0.15]'
                  : 'bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-amber-500/30 hover:border-amber-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_28px_rgba(245,158,11,0.25)] hover:-translate-y-0.5'
              }`}
              aria-label={`Tile ${tile.id} ${tile.isOpened ? 'Opened' : 'Unopened'}`}
            >
              {/* Subtle top edge specular highlight */}
              {!tile.isOpened && (
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />
              )}

              {/* TILE CONTENT */}
              {!tile.isOpened ? (
                // UNOPENED: Crisp, bold stage numeral with subtle glow
                <div className="flex flex-col items-center justify-center relative w-full h-full min-h-0">
                  {/* Host X-Ray Peek Indicator */}
                  {isHostXrayActive && (
                    <div className="absolute top-0.5 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold tracking-wider bg-purple-950/90 border border-purple-400/50 text-purple-300 shadow-sm flex items-center gap-1">
                      <span>{tile.category === 'twist' ? 'TWIST' : tile.category.toUpperCase()}</span>
                      {tile.mediaUrl && <span className="text-[10px]">📸</span>}
                    </div>
                  )}

                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-300 leading-none">
                    {tile.id < 10 ? `0${tile.id}` : tile.id}
                  </span>

                  <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] sm:text-[9px] font-medium tracking-[0.2em] uppercase text-amber-200/80">
                      {isHostXrayActive && tile.category === 'twist'
                        ? tile.twist?.title || 'TWIST'
                        : 'LOCKED'}
                    </span>
                  </div>
                </div>
              ) : (
                // OPENED / SOLVED
                <div className="flex flex-col items-center justify-center text-center p-1 w-full h-full min-h-0 overflow-hidden">
                  <div className="mb-1 p-1.5 rounded-xl bg-slate-900/90 border border-white/[0.08]">
                    {getCategoryIcon(tile.category)}
                  </div>

                  <span className="text-[11px] sm:text-xs font-semibold text-slate-200 line-clamp-1 max-w-[90%]">
                    {tile.category === 'twist' ? 'Twist of Fate' : tile.title}
                  </span>

                  {/* Stamp of solving team or twist badge */}
                  {tile.category === 'twist' ? (
                    <div className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider bg-purple-950/60 text-purple-300 border border-purple-500/40">
                      Triggered
                    </div>
                  ) : solvedTeam ? (
                    <div
                      className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide flex items-center gap-1 border"
                      style={{
                        backgroundColor: `${solvedTeam.color}15`,
                        borderColor: `${solvedTeam.color}60`,
                        color: solvedTeam.color,
                      }}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[60px] sm:max-w-[80px]">{solvedTeam.name}</span>
                    </div>
                  ) : (
                    <span className="mt-1 text-[9px] text-slate-500 font-medium">
                      Completed
                    </span>
                  )}

                  <span className="text-[8px] text-slate-500 font-mono mt-1">
                    #{tile.id}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
