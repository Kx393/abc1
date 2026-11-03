/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeTwist,
  getLeaderboard,
  isGameOver,
  Team,
  TwistConfig,
  TileData,
} from './twistRules';

const mockTeams: Team[] = [
  { id: 'team-1', name: 'Red Tigers', score: 40, color: '#ef4444', avatarEmoji: '🐅' },
  { id: 'team-2', name: 'Blue Sharks', score: 60, color: '#3b82f6', avatarEmoji: '🦈' },
  { id: 'team-3', name: 'Green Cobras', score: 20, color: '#10b981', avatarEmoji: '🐍' },
];

test('executeTwist: STEAL_POINTS transfers points from highest opponent to current team', () => {
  const twist: TwistConfig = {
    type: 'STEAL_POINTS',
    title: 'Point Heist',
    description: 'Steal 20 points',
    value: 20,
    badgeText: 'STEAL',
    flairColor: 'rose',
    iconName: 'Zap',
  };

  const result = executeTwist(twist, 'team-1', mockTeams);
  // Red Tigers had 40, steals 20 from highest opponent Blue Sharks (had 60)
  const red = result.updatedTeams.find((t) => t.id === 'team-1')!;
  const blue = result.updatedTeams.find((t) => t.id === 'team-2')!;

  assert.equal(red.score, 60);
  assert.equal(blue.score, 40);
  assert.ok(result.message.includes('STOLE 20 points'));
});

test('executeTwist: STEAL_POINTS with specified target team', () => {
  const twist: TwistConfig = {
    type: 'STEAL_POINTS',
    title: 'Targeted Steal',
    description: 'Steal 20 points',
    value: 20,
    badgeText: 'STEAL',
    flairColor: 'rose',
    iconName: 'Zap',
  };

  // Steal specifically from Green Cobras (team-3) who have 20 points
  const result = executeTwist(twist, 'team-1', mockTeams, 'team-3');
  const red = result.updatedTeams.find((t) => t.id === 'team-1')!;
  const green = result.updatedTeams.find((t) => t.id === 'team-3')!;

  assert.equal(red.score, 60);
  assert.equal(green.score, 0);
});

test('executeTwist: DOUBLE_SCORE doubles current team score', () => {
  const twist: TwistConfig = {
    type: 'DOUBLE_SCORE',
    title: 'Double Surge',
    description: 'Double current score',
    badgeText: '2X MULTIPLIER',
    flairColor: 'amber',
    iconName: 'Flame',
  };

  const result = executeTwist(twist, 'team-1', mockTeams);
  const red = result.updatedTeams.find((t) => t.id === 'team-1')!;
  assert.equal(red.score, 80);
});

test('executeTwist: LOSE_POINTS deducts penalty with 0 floor', () => {
  const twist: TwistConfig = {
    type: 'LOSE_POINTS',
    title: 'Tax Wipeout',
    description: 'Lose 15 points',
    value: 15,
    badgeText: 'PENALTY',
    flairColor: 'red',
    iconName: 'AlertTriangle',
  };

  const result = executeTwist(twist, 'team-3', mockTeams);
  const green = result.updatedTeams.find((t) => t.id === 'team-3')!;
  // had 20, loses 15 -> 5
  assert.equal(green.score, 5);
});

test('executeTwist: SWAP_SCORES swaps current team with top rival', () => {
  const twist: TwistConfig = {
    type: 'SWAP_SCORES',
    title: 'Karma Swap',
    description: 'Swap with 1st place',
    badgeText: 'SWAP',
    flairColor: 'purple',
    iconName: 'RefreshCw',
  };

  // Green Cobras (20 pts) swaps with Blue Sharks (60 pts)
  const result = executeTwist(twist, 'team-3', mockTeams);
  const green = result.updatedTeams.find((t) => t.id === 'team-3')!;
  const blue = result.updatedTeams.find((t) => t.id === 'team-2')!;

  assert.equal(green.score, 60);
  assert.equal(blue.score, 20);
});

test('executeTwist: JACKPOT awards bonus points', () => {
  const twist: TwistConfig = {
    type: 'JACKPOT',
    title: 'Jackpot Box',
    description: 'Instant +40 points',
    value: 40,
    badgeText: 'JACKPOT',
    flairColor: 'emerald',
    iconName: 'Award',
  };

  const result = executeTwist(twist, 'team-1', mockTeams);
  const red = result.updatedTeams.find((t) => t.id === 'team-1')!;
  assert.equal(red.score, 80);
});

test('executeTwist: EQUALIZER siphons points across all opposing teams', () => {
  const twist: TwistConfig = {
    type: 'EQUALIZER',
    title: 'Robin Hood',
    description: 'Take 5 pts from each opponent',
    value: 5,
    badgeText: 'EQUALIZER',
    flairColor: 'cyan',
    iconName: 'Scale',
  };

  // Red Tigers siphons 5 from Blue (60 -> 55) and 5 from Green (20 -> 15), total +10
  const result = executeTwist(twist, 'team-1', mockTeams);
  const red = result.updatedTeams.find((t) => t.id === 'team-1')!;
  const blue = result.updatedTeams.find((t) => t.id === 'team-2')!;
  const green = result.updatedTeams.find((t) => t.id === 'team-3')!;

  assert.equal(blue.score, 55);
  assert.equal(green.score, 15);
  assert.equal(red.score, 50);
});

test('getLeaderboard ranks teams correctly by highest score', () => {
  const leaderboard = getLeaderboard(mockTeams);
  assert.equal(leaderboard[0].team.id, 'team-2'); // 60 pts
  assert.equal(leaderboard[0].rank, 1);
  assert.equal(leaderboard[1].team.id, 'team-1'); // 40 pts
  assert.equal(leaderboard[2].team.id, 'team-3'); // 20 pts
});

test('isGameOver verifies all tiles are opened', () => {
  const tiles: Partial<TileData>[] = [
    { id: 1, isOpened: true },
    { id: 2, isOpened: true },
  ];
  assert.equal(isGameOver(tiles as TileData[]), true);

  tiles.push({ id: 3, isOpened: false });
  assert.equal(isGameOver(tiles as TileData[]), false);
});
