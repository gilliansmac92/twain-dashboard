import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IndividualLookup({ data }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  if (!data) return null;
  const { processed } = data;

  const handleSearch = () => setSubmitted(query.trim());

  const results = useMemo(() => {
    if (!submitted) return [];
    const q = submitted.toLowerCase();
    return processed.filter(r =>
      r.senderNorm.toLowerCase().includes(q) ||
      r.receiverNorm.toLowerCase().includes(q) ||
      (r.sender && r.sender.toLowerCase().includes(q)) ||
      (r.receiver && r.receiver.toLowerCase().includes(q))
    );
  }, [submitted, processed]);

  const timeline = useMemo(() => {
    const m = {};
    results.forEach(r => { if (r.year) m[r.year] = (m[r.year] || 0) + 1; });
    return Object.entries(m).map(([year, count]) => ({ year: parseInt(year), count })).sort((a,b) => a.year-b.year);
  }, [results]);

  const years = results.filter(r => r.year).map(r => r.year);
  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;

  const wikiUrl = submitted
    ? `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(submitted)}`
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Search Individual Letters</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter a name, e.g. 'William Dean Howells'"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="bg-white border border-[#ddd] rounded px-3 py-2 text-[#222] text-sm flex-1 focus:outline-none focus:border-[#b07040]"
          />
          <button
            onClick={handleSearch}
            className="bg-[#4a2200] text-white font-semibold px-5 py-2 rounded hover:bg-[#6a3200] transition-colors text-sm"
          >
            Search
          </button>
        </div>
        {submitted && (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="text-[#555] text-sm">{results.length.toLocaleString()} results for &quot;{submitted}&quot;</span>
            {minYear && <span className="text-[#555] text-sm">Span: {minYear}–{maxYear}</span>}
            {wikiUrl && (
              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a2200] text-sm hover:underline"
              >
                🔍 Wikipedia Search →
              </a>
            )}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <>
          {timeline.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#4a2200] mb-3">Letters Per Year</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="lookupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a2200" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4a2200" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="year" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(40,20,0,.88)', border: 'none', color: '#fff', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="count" stroke="#4a2200" strokeWidth={2} fill="url(#lookupGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#4a2200] mb-3">Matching Letters (first 200)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ddd] text-left">
                    <th className="py-2 pr-3 text-[#4a2200] font-semibold">Sender</th>
                    <th className="py-2 pr-3 text-[#4a2200] font-semibold">Receiver</th>
                    <th className="py-2 pr-3 text-[#4a2200] font-semibold">Date</th>
                    <th className="py-2 pr-3 text-[#4a2200] font-semibold">Location</th>
                    <th className="py-2 text-[#4a2200] font-semibold">Identifier</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 200).map((row, i) => (
                    <tr key={i} className="border-b border-[#eee] hover:bg-[#f0e8de] transition-colors">
                      <td className="py-1.5 pr-3 text-[#222]">{row.senderNorm}</td>
                      <td className="py-1.5 pr-3 text-[#222]">{row.receiverNorm}</td>
                      <td className="py-1.5 pr-3 text-[#555] whitespace-nowrap">{row.date || '—'}</td>
                      <td className="py-1.5 pr-3 text-[#555]">{row.locationNorm}</td>
                      <td className="py-1.5 text-[#888] text-xs">{row.identifier || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.length > 200 && (
              <div className="mt-3 text-[#888] text-sm text-center">
                Showing 200 of {results.length.toLocaleString()} results. Refine your search for more specific results.
              </div>
            )}
          </div>
        </>
      )}

      {submitted && results.length === 0 && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-8 text-center text-[#888] shadow-sm">
          No letters found matching &quot;{submitted}&quot;
        </div>
      )}
    </div>
  );
}
