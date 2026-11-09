# Student Management System

A responsive React + Vite student administration dashboard demonstrating nine React event-handling requirements.

## Features

1. **Register students** — controlled form inputs managed with React state.
2. **Display students** — dynamic records rendered with `map()`.
3. **Search students** — 350ms debounced search using a custom `useDebounce` hook.
4. **Delete students** — event handlers, confirmation dialog and `filter()`.
5. **View student details** — selected student passed to detail views as an argument.
6. **Validate registration** — form submission with `preventDefault()`, required-field and duplicate-email checks.
7. **Keyboard shortcuts** — custom `useKeyboardShortcuts` hook: Ctrl/Cmd+K search, Ctrl/Cmd+N new student, Escape closes dialogs.
8. **Nested clicks** — `stopPropagation()` prevents action buttons from triggering the row click.
9. **Prevent repeated actions** — custom `useThrottle` hook limits rapid form submissions.

Additional functionality: edit records, active/inactive status, department and status filters, CSV export, responsive dashboard, light/dark theme, notifications and browser LocalStorage persistence.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Keyboard shortcuts

- **Ctrl/Cmd + K** — open Students and focus search.
- **Ctrl/Cmd + N** — open the registration form.
- **Escape** — close the active dialog.

## Demo and data notice

This is a frontend demonstration. Student records are stored in the current browser's LocalStorage. There is no real administrator authentication, server-side authorization, centralized database, or secure multi-user storage. Do not enter real or sensitive student personal information.

Built with React, Vite and Lucide React.
