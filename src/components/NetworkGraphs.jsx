import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { buildNetworkData } from '../utils/dataUtils';

const GRAPH_PEOPLE = [
  {
    key: 'Samuel L. Clemens',
    label: "Twain's Network",
    subtitle: 'Overall force-directed correspondence network for Samuel L. Clemens (Mark Twain)',
  },
  {
    key: 'Clara L. Clemens',
    label: "Clara's Network",
    subtitle: "Force-directed correspondence network for Clara L. Clemens",
  },
  {
    key: 'Olivia L. Clemens',
    label: "Olivia's Network",
    subtitle: "Force-directed correspondence network for Olivia L. Clemens",
  },
];

function shortenName(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function ForceGraph({ networkData }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!networkData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 860;
    const height = 560;

    // Deep copy so D3 can mutate without touching React state
    const nodes = networkData.nodes.map(n => ({ ...n }));
    const links = networkData.links.map(l => ({ ...l }));

    const maxValue = d3.max(nodes, d => d.value) || 1;
    const getRadius = d => (d.isCenter ? 26 : 6 + (d.value / maxValue) * 18);

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.25, 5])
      .on('zoom', event => g.attr('transform', event.transform));
    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(110).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => getRadius(d) + 10));

    const maxLinkValue = d3.max(links, d => d.value) || 1;

    const linkSel = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#c5a880')
      .attr('stroke-opacity', d => 0.2 + (d.value / maxLinkValue) * 0.6)
      .attr('stroke-width', d => 0.5 + (d.value / maxLinkValue) * 3.5);

    const nodeSel = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('mouseenter', (event, d) => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
          name: d.id,
          value: d.value,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 10,
        });
      })
      .on('mousemove', (event) => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip(prev =>
          prev ? { ...prev, x: event.clientX - rect.left + 12, y: event.clientY - rect.top - 10 } : prev
        );
      })
      .on('mouseleave', () => setTooltip(null));

    nodeSel.append('circle')
      .attr('r', d => getRadius(d))
      .attr('fill', d => d.isCenter ? '#4a2200' : '#a05820')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0.9);

    nodeSel.append('text')
      .text(d => {
        if (d.isCenter) return shortenName(d.id);
        return d.value > maxValue * 0.12 ? shortenName(d.id) : '';
      })
      .attr('text-anchor', 'middle')
      .attr('dy', d => getRadius(d) + 14)
      .attr('font-size', d => (d.isCenter ? 12 : 10))
      .attr('font-weight', d => (d.isCenter ? 'bold' : 'normal'))
      .attr('fill', '#333')
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      linkSel
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      nodeSel.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
      setTooltip(null);
    };
  }, [networkData]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ background: '#faf7f2', borderRadius: '8px', display: 'block' }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded px-3 py-2 text-sm text-white shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            background: 'rgba(40,20,0,0.88)',
            maxWidth: 220,
          }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          {tooltip.value > 0 && (
            <div className="text-[#f0d0a0] text-xs mt-0.5">{tooltip.value} letters exchanged</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NetworkGraphs({ data }) {
  const [activeGraph, setActiveGraph] = useState(0);

  if (!data) return null;
  const { processed } = data;

  const networkData = useMemo(
    () => buildNetworkData(processed, GRAPH_PEOPLE[activeGraph].key),
    [processed, activeGraph]
  );

  const current = GRAPH_PEOPLE[activeGraph];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4a2200] mb-4">Network Graphs</h2>
        <p className="text-[#555] text-sm mb-4">
          Force-directed correspondence networks built with D3.js. Nodes represent people; edges
          represent letters exchanged. Node size reflects the number of letters with the central
          person. Drag nodes to rearrange, scroll to zoom.
        </p>

        {/* Sub-tab buttons */}
        <div className="flex gap-2 flex-wrap mb-5">
          {GRAPH_PEOPLE.map((p, i) => (
            <button
              key={p.key}
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
          {networkData.nodes.length} people &middot; {networkData.links.length} connections
        </p>

        <ForceGraph networkData={networkData} />

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-5 text-xs text-[#555]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full bg-[#4a2200]" />
            Central person
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full bg-[#a05820]" />
            Correspondent (size ∝ letters)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-8 h-px bg-[#c5a880] border-t-2 border-[#c5a880]" />
            Edge weight ∝ letter count
          </span>
        </div>
      </div>
    </div>
  );
}
