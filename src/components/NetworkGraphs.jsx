import { useState, useMemo } from 'react';
import { buildNetworkData, buildTwainNetworkWithPlaces } from '../utils/dataUtils';
import ForceGraph from './ForceGraph';

const GRAPH_PEOPLE = [
  {
    key: 'Samuel L. Clemens',
    label: "Twain's Network",
    subtitle: 'Overall force-directed correspondence network for Samuel L. Clemens (Mark Twain)',
    withPlaces: false,
  },
  {
    key: 'Samuel L. Clemens',
    label: "Twain + Places",
    subtitle: "Twain's correspondence network including the places he wrote from — navy nodes are locations, brown nodes are people",
    withPlaces: true,
  },
  {
    key: 'Clara L. Clemens',
    label: "Clara's Network",
    subtitle: "Force-directed correspondence network for Clara L. Clemens",
    withPlaces: false,
  },
  {
    key: 'Olivia L. Clemens',
    label: "Olivia's Network",
    subtitle: "Force-directed correspondence network for Olivia L. Clemens",
    withPlaces: false,
  },
  {
    key: 'Isabel V. Lyon',
    label: "Isabel's Network",
    subtitle: "Force-directed correspondence network for Isabel V. Lyon",
    withPlaces: false,
  },
  {
    key: 'Ralph W. Ashcroft',
    label: "Ashcroft's Network",
    subtitle: "Force-directed correspondence network for Ralph W. Ashcroft",
    withPlaces: false,
  },
];

export default function NetworkGraphs({ data }) {
  const [activeGraph, setActiveGraph] = useState(0);

  if (!data) return null;
  const { processed } = data;

  const networkData = useMemo(() => {
    const g = GRAPH_PEOPLE[activeGraph];
    if (g.withPlaces) {
      return buildTwainNetworkWithPlaces(processed, g.key);
    }
    return buildNetworkData(processed, g.key);
  }, [processed, activeGraph]);

  const current = GRAPH_PEOPLE[activeGraph];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-2">Network Graphs</h2>
        <p className="text-[#555] text-sm mb-4">
          Force-directed correspondence networks built with D3.js. Nodes represent people (and
          optionally places); edges represent letters exchanged or letters sent from a location.
          Node size reflects the number of letters. Drag nodes to rearrange, scroll to zoom.
        </p>

        <div className="flex gap-2 flex-wrap mb-5">
          {GRAPH_PEOPLE.map((p, i) => (
            <button
              key={`${p.key}-${p.label}`}
              onClick={() => setActiveGraph(i)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeGraph === i
                  ? 'bg-[#4a2200] text-white'
                  : 'bg-[#f0e8de] text-[#4a2200] hover:bg-[#e0d0c0]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="text-[#666] text-sm mb-2">{current.subtitle}</p>
        <p className="text-[#aaa] text-xs mb-4">
          {networkData.nodes.length} nodes &middot; {networkData.links.length} connections
        </p>

        <ForceGraph networkData={networkData} />

        <div className="mt-4 flex flex-wrap gap-5 text-xs text-[#555]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full bg-[#4a2200]" />
            Central person
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full bg-[#a05820]" />
            Correspondent (size ∝ letters)
          </span>
          {current.withPlaces && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded-full bg-[#1e3a5f]" />
              Location (size ∝ letters sent)
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-8 h-px bg-[#c5a880] border-t-2 border-[#c5a880]" />
            Edge weight ∝ letter count
          </span>
        </div>
      </div>
    </div>
  );
}

