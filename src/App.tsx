/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scoreboard } from './components/Scoreboard';
import { GridBoard } from './components/GridBoard';
import { TileModal } from './components/TileModal';
import { SoundboardModal } from './components/SoundboardModal';
import { VictoryModal } from './components/VictoryModal';
import { DeckManagerModal } from './components/DeckManagerModal';
import { AIControlPanel } from './components/AIControlPanel';
import { UserGuideModal } from './components/UserGuideModal';
import { BOLLYWOOD_STAGE_PACK, DEFAULT_TEAMS, GamePack } from './data/defaultPacks';
import { TileData, Team, TwistExecutionResult, isGameOver } from './game/twistRules';
import {
  playCorrectSound,
  playBuzzerSound,
  playDramaticTwistSound,
  playVictoryFanfare,
} from './utils/soundEffects';
import {
  getLocalCachedState,
  getLocalCachedPacks,
  fetchServerState,
  saveStateToServer,
  resetServerGameState,
  fetchServerCustomPacks,
  saveCustomPackToServer,
  deleteCustomPackFromServer,
  PersistedGameState,
} from './utils/storageService';
import { Zap, Volume2, Sparkles, Play, Award, RotateCcw, Cloud, Save } from 'lucide-react';

export default function App() {
  // Synchronous cache read so initial render is instantaneous without layout flicker
  const initialCache = getLocalCachedState();

  // Game State
  const [currentPack, setCurrentPack] = useState<GamePack>(
    initialCache?.currentPack || BOLLYWOOD_STAGE_PACK
  );
  const [tiles, setTiles] = useState<TileData[]>(
    initialCache?.tiles || BOLLYWOOD_STAGE_PACK.tiles
  );
  const [teams, setTeams] = useState<Team[]>(
    initialCache?.teams && initialCache.teams.length >= 2 ? initialCache.teams : DEFAULT_TEAMS
  );
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(
    initialCache?.activeTeamIndex ?? 0
  );
  const [customPacks, setCustomPacks] = useState<GamePack[]>(
    initialCache?.customPacks || getLocalCachedPacks()
  );
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);

  // Persistence & Server Sync Status
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'synced' | 'error' | 'idle'>(
    'saved'
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialCache?.updatedAt || null);
  const isInitialMount = useRef(true);

  // Modals & Panels
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState<boolean>(false);
  const [isAIControlOpen, setIsAIControlOpen] = useState<boolean>(false);
  const [isHostXrayActive, setIsHostXrayActive] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // High-Energy Stage Toast Notification (e.g. for twists or saves)
  const [stageToast, setStageToast] = useState<{ message: string; type: 'twist' | 'points' } | null>(
    null
  );

  // Game flow state
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>(
    initialCache?.gameState || 'playing'
  );

  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Turn management: Cycle to next team
  const advanceTurn = useCallback(() => {
    setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  }, [teams.length]);

  const activeTeam = teams[activeTeamIndex] || teams[0];

  // Show Toast
  const triggerStageToast = (message: string, type: 'twist' | 'points' = 'twist') => {
    setStageToast({ message, type });
    setTimeout(() => {
      setStageToast(null);
    }, 4500);
  };

  // 1. Initial Remote Hydration from Server (/api/state)
  useEffect(() => {
    let isMounted = true;
    async function loadRemoteState() {
      try {
        const serverState = await fetchServerState();
        if (serverState && isMounted) {
          if (serverState.currentPack) setCurrentPack(serverState.currentPack);
          if (serverState.tiles && serverState.tiles.length === 16) setTiles(serverState.tiles);
          if (serverState.teams && serverState.teams.length >= 2) setTeams(serverState.teams);
          if (typeof serverState.activeTeamIndex === 'number') {
            setActiveTeamIndex(serverState.activeTeamIndex);
          }
          if (serverState.gameState) setGameState(serverState.gameState);
          if (serverState.customPacks && serverState.customPacks.length > 0) {
            setCustomPacks(serverState.customPacks);
          }
          if (serverState.updatedAt) setLastSavedAt(serverState.updatedAt);
          setSyncStatus('saved');
        }

        const serverPacks = await fetchServerCustomPacks();
        if (serverPacks && serverPacks.length > 0 && isMounted) {
          setCustomPacks((prev) => {
            const combined = [...serverPacks];
            prev.forEach((p) => {
              if (!combined.some((item) => item.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn('Initial server state fetch failed, running from cached state:', err);
      }
    }

    loadRemoteState();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto-Save Debounced Effect to Server
  useEffect(() => {
    // Skip saving on the very first mount cycle to avoid overwriting server state with initial render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSyncStatus('saving');
    const timer = setTimeout(async () => {
      const payload: PersistedGameState = {
        currentPack,
        tiles,
        teams,
        activeTeamIndex,
        gameState,
        customPacks,
      };

      const res = await saveStateToServer(payload);
      if (res.success) {
        setSyncStatus('saved');
        setLastSavedAt(res.updatedAt);
      } else {
        setSyncStatus('error');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [tiles, teams, activeTeamIndex, currentPack, gameState, customPacks]);

  // 3. Manual Save to Server
  const handleManualSave = async () => {
    setSyncStatus('saving');
    const payload: PersistedGameState = {
      currentPack,
      tiles,
      teams,
      activeTeamIndex,
      gameState,
      customPacks,
    };

    const res = await saveStateToServer(payload);
    if (res.success) {
      setSyncStatus('saved');
      setLastSavedAt(res.updatedAt);
      triggerStageToast('💾 Stage matrix, scores, and custom edits saved to server!', 'points');
    } else {
      setSyncStatus('error');
      triggerStageToast('💾 Saved to local browser cache (server offline)', 'twist');
    }
  };

  // Handle Tile Selection
  const handleTileClick = (tile: TileData) => {
    setSelectedTile(tile);
  };

  // Apply Question Score to a team
  const handleApplyQuestionScore = (tileId: number, teamId: string, points: number) => {
    setTeams((prevTeams) =>
      prevTeams.map((t) => (t.id === teamId ? { ...t, score: t.score + points } : t))
    );

    const targetTeam = teams.find((t) => t.id === teamId);
    triggerStageToast(
      `🎉 +${points} POINTS AWARDED TO ${targetTeam ? targetTeam.name.toUpperCase() : 'TEAM'}!`,
      'points'
    );

    // Mark tile as opened
    setTiles((prevTiles) =>
      prevTiles.map((t) =>
        t.id === tileId
          ? { ...t, isOpened: true, solvedByTeamId: teamId, pointsAwarded: points }
          : t
      )
    );

    advanceTurn();
  };

  // Mark solved with zero points (e.g. passed without score or time up)
  const handleMarkSolvedWithoutPoints = (tileId: number) => {
    setTiles((prevTiles) =>
      prevTiles.map((t) => (t.id === tileId ? { ...t, isOpened: true } : t))
    );
    advanceTurn();
  };

  // Apply Twist execution result
  const handleApplyTwistResult = (tileId: number, result: TwistExecutionResult) => {
    setTeams(result.updatedTeams);
    triggerStageToast(result.message, 'twist');

    setTiles((prevTiles) =>
      prevTiles.map((t) => (t.id === tileId ? { ...t, isOpened: true } : t))
    );

    advanceTurn();
  };

  // Check if all tiles opened -> auto-trigger Victory
  useEffect(() => {
    if (tiles.length > 0 && isGameOver(tiles)) {
      setTimeout(() => {
        setIsVictoryOpen(true);
        setGameState('gameover');
      }, 1000);
    }
  }, [tiles]);

  // Adjust Score (+10 or -10 directly from host header)
  const handleAdjustScore = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  // Switch Active Team by clicking on HUD
  const handleSelectActiveTeam = (teamId: string) => {
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx !== -1) setActiveTeamIndex(idx);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Reset Game Board
  const handleResetBoard = async () => {
    const resetTiles = currentPack.tiles.map((t) => ({
      ...t,
      isOpened: false,
      solvedByTeamId: undefined,
    }));
    const resetTeams = teams.map((t) => ({ ...t, score: 0 }));

    setTiles(resetTiles);
    setTeams(resetTeams);
    setActiveTeamIndex(0);
    setSelectedTile(null);
    setIsVictoryOpen(false);
    setGameState('playing');

    // Immediately persist reset state to server
    const payload: PersistedGameState = {
      currentPack,
      tiles: resetTiles,
      teams: resetTeams,
      activeTeamIndex: 0,
      gameState: 'playing',
      customPacks,
    };
    await saveStateToServer(payload);
    triggerStageToast('🔄 Game board reset & saved to server! New battle begins!', 'points');
  };

  // Select new Pack
  const handleSelectPack = (pack: GamePack) => {
    setCurrentPack(pack);
    const newTiles = pack.tiles.map((t) => ({
      ...t,
      isOpened: false,
      solvedByTeamId: undefined,
    }));
    setTiles(newTiles);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setActiveTeamIndex(0);
    setSelectedTile(null);
    triggerStageToast(`Loaded "${pack.name}"!`, 'points');
  };

  // Apply custom generated tiles from AI
  const handleApplyCustomTiles = async (customTiles: TileData[], packName: string) => {
    const newPack: GamePack = {
      id: `custom-${Date.now()}`,
      name: packName,
      description: 'Custom event show pack with specialized trivia & mystery twists.',
      badge: 'Custom Show',
      tiles: customTiles,
    };

    const updatedPacks = [newPack, ...customPacks.filter((p) => p.id !== newPack.id)];
    setCustomPacks(updatedPacks);
    setCurrentPack(newPack);
    setTiles(customTiles);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setActiveTeamIndex(0);
    setSelectedTile(null);

    // Save pack to server backend
    await saveCustomPackToServer(newPack);
    triggerStageToast(`Saved & loaded custom show: "${packName}"!`, 'twist');
  };

  // Delete custom pack
  const handleDeleteCustomPack = async (packId: string) => {
    const updated = customPacks.filter((p) => p.id !== packId);
    setCustomPacks(updated);
    await deleteCustomPackFromServer(packId);

    if (currentPack.id === packId) {
      handleSelectPack(BOLLYWOOD_STAGE_PACK);
    }
    triggerStageToast('Custom show deleted from server', 'twist');
  };

  // Keyboard Hotkeys Listener for the Anchor / Operator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleManualSave();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        playCorrectSound();
      } else if (e.key === 'w' || e.key === 'W') {
        playBuzzerSound();
      } else if (e.key === 't' || e.key === 'T') {
        playDramaticTwistSound();
      } else if (e.key === 'v' || e.key === 'V') {
        playVictoryFanfare();
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        setIsGuideOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedTile(null);
        setIsSoundboardOpen(false);
        setIsDeckModalOpen(false);
        setIsVictoryOpen(false);
        setIsAIControlOpen(false);
        setIsGuideOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPack, tiles, teams, activeTeamIndex, gameState, customPacks]);

  return (
    <div className="h-dvh max-h-dvh w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden max-md:h-auto max-md:min-h-screen max-md:overflow-y-auto">
      {/* Background Stage Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-1/3 w-[500px] h-[400px] bg-gradient-to-t from-purple-900/15 via-indigo-950/10 to-transparent blur-[130px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* STAGE HEADER & LIVE SCOREBOARD WITH SERVER SYNC BADGE */}
      <Scoreboard
        teams={teams}
        activeTeamId={activeTeam.id}
        onSelectActiveTeam={handleSelectActiveTeam}
        onAdjustScore={handleAdjustScore}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSoundboard={() => setIsSoundboardOpen(true)}
        onOpenDeckModal={() => setIsDeckModalOpen(true)}
        onOpenAIControl={() => setIsAIControlOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onEndGame={() => setIsVictoryOpen(true)}
        currentPackName={currentPack.name}
        isHostXrayActive={isHostXrayActive}
        syncStatus={syncStatus}
        lastSavedAt={lastSavedAt}
        onManualSave={handleManualSave}
      />

      {/* MAIN STAGE ARENA */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-center items-center px-2 py-1 sm:px-4 sm:py-1.5 md:py-2 overflow-hidden">
        <GridBoard
          tiles={tiles}
          teams={teams}
          onTileClick={handleTileClick}
          activeTeam={activeTeam}
          isHostXrayActive={isHostXrayActive}
        />
      </main>

      {/* STAGE TOAST ANNOUNCEMENT */}
      {stageToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-bottom-4 duration-300">
          <div
            className={`px-5 py-2.5 rounded-2xl border text-center font-semibold text-xs sm:text-sm shadow-2xl flex items-center justify-center gap-2.5 backdrop-blur-xl ${
              stageToast.type === 'twist'
                ? 'bg-purple-950/90 border-purple-400/50 text-purple-200 shadow-purple-950/50'
                : 'bg-slate-900/95 border-amber-400/50 text-amber-200 shadow-amber-950/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="leading-snug">{stageToast.message}</span>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLS & EVENT HOST QUICK HINTS */}
      <footer className="w-full shrink-0 bg-slate-950/95 border-t border-white/[0.06] px-4 py-1.5 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-300">Stage Arena Active</span>
          <span className="hidden md:inline text-slate-700">·</span>
          <span className="hidden md:inline text-slate-500 text-[11px]">
            Shortcuts: F (Fullscreen) · C (Chime) · W (Buzzer) · T (Twist) · Ctrl+S (Save) · ? (Guide)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSave}
            className="hover:text-emerald-300 text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Force save all matrix changes to server"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save to Server</span>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-amber-300 text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Host Guide</span>
            <kbd className="px-1 py-0.2 rounded bg-slate-800 text-[10px] text-amber-300 font-mono">
              ?
            </kbd>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="hover:text-amber-300 text-slate-400 font-medium transition-colors cursor-pointer"
          >
            Themes & Teams
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={handleResetBoard}
            className="hover:text-rose-400 text-slate-400 font-medium transition-colors cursor-pointer"
          >
            Reset Board
          </button>
        </div>
      </footer>

      {/* QUESTION / TWIST MODAL */}
      {selectedTile && (
        <TileModal
          tile={selectedTile}
          teams={teams}
          activeTeamId={activeTeam.id}
          onClose={() => setSelectedTile(null)}
          onApplyQuestionScore={handleApplyQuestionScore}
          onApplyTwistResult={handleApplyTwistResult}
          onMarkSolvedWithoutPoints={handleMarkSolvedWithoutPoints}
        />
      )}

      {/* SOUNDBOARD MODAL */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
      />

      {/* DECK & TEAM MANAGER MODAL */}
      <DeckManagerModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        currentPackId={currentPack.id}
        onSelectPack={handleSelectPack}
        teams={teams}
        onUpdateTeams={(newTeams) => {
          setTeams(newTeams);
          triggerStageToast('Teams updated and saved to server!', 'points');
        }}
        onResetBoard={handleResetBoard}
        onApplyCustomTiles={handleApplyCustomTiles}
        customPacks={customPacks}
        onDeleteCustomPack={handleDeleteCustomPack}
      />

      {/* VICTORY CHAMPIONS MODAL */}
      <VictoryModal
        isOpen={isVictoryOpen}
        teams={teams}
        onClose={() => setIsVictoryOpen(false)}
        onResetGame={handleResetBoard}
      />

      {/* ANCHOR AI CONTROL PANEL */}
      <AIControlPanel
        isOpen={isAIControlOpen}
        onClose={() => setIsAIControlOpen(false)}
        tiles={tiles}
        onUpdateTiles={(updated) => {
          setTiles(updated);
          triggerStageToast('Tiles updated and saved to server!', 'points');
        }}
        isHostXrayActive={isHostXrayActive}
        onToggleHostXray={() => setIsHostXrayActive((prev) => !prev)}
      />

      {/* EVENT HOST USER GUIDE MODAL */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
