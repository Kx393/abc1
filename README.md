# StageGrid AI · Event Anchor Mystery Matrix & Twist Game

An interactive 4×4 stage mystery grid game for event anchors and MCs featuring trivia, audiovisual challenges, live score tracking, dramatic game-modifying twist cards, and full persistence.

---

## 🚀 How to Launch on GitHub Pages (Fixing Blank/White Screen)

If you saw a white screen when launching on GitHub Pages, it is because GitHub Pages was serving uncompiled source files instead of the compiled production build.

You have two instant options to fix it:

### Option 1: GitHub Actions (Recommended - 10 Seconds)
1. Go to your GitHub repository in your web browser.
2. Click **Settings** (gear icon) &rarr; **Pages** (in the left sidebar).
3. Under **Build and deployment** &rarr; **Source**, click the dropdown and select **GitHub Actions**.
4. That's it! GitHub will automatically trigger the included `.github/workflows/deploy.yml` workflow.
5. In ~1 minute, refresh your GitHub Pages URL and the full game will load live!

---

### Option 2: Direct Branch Deploy using `/docs` (Zero-Config)
The repository now includes the fully pre-compiled production build inside the `/docs` folder!
1. Go to your GitHub repository &rarr; **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, choose **Deploy from a branch**.
3. Under **Branch**, select `main` (or `master`) and change the folder from `/ (root)` to **`/docs`**.
4. Click **Save**.
5. Your site is immediately live at your GitHub Pages address!

---

## 🛠 Local Development & Server

```bash
# Install dependencies
npm install

# Start local full-stack server (includes persistence & Gemini AI)
npm run dev

# Build production bundle and update /docs
npm run build
```
