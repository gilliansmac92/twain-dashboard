# Mark Twain's Outgoing Letters: An Interactive History

An interactive React + Vite + Tailwind CSS dashboard for exploring ~12,722 outgoing letters drawn from the [Mark Twain Project Online](https://www.marktwainproject.org/)'s catalogue of letters (1853–1910).

## Live Dashboard

Deployed at: **https://gilliansmac92.github.io/twain-dashboard/**

## Features

- **Overview** – Key stats (total letters, unique senders/receivers, year range), letters-per-year area chart, top 20 senders, receivers, and locations
- **People Explorer** – Select any person to see their personal correspondence stats, year timeline, individual force-directed network graph, top contacts, and writing locations
- **Correspondence Progression** – Stacked bar chart of letters by sender over time, correspondence span table for top correspondents, and a decade-level activity heatmap
- **Individual Lookup** – Free-text search by sender or receiver name with matching letter table, year timeline, and Wikipedia search link
- **Network Graphs** – Multiple force-directed D3 graphs: Twain's correspondence network, Twain + Places (showing writing locations as navy nodes alongside person nodes), and networks for Clara, Olivia, Isabel, and Ashcroft
- **Places** – Location stats, stacked bar chart of letters over time by location, **location-to-location network graph** (nodes are places, edges connect locations with shared correspondents), decade activity heatmap, correspondence span table, and a per-location spotlight with timeline and top senders/receivers

## Tech Stack

- [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Recharts 2](https://recharts.org/) for area/bar charts
- [D3.js 7](https://d3js.org/) for force-directed network graphs
- [PapaParse 5](https://www.papaparse.com/) for client-side CSV parsing

## Data

`public/twainletterscsv.txt` — CSV with columns: `sender, receiver, date, location, identifier`

Name normalization handles abbreviations like `SLC` → `Samuel L. Clemens`, `OLC` → `Olivia L. Clemens`, `IVL` → `Isabel V. Lyon`, and dozens of location aliases.

## Development

```bash
npm install
npm run dev      # dev server at http://localhost:5173/twain-dashboard/
npm run build    # production build → dist/
npm run preview  # preview production build at http://localhost:4173/twain-dashboard/
```

## Deployment

Push to `main` — GitHub Actions (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages via `peaceiris/actions-gh-pages`.
