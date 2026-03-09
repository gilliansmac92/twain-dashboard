import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { buildPlaceNetworkData } from '../utils/dataUtils';
import ForceGraph from './ForceGraph';

const COLORS = ['#4a2200', '#7a4010', '#a05820', '#c07830', '#d09040', '#3a6040'];

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
      <div className="text-2xl font-bold text-[#4a2200]">{value}</div>
      <div className="text-[#888] text-sm mt-1">{label}</div>
    </div>
  );
}

function LocationHeatmap({ processed, top5Locations }) {
  const decades = [1850, 1860, 1870, 1880, 1890, 1900, 1910];
  const allKeys = [...top5Locations, 'Others'];

  const matrix = useMemo(() => {
    return decades.map(d => {
      const row = { decade: `${d}s` };
      top5Locations.forEach(loc => {
        row[loc] = processed.filter(
          r => r.year && Math.floor(r.year / 10) * 10 === d && r.locationNorm === loc
        ).length;
      });
      row['Others'] = processed.filter(
        r =>
          r.year &&
          Math.floor(r.year / 10) * 10 === d &&
          r.locationNorm !== 'Unknown' &&
          !top5Locations.includes(r.locationNorm)
      ).length;
      return row;
    });
  }, [processed, top5Locations]);

  const maxVal = Math.max(...matrix.flatMap(r => allKeys.map(k => r[k] || 0)));

  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full">
        <thead>
          <tr>
            <th className="py-2 pr-3 text-left text-[#888]">Decade</th>
            {allKeys.map(k => (
              <th key={k} className="py-2 px-3 text-left text-[#888] whitespace-nowrap">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map(row => (
            <tr key={row.decade}>
              <td className="py-2 pr-3 text-[#555] font-medium">{row.decade}</td>
              {allKeys.map(k => {
                const val = row[k] || 0;
                const opacity = maxVal > 0 ? val / maxVal : 0;
                return (
                  <td key={k} className="py-2 px-3">
                    <div
                      className="rounded px-2 py-1 text-center text-xs font-medium"
                      style={{
                        background: `rgba(74,34,0,${opacity * 0.85 + (opacity > 0 ? 0.1 : 0)})`,
                        color: opacity > 0.5 ? '#fff' : '#555',
                        minWidth: '3rem',
                      }}
                    >
                      {val.toLocaleString()}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlaceSpotlight({ processed, allLocations }) {
  const [selected, setSelected] = useState(allLocations[0] || '');
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allLocations.filter(l => l.toLowerCase().includes(search.toLowerCase()))
    : allLocations;

  const spotlightData = useMemo(() => {
    if (!selected) return null;
    const rows = processed.filter(r => r.locationNorm === selected);
    if (rows.length === 0) return null;

    const senderMap = {};
    rows.forEach(r => { senderMap[r.senderNorm] = (senderMap[r.senderNorm] || 0) + 1; });
    const topSenders = Object.entries(senderMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const receiverMap = {};
    rows.forEach(r => { receiverMap[r.receiverNorm] = (receiverMap[r.receiverNorm] || 0) + 1; });
    const topReceivers = Object.entries(receiverMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const timeMap = {};
    rows.forEach(r => { if (r.year) timeMap[r.year] = (timeMap[r.year] || 0) + 1; });
    const timeline = Object.entries(timeMap)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    const years = rows.filter(r => r.year).map(r => r.year);
    const minYear = years.length ? Math.min(...years) : null;
    const maxYear = years.length ? Math.max(...years) : null;

    return {
      total: rows.length,
      uniqueSenders: Object.keys(senderMap).length,
      topSenders,
      topReceivers,
      timeline,
      minYear,
      maxYear,
    };
  }, [processed, selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-[#555] mb-1">Search location</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter locations…"
            className="w-full border border-[#ccc] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#4a2200]"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-[#555] mb-1">Select location</label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full border border-[#ccc] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#4a2200] bg-white"
          >
            {filtered.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {spotlightData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Letters from here" value={spotlightData.total.toLocaleString()} />
            <StatCard label="Unique senders" value={spotlightData.uniqueSenders.toLocaleString()} />
            <StatCard label="First active" value={spotlightData.minYear ?? '—'} />
            <StatCard label="Last active" value={spotlightData.maxYear ?? '—'} />
          </div>

          <div className="bg-[#faf7f2] border border-[#e5e7eb] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#4a2200] mb-3">Letters sent from {selected} over time</h4>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={spotlightData.timeline} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="placeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a2200" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4a2200" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 10 }} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#4a2200" strokeWidth={2} fill="url(#placeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#faf7f2] border border-[#e5e7eb] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[#4a2200] mb-3">Top senders from {selected}</h4>
              <ResponsiveContainer width="100%" height={spotlightData.topSenders.length * 28 + 30}>
                <BarChart
                  data={[...spotlightData.topSenders].reverse()}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#333', fontSize: 11 }} width={160} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }}
                    cursor={{ fill: 'rgba(74,34,0,0.08)' }}
                  />
                  <Bar dataKey="count" fill="#4a2200" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#faf7f2] border border-[#e5e7eb] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-[#4a2200] mb-3">Top recipients of letters from {selected}</h4>
              <ResponsiveContainer width="100%" height={spotlightData.topReceivers.length * 28 + 30}>
                <BarChart
                  data={[...spotlightData.topReceivers].reverse()}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#333', fontSize: 11 }} width={160} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }}
                    cursor={{ fill: 'rgba(74,34,0,0.08)' }}
                  />
                  <Bar dataKey="count" fill="#a05820" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlacesExplorer({ data }) {
  if (!data) return null;
  const {
    processed,
    topLocations,
    locationStackedData,
    top5Locations,
    locationSpans,
    allLocations,
  } = data;

  const knownLocations = topLocations.filter(l => l.name !== 'Unknown');
  const uniqueLocationCount = knownLocations.length;
  const mostActive = knownLocations[0];

  const totalWithLocation = processed.filter(r => r.locationNorm !== 'Unknown' && r.year).length;
  const coveragePercent = processed.length > 0
    ? Math.round((totalWithLocation / processed.length) * 100)
    : 0;

  const placeNetworkData = useMemo(() => buildPlaceNetworkData(processed, 30), [processed]);

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Known Locations" value={uniqueLocationCount.toLocaleString()} />
        <StatCard label="Most Active Location" value={mostActive ? mostActive.name : '—'} />
        <StatCard
          label="Letters with Location"
          value={`${totalWithLocation.toLocaleString()} (${coveragePercent}%)`}
        />
        <StatCard
          label="Top Location Letters"
          value={mostActive ? mostActive.count.toLocaleString() : '—'}
        />
      </div>

      {/* Letters over time by location */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-1">Letters Over Time by Location</h2>
        <p className="text-sm text-[#888] mb-4">
          Shows how writing activity shifted across the top 5 locations throughout the correspondence period.
          Larger bands indicate periods of concentrated writing from a particular place.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={locationStackedData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: '#555', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }}
            />
            <Legend wrapperStyle={{ color: '#555', fontSize: 12 }} />
            {[...top5Locations, 'Others'].map((loc, i) => (
              <Bar key={loc} dataKey={loc} stackId="a" fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Place-to-place network graph */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-1">Location Connection Network</h2>
        <p className="text-sm text-[#888] mb-4">
          Nodes represent the top 30 writing locations. Two locations are connected when the same
          correspondents wrote from both places — stronger edges indicate more shared writers.
          Node size reflects the total number of letters sent from that location. Drag nodes to
          rearrange, scroll to zoom.
        </p>
        <p className="text-[#aaa] text-xs mb-4">
          {placeNetworkData.nodes.length} locations &middot; {placeNetworkData.links.length} connections
        </p>
        <ForceGraph
          networkData={placeNetworkData}
          height={500}
          centerColor="#1e3a5f"
          personColor="#1e3a5f"
          placeColor="#1e3a5f"
        />
        <div className="mt-3 flex flex-wrap gap-5 text-xs text-[#555]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#1e3a5f]" />
            Location (size ∝ letters sent)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-8 h-px bg-[#c5a880] border-t-2 border-[#c5a880]" />
            Edge weight ∝ shared correspondents
          </span>
        </div>
      </div>

      {/* Decade heatmap by location */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-1">Location Activity by Decade</h2>
        <p className="text-sm text-[#888] mb-4">
          Darker cells indicate more letters sent from that location in a given decade, revealing
          how the writers' geographic base shifted over time.
        </p>
        <LocationHeatmap processed={processed} top5Locations={top5Locations} />
      </div>

      {/* Location spans table */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-1">Location Correspondence Spans</h2>
        <p className="text-sm text-[#888] mb-4">
          How long each location appears in the record — a wide span suggests a home base or
          frequently revisited place; a narrow span may indicate a single trip or residence.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ddd] text-left">
                <th className="py-2 pr-4 text-[#4a2200] font-semibold">Location</th>
                <th className="py-2 pr-4 text-[#4a2200] font-semibold">Letters</th>
                <th className="py-2 pr-4 text-[#4a2200] font-semibold">First Year</th>
                <th className="py-2 pr-4 text-[#4a2200] font-semibold">Last Year</th>
                <th className="py-2 text-[#4a2200] font-semibold">Span (yrs)</th>
              </tr>
            </thead>
            <tbody>
              {locationSpans.slice(0, 30).map((row, i) => (
                <tr key={i} className="border-b border-[#eee] hover:bg-[#f0e8de] transition-colors">
                  <td className="py-2 pr-4 text-[#222]">{row.name}</td>
                  <td className="py-2 pr-4 text-[#4a2200] font-medium">{row.count.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-[#555]">{row.minYear}</td>
                  <td className="py-2 pr-4 text-[#555]">{row.maxYear}</td>
                  <td className="py-2 text-[#555]">{row.span}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place spotlight */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-1">Place Spotlight</h2>
        <p className="text-sm text-[#888] mb-4">
          Select a location to explore who wrote from there, who they were writing to, and how
          activity from that place unfolded across the years.
        </p>
        <PlaceSpotlight processed={processed} allLocations={allLocations} />
      </div>
    </div>
  );
}
