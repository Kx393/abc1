/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Cloud,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Server,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import {
  getRemoteServerUrl,
  setRemoteServerUrl,
  testServerConnection,
  exportStateToJsonFile,
  PersistedGameState,
} from '../utils/storageService';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageType: 'cloud' | 'local';
  lastSavedAt: string | null;
  currentGameState: PersistedGameState;
  onManualSave: () => void;
  onRestoreState: (state: PersistedGameState) => void;
  onResetBoard: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  storageType,
  lastSavedAt,
  currentGameState,
  onManualSave,
  onRestoreState,
  onResetBoard,
}) => {
  const [serverUrl, setServerUrlState] = useState(getRemoteServerUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [justSaved, setJustSaved] = useState(false);
  const isGithubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  if (!isOpen) return null;

  const handleSaveClick = () => {
    onManualSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleExport = () => {
    exportStateToJsonFile(currentGameState);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as PersistedGameState;
        if (parsed.currentPack && parsed.tiles) {
          onRestoreState(parsed);
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestAndSaveServer = async () => {
    if (!serverUrl.trim()) {
      setRemoteServerUrl('');
      setConnectionMessage({
        ok: true,
        text: 'Using fast, permanent browser storage (GitHub Pages mode).',
      });
      return;
    }

    setTestingConnection(true);
    setConnectionMessage(null);

    const res = await testServerConnection(serverUrl);
    setTestingConnection(false);

    if (res.ok) {
      setRemoteServerUrl(serverUrl);
      setConnectionMessage({ ok: true, text: res.message });
      onManualSave();
    } else {
      setConnectionMessage({ ok: false, text: res.message });
    }
  };

  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Recently';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {storageType === 'cloud' ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Storage & State Persistence</h3>
              <p className="text-[11px] text-slate-400">
                {isGithubPages
                  ? 'Running on GitHub Pages with persistent browser storage'
                  : 'Full-stack session persistence'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Status Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
              <span>{storageType === 'cloud' ? 'Cloud Server Synced' : 'Auto-Saved to Browser Storage'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All question edits, team scores, active turns, and custom decks are permanently stored and stay intact when you refresh the page.
            </p>
            <div className="text-[11px] text-emerald-400/80 font-mono pt-0.5">
              Last saved: {formattedTime}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/[0.06]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Show</div>
            <div className="text-xs font-bold text-amber-300 truncate mt-0.5">
              {currentGameState.currentPack.name}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/[0.06]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Stage Teams</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {currentGameState.teams.length} Teams
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/[0.06]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Opened Tiles</div>
            <div className="text-xs font-bold text-cyan-300 mt-0.5">
              {currentGameState.tiles.filter((t) => t.isOpened).length} / 16
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSaveClick}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Show Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Force Save Show State Now</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Show (.json)</span>
            </button>

            <label className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import Show (.json)</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Remote Server Sync (Optional) */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.06] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Server className="w-3.5 h-3.5" />
            <span>Optional: Connect Deployed Cloud Server</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            GitHub Pages is a static host. If you host <code>server.ts</code> on Render, Railway, or Google Cloud Run for cross-device live sync, paste its URL here:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrlState(e.target.value)}
              placeholder="e.g. https://my-stagegrid-server.onrender.com"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleTestAndSaveServer}
              disabled={testingConnection}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {testingConnection ? 'Testing...' : 'Test & Save'}
            </button>
          </div>

          {connectionMessage && (
            <div
              className={`text-[11px] font-medium p-2 rounded-lg border ${
                connectionMessage.ok
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              {connectionMessage.text}
            </div>
          )}
        </div>

        {/* Reset Clean Slate */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <span className="text-[11px] text-slate-400">Start over with a clean board?</span>
          <button
            onClick={() => {
              onResetBoard();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
