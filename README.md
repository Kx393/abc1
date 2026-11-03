# StageGrid AI · Event Anchor Mystery Matrix & Twist Game

An interactive 4×4 stage mystery grid game for event anchors and MCs featuring trivia, audiovisual challenges, live score tracking, dramatic game-modifying twist cards, and full server & local persistence.

---

## 🚀 Instant Deployment on GitHub Pages

The repository is pre-configured to run out-of-the-box on GitHub Pages with zero complex setup:

### Default Method: Deploy from a Branch (Root or /docs)
1. In your GitHub repository, go to **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, keep **Deploy from a branch**.
3. Under **Branch**, select `main` (or `master`) with folder **`/ (root)`** (or **`/docs`**).
4. Click **Save**.
5. The full stage matrix and game will load directly without any error screens or build steps!

### Automated CI/CD Method: GitHub Actions
If you prefer automated builds on push, select **Source: GitHub Actions** in Settings &rarr; Pages. The repository includes `.github/workflows/deploy.yml` which will automatically build and deploy `dist/` on every commit.

---

## 🛠 Local Development & Server

```bash
# Install dependencies
npm install

# Start local server (includes full-stack persistence & Gemini AI)
npm run dev

# Re-build production bundles into dist/, docs/, and assets/
npm run build
```
