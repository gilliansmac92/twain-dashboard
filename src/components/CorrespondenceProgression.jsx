import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#FFD54F', '#FFB300', '#FF8F00', '#FFE082', '#FFCA28', '#FFC107'];

export default function CorrespondenceProgression({ data }) {
  if (!data) return null;
  const { stackedData, top5Senders, correspondenceSpans } = data;

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Letters Per Year by Sender</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stackedData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#d1d5db', fontSize: 12 }} />
            {[...top5Senders, 'Others'].map((sender, i) => (
              <Bar key={sender} dataKey={sender} stackId="a" fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Top Correspondents – Correspondence Spans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-left">
                <th className="py-2 pr-4 text-yellow-400 font-semibold">Receiver</th>
                <th className="py-2 pr-4 text-yellow-400 font-semibold">Letters</th>
                <th className="py-2 pr-4 text-yellow-400 font-semibold">First Year</th>
                <th className="py-2 pr-4 text-yellow-400 font-semibold">Last Year</th>
                <th className="py-2 text-yellow-400 font-semibold">Span (yrs)</th>
              </tr>
            </thead>
            <tbody>
              {correspondenceSpans.slice(0, 30).map((row, i) => (
                <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800 transition-colors">
                  <td className="py-2 pr-4 text-white">{row.name}</td>
                  <td className="py-2 pr-4 text-yellow-400 font-medium">{row.count.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-gray-300">{row.minYear}</td>
                  <td className="py-2 pr-4 text-gray-300">{row.maxYear}</td>
                  <td className="py-2 text-gray-300">{row.span}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Activity by Decade</h2>
        <DecadeHeatmap data={data} />
      </div>
    </div>
  );
}

function DecadeHeatmap({ data }) {
  const { processed } = data;
  const decades = [1850, 1860, 1870, 1880, 1890, 1900, 1910];
  const top5 = data.top5Senders;

  const matrix = decades.map(d => {
    const row = { decade: `${d}s` };
    top5.forEach(s => {
      row[s] = processed.filter(r => r.year && Math.floor(r.year / 10) * 10 === d && r.senderNorm === s).length;
    });
    row['Others'] = processed.filter(r => r.year && Math.floor(r.year / 10) * 10 === d && !top5.includes(r.senderNorm)).length;
    return row;
  });

  const allKeys = [...top5, 'Others'];
  const maxVal = Math.max(...matrix.flatMap(r => allKeys.map(k => r[k] || 0)));

  return (
    <div className="overflow-x-auto">
      <table className="text-sm w-full">
        <thead>
          <tr>
            <th className="py-2 pr-3 text-left text-gray-400">Decade</th>
            {allKeys.map(k => <th key={k} className="py-2 px-3 text-left text-gray-400 whitespace-nowrap">{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map(row => (
            <tr key={row.decade}>
              <td className="py-2 pr-3 text-gray-300 font-medium">{row.decade}</td>
              {allKeys.map(k => {
                const val = row[k] || 0;
                const opacity = maxVal > 0 ? val / maxVal : 0;
                return (
                  <td key={k} className="py-2 px-3">
                    <div
                      className="rounded px-2 py-1 text-center text-xs font-medium"
                      style={{
                        background: `rgba(255,213,79,${opacity * 0.85 + (opacity > 0 ? 0.1 : 0)})`,
                        color: opacity > 0.5 ? '#000' : '#d1d5db',
                        minWidth: '3rem'
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
