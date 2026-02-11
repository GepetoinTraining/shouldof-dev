<p align="center">
  <br />
  <strong>🌐 shouldof.dev</strong>
  <br />
  <em>Standing on the shoulders of giants — now you can see them.</em>
  <br /><br />
  <a href="https://shouldof.dev">Website</a> · <a href="#the-why">The Why</a> · <a href="#features">Features</a> · <a href="#get-involved">Get Involved</a>
</p>

---

# The Gratitude Graph

**A visual web of open source interconnection where anyone can see the humans behind their code — and thank them.**

Every `npm install` is a person. A Ukrainian developer building through war. A Brazilian kernel hacker who forked SQLite. A Swedish programmer who turned text into diagrams. A guy who learned TypeScript by accident. Two brothers who killed auth pain.

Nobody says their names. This platform changes that.

---

## The Why

> *"Everything you use was loved into existence by someone, and the minimum response to that is to say their name."*

Open source has a gratitude problem. Every `package.json` is a map of human collaboration, but nobody renders it as one. Contributors get GitHub stars but not stories. They get download counts but not thank-you notes. They build tools used by millions and have 3 followers on Medium.

**shouldof.dev** makes the invisible visible.

---

## Features

### 🕸️ The Web
An interactive force-directed graph of open source packages and the projects that depend on them. Every node is a person. Every edge is a dependency relationship. Click any node to read their story.

### 🔗 Connect Your GitHub
Sign in with GitHub, select a repository, and watch the graph grow. The system reads your `package.json`, discovers your dependencies, queries the npm registry for creator metadata, and adds new nodes to the web.

### 📖 Wiki Pages
Every package gets a human-written (or AI-generated) wiki page telling the creator's story — who they are, where they're from, what moment of frustration led them to build this, and how many people depend on their work.

### 💜 Thank-You Wall
Free text messages on every wiki page. No payment required. The words matter more than the money. Zero barrier to recognition.

### 🏷️ Application Tagging
Tag your project: `edutech`, `fintech`, `healthtech`, `saas`, `game`, `tool`, `blog`. Discover patterns like *"89% of edutech projects use React, but only 34% of fintech."*

---

## The First Two Stories

### #0 — John Gruber & Aaron Swartz · Markdown (.md)
The format everything is written in. Gruber wanted readable plain text for the web. Aaron Swartz co-designed the spec at age 17 — the same kid who co-created RSS at 14, helped build Reddit, co-founded Creative Commons, and was prosecuted for downloading academic papers he believed should be free. He died at 26. Every README on this platform exists because of them.

*Aaron's page has no donate button. His gift gives differently.*

### #1 — Knut Sveidqvist · Mermaid.js
74,000 GitHub stars. Over 8 million users. 3 Medium followers. He built diagrams from text — like Markdown for visuals — and this project exists because discovering his tool revealed that the open source ecosystem has no mechanism for gratitude.

---

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Framework | Next.js 15 | SSR + App Router |
| UI | Mantine v7 | Dark space theme |
| Graph | D3.js | Force-directed visualization |
| Database | Turso / libSQL | *Using Glauber Costa's tool to credit Glauber Costa* |
| ORM | Drizzle | *Using Andrii Sherman's tool to credit Andrii Sherman* |
| Validation | Zod | *Using Colin McDonnell's tool to credit Colin McDonnell* |
| Auth | NextAuth.js v5 | GitHub OAuth |
| Language | TypeScript | End-to-end type safety |

The stack is the message. We build with the tools of the people we honor.

---

## Getting Started

```bash
# Clone
git clone https://github.com/GepetoinTraining/shouldof-dev.git
cd shouldof-dev

# Install
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN

# Push database schema
npx drizzle-kit push

# Run
npm run dev
```

Then open [localhost:3000](http://localhost:3000), connect your GitHub, and be the first node in the graph.

---

## Roadmap

- [x] **Phase 1: The Seed** — Interactive graph, first wiki pages, GitHub connect, package.json parser
- [ ] **Phase 2: The Voice** — AI wiki generation, creator claim flow, community editing
- [ ] **Phase 3: The Gift** — Stripe donations, escrow for unclaimed developers, project-wide donation splitting
- [ ] **Phase 4: The Map** — Multi-registry (PyPI, Crates.io, Go), geographic visualization, industry heatmaps

---

## Get Involved

The graph grows with every new connection. Connect your GitHub repo. Read a wiki page. Say thank you.

If you're an open source creator and see your name here: you can claim your page. If you'd rather not be listed: we respect that completely. Opt-out is always available.

---

## Origin

Born February 11, 2026, at Node Zero (Joinville, SC, Brazil) while discovering Mermaid.js and realizing that the open source ecosystem has no mechanism for gratitude.

The silence of the good. This platform breaks it.

---

<p align="center">
  <em>Built with 💜 at Node Zero</em>
</p>
