# Mark Twain Letters Dashboard

An interactive React + Vite + Tailwind CSS dashboard for exploring ~12,722 letters from the [Mark Twain Project Online](https://www.marktwainproject.org/) (1853–1910).

## Live Dashboard

Deployed at: **https://[username].github.io/experiments/**

## Features

- **Overview** – Key stats (total letters, unique senders/receivers, year range), letters-per-year area chart, top 20 senders, receivers, and locations
- **People Explorer** – Select any of the top 50 senders/receivers to see their personal correspondence stats, timeline, top contacts, and locations
- **Correspondence Progression** – Stacked bar chart of letters by sender over time, correspondence span table for top correspondents, and a decade-level activity heatmap
- **Individual Lookup** – Free-text search by sender or receiver name with matching letter table, year timeline, and Wikipedia link

## Tech Stack

- [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Recharts 2](https://recharts.org/)
- [PapaParse 5](https://www.papaparse.com/) for CSV parsing

## Data

`twainletterscsv.txt` — CSV with columns: `sender, receiver, date, location, identifier`

## Development

```bash
npm install
npm run dev      # dev server at http://localhost:5173/experiments/
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Deployment

Push to `main` — GitHub Actions (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages via `peaceiris/actions-gh-pages`.
