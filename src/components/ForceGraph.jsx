import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function shortenName(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

/**
 * Reusable D3 force-directed graph component.
 *
 * networkData: { nodes: [{ id, isCenter, value, isPlace? }], links: [{ source, target, value }] }
 * height: SVG height in px (default 560)
 * centerColor: fill for center node
 * personColor: fill for regular person nodes
 * placeColor: fill for place nodes (if isPlace is true)
 */
export default function ForceGraph({
  networkData,
  height = 560,
  centerColor = '#4a2200',
  personColor = '#a05820',
  placeColor = '#1e3a5f',
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!networkData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 860;

    const nodes = networkData.nodes.map(n => ({ ...n }));
    const links = networkData.links.map(l => ({ ...l }));

    const maxValue = d3.max(nodes, d => d.value) || 1;
    const getRadius = d => (d.isCenter ? 26 : 6 + (d.value / maxValue) * 18);

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.2, 6])
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

    const getNodeColor = d => {
      if (d.isCenter) return centerColor;
      if (d.isPlace) return placeColor;
      return personColor;
    };

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
          isPlace: d.isPlace,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 10,
        });
      })
      .on('mousemove', event => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip(prev =>
          prev
            ? { ...prev, x: event.clientX - rect.left + 12, y: event.clientY - rect.top - 10 }
            : prev
        );
      })
      .on('mouseleave', () => setTooltip(null));

    nodeSel.append('circle')
      .attr('r', d => getRadius(d))
      .attr('fill', d => getNodeColor(d))
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
  }, [networkData, height, centerColor, personColor, placeColor]);

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
            maxWidth: 240,
          }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          {tooltip.value > 0 && (
            <div className="text-[#f0d0a0] text-xs mt-0.5">
              {tooltip.isPlace
                ? `${tooltip.value} letters`
                : `${tooltip.value} letters exchanged`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
