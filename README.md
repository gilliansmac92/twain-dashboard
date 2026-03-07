# experiments
experiments with github copilot agents

## Mark Twain Letters — Interactive Dashboard

An interactive dashboard that explores [`twainletterscsv.txt`](twainletterscsv.txt) — a corpus of 12,723 letters from the Mark Twain Project Online (1853–1910).

### Features

- **Summary stats** — total letters, unique senders/receivers, year range
- **Letters per Year** — area line chart showing correspondence volume across time
- **Top 20 Senders / Receivers / Locations** — horizontal bar charts
- **Browse & Filter** — filter by sender, location, year range, or keyword; results update instantly
- **Keyword highlighting** — matching text is highlighted in yellow
- **Sortable table** — click any column header to sort ascending/descending
- **Pagination** — configurable rows per page

### Usage

The dashboard is fully self-contained — no internet or server required.

1. **Generate (or regenerate) the dashboard:**
   ```bash
   python3 generate_dashboard.py
   ```
2. **Open in a browser:**
   ```
   open dashboard.html        # macOS
   xdg-open dashboard.html    # Linux
   start dashboard.html       # Windows
   ```

> **Note:** `dashboard.html` embeds all 12,723 records and is ~1.2 MB. Re-run `generate_dashboard.py` any time `twainletterscsv.txt` is updated.
