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

const LOCAL_STORAGE_KEY = 'stagegrid_server_cached_state';
const LOCAL_CUSTOM_PACKS_KEY = 'stagegrid_custom_packs';

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
 * Fetch saved game state from server backend (/api/state)
 */
export async function fetchServerState(): Promise<PersistedGameState | null> {
  try {
    const response = await fetch('/api/state', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.exists && data.state) {
      // Sync local storage cache
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
      } catch {
        // quota ignore
      }
      return data.state as PersistedGameState;
    }
    return null;
  } catch (err) {
    console.info('Server state endpoint unavailable or offline, using local cache:', err);
    return getLocalCachedState();
  }
}

/**
 * Persist current state to server backend and update local cache
 */
export async function saveStateToServer(
  state: PersistedGameState
): Promise<{ success: boolean; updatedAt: string }> {
  // Always update local cache immediately for resilience
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }

  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      throw new Error(`Server save failed: HTTP ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      updatedAt: result.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Failed to save to server, saved locally in browser:', err);
    return {
      success: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Reset game state on the server
 */
export async function resetServerGameState(): Promise<boolean> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    const response = await fetch('/api/state/reset', {
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
 * Fetch custom packs from the server
 */
export async function fetchServerCustomPacks(): Promise<GamePack[]> {
  try {
    const response = await fetch('/api/packs', {
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
    console.warn('Failed to fetch server custom packs, using local cache:', err);
  }
  return getLocalCachedPacks();
}

/**
 * Save custom pack to the server
 */
export async function saveCustomPackToServer(pack: GamePack): Promise<boolean> {
  // Update local cache
  const localPacks = getLocalCachedPacks();
  const filtered = localPacks.filter((p) => p.id !== pack.id);
  filtered.unshift(pack);
  try {
    localStorage.setItem(LOCAL_CUSTOM_PACKS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }

  try {
    const response = await fetch('/api/packs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack }),
    });
    return response.ok;
  } catch (err) {
    console.warn('Failed to save pack to server:', err);
    return false;
  }
}

/**
 * Delete a custom pack on the server
 */
export async function deleteCustomPackFromServer(packId: string): Promise<boolean> {
  const localPacks = getLocalCachedPacks().filter((p) => p.id !== packId);
  try {
    localStorage.setItem(LOCAL_CUSTOM_PACKS_KEY, JSON.stringify(localPacks));
  } catch {
    // ignore
  }

  try {
    const response = await fetch(`/api/packs/${packId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (err) {
    console.warn('Failed to delete pack from server:', err);
    return false;
  }
}
