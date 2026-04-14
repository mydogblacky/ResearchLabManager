![research_lab_manager_logo](https://github.com/user-attachments/assets/af96663c-176f-4cf0-9587-a31acefe3254)
<svg width="100%" viewBox="0 0 680 420" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Research Lab Manager logo v3</title>
  <desc>A logo featuring a stylized clipboard with a progress chart and academic cap for the Research Lab Manager app</desc>

  <style>
    .wm  { font-family: sans-serif; font-size: 30px; font-weight: 500; fill: #1a2238; letter-spacing: -0.6px; }
    .acc { font-family: sans-serif; font-size: 30px; font-weight: 500; fill: #2a7d5f; letter-spacing: -0.6px; }
    .sub { font-family: sans-serif; font-size: 11.5px; font-weight: 400; fill: #7a8fa0; letter-spacing: 2.8px; }
  </style>

  <!-- Clipboard body -->
  <rect x="130" y="105" width="140" height="190" rx="8" fill="#f0f7f4" stroke="#2a7d5f" stroke-width="2.2"/>

  <!-- Clipboard clip bar -->
  <rect x="165" y="96" width="70" height="22" rx="6" fill="#2a7d5f"/>
  <rect x="185" y="92" width="30" height="14" rx="5" fill="#1a5c42"/>

  <!-- Mini bar chart -->
  <line x1="148" y1="262" x2="252" y2="262" stroke="#b0cfc4" stroke-width="1.2"/>
  <rect x="155" y="218" width="18" height="44" rx="3" fill="#2a7d5f" opacity="0.85"/>
  <rect x="181" y="232" width="18" height="30" rx="3" fill="#2a7d5f" opacity="0.6"/>
  <rect x="207" y="244" width="18" height="18" rx="3" fill="#f5a623" opacity="0.85"/>
  <rect x="233" y="225" width="18" height="37" rx="3" fill="#2a7d5f" opacity="0.7"/>

  <!-- Trend line -->
  <polyline points="164,214 190,228 216,240 242,221" fill="none" stroke="#1a5c42" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/>
  <circle cx="164" cy="214" r="3" fill="#1a5c42" opacity="0.85"/>
  <circle cx="190" cy="228" r="3" fill="#1a5c42" opacity="0.85"/>
  <circle cx="216" cy="240" r="3" fill="#f5a623" opacity="0.9"/>
  <circle cx="242" cy="221" r="3" fill="#1a5c42" opacity="0.85"/>

  <!-- Clipboard lines -->
  <rect x="148" y="130" width="104" height="6" rx="3" fill="#c8dfd8"/>
  <rect x="148" y="144" width="80" height="6" rx="3" fill="#c8dfd8"/>
  <rect x="148" y="158" width="92" height="6" rx="3" fill="#c8dfd8"/>
  <rect x="148" y="172" width="60" height="6" rx="3" fill="#e8b870" opacity="0.8"/>

  <!-- Academic cap -->
  <polygon points="248,118 268,127 248,136 228,127" fill="#1a2238"/>
  <rect x="245" y="127" width="6" height="12" rx="2" fill="#1a2238"/>
  <line x1="268" y1="127" x2="274" y2="138" stroke="#f5c030" stroke-width="2" stroke-linecap="round"/>
  <circle cx="274" cy="141" r="2.8" fill="#f5c030"/>
  <line x1="274" y1="141" x2="271" y2="148" stroke="#f5c030" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="274" y1="141" x2="274" y2="149" stroke="#f5c030" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="274" y1="141" x2="277" y2="148" stroke="#f5c030" stroke-width="1.2" stroke-linecap="round"/>

  <!-- Wordmark -->
  <text x="320" y="175" class="wm">Research</text>
  <text x="320" y="214"><tspan class="acc">Lab</tspan><tspan class="wm"> Manager</tspan></text>

  <!-- Rule -->
  <line x1="320" y1="234" x2="572" y2="234" stroke="#c8dfd8" stroke-width="1"/>

  <!-- Tagline -->
  <text x="320" y="255" class="sub">PHD PROGRESS · PROJECT TRACKING</text>

</svg>

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

Research Lab Manager is a desktop application. To run it from source, you need [Node.js](https://nodejs.org/) and [Rust](https://www.rust-lang.org/tools/install) installed.

```bash
npm install
npm run tauri dev
```

To build a standalone application:

```bash
npm run tauri build
```
