<img width="580" height="247" alt="Scherm­afbeelding 2026-04-14 om 16 34 52" src="https://github.com/user-attachments/assets/94597824-dc9f-4fd8-b8fc-5cc11b1f7edf" />

# Research Lab Manager

A desktop application for research lab leaders to manage their team, track PhD student progress, organize research projects, and keep meeting notes — all in one place. Your data is stored locally on your machine.

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

### Settings

- **Export** — Download all your data as a JSON file for backup.
- **Import** — Restore from a previously exported backup. This replaces all current data, so use it with care.

## Getting Started

Research Lab Manager is a desktop application built with [Tauri](https://tauri.app/), Vue 3, and SQLite.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Platform build tools required by Tauri:
  - **macOS** — Xcode Command Line Tools (`xcode-select --install`)
  - **Windows** — Microsoft Visual Studio C++ Build Tools and WebView2
  - **Linux** — `webkit2gtk`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, and friends (see the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/))

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
