/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GamePack, ALL_PACKS } from '../data/defaultPacks';
import { Team, TileData } from '../game/twistRules';
import {
  X,
  Layers,
  Sparkles,
  Users,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Wand2,
  HelpCircle,
} from 'lucide-react';

interface DeckManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackId: string;
  onSelectPack: (pack: GamePack) => void;
  teams: Team[];
  onUpdateTeams: (newTeams: Team[]) => void;
  onResetBoard: () => void;
  onApplyCustomTiles: (tiles: TileData[], packName: string) => void;
  customPacks?: GamePack[];
  onDeleteCustomPack?: (packId: string) => void;
}

const EMOJI_OPTIONS = ['🦁', '⚡', '🛡️', '🔥', '🦈', '🚀', '👑', '🎯', '🐅', '🦅'];
const COLOR_OPTIONS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];

export const DeckManagerModal: React.FC<DeckManagerModalProps> = ({
  isOpen,
  onClose,
  currentPackId,
  onSelectPack,
  teams,
  onUpdateTeams,
  onResetBoard,
  onApplyCustomTiles,
  customPacks = [],
  onDeleteCustomPack,
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'teams' | 'ai'>('packs');
  const [localTeams, setLocalTeams] = useState<Team[]>(teams);
  const [themePrompt, setThemePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsg, setGenerationMsg] = useState('');

  if (!isOpen) return null;

  // Team management handlers
  const handleTeamNameChange = (id: string, name: string) => {
    setLocalTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const handleTeamEmojiChange = (id: string, emoji: string) => {
    setLocalTeams((prev) => prev.map((t) => (t.id === id ? { ...t, avatarEmoji: emoji } : t)));
  };

  const handleTeamColorChange = (id: string, color: string) => {
    setLocalTeams((prev) => prev.map((t) => (t.id === id ? { ...t, color } : t)));
  };

  const handleAddTeam = () => {
    if (localTeams.length >= 6) return;
    const nextNum = localTeams.length + 1;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `Team ${nextNum}`,
      score: 0,
      avatarEmoji: EMOJI_OPTIONS[localTeams.length % EMOJI_OPTIONS.length],
      color: COLOR_OPTIONS[localTeams.length % COLOR_OPTIONS.length],
    };
    setLocalTeams([...localTeams, newTeam]);
  };

  const handleRemoveTeam = (id: string) => {
    if (localTeams.length <= 2) return;
    setLocalTeams(localTeams.filter((t) => t.id !== id));
  };

  const handleSaveTeams = () => {
    onUpdateTeams(localTeams);
    onClose();
  };

  // AI Theme Generator Handler (Generates tailored 16 tiles including twists!)
  const handleGenerateThemedBoard = () => {
    if (!themePrompt.trim()) return;
    setIsGenerating(true);
    setGenerationMsg('Crafting 16 high-energy stage challenges and mystery twists...');

    setTimeout(() => {
      // Build a custom 16-tile theme board with the requested theme!
      const theme = themePrompt.trim();
      const generatedTiles: TileData[] = [
        {
          id: 1,
          category: 'trivia',
          points: 20,
          title: `${theme} Trivia #1`,
          question: `Name the most memorable founding milestone or icon in ${theme}!`,
          visualClue: '🌟 🏛️ Landmark',
          answer: `Host discretion / Iconic milestone of ${theme}`,
          isOpened: false,
        },
        {
          id: 2,
          category: 'twist',
          points: 0,
          title: '⚡ MYSTERY TWIST',
          question: 'AI POINT HEIST: STEAL 20 POINTS!',
          visualClue: '🚨 High Voltage',
          answer: 'Steal 20 points from any rival team!',
          twist: {
            type: 'STEAL_POINTS',
            title: 'Point Heist',
            description: 'Steal 20 points from any rival table!',
            value: 20,
            badgeText: '⚡ POINT HEIST',
            flairColor: 'rose',
            iconName: 'Zap',
          },
          isOpened: false,
        },
        {
          id: 3,
          category: 'song',
          points: 20,
          title: 'Sing / Melody Clue',
          question: `Sing 2 lines from the most famous anthem or cheer associated with ${theme}!`,
          visualClue: '🎤 🎶 Stage Mic',
          answer: 'Team delivers a lively crowd chorus!',
          isOpened: false,
        },
        {
          id: 4,
          category: 'hook_step',
          points: 30,
          title: 'Action Challenge',
          question: `Show off a signature 15-second group celebration or cheer for ${theme}!`,
          visualClue: '🕺 💃 Crowd Energy',
          answer: 'Audience applause approves!',
          isOpened: false,
        },
        {
          id: 5,
          category: 'twist',
          points: 0,
          title: '⚡ MYSTERY TWIST',
          question: 'KARMA ENGINE ACTIVATED: SWAP SCORES!',
          visualClue: '🔄 Cosmic Swap',
          answer: 'Swap scores with whoever is currently leading in 1st Place!',
          twist: {
            type: 'SWAP_SCORES',
            title: 'Karma Swap',
            description: 'Swap your current points with the #1 team on stage!',
            badgeText: '🔄 KARMA SWAP',
            flairColor: 'purple',
            iconName: 'RefreshCw',
          },
          isOpened: false,
        },
        {
          id: 6,
          category: 'observation',
          points: 20,
          title: 'Observation Test',
          question: `What is the most common misconception or error people make about ${theme}?`,
          visualClue: '🔍 🧐 Sharp Eye',
          answer: 'Correctly identify the popular myth!',
          isOpened: false,
        },
        {
          id: 7,
          category: 'dialogue',
          points: 20,
          title: 'Quote & Punchline',
          question: `Deliver the most memorable catchphrase or punchline related to ${theme}!`,
          visualClue: '💬 🗣️ Famous Words',
          answer: 'Team delivers the punchline with dramatic flair!',
          isOpened: false,
        },
        {
          id: 8,
          category: 'twist',
          points: 0,
          title: '⚡ MYSTERY TWIST',
          question: 'MULTIPLIER SURGE: 2X SCORE MULTIPLIER!',
          visualClue: '🎰 Jackpot Lights',
          answer: 'Your team points DOUBLE immediately!',
          twist: {
            type: 'DOUBLE_SCORE',
            title: 'Score Multiplier',
            description: 'Your team total score is DOUBLED instantly! (Or +30 if at 0).',
            badgeText: '🎰 2X MULTIPLIER',
            flairColor: 'amber',
            iconName: 'Flame',
          },
          isOpened: false,
        },
        {
          id: 9,
          category: 'rapid_fire',
          points: 30,
          title: 'Rapid Fire 15s',
          question: `Name 4 key legends or items related to ${theme} within 15 seconds!`,
          visualClue: '⏱️ 🔥 Speed Clock',
          answer: 'Must complete without pause before the timer buzzes!',
          isOpened: false,
        },
        {
          id: 10,
          category: 'twist',
          points: 0,
          title: '⚡ MYSTERY TWIST',
          question: 'CHAOS TAX: LOSE 15 POINTS!',
          visualClue: '💥 Red Penalty',
          answer: 'Lose 15 points to the house!',
          twist: {
            type: 'LOSE_POINTS',
            title: 'Chaos Penalty',
            description: 'Sudden penalty! Deduct 15 points from your score.',
            value: 15,
            badgeText: '💥 CHAOS PENALTY',
            flairColor: 'red',
            iconName: 'AlertTriangle',
          },
          isOpened: false,
        },
        {
          id: 11,
          category: 'movie',
          points: 20,
          title: 'Pop Culture / Media',
          question: `Which movie, show, or viral reel best represents the spirit of ${theme}?`,
          visualClue: '🎬 📱 Viral Screen',
          answer: 'Host and crowd validate the answer!',
          isOpened: false,
        },
        {
          id: 12,
          category: 'trivia',
          points: 20,
          title: 'Brain Buster',
          question: `What unexpected secret fact or record holder exists in ${theme}?`,
          visualClue: '💡 🧠 Hidden Fact',
          answer: 'Revealed answer by MC!',
          isOpened: false,
        },
        {
          id: 13,
          category: 'twist',
          points: 0,
          title: '⚡ MYSTERY TWIST',
          question: 'ROBIN HOOD: THE EQUALIZER!',
          visualClue: '⚖️ Siphon Ring',
          answer: 'Steal 5 points from every opposing team!',
          twist: {
            type: 'EQUALIZER',
            title: 'Robin Hood Equalizer',
            description: 'Siphon 5 points from every opposing table into your score!',
            value: 5,
            badgeText: '⚖️ EQUALIZER',
            flairColor: 'cyan',
            iconName: 'Scale',
          },
          isOpened: false,
        },
        {
          id: 14,
          category: 'song',
          points: 20,
          title: 'Crowd Antakshari',
          question: `Lead the entire hall in singing any feel-good anthem!`,
          visualClue: '🎶 👏 Hall Chorus',
          answer: 'High volume singing from audience unlocks full points!',
          isOpened: false,
        },
        {
          id: 15,
          category: 'dialogue',
          points: 20,
          title: 'Impersonation Stunt',
          question: `One player must impersonate someone famous associated with ${theme}!`,
          visualClue: '🎭 🥸 Mirror Actor',
          answer: 'Guessed within 20 seconds!',
          isOpened: false,
        },
        {
          id: 16,
          category: 'twist',
          points: 0,
          title: '⚡ MYSTERY TWIST',
          question: 'GOLDEN BOUNTY: MYSTERY JACKPOT!',
          visualClue: '🎁 Golden Chest',
          answer: 'Instant +40 points awarded!',
          twist: {
            type: 'JACKPOT',
            title: 'Golden Mystery Box',
            description: 'Massive +40 point bounty awarded to your team!',
            value: 40,
            badgeText: '🎁 +40 JACKPOT',
            flairColor: 'emerald',
            iconName: 'Award',
          },
          isOpened: false,
        },
      ];

      onApplyCustomTiles(generatedTiles, `${theme} Stage Showdown`);
      setIsGenerating(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Event Stage Setup & Theme Packs
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('packs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'packs'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Curated Packs
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Stage Teams ({localTeams.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/30'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            AI Theme Generator
          </button>
        </div>

        {/* TAB 1: CURATED PACKS & SAVED CUSTOM PACKS */}
        {activeTab === 'packs' && (
          <div className="space-y-4">
            {customPacks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <span>Saved Custom Shows ({customPacks.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Stored on server</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customPacks.map((pack) => {
                    const isSelected = pack.id === currentPackId;
                    return (
                      <div
                        key={pack.id}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 relative group ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/10'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          onClick={() => {
                            onSelectPack(pack);
                            onClose();
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {pack.badge || 'Custom Show'}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                          </div>
                          <h4 className="text-sm font-black text-white mt-2">{pack.name}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {pack.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-800/60 mt-2">
                          <span>16 Tiles Saved</span>
                          {onDeleteCustomPack && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCustomPack(pack.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                              title="Delete saved show"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Built-in Show Decks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_PACKS.map((pack) => {
                  const isSelected = pack.id === currentPackId;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => {
                        onSelectPack(pack);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {pack.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <h4 className="text-sm font-black text-white mt-2">{pack.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {pack.description}
                        </p>
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold pt-1">
                        16 Tiles • 6 High-Impact Twists Included
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Want a clean slate for the current board?
              </span>
              <button
                onClick={() => {
                  onResetBoard();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All 16 Tiles
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: STAGE TEAMS */}
        {activeTab === 'teams' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="space-y-2.5">
              {localTeams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  {/* Emoji selector */}
                  <select
                    value={team.avatarEmoji}
                    onChange={(e) => handleTeamEmojiChange(team.id, e.target.value)}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-lg flex items-center justify-center text-center cursor-pointer"
                  >
                    {EMOJI_OPTIONS.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>

                  {/* Team name input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                      placeholder={`Team ${idx + 1}`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Color selector */}
                  <div className="flex items-center gap-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleTeamColorChange(team.id, c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          team.color === c ? 'scale-125 border-white ring-1 ring-amber-400' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>

                  {/* Remove button */}
                  {localTeams.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTeam(team.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleAddTeam}
                disabled={localTeams.length >= 6}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stage Table / Team (Max 6)
              </button>
              <button
                type="button"
                onClick={handleSaveTeams}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors"
              >
                Save Teams
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AI THEME GENERATOR */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Custom Event Matrix Generator
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hosting a wedding sangeet, medical offsite, tech hackathon, or university gala? Enter your event theme below to instantly configure a 16-tile stage grid packed with trivia, songs, observation riddles, and dramatic AI twist cards!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Event / Party Theme:
              </label>
              <input
                type="text"
                value={themePrompt}
                onChange={(e) => setThemePrompt(e.target.value)}
                placeholder="e.g. 90s Bollywood Night, Tech Startup Gala, Sangeet Family Clash, Medical Summit..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-500 font-semibold py-1">Quick Suggestions:</span>
              {['90s Retro Disco', 'Silicon Valley Tech Gala', 'Wedding Sangeet Battle', 'College Fest Chaos'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setThemePrompt(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/40 text-purple-200 border border-slate-700 hover:border-purple-500/50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            {generationMsg && (
              <div className="text-xs text-amber-300 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {generationMsg}
              </div>
            )}

            <button
              onClick={handleGenerateThemedBoard}
              disabled={!themePrompt.trim() || isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:from-purple-400 hover:to-amber-400 disabled:opacity-40 text-white font-black text-sm tracking-wide shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              Generate 16-Tile Stage Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
