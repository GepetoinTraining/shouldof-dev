'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';

export interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    slug: string;
    type: 'package' | 'project';
    userCount: number;
    thankYouCount: number;
    creatorName?: string;
    tag?: string;
    hasWiki: boolean;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    type: 'dependency' | 'devDependency' | 'peerDependency';
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

// Color palette for different node types / tags
const TAG_COLORS: Record<string, string> = {
    edutech: '#10b981',
    fintech: '#f59e0b',
    healthtech: '#f43f5e',
    saas: '#06b6d4',
    game: '#ec4899',
    tool: '#8b5cf6',
    blog: '#6366f1',
    other: '#64748b',
    package: '#a78bfa',
    project: '#06b6d4',
};

export default function ForceGraph({ data, interactive = false, onNodeClick }: { data: GraphData; interactive?: boolean; onNodeClick?: (node: GraphNode) => void }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
    const interactiveRef = useRef(interactive);
    const onNodeClickRef = useRef(onNodeClick);

    // Keep refs in sync with props so D3 closures always read the latest value
    useEffect(() => { interactiveRef.current = interactive; }, [interactive]);
    useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);

    const getNodeColor = useCallback((node: GraphNode) => {
        if (node.type === 'project') return TAG_COLORS[node.tag || 'other'] || TAG_COLORS.other;
        return TAG_COLORS.package;
    }, []);

    const getNodeRadius = useCallback((node: GraphNode) => {
        if (node.type === 'project') return 12;
        const base = 6;
        const scale = Math.min(node.userCount * 0.5, 14);
        return base + scale;
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length) return;

        const svg = d3.select(svgRef.current);
        const container = svgRef.current.parentElement!;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Clear previous render
        svg.selectAll('*').remove();

        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // Create a group for zoom/pan
        const g = svg.append('g');

        // Zoom behavior — interactive mode enables full zoom, backdrop mode blocks scroll
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 4])
            .filter((event) => {
                // In backdrop mode, block wheel events so page scrolls normally
                if (!interactiveRef.current && event.type === 'wheel') return false;
                return true;
            })
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Deep clone nodes and links for D3 mutation
        const nodes: GraphNode[] = data.nodes.map((d) => ({ ...d }));
        const links: GraphLink[] = data.links.map((d) => ({ ...d }));

        // Create the simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(links)
                .id((d) => d.id)
                .distance(80)
                .strength(0.4)
            )
            .force('charge', d3.forceManyBody()
                .strength(-200)
                .distanceMax(400)
            )
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide<GraphNode>()
                .radius((d) => getNodeRadius(d) + 4)
            )
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2).strength(0.05));

        simulationRef.current = simulation;

        // Glow filter
        const defs = svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Draw links
        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('class', 'link-line')
            .attr('stroke-opacity', 0.4);

        // Draw nodes
        const node = g.append('g')
            .selectAll<SVGCircleElement, GraphNode>('circle')
            .data(nodes)
            .join('circle')
            .attr('class', 'node-circle')
            .attr('r', (d) => getNodeRadius(d))
            .attr('fill', (d) => getNodeColor(d))
            .attr('stroke', (d) => d.hasWiki ? 'rgba(255,255,255,0.3)' : 'none')
            .attr('stroke-width', 1.5)
            .style('filter', 'url(#glow)')
            .style('opacity', 0)
            .transition()
            .duration(800)
            .delay((_d, i) => i * 30)
            .style('opacity', 1);

        // Labels
        const label = g.append('g')
            .selectAll<SVGTextElement, GraphNode>('text')
            .data(nodes)
            .join('text')
            .attr('class', 'node-label')
            .text((d) => d.name)
            .style('font-size', (d) => d.type === 'project' ? '13px' : '11px')
            .style('font-weight', (d) => d.type === 'project' ? '700' : '500')
            .attr('dy', (d) => getNodeRadius(d) + 14)
            .style('opacity', 0)
            .transition()
            .duration(800)
            .delay((_d, i) => i * 30 + 400)
            .style('opacity', 1);

        // Tooltip & interaction
        const nodeSelection = g.selectAll<SVGCircleElement, GraphNode>('circle');

        nodeSelection
            .on('mouseover', function (_event: MouseEvent, d: GraphNode) {
                const tooltip = tooltipRef.current;
                if (!tooltip) return;

                d3.select(this)
                    .transition().duration(150)
                    .attr('r', getNodeRadius(d) * 1.3);

                // Highlight connected links
                link
                    .classed('highlighted', (l) => {
                        const src = typeof l.source === 'object' ? l.source.id : l.source;
                        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                        return src === d.id || tgt === d.id;
                    })
                    .attr('stroke-opacity', (l) => {
                        const src = typeof l.source === 'object' ? l.source.id : l.source;
                        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                        return (src === d.id || tgt === d.id) ? 0.8 : 0.15;
                    });

                tooltip.innerHTML = `
          <h4>${d.name}</h4>
          ${d.creatorName ? `<p>by ${d.creatorName}</p>` : ''}
          <div class="tooltip-stat">
            ${d.type === 'package' ? `👥 ${d.userCount} developers` : `📦 ${d.tag || 'project'}`}
          </div>
          ${d.thankYouCount > 0 ? `<div class="tooltip-stat">💜 ${d.thankYouCount} thank-yous</div>` : ''}
          ${d.hasWiki ? '<div class="tooltip-stat">📖 Has wiki page</div>' : ''}
        `;
                tooltip.classList.add('visible');
            })
            .on('mousemove', function (event: MouseEvent) {
                const tooltip = tooltipRef.current;
                if (!tooltip) return;
                const rect = container.getBoundingClientRect();
                tooltip.style.left = `${event.clientX - rect.left + 16}px`;
                tooltip.style.top = `${event.clientY - rect.top - 10}px`;
            })
            .on('mouseout', function (_event: MouseEvent, d: GraphNode) {
                const tooltip = tooltipRef.current;
                if (tooltip) tooltip.classList.remove('visible');

                d3.select(this)
                    .transition().duration(150)
                    .attr('r', getNodeRadius(d));

                link
                    .classed('highlighted', false)
                    .attr('stroke-opacity', 0.4);
            })
            .on('click', function (_event: MouseEvent, d: GraphNode) {
                if (onNodeClickRef.current) {
                    onNodeClickRef.current(d);
                } else if (d.hasWiki) {
                    router.push(`/wiki/${d.slug}`);
                }
            });

        // Drag behavior
        const drag = d3.drag<SVGCircleElement, GraphNode>()
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
            });

        g.selectAll<SVGCircleElement, GraphNode>('circle').call(drag);

        // Tick
        simulation.on('tick', () => {
            link
                .attr('x1', (d) => (d.source as GraphNode).x!)
                .attr('y1', (d) => (d.source as GraphNode).y!)
                .attr('x2', (d) => (d.target as GraphNode).x!)
                .attr('y2', (d) => (d.target as GraphNode).y!);

            g.selectAll<SVGCircleElement, GraphNode>('circle')
                .attr('cx', (d) => d.x!)
                .attr('cy', (d) => d.y!);

            g.selectAll<SVGTextElement, GraphNode>('text')
                .attr('x', (d) => d.x!)
                .attr('y', (d) => d.y!);
        });

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [data, getNodeColor, getNodeRadius, router]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (simulationRef.current && svgRef.current) {
                const container = svgRef.current.parentElement!;
                const width = container.clientWidth;
                const height = container.clientHeight;
                d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);
                simulationRef.current
                    .force('center', d3.forceCenter(width / 2, height / 2))
                    .force('x', d3.forceX(width / 2).strength(0.05))
                    .force('y', d3.forceY(height / 2).strength(0.05))
                    .alpha(0.3)
                    .restart();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="graph-container" style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
            <svg ref={svgRef} style={{ pointerEvents: 'auto' }} />
            <div ref={tooltipRef} className="graph-tooltip" />
        </div>
    );
}
