/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TwistType =
  | 'STEAL_POINTS'
  | 'DOUBLE_SCORE'
  | 'LOSE_POINTS'
  | 'SWAP_SCORES'
  | 'JACKPOT'
  | 'EQUALIZER'
  | 'FREE_PASS';

export type TileCategory =
  | 'twist'
  | 'song'
  | 'movie'
  | 'hook_step'
  | 'trivia'
  | 'observation'
  | 'dialogue'
  | 'rapid_fire';

export interface TwistConfig {
  type: TwistType;
  title: string;
  description: string;
  value?: number; // e.g. 20 points for steal, 15 for lose, 40 for jackpot
  badgeText: string;
  flairColor: string; // Tailwind color class key (e.g. 'amber', 'rose', 'purple', 'emerald', 'cyan')
  iconName: string;
}

export interface TileData {
  id: number;
  category: TileCategory;
  points: number; // For normal trivia
  title: string;
  question: string;
  visualClue?: string;
  mediaType?: 'text' | 'image' | 'audio' | 'video' | 'audio_cue';
  mediaUrl?: string;
  mediaTitle?: string;
  answer: string;
  extraNotes?: string;
  twist?: TwistConfig;
  isOpened: boolean;
  solvedByTeamId?: string;
  pointsAwarded?: number;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color: string; // Hex or tailwind color
  avatarEmoji: string;
}

export interface TwistExecutionResult {
  updatedTeams: Team[];
  message: string;
  transferDetails?: {
    sourceTeamId?: string;
    targetTeamId?: string;
    pointsDelta: number;
  };
}

/**
 * Executes a Twist card modification on the current team and optional target team.
 */
export function executeTwist(
  twist: TwistConfig,
  currentTeamId: string,
  teams: Team[],
  targetTeamId?: string
): TwistExecutionResult {
  const currentTeam = teams.find((t) => t.id === currentTeamId);
  if (!currentTeam) {
    return { updatedTeams: teams, message: 'Invalid active team' };
  }

  const updatedTeams = teams.map((t) => ({ ...t }));
  const activeIdx = updatedTeams.findIndex((t) => t.id === currentTeamId);

  switch (twist.type) {
    case 'STEAL_POINTS': {
      const stealAmount = twist.value ?? 20;
      // Default to the leading opponent if no target specified
      const opponentTeams = updatedTeams.filter((t) => t.id !== currentTeamId);
      const target =
        targetTeamId
          ? updatedTeams.find((t) => t.id === targetTeamId)
          : opponentTeams.sort((a, b) => b.score - a.score)[0];

      if (!target) {
        return {
          updatedTeams,
          message: `${currentTeam.name} tried to steal, but there are no opponents!`,
        };
      }

      const targetIdx = updatedTeams.findIndex((t) => t.id === target.id);
      // Can steal points up to target's score (or allow stealing into negative if host wishes, minimum 0 floor for target)
      const actualSteal = Math.max(0, target.score < stealAmount ? target.score : stealAmount);
      
      updatedTeams[targetIdx].score -= actualSteal;
      updatedTeams[activeIdx].score += actualSteal;

      return {
        updatedTeams,
        message: `⚡ ${currentTeam.name} successfully STOLE ${actualSteal} points from ${target.name}!`,
        transferDetails: {
          sourceTeamId: target.id,
          targetTeamId: currentTeam.id,
          pointsDelta: actualSteal,
        },
      };
    }

    case 'DOUBLE_SCORE': {
      const oldScore = updatedTeams[activeIdx].score;
      // If current score is <= 0, grant a generous +30 boost instead of leaving it 0 or making negative worse!
      const newScore = oldScore > 0 ? oldScore * 2 : oldScore + 30;
      const delta = newScore - oldScore;
      updatedTeams[activeIdx].score = newScore;

      return {
        updatedTeams,
        message: `🎰 JACKPOT MULTIPLIER! ${currentTeam.name}'s score boosted from ${oldScore} to ${newScore} (+${delta} pts)!`,
        transferDetails: {
          targetTeamId: currentTeam.id,
          pointsDelta: delta,
        },
      };
    }

    case 'LOSE_POINTS': {
      const lossAmount = twist.value ?? 15;
      const oldScore = updatedTeams[activeIdx].score;
      updatedTeams[activeIdx].score = Math.max(0, oldScore - lossAmount);
      const actualLost = oldScore - updatedTeams[activeIdx].score;

      return {
        updatedTeams,
        message: `💥 CHAOS PENALTY! ${currentTeam.name} lost ${actualLost} points!`,
        transferDetails: {
          targetTeamId: currentTeam.id,
          pointsDelta: -actualLost,
        },
      };
    }

    case 'SWAP_SCORES': {
      // Find top team other than active
      const otherTeams = updatedTeams.filter((t) => t.id !== currentTeamId);
      const target =
        targetTeamId
          ? updatedTeams.find((t) => t.id === targetTeamId)
          : otherTeams.sort((a, b) => b.score - a.score)[0];

      if (!target || target.id === currentTeamId) {
        return {
          updatedTeams,
          message: `${currentTeam.name} triggered a swap, but no eligible opponent was found!`,
        };
      }

      const targetIdx = updatedTeams.findIndex((t) => t.id === target.id);
      const currentScore = updatedTeams[activeIdx].score;
      const targetScore = updatedTeams[targetIdx].score;

      updatedTeams[activeIdx].score = targetScore;
      updatedTeams[targetIdx].score = currentScore;

      return {
        updatedTeams,
        message: `🔄 KARMA SWAP! ${currentTeam.name} (${targetScore} pts) swapped scores with ${target.name} (${currentScore} pts)!`,
        transferDetails: {
          sourceTeamId: target.id,
          targetTeamId: currentTeam.id,
          pointsDelta: targetScore - currentScore,
        },
      };
    }

    case 'JACKPOT': {
      const jackpotAmount = twist.value ?? 40;
      updatedTeams[activeIdx].score += jackpotAmount;

      return {
        updatedTeams,
        message: `🎁 GOLDEN BOUNTY! ${currentTeam.name} claimed the Mystery Jackpot of +${jackpotAmount} points!`,
        transferDetails: {
          targetTeamId: currentTeam.id,
          pointsDelta: jackpotAmount,
        },
      };
    }

    case 'EQUALIZER': {
      // Takes 5 points from every other team and gives to active team
      const taxPerOpponent = twist.value ?? 5;
      let totalCollected = 0;

      for (let i = 0; i < updatedTeams.length; i++) {
        if (updatedTeams[i].id !== currentTeamId) {
          const available = Math.max(0, Math.min(taxPerOpponent, updatedTeams[i].score));
          updatedTeams[i].score -= available;
          totalCollected += available;
        }
      }

      updatedTeams[activeIdx].score += totalCollected;

      return {
        updatedTeams,
        message: `⚖️ ROBIN HOOD EQUALIZER! Siphoned ${totalCollected} points across all opposing teams to ${currentTeam.name}!`,
        transferDetails: {
          targetTeamId: currentTeam.id,
          pointsDelta: totalCollected,
        },
      };
    }

    case 'FREE_PASS': {
      return {
        updatedTeams,
        message: `🛡️ AUDIENCE PASS! ${currentTeam.name} gets a free lifeline for any future question or prize!`,
      };
    }

    default:
      return {
        updatedTeams,
        message: `Twist executed for ${currentTeam.name}`,
      };
  }
}

/**
 * Calculates standings, sorted from 1st place to last.
 */
export function getLeaderboard(teams: Team[]): { rank: number; team: Team }[] {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return sorted.map((team, index) => ({
    rank: index + 1,
    team,
  }));
}

/**
 * Checks if all tiles in the grid have been opened.
 */
export function isGameOver(tiles: TileData[]): boolean {
  return tiles.length > 0 && tiles.every((tile) => tile.isOpened);
}
