/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GamePack } from '../data/defaultPacks';
import { TileData, Team } from '../game/twistRules';

export interface PersistedGameState {
  currentPack: GamePack;
  tiles: TileData[];
  teams: Team[];
  activeTeamIndex: number;
  gameState?: 'title' | 'playing' | 'gameover';
  customPacks?: GamePack[];
  updatedAt?: string;
}

export interface SaveResult {
  success: boolean;
  storageType: 'cloud' | 'local';
  updatedAt: string;
  message?: string;
}

const LOCAL_STORAGE_KEY = 'stagegrid_server_cached_state';
const LOCAL_CUSTOM_PACKS_KEY = 'stagegrid_custom_packs';
const REMOTE_SERVER_URL_KEY = 'stagegrid_remote_server_url';

/**
 * Get configured remote server URL (e.g. deployed Render, Railway, or Cloud Run backend)
 */
export function getRemoteServerUrl(): string {
  try {
    return localStorage.getItem(REMOTE_SERVER_URL_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Set or clear configured remote server URL
 */
export function setRemoteServerUrl(url: string): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(REMOTE_SERVER_URL_KEY);
    } else {
      localStorage.setItem(REMOTE_SERVER_URL_KEY, url.trim().replace(/\/+$/, ''));
    }
  } catch {
    // ignore
  }
}

/**
 * Resolve API base URL based on environment and user configuration
 */
export function getApiBaseUrl(): string | null {
  const custom = getRemoteServerUrl();
  if (custom) return custom;

  if (typeof window !== 'undefined') {
    // GitHub Pages has no backend server unless user explicitly connects one
    if (window.location.hostname.endsWith('github.io')) {
      return null;
    }
    // Localhost or Cloud Run full-stack environments
    if (
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1') ||
      window.location.hostname.includes('run.app')
    ) {
      return '';
    }
  }

  return null;
}

/**
 * Synchronous local cache reader for immediate, zero-flicker UI rendering on page load
 */
export function getLocalCachedState(): PersistedGameState | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGameState;
  } catch (e) {
    console.warn('Failed to parse local cached state:', e);
    return null;
  }
}

/**
 * Synchronous local cache reader for custom packs
 */
export function getLocalCachedPacks(): GamePack[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_PACKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GamePack[];
  } catch (e) {
    console.warn('Failed to parse local custom packs:', e);
    return [];
  }
}

/**
 * Fetch saved game state from server backend (if available) or local storage
 */
export async function fetchServerState(): Promise<{ state: PersistedGameState | null; storageType: 'cloud' | 'local' }> {
  const localState = getLocalCachedState();
  const apiBase = getApiBaseUrl();

  // If no server endpoint is configured or running on static host, use local storage directly
  if (apiBase === null) {
    return { state: localState, storageType: 'local' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${apiBase}/api/state`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && data.exists && data.state) {
        // Sync local storage cache
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
        } catch {
          // ignore
        }
        return { state: data.state as PersistedGameState, storageType: 'cloud' };
      }
    }
  } catch (err) {
    console.info('Server sync unreachable, using browser persistent storage:', err);
  }

  return { state: localState, storageType: 'local' };
}

/**
 * Persist current state to local storage and remote server (if available)
 */
export async function saveStateToServer(state: PersistedGameState): Promise<SaveResult> {
  const timestamp = new Date().toISOString();
  const enrichedState = { ...state, updatedAt: timestamp };

  // 1. Always update browser permanent storage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enrichedState));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }

  const apiBase = getApiBaseUrl();

  // If on static host with no backend, local storage is the primary storage!
  if (apiBase === null) {
    return {
      success: true,
      storageType: 'local',
      updatedAt: timestamp,
      message: 'Saved to browser persistent storage',
    };
  }

  // 2. Sync with remote backend if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${apiBase}/api/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedState),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        storageType: 'cloud',
        updatedAt: result.updatedAt || timestamp,
        message: 'Saved to cloud server & local storage',
      };
    }
  } catch (err) {
    console.info('Cloud sync deferred, saved in browser storage:', err);
  }

  // Gracefully report local save success so user knows their data is preserved!
  return {
    success: true,
    storageType: 'local',
    updatedAt: timestamp,
    message: 'Saved to browser storage (server offline)',
  };
}

/**
 * Reset game state in storage
 */
export async function resetServerGameState(): Promise<boolean> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }

  const apiBase = getApiBaseUrl();
  if (apiBase === null) return true;

  try {
    const response = await fetch(`${apiBase}/api/state/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (err) {
    console.warn('Reset server call failed:', err);
    return false;
  }
}

/**
 * Fetch custom packs from server or local storage
 */
export async function fetchServerCustomPacks(): Promise<GamePack[]> {
  const localPacks = getLocalCachedPacks();
  const apiBase = getApiBaseUrl();

  if (apiBase === null) return localPacks;

  try {
    const response = await fetch(`${apiBase}/api/packs`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const packs = (data.customPacks || []) as GamePack[];
      try {
        localStorage.setItem(LOCAL_CUSTOM_PACKS_KEY, JSON.stringify(packs));
      } catch {
        // ignore
      }
      return packs;
    }
  } catch (err) {
    console.info('Custom packs loaded from browser storage:', err);
  }

  return localPacks;
}

/**
 * Save custom pack
 */
export async function saveCustomPackToServer(pack: GamePack): Promise<boolean> {
  const localPacks = getLocalCachedPacks();
  const filtered = localPacks.filter((p) => p.id !== pack.id);
  filtered.unshift(pack);
  try {
    localStorage.setItem(LOCAL_CUSTOM_PACKS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }

  const apiBase = getApiBaseUrl();
  if (apiBase === null) return true;

  try {
    const response = await fetch(`${apiBase}/api/packs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack }),
    });
    return response.ok;
  } catch (err) {
    console.warn('Pack saved locally (server offline):', err);
    return true;
  }
}

/**
 * Delete a custom pack
 */
export async function deleteCustomPackFromServer(packId: string): Promise<boolean> {
  const localPacks = getLocalCachedPacks().filter((p) => p.id !== packId);
  try {
    localStorage.setItem(LOCAL_CUSTOM_PACKS_KEY, JSON.stringify(localPacks));
  } catch {
    // ignore
  }

  const apiBase = getApiBaseUrl();
  if (apiBase === null) return true;

  try {
    const response = await fetch(`${apiBase}/api/packs/${packId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (err) {
    console.warn('Deleted locally:', err);
    return true;
  }
}

/**
 * Test connectivity to a custom remote backend URL
 */
export async function testServerConnection(url: string): Promise<{ ok: boolean; message: string }> {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${cleanUrl}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: true,
        message: `Successfully connected! Server status: ${data.status || 'online'}`,
      };
    }
    return { ok: false, message: `Server returned HTTP ${res.status}` };
  } catch (e: any) {
    return { ok: false, message: e.message || 'Connection failed or timed out' };
  }
}

/**
 * Export current show data to a downloadable JSON file
 */
export function exportStateToJsonFile(state: PersistedGameState): void {
  try {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StageGrid_Show_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export show error:', e);
  }
}
