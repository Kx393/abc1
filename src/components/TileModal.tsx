/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TileData, Team, TwistConfig, executeTwist, TwistExecutionResult } from '../game/twistRules';
import {
  playTimerTickSound,
  playCorrectSound,
  playBuzzerSound,
  playDramaticTwistSound,
  playHeistSound,
  playJackpotChime,
} from '../utils/soundEffects';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  Flame,
  AlertTriangle,
  RefreshCw,
  Award,
  Scale,
  Shield,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

interface TileModalProps {
  tile: TileData | null;
  teams: Team[];
  activeTeamId: string;
  onClose: () => void;
  onApplyQuestionScore: (tileId: number, teamId: string, points: number) => void;
  onApplyTwistResult: (tileId: number, result: TwistExecutionResult) => void;
  onMarkSolvedWithoutPoints: (tileId: number) => void;
}

export const TileModal: React.FC<TileModalProps> = ({
  tile,
  teams,
  activeTeamId,
  onClose,
  onApplyQuestionScore,
  onApplyTwistResult,
  onMarkSolvedWithoutPoints,
}) => {
  if (!tile) return null;

  const isTwist = tile.category === 'twist' && !!tile.twist;
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  // 30-Second Stage Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Question Answer Reveal State
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Twist target team state (for STEAL_POINTS or SWAP_SCORES)
  const opponents = teams.filter((t) => t.id !== activeTeamId);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    opponents.length > 0 ? opponents[0].id : ''
  );
  const [twistExecutedResult, setTwistExecutedResult] = useState<TwistExecutionResult | null>(null);

  // On mount, if it's a twist, play dramatic sound effect!
  useEffect(() => {
    if (isTwist) {
      playDramaticTwistSound();
    }
  }, [isTwist]);

  // Timer Tick Interval
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            playBuzzerSound();
            return 0;
          }
          playTimerTickSound(prev <= 6);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(30);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(30);
  };

  // Execute Twist Handler
  const handleExecuteTwist = () => {
    if (!tile.twist) return;

    // Visual confetti & sound depending on twist type
    if (tile.twist.type === 'STEAL_POINTS') {
      playHeistSound();
    } else if (tile.twist.type === 'DOUBLE_SCORE' || tile.twist.type === 'JACKPOT') {
      playJackpotChime();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    } else if (tile.twist.type === 'LOSE_POINTS') {
      playBuzzerSound();
    } else {
      playCorrectSound();
    }

    const result = executeTwist(tile.twist, activeTeamId, teams, selectedTargetId);
    setTwistExecutedResult(result);
    onApplyTwistResult(tile.id, result);
  };

  // Award Question Points
  const handleAwardPoints = (targetTeamId: string) => {
    playCorrectSound();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
    });
    onApplyQuestionScore(tile.id, targetTeamId, tile.points);
    onClose();
  };

  const handleIncorrect = () => {
    playBuzzerSound();
    onMarkSolvedWithoutPoints(tile.id);
    onClose();
  };

  // Twist icon helper
  const renderTwistIcon = (type: string) => {
    switch (type) {
      case 'STEAL_POINTS':
        return <Zap className="w-10 h-10 text-rose-400 animate-pulse" />;
      case 'DOUBLE_SCORE':
        return <Flame className="w-10 h-10 text-amber-400 animate-bounce" />;
      case 'LOSE_POINTS':
        return <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />;
      case 'SWAP_SCORES':
        return <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />;
      case 'JACKPOT':
        return <Award className="w-10 h-10 text-emerald-400 animate-pulse" />;
      case 'EQUALIZER':
        return <Scale className="w-10 h-10 text-cyan-400" />;
      default:
        return <Shield className="w-10 h-10 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-8 border shadow-2xl transition-all ${
          isTwist
            ? 'bg-slate-950 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.15)]'
            : 'bg-slate-950 border-white/[0.1] shadow-[0_0_50px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Soft atmospheric gradient glow behind modal */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15 ${
            isTwist ? 'bg-purple-600' : 'bg-amber-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-20 cursor-pointer border border-white/[0.08]"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ------------------- TWIST CARD VIEW ------------------- */}
        {isTwist && tile.twist ? (
          <div className="flex flex-col items-center text-center space-y-5">
            {/* Minimalist Theatrical Twist Banner */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-purple-300">
                TWIST OF FATE · TILE #{tile.id < 10 ? `0${tile.id}` : tile.id}
              </span>
            </div>

            {/* Twist Centerpiece Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-purple-950/60 to-slate-900/90 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-950/50">
              {renderTwistIcon(tile.twist.type)}
            </div>

            {/* Twist Headline & Description */}
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                {tile.twist.title}
              </h2>
              <p className="text-sm sm:text-base font-medium text-amber-300/90 leading-relaxed">
                {tile.twist.description}
              </p>
            </div>

            {/* Target Opponent Selection (For Steal or Swap) */}
            {(tile.twist.type === 'STEAL_POINTS' || tile.twist.type === 'SWAP_SCORES') &&
              !twistExecutedResult && (
                <div className="w-full max-w-md bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 text-left space-y-2.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    Target Table:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opponents.map((opp) => (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => setSelectedTargetId(opp.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedTargetId === opp.id
                            ? 'bg-purple-950/50 border-purple-400 text-white shadow-sm ring-1 ring-purple-400/40'
                            : 'bg-slate-950 border-white/[0.06] text-slate-300 hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{opp.avatarEmoji}</span>
                          <span className="text-xs font-semibold truncate max-w-[100px]">
                            {opp.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-amber-400">
                          {opp.score} pts
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Twist Execution Banner / Message */}
            {twistExecutedResult ? (
              <div className="w-full max-w-lg p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 font-semibold text-sm animate-in zoom-in-95 duration-200 shadow-lg">
                {twistExecutedResult.message}
              </div>
            ) : null}

            {/* Twist Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!twistExecutedResult ? (
                <button
                  onClick={handleExecuteTwist}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-sm sm:text-base font-bold tracking-wide shadow-lg shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Execute Twist
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-7 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold border border-white/[0.1] transition-colors cursor-pointer"
                >
                  Return to Matrix
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ------------------- REGULAR TRIVIA / CHALLENGE VIEW ------------------- */
          <div className="flex flex-col space-y-5">
            {/* Header: Category Badge + Points + Tile ID */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-amber-400">
                  {tile.category.replace('_', ' ')}
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Tile #{tile.id < 10 ? `0${tile.id}` : tile.id}
                </span>
              </div>

              <div className="px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold text-xs sm:text-sm tracking-tight">
                +{tile.points} PTS
              </div>
            </div>

            {/* Active Team Header Bar + 30s Countdown */}
            <div className="flex items-center justify-between bg-slate-900/50 border border-white/[0.06] rounded-2xl px-3.5 py-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${activeTeam.color}20`, color: activeTeam.color }}
                >
                  {activeTeam.avatarEmoji}
                </div>
                <div className="text-xs sm:text-sm text-slate-300">
                  <span className="text-slate-500 font-normal">Active: </span>
                  <span className="font-semibold" style={{ color: activeTeam.color }}>
                    {activeTeam.name}
                  </span>
                </div>
              </div>

              {/* 30-Second Stage Countdown Timer HUD */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs sm:text-sm tabular-nums transition-colors ${
                    timeLeft <= 5
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
                      : timeLeft <= 10
                      ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900 border-white/[0.08] text-slate-200'
                  }`}
                >
                  <span>{timeLeft}s</span>
                </div>
                <button
                  onClick={toggleTimer}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Reset 30s Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Clue ribbon if available */}
            {tile.visualClue && (
              <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/5 border border-amber-400/20">
                <span className="text-amber-400 font-semibold uppercase text-[10px] tracking-wider">Clue:</span>
                <span>{tile.visualClue}</span>
              </div>
            )}

            {/* STAGE MEDIA DISPLAY (PHOTO, AUDIO, OR VIDEO) */}
            {tile.mediaUrl && (
              <div className="w-full rounded-2xl overflow-hidden border border-white/[0.1] bg-slate-950 shadow-xl relative group">
                {/* Image Display */}
                {(!tile.mediaType || tile.mediaType === 'image') && (
                  <div className="relative aspect-video max-h-[180px] sm:max-h-[230px] md:max-h-[260px] w-full flex items-center justify-center bg-slate-900/60 overflow-hidden">
                    <img
                      src={tile.mediaUrl}
                      alt={tile.title || 'Question Visual'}
                      className="w-full h-full object-contain"
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    {tile.mediaTitle && (
                      <div className="absolute bottom-2 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm text-xs font-semibold text-white border border-white/[0.1]">
                        {tile.mediaTitle}
                      </div>
                    )}
                  </div>
                )}

                {/* Audio Player Display */}
                {(tile.mediaType === 'audio' || tile.mediaType === 'audio_cue') && (
                  <div className="p-3 sm:p-4 bg-slate-900/80 flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-lg shrink-0">
                      🎵
                    </div>
                    <div className="flex-1 w-full space-y-1 text-center sm:text-left">
                      <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                        Audio Track Clue
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        {tile.mediaTitle || 'Listen to the audio clip below'}
                      </div>
                      <audio
                        controls
                        src={tile.mediaUrl}
                        className="w-full mt-1 h-8 rounded-lg filter invert hue-rotate-180"
                      >
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  </div>
                )}

                {/* Video Player Display */}
                {tile.mediaType === 'video' && (
                  <div className="relative aspect-video max-h-[180px] sm:max-h-[230px] md:max-h-[260px] w-full bg-black flex items-center justify-center">
                    <video
                      controls
                      src={tile.mediaUrl}
                      className="w-full h-full object-contain"
                      preload="metadata"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                )}
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100 tracking-tight leading-snug">
              {tile.question}
            </h2>

            {/* Host Solution Drawer */}
            <div className="border border-white/[0.08] rounded-2xl bg-slate-900/40 p-3 sm:p-4 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                  Anchor / Host Solution
                </span>
                <button
                  onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isAnswerRevealed ? 'Hide Solution' : 'Reveal Solution'}
                </button>
              </div>

              {isAnswerRevealed && (
                <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-1 animate-in fade-in duration-150">
                  <div className="text-sm sm:text-base font-bold text-emerald-400">
                    {tile.answer}
                  </div>
                  {tile.extraNotes && (
                    <div className="text-xs text-slate-400 italic">
                      Host Note: {tile.extraNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Anchor Scoring Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <button
                onClick={handleIncorrect}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-white/[0.08] hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Pass / No Score
              </button>

              <div className="flex items-center gap-2">
                {/* Award directly to Active Team */}
                <button
                  onClick={() => handleAwardPoints(activeTeamId)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Award +{tile.points} to {activeTeam.name}
                </button>
              </div>
            </div>

            {/* Quick Award to Opponent Tables if Question was Stolen/Passed */}
            {opponents.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Or Award To:
                </span>
                {opponents.map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => handleAwardPoints(opp.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/[0.06] hover:border-white/[0.15] text-slate-300 hover:text-white text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{opp.avatarEmoji}</span>
                    <span>+{tile.points} to {opp.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
