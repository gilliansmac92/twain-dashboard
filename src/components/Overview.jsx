import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ label, value }) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
      <div className="text-2xl font-bold text-yellow-400">{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

function HBarChart({ data, dataKey = 'count', nameKey = 'name', color = '#FFD54F' }) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 32 + 40}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis type="category" dataKey={nameKey} tick={{ fill: '#d1d5db', fontSize: 11 }} width={160} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#fff' }}
          cursor={{ fill: 'rgba(255,213,79,0.08)' }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Overview({ data }) {
  if (!data) return null;
  const { lettersPerYear, topSenders, topReceivers, topLocations, uniqueSenders, uniqueReceivers, minYear, maxYear, processed } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Letters" value={processed.length.toLocaleString()} />
        <StatCard label="Unique Senders" value={uniqueSenders.toLocaleString()} />
        <StatCard label="Unique Receivers" value={uniqueReceivers.toLocaleString()} />
        <StatCard label="Year Range" value={`${minYear}–${maxYear}`} />
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Letters Per Year</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={lettersPerYear} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD54F" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FFD54F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#fff' }}
            />
            <Area type="monotone" dataKey="count" stroke="#FFD54F" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Top 20 Senders</h2>
          <HBarChart data={[...topSenders].reverse()} />
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Top 20 Receivers</h2>
          <HBarChart data={[...topReceivers].reverse()} color="#FFB300" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Top 20 Locations</h2>
        <HBarChart data={[...topLocations].reverse()} color="#FFE082" />
      </div>
    </div>
  );
}
