import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { getPersonData } from '../utils/dataUtils';

function SmallBarChart({ data, color = '#4a2200' }) {
  if (!data || data.length === 0) return <div className="text-[#888] text-sm py-4">No data</div>;
  return (
    <ResponsiveContainer width="100%" height={data.length * 28 + 40}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#333', fontSize: 11 }} width={160} />
        <Tooltip contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }} cursor={{ fill: 'rgba(74,34,0,0.08)' }} />
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
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Select a Person</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search names..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-[#ddd] rounded px-3 py-2 text-[#222] text-sm w-full sm:w-64 focus:outline-none focus:border-[#b07040]"
          />
          <select
            value={selected}
            onChange={e => { setSelected(e.target.value); setSearch(''); }}
            className="bg-white border border-[#ddd] rounded px-3 py-2 text-[#222] text-sm w-full sm:w-72 focus:outline-none focus:border-[#b07040]"
          >
            <option value="">-- Choose a person --</option>
            {filtered.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {personData && selected && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-[#4a2200]">{personData.sent.toLocaleString()}</div>
              <div className="text-[#888] text-sm mt-1">Letters Sent</div>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-[#4a2200]">{personData.received.toLocaleString()}</div>
              <div className="text-[#888] text-sm mt-1">Letters Received</div>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-[#4a2200]">{personData.minYear ?? '—'}</div>
              <div className="text-[#888] text-sm mt-1">First Letter Year</div>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-[#4a2200]">{personData.maxYear ?? '—'}</div>
              <div className="text-[#888] text-sm mt-1">Last Letter Year</div>
            </div>
          </div>

          {personData.timeline.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#4a2200] mb-3">Letters Sent Per Year</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={personData.timeline}>
                  <defs>
                    <linearGradient id="personGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a2200" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4a2200" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="count" stroke="#4a2200" strokeWidth={2} fill="url(#personGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#4a2200] mb-3">Top 10 Recipients</h3>
              <SmallBarChart data={[...personData.topTo].reverse()} />
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#4a2200] mb-3">Top 10 Senders to {selected}</h3>
              <SmallBarChart data={[...personData.topFrom].reverse()} color="#7a4010" />
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#4a2200] mb-3">Top Locations</h3>
            <SmallBarChart data={[...personData.topLocs].reverse()} color="#a05820" />
          </div>
        </>
      )}
    </div>
  );
}
