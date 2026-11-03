/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TileData, TileCategory, TwistType } from '../game/twistRules';
import {
  X,
  Wand2,
  Image,
  Music,
  Video,
  Zap,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  Eye,
  Check,
  Film,
  Plus,
} from 'lucide-react';

interface AIControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tiles: TileData[];
  onUpdateTiles: (updatedTiles: TileData[]) => void;
  isHostXrayActive: boolean;
  onToggleHostXray: () => void;
}

const PRESET_MEDIA = [
  {
    name: 'Sholay Scooter & Sidecar',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Red Sindoor Powder',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bollywood Party Dress (Sequin & Glow)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'DDLJ Alps & Violin Mood',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chaiyya Chaiyya Steam Train',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chennai Express Train',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Golden Trophy / Mystery Box',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sample Audio Clip (Chime/Tune)',
    type: 'audio' as const,
    url: 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3',
  },
];

export const AIControlPanel: React.FC<AIControlPanelProps> = ({
  isOpen,
  onClose,
  tiles,
  onUpdateTiles,
  isHostXrayActive,
  onToggleHostXray,
}) => {
  const [selectedTileId, setSelectedTileId] = useState<number>(1);
  const [localTiles, setLocalTiles] = useState<TileData[]>(tiles);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentTile = localTiles.find((t) => t.id === selectedTileId) || localTiles[0];

  const handleUpdateCurrentTile = (partial: Partial<TileData>) => {
    setLocalTiles((prev) =>
      prev.map((t) => (t.id === selectedTileId ? { ...t, ...partial } : t))
    );
  };

  const handleToggleTwist = (isTwist: boolean) => {
    if (isTwist) {
      handleUpdateCurrentTile({
        category: 'twist',
        points: 0,
        title: '⚡ MYSTERY TWIST',
        twist: {
          type: 'STEAL_POINTS',
          title: 'Point Heist',
          description: 'Steal 20 points from any rival team of your choice!',
          value: 20,
          badgeText: '⚡ POINT HEIST',
          flairColor: 'rose',
          iconName: 'Zap',
        },
      });
    } else {
      handleUpdateCurrentTile({
        category: 'trivia',
        points: 20,
        title: 'Stage Challenge',
        twist: undefined,
      });
    }
  };

  const handleTwistTypeChange = (type: TwistType) => {
    if (!currentTile.twist) return;

    let title = 'Mystery Twist';
    let description = 'A mystery game modifier!';
    let value = 20;
    let badgeText = '⚡ TWIST';
    let flairColor = 'purple';

    switch (type) {
      case 'STEAL_POINTS':
        title = 'Point Heist';
        description = 'Steal 20 points from any rival table!';
        value = 20;
        badgeText = '⚡ STEAL';
        flairColor = 'rose';
        break;
      case 'DOUBLE_SCORE':
        title = 'Multiplier Surge';
        description = "Your team's total score is DOUBLED instantly!";
        badgeText = '🎰 2X MULTIPLIER';
        flairColor = 'amber';
        break;
      case 'LOSE_POINTS':
        title = 'Chaos Penalty';
        description = 'Oops! Deduct 15 points from your team score!';
        value = 15;
        badgeText: '💥 PENALTY';
        flairColor = 'red';
        break;
      case 'SWAP_SCORES':
        title = 'Karma Swap';
        description = 'Swap scores with whoever is currently leading in 1st Place!';
        badgeText = '🔄 KARMA SWAP';
        flairColor = 'purple';
        break;
      case 'JACKPOT':
        title = 'Golden Mystery Jackpot';
        description = 'Surprise stage bounty: +40 points awarded to your team!';
        value = 40;
        badgeText = '🎁 +40 JACKPOT';
        flairColor = 'emerald';
        break;
      case 'EQUALIZER':
        title = 'Robin Hood Equalizer';
        description = 'Siphon 5 points from every other team into your account!';
        value = 5;
        badgeText = '⚖️ EQUALIZER';
        flairColor = 'cyan';
        break;
    }

    handleUpdateCurrentTile({
      twist: {
        type,
        title,
        description,
        value,
        badgeText,
        flairColor,
        iconName: 'Zap',
      },
    });
  };

  // Local File Upload handler (Converts to Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const type = file.type.startsWith('video')
        ? 'video'
        : file.type.startsWith('audio')
        ? 'audio'
        : 'image';

      handleUpdateCurrentTile({
        mediaUrl: result,
        mediaType: type,
        mediaTitle: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  // AI Assistance: Generate / Polish Question with Gemini AI
  const handleAiGenerateTile = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      // Call server-side Gemini API or intelligent prompt synthesizer
      const response = await fetch('/api/gemini/generate-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          tileId: selectedTileId,
          isTwist: currentTile.category === 'twist',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        handleUpdateCurrentTile({
          title: data.title || currentTile.title,
          question: data.question || currentTile.question,
          answer: data.answer || currentTile.answer,
          visualClue: data.visualClue || currentTile.visualClue,
          mediaUrl: data.mediaUrl || currentTile.mediaUrl,
          mediaType: data.mediaType || currentTile.mediaType || 'image',
          points: data.points || currentTile.points,
        });
      } else {
        // Fallback intelligent stage generator if server route is offline
        generateFallbackStageChallenge(aiPrompt);
      }
    } catch {
      generateFallbackStageChallenge(aiPrompt);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  const generateFallbackStageChallenge = (promptText: string) => {
    const lower = promptText.toLowerCase();
    if (lower.includes('song') || lower.includes('sing') || lower.includes('music')) {
      handleUpdateCurrentTile({
        category: 'song',
        title: 'Sing This Song !!',
        question: `Look at the stage screen! Sing 2 lines from the most famous anthem matching: "${promptText}"!`,
        visualClue: '🎤 🎶 Retro Mic',
        mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        answer: 'Lead vocal performance approved by audience!',
        points: 20,
      });
    } else if (lower.includes('movie') || lower.includes('film') || lower.includes('cinema')) {
      handleUpdateCurrentTile({
        category: 'movie',
        title: 'Guess the Movie !!',
        question: `Guess the blockbuster movie from the iconic clue: "${promptText}"!`,
        visualClue: '🎬 🍿 Cinema Roll',
        mediaUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        answer: 'Audience validates the correct title!',
        points: 20,
      });
    } else if (lower.includes('dance') || lower.includes('hook') || lower.includes('step')) {
      handleUpdateCurrentTile({
        category: 'hook_step',
        title: 'Dance Arena (Hook Step)',
        question: `Perform the signature 15-second hook step for: "${promptText}"!`,
        visualClue: '🕺 💃 Crowd Energy',
        mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        answer: 'High energy dance routine!',
        points: 30,
      });
    } else if (lower.includes('twist') || lower.includes('steal') || lower.includes('karma')) {
      handleToggleTwist(true);
    } else {
      handleUpdateCurrentTile({
        category: 'trivia',
        title: 'Stage Challenge',
        question: `Live Audience Challenge: ${promptText}`,
        visualClue: '💡 🧠 Sharp Wit',
        answer: 'Correct answer verified by MC!',
        points: 20,
      });
    }
  };

  const handleSaveAll = () => {
    onUpdateTiles(localTiles);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-[2px] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Anchor AI Control Panel & Question Editor
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI ASSISTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customize question prompts, assign images, audio, video clips, and configure secret twists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Host X-Ray Peek Toggle */}
            <button
              onClick={onToggleHostXray}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHostXrayActive
                  ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-lg shadow-purple-900/30'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Peek which tiles are secret twists on the board"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isHostXrayActive ? 'Host X-Ray (ON)' : 'Host X-Ray (OFF)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tile Matrix Selector Ribbon (1 to 16) */}
        <div className="py-3 border-b border-slate-800 shrink-0">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
            Select Tile to Edit:
          </label>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
            {localTiles.map((t) => {
              const isSelected = t.id === selectedTileId;
              const isTwist = t.category === 'twist';
              const hasMedia = !!t.mediaUrl;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTileId(t.id)}
                  className={`relative p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-105 shadow-md'
                      : isTwist
                      ? 'bg-purple-950/70 border border-purple-500/40 text-purple-200 hover:border-purple-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span>{t.id}</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isTwist && <span className="text-[8px]">⚡</span>}
                    {hasMedia && <span className="text-[8px]">📸</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-5">
          {/* Tile Type Switcher: Question vs Twist */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Tile #{currentTile.id} Archetype:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleToggleTwist(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentTile.category !== 'twist'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Regular Question
                </button>
                <button
                  onClick={() => handleToggleTwist(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    currentTile.category === 'twist'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  Secret AI Twist Card
                </button>
              </div>
            </div>

            {currentTile.category !== 'twist' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Points Value:</span>
                {[10, 20, 30, 40].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => handleUpdateCurrentTile({ points: pts })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      currentTile.points === pts
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI PROMPT ASSISTANT BAR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Question & Clue Assistant
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'Make this a hilarious 90s Bollywood song challenge with scooter photo' or 'Steal 30 points twist'..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleAiGenerateTile}
                disabled={!aiPrompt.trim() || isGenerating}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
          </div>

          {/* TWIST SPECIFIC SETTINGS */}
          {currentTile.category === 'twist' && currentTile.twist ? (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Select Twist Archetype:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'STEAL_POINTS', name: '⚡ Point Heist (Steal)', desc: 'Steal points from a rival' },
                    { id: 'DOUBLE_SCORE', name: '🎰 2x Multiplier Surge', desc: 'Double team score' },
                    { id: 'SWAP_SCORES', name: '🔄 Karma Swap', desc: 'Swap with 1st place team' },
                    { id: 'LOSE_POINTS', name: '💥 Chaos Penalty', desc: 'Deduct penalty points' },
                    { id: 'JACKPOT', name: '🎁 Golden Jackpot', desc: 'Instant bonus bounty' },
                    { id: 'EQUALIZER', name: '⚖️ The Equalizer', desc: 'Siphon 5 pts from all teams' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTwistTypeChange(t.id as TwistType)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        currentTile.twist?.type === t.id
                          ? 'bg-purple-900/60 border-purple-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Twist Headline:
                  </label>
                  <input
                    type="text"
                    value={currentTile.twist.title}
                    onChange={(e) =>
                      handleUpdateCurrentTile({
                        twist: { ...currentTile.twist!, title: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Stage Description:
                  </label>
                  <input
                    type="text"
                    value={currentTile.twist.description}
                    onChange={(e) =>
                      handleUpdateCurrentTile({
                        twist: { ...currentTile.twist!, description: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* REGULAR QUESTION SETTINGS */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Category:
                  </label>
                  <select
                    value={currentTile.category}
                    onChange={(e) =>
                      handleUpdateCurrentTile({ category: e.target.value as TileCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
                  >
                    <option value="song">Song / Music Challenge</option>
                    <option value="movie">Movie / Scene Guess</option>
                    <option value="hook_step">Hook Step / Dance</option>
                    <option value="observation">Observation / Spot Error</option>
                    <option value="dialogue">Dialogue / Punchline</option>
                    <option value="rapid_fire">Rapid Fire Blitz</option>
                    <option value="trivia">General Trivia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tile Title / Badge:
                  </label>
                  <input
                    type="text"
                    value={currentTile.title}
                    onChange={(e) => handleUpdateCurrentTile({ title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Visual Hint / Clue:
                  </label>
                  <input
                    type="text"
                    value={currentTile.visualClue || ''}
                    onChange={(e) => handleUpdateCurrentTile({ visualClue: e.target.value })}
                    placeholder="e.g. 🛵 🌾 Sholay Scooter"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Question Prompt (Displayed Large on Stage):
                </label>
                <textarea
                  rows={2}
                  value={currentTile.question}
                  onChange={(e) => handleUpdateCurrentTile({ question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Answer (Shown to Anchor & Revealed on Spacebar):
                  </label>
                  <input
                    type="text"
                    value={currentTile.answer}
                    onChange={(e) => handleUpdateCurrentTile({ answer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Host Stage Notes:
                  </label>
                  <input
                    type="text"
                    value={currentTile.extraNotes || ''}
                    onChange={(e) => handleUpdateCurrentTile({ extraNotes: e.target.value })}
                    placeholder="e.g. Tease the audience or give bonus 10 pts for vocal flair"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* MEDIA ATTACHMENT SECTION (IMAGE, AUDIO, VIDEO) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Stage Media Attachment
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Photos, songs, video clips)
                    </span>
                  </div>

                  {/* Media Type Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleUpdateCurrentTile({ mediaType: 'image' })}
                      className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                        !currentTile.mediaType || currentTile.mediaType === 'image'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Image className="w-3 h-3" />
                      Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCurrentTile({ mediaType: 'audio' })}
                      className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                        currentTile.mediaType === 'audio'
                          ? 'bg-purple-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Music className="w-3 h-3" />
                      Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCurrentTile({ mediaType: 'video' })}
                      className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                        currentTile.mediaType === 'video'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      Video
                    </button>
                    {currentTile.mediaUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCurrentTile({ mediaUrl: undefined, mediaTitle: undefined })
                        }
                        className="px-2 py-0.5 text-xs text-rose-400 hover:underline ml-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Media URL / Upload Input */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Media Web URL:
                      </label>
                      <input
                        type="text"
                        value={currentTile.mediaUrl || ''}
                        onChange={(e) => handleUpdateCurrentTile({ mediaUrl: e.target.value })}
                        placeholder="https://... (image, mp3, mp4)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    {/* Or upload local file */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Or Upload File From Your Computer:
                      </label>
                      <label className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 border-dashed text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Choose Local Image or Audio File</span>
                        <input
                          type="file"
                          accept="image/*,audio/*,video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preset Media Quick Library */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Quick Preset Stage Library:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_MEDIA.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              handleUpdateCurrentTile({
                                mediaUrl: preset.url,
                                mediaType: preset.type,
                                mediaTitle: preset.name,
                              })
                            }
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 text-[10px] font-medium transition-colors"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Media Live Preview */}
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 flex flex-col items-center justify-center min-h-[140px] text-center">
                    {currentTile.mediaUrl ? (
                      currentTile.mediaType === 'audio' ? (
                        <div className="w-full p-2 space-y-2">
                          <span className="text-xs text-purple-300 font-bold block">
                            🎵 Audio Preview
                          </span>
                          <audio controls src={currentTile.mediaUrl} className="w-full h-8" />
                        </div>
                      ) : currentTile.mediaType === 'video' ? (
                        <video
                          controls
                          src={currentTile.mediaUrl}
                          className="max-h-[120px] rounded-lg"
                        />
                      ) : (
                        <img
                          src={currentTile.mediaUrl}
                          alt="Preview"
                          className="max-h-[120px] object-contain rounded-lg shadow-md"
                        />
                      )
                    ) : (
                      <div className="text-slate-500 text-xs flex flex-col items-center gap-1">
                        <Film className="w-6 h-6 opacity-40" />
                        <span>No media attached yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Changes Applied to Stage Matrix!
              </span>
            ) : (
              <span>All 16 tiles update in real time on the live stage matrix.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save & Apply to Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
