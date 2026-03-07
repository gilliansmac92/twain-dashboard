import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { getPersonData } from '../utils/dataUtils';

function SmallBarChart({ data, color = '#FFD54F' }) {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm py-4">No data</div>;
  return (
    <ResponsiveContainer width="100%" height={data.length * 28 + 40}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 11 }} width={160} />
        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#fff' }} cursor={{ fill: 'rgba(255,213,79,0.08)' }} />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function PeopleExplorer({ data }) {
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');

  if (!data) return null;
  const { allPeople, processed } = data;

  const filtered = search
    ? allPeople.filter(p => p.toLowerCase().includes(search.toLowerCase()))
    : allPeople;

  const personData = selected ? getPersonData(processed, selected) : null;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Select a Person</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search names..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white text-sm w-full sm:w-64 focus:outline-none focus:border-yellow-400"
          />
          <select
            value={selected}
            onChange={e => { setSelected(e.target.value); setSearch(''); }}
            className="bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white text-sm w-full sm:w-72 focus:outline-none focus:border-yellow-400"
          >
            <option value="">-- Choose a person --</option>
            {filtered.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {personData && selected && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{personData.sent.toLocaleString()}</div>
              <div className="text-gray-400 text-sm mt-1">Letters Sent</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{personData.received.toLocaleString()}</div>
              <div className="text-gray-400 text-sm mt-1">Letters Received</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{personData.minYear ?? '—'}</div>
              <div className="text-gray-400 text-sm mt-1">First Letter Year</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{personData.maxYear ?? '—'}</div>
              <div className="text-gray-400 text-sm mt-1">Last Letter Year</div>
            </div>
          </div>

          {personData.timeline.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
              <h3 className="text-base font-semibold text-yellow-400 mb-3">Letters Sent Per Year</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={personData.timeline}>
                  <defs>
                    <linearGradient id="personGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD54F" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FFD54F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#fff' }} />
                  <Area type="monotone" dataKey="count" stroke="#FFD54F" strokeWidth={2} fill="url(#personGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
              <h3 className="text-base font-semibold text-yellow-400 mb-3">Top 10 Recipients</h3>
              <SmallBarChart data={[...personData.topTo].reverse()} />
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
              <h3 className="text-base font-semibold text-yellow-400 mb-3">Top 10 Senders to {selected}</h3>
              <SmallBarChart data={[...personData.topFrom].reverse()} color="#FFB300" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
            <h3 className="text-base font-semibold text-yellow-400 mb-3">Top Locations</h3>
            <SmallBarChart data={[...personData.topLocs].reverse()} color="#FFE082" />
          </div>
        </>
      )}
    </div>
  );
}
