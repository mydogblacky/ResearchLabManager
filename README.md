<img width="580" height="247" alt="Scherm­afbeelding 2026-04-14 om 16 34 52" src="https://github.com/user-attachments/assets/94597824-dc9f-4fd8-b8fc-5cc11b1f7edf" />

# Research Lab Manager

A desktop application for research lab leaders to manage their team, track PhD student progress, organize research projects, and keep meeting notes — all in one place. Lab data lives in a shared Supabase (Postgres) project so everyone in the lab sees the same data and changes propagate live.

## Features

### Dashboard

The dashboard gives you a quick overview of your entire lab: how many team members you have, how many PhD students are being tracked, active projects, and recent meeting notes. It also shows PhD progress bars at a glance, upcoming deliverables with color-coded due dates, and links to your most recent meetings.

### Team Management

Add and manage everyone in your lab — PhD students, postdocs, professors, or any other role. Each member has a name, role, email, and start date. You can mark members as inactive when they leave the lab, and toggle their visibility with the "Show Inactive" button. Team members appear throughout the app: they can be assigned to projects, linked to PhD trackers, and added as meeting attendees.

### PhD Progress Tracking

Track the progress of PhD students from start to expected completion. Each tracker includes:

- **Timeline overview** — A visual timeline showing all PhD students side by side, with a "today" marker so you can see where everyone stands at a glance.
- **Status tracking** — Mark each student as On Track, At Risk, Overdue, or Completed. Status is reflected in the progress bar colors across the app.
- **Milestones** — Add milestones with target dates (e.g., "Literature review complete", "First paper submitted"). Check them off as they're achieved. Completed milestones also appear on the timeline.
- **Dissertation chapters** — Track individual chapters of the dissertation with a title, APA reference, notes, and a status (Not Started, In Progress, Finished). Useful for keeping an overview of a paper-based dissertation.

Click on any PhD tracker card to expand it and see the full details, milestones, and chapters.

### Projects

Organize your research projects with descriptions, date ranges, color labels, and status (Active, Planned, On Hold, Completed). Each project can have:

- **Team members** — Assign lab members to projects so you can see who is working on what.
- **Deliverables** — Add deliverables with due dates, descriptions, and status tracking. Assign a deliverable to a specific team member. Upcoming deliverables automatically appear on the dashboard.

Expand any project card to manage its members and deliverables.

### Meeting Notes

A built-in note-taking tool for lab meetings. Create a new meeting note by giving it a title, date, and optionally linking it to a project. Select which team members attended.

The editor supports rich text formatting: bold, italic, strikethrough, headings, bullet lists, numbered lists, and block quotes. Notes are saved automatically as you type. A sidebar lets you browse and search through all your meeting notes.

### Publications

Pull each team member's publication record straight from [Biblio UGent](https://biblio.ugent.be/). Set a member's UGent ID on the Team page — either the **numeric form** (e.g., `801000947425`) or the **UUID form** found on newer Biblio profiles (e.g., `EB23467E-5E7C-11E6-BCAC-C275B5D1D7B1`) — and the Publications page will fetch their full bibliography on demand.

Each member's publications are listed with title, authors, year, type, journal, and a link out to the Biblio record or DOI. The page also surfaces aggregate metadata across all tracked members:

- **% A1 tile** — share of publications classified as A1 (journal article in Web of Science) under the Belgian VABB classification.
- **By VABB classification** — pie chart of A1 / A2 / B / C / D / U / V codes, with A1 highlighted.
- **By type** — pie chart breaking down journal articles, book chapters, conference papers, etc.
- **Publications per year** — full-width timeline (bar per year, oldest left to newest right) so you can see output trends at a glance.

Filters let you narrow the per-member list by year or type.

### Settings

- **Account** — Shows the email you're signed in as and lets you sign out.
- **Export** — Download a JSON snapshot of the shared lab database (useful for backups).
- **Import** — Replace the shared database with a JSON backup. Also accepts exports from the legacy local-SQLite version of the app (one-time migration). **This affects everyone in the lab**, so use with care.

## Getting Started

Research Lab Manager is a desktop application built with [Tauri](https://tauri.app/), Vue 3, and [Supabase](https://supabase.com/) (hosted Postgres + auth + realtime).

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- A free [Supabase](https://supabase.com/) project (one per lab — everyone shares it)
- Platform build tools required by Tauri:
  - **macOS** — Xcode Command Line Tools (`xcode-select --install`)
  - **Windows** — Microsoft Visual Studio C++ Build Tools and WebView2
  - **Linux** — `webkit2gtk`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, and friends (see the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/))

### One-time Supabase setup (do this once per lab)

1. Sign up at [supabase.com](https://supabase.com/) and create a new project. Pick the region closest to your lab.
2. In the project dashboard, open the **SQL editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates all tables, views, RLS policies, and enables realtime.
3. In **Authentication → Providers**, make sure Email is enabled. For a small lab, you can also disable "Confirm email" under **Authentication → Settings** so colleagues can sign in immediately after sign-up.
4. In **Settings → API**, copy the **Project URL** and the **anon public** key. Share them with your colleagues — these are not secrets.
5. (Optional, one-time) If you have an export from the legacy local-SQLite version, sign in to the new app and use **Settings → Import JSON** to load it into Supabase.

### Per-user setup

Each colleague clones the repo and creates a `.env` file with the values from step 4 above:

```bash
cp .env.example .env
# then edit .env and paste in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Install dependencies

```bash
npm install
```

### Run in development

Launches the Vite dev server and opens the Tauri window with hot reload:

```bash
npm run tauri dev
```

### Build a standalone application

To build a production binary and platform installer:

```bash
npm run tauri build
```

This compiles the Vue app, bundles the Rust binary, and produces installers in `src-tauri/target/release/bundle/`:

- **macOS** — `.app` and `.dmg` under `bundle/macos/` and `bundle/dmg/`
- **Windows** — `.msi` and `.exe` installers under `bundle/msi/` and `bundle/nsis/`
- **Linux** — `.deb`, `.rpm`, and `.AppImage` under their respective folders

The first build downloads and compiles all Rust dependencies and may take several minutes. Subsequent builds are much faster.

### Other scripts

```bash
npm run dev       # Vite dev server only (no Tauri shell)
npm run build     # Type-check and build the frontend bundle only
npm run lint      # Run ESLint
npm run preview   # Preview the built frontend
```
