import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
      <div className="text-2xl font-bold text-[#4a2200]">{value}</div>
      <div className="text-[#888] text-sm mt-1">{label}</div>
    </div>
  );
}

function HBarChart({ data, dataKey = 'count', nameKey = 'name', color = '#4a2200' }) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 32 + 40}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} />
        <YAxis type="category" dataKey={nameKey} tick={{ fill: '#333', fontSize: 11 }} width={160} />
        <Tooltip
          contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }}
          cursor={{ fill: 'rgba(74,34,0,0.08)' }}
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

      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Letters Per Year</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={lettersPerYear} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4a2200" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4a2200" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 11 }} />
            <YAxis tick={{ fill: '#555', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }}
            />
            <Area type="monotone" dataKey="count" stroke="#4a2200" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Top 20 Senders</h2>
          <HBarChart data={[...topSenders].reverse()} />
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Top 20 Receivers</h2>
          <HBarChart data={[...topReceivers].reverse()} color="#7a4010" />
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Top 20 Locations</h2>
        <HBarChart data={[...topLocations].reverse()} color="#a05820" />
      </div>
    </div>
  );
}
