# GitHub Pages Deployment Plan

Automate the build and deployment of the StageGrid AI web application to GitHub Pages using relative asset paths and a continuous-deployment GitHub Actions workflow.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following deployment settings were confirmed based on your preferences:
> - **Deployment Method**: Automated GitHub Actions workflow on push to the `main` branch.
> - **Asset Path Resolution**: Relative base path (`base: './'`) in Vite, guaranteeing that scripts, styles, and sound effects load reliably regardless of your GitHub repository name or whether you use a custom domain.

- **Confirmed Decision 1**: Automated GitHub Actions workflow triggered on pushes to `main`.
- **Confirmed Decision 2**: Relative asset paths (`base: './'`) in `vite.config.ts`.
- **Target Audience / Execution**: Event anchors, organizers, and hosts who want a free, globally accessible, zero-maintenance static URL for stage events.

---

### 1. Overview & Core Concept

- **What It Delivers**:
  - Full static compatibility for the React + Vite + Tailwind CSS stage application.
  - Zero-configuration deployment: pushing commits to GitHub automatically builds the production bundle and publishes it to `https://<username>.github.io/<repo-name>/`.
  - Comprehensive, foolproof setup documentation with step-by-step Git commands and GitHub repository settings instructions.
- **Key Value**:
  - Offline-ready and client-authoritative: the procedural Web Audio sound synthesis, 4x4 matrix, timer, and twist engines run 100% in the browser with no backend server required.

---

### 2. User Experience & Deployment Flow

```
┌─────────────────────────┐       git push       ┌────────────────────────┐
│ Local / AI Studio Code  │ ───────────────────> │ GitHub Repository      │
│ (main branch)           │                      │ (main branch)          │
└─────────────────────────┘                      └───────────┬────────────┘
                                                             │
                                                             ▼ triggers
┌─────────────────────────┐      deploys to      ┌────────────────────────┐
│ GitHub Pages Live URL   │ <─────────────────── │ GitHub Actions Runner  │
│ https://<user>.github.io│                      │ • npm ci               │
│ /<repo>/                │                      │ • npm run build (dist) │
└─────────────────────────┘                      │ • upload & deploy      │
                                                 └────────────────────────┘
```

1. **Vite Configuration Update**:
   - Set `base: './'` in `vite.config.ts` so all chunk references (`<script src="./assets/...">`, CSS `@import`) resolve relative to the current URL rather than the domain root `/`.
2. **GitHub Actions Workflow Creation**:
   - Add `.github/workflows/deploy.yml` configuring permissions (`pages: write`, `id-token: write`), Node.js 22 setup, caching, `npm run build`, and standard GitHub Pages publishing artifacts.
3. **Repository Setup & Instruction Guide**:
   - Provide a clear, copy-pasteable guide covering:
     - Initializing the local git repository and committing files.
     - Creating the GitHub repository and pushing.
     - Enabling GitHub Pages under **Repository Settings -> Pages -> Build and deployment -> Source: GitHub Actions**.

---

### 3. Key Product Decisions & Trade-Offs

- **Relative Base (`base: './'`) vs. Fixed Base (`base: '/repo-name/'`)**:
  - *Chosen Approach*: Relative base (`'./'`).
  - *Why*: Eliminates manual editing of `vite.config.ts` when renaming the repository or when multiple collaborators fork the project. Works out of the box on both user sites (`<user>.github.io`) and project sites (`<user>.github.io/<repo>`).
- **GitHub Actions Workflow vs. `gh-pages` Branch**:
  - *Chosen Approach*: Native GitHub Actions with `actions/deploy-pages`.
  - *Why*: Cleaner repository history (no cluttered `gh-pages` orphan branch), automated CI validation on every pull request or commit, and zero extra npm dependencies.

---

### 4. Technical Architecture & File Strategy

```
Repository Root
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD pipeline for GitHub Pages
├── vite.config.ts              # Configured with base: './'
├── package.json                # Verified clean build scripts
└── README.md                   # Complete hosting & deployment instructions
```

#### Proposed Changes:
1. **`vite.config.ts`**:
   - Add `base: './'` to the configuration export.
2. **`.github/workflows/deploy.yml`**:
   - Define job with `ubuntu-latest`, checking out code, running `npm ci`, `npm run build`, and calling `actions/deploy-pages@v4`.
3. **`README.md`**:
   - Add quick-start instructions for GitHub Pages deployment.
4. **Verification**:
   - Run `npm run build` locally to verify that generated `dist/index.html` references `./assets/...` and assets build cleanly without missing paths.
