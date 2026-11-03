/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint: Generate or polish a stage tile question or twist
app.post('/api/gemini/generate-tile', async (req, res) => {
  const { prompt, tileId, isTwist } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      title: isTwist ? '⚡ AI Twist' : 'Stage Challenge',
      question: `Audience Challenge: ${prompt}`,
      answer: 'Correct answer verified by MC / Stage Anchor!',
      visualClue: '💡 🎯 Spotlight',
      mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      points: 20,
    });
  }

  try {
    const systemInstruction = `You are a professional live event show producer and game show host (like MC Sanjay Potdar).
You design high-energy stage quiz questions, musical challenges, visual movie riddles, observation puzzles, or dramatic game twists for live stage competitions.
The user wants a tile for Tile #${tileId || 1}.
Always respond in strict JSON format with the following keys:
- title: Short catchy category or headline (e.g. "Sing This Song !!", "Guess the Movie !!", "Point Heist", "Dance Arena")
- question: Clear, high-impact stage prompt for the audience/teams
- answer: The correct answer and hints for the anchor
- visualClue: An emoji and short 2-3 word prop clue
- mediaUrl: A high quality photo URL from unsplash or empty
- mediaType: "image" or "audio" or "video"
- points: numeric point value (usually 20 or 30)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Design a stage game challenge or twist based on this request: "${prompt}". Is this a twist card? ${isTwist ? 'YES' : 'NO'}. Return JSON.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: unknown) {
    console.error('Error generating tile with Gemini:', error);
    return res.json({
      title: isTwist ? '⚡ Mystery Twist' : 'Stage Challenge',
      question: `Audience Challenge: ${prompt}`,
      answer: 'Verified by Host',
      visualClue: '🌟 🎤 Live Stage',
      mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      points: 20,
    });
  }
});

// Ensure persistent data directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STATE_FILE = path.join(DATA_DIR, 'gamestate.json');
const PACKS_FILE = path.join(DATA_DIR, 'custom_packs.json');

// Helper to safely read JSON file
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

// Helper to safely write JSON file
async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, filePath);
}

// API endpoint: Get saved game state
app.get('/api/state', async (_req, res) => {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return res.json({ exists: false, state: null });
    }
    const state = await readJsonFile(STATE_FILE, null);
    if (!state) {
      return res.json({ exists: false, state: null });
    }
    return res.json({ exists: true, state });
  } catch (err) {
    console.error('Error fetching state:', err);
    return res.status(500).json({ error: 'Failed to retrieve state' });
  }
});

// API endpoint: Save game state
app.post('/api/state', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid state payload' });
    }

    const stateToSave = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile(STATE_FILE, stateToSave);
    return res.json({
      success: true,
      updatedAt: stateToSave.updatedAt,
      message: 'Game state saved successfully to server',
    });
  } catch (err) {
    console.error('Error saving state:', err);
    return res.status(500).json({ error: 'Failed to save game state to server' });
  }
});

// API endpoint: Reset game state
app.post('/api/state/reset', async (_req, res) => {
  try {
    if (fs.existsSync(STATE_FILE)) {
      await fs.promises.unlink(STATE_FILE);
    }
    return res.json({ success: true, message: 'Game state reset successfully' });
  } catch (err) {
    console.error('Error resetting state:', err);
    return res.status(500).json({ error: 'Failed to reset state' });
  }
});

// API endpoint: Get custom packs
app.get('/api/packs', async (_req, res) => {
  try {
    const packs = await readJsonFile<any[]>(PACKS_FILE, []);
    return res.json({ customPacks: packs });
  } catch (err) {
    console.error('Error fetching packs:', err);
    return res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

// API endpoint: Save custom pack
app.post('/api/packs', async (req, res) => {
  try {
    const { pack } = req.body;
    if (!pack || !pack.id) {
      return res.status(400).json({ error: 'Invalid pack data' });
    }

    const currentPacks = await readJsonFile<any[]>(PACKS_FILE, []);
    const filtered = currentPacks.filter((p) => p.id !== pack.id);
    filtered.unshift(pack);

    await writeJsonFile(PACKS_FILE, filtered);
    return res.json({ success: true, pack });
  } catch (err) {
    console.error('Error saving pack:', err);
    return res.status(500).json({ error: 'Failed to save pack' });
  }
});

// API endpoint: Delete custom pack
app.delete('/api/packs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentPacks = await readJsonFile<any[]>(PACKS_FILE, []);
    const filtered = currentPacks.filter((p) => p.id !== id);

    await writeJsonFile(PACKS_FILE, filtered);
    return res.json({ success: true, message: 'Pack deleted' });
  } catch (err) {
    console.error('Error deleting pack:', err);
    return res.status(500).json({ error: 'Failed to delete pack' });
  }
});

// API endpoint: Health check & server status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    persistence: 'filesystem',
    serverTime: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
