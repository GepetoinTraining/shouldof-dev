'use client';

import { useEffect, useState } from 'react';
import ForceGraph, { type GraphData, type GraphNode } from '@/components/graph/ForceGraph';

// Initial demo data before the DB is populated
const SEED_GRAPH: GraphData = {
    nodes: [
        {
            id: 'pkg-markdown',
            name: 'Markdown',
            slug: 'markdown',
            type: 'package',
            userCount: 0,
            thankYouCount: 0,
            creatorName: 'John Gruber & Aaron Swartz',
            hasWiki: true,
        },
        {
            id: 'pkg-mermaid',
            name: 'Mermaid.js',
            slug: 'mermaid',
            type: 'package',
            userCount: 0,
            thankYouCount: 0,
            creatorName: 'Knut Sveidqvist',
            hasWiki: true,
        },
    ],
    links: [
        {
            source: 'pkg-mermaid',
            target: 'pkg-markdown',
            type: 'dependency',
        },
    ],
};

export default function GraphSection({ interactive = false, onNodeClick }: { interactive?: boolean; onNodeClick?: (node: GraphNode) => void }) {
    const [graphData, setGraphData] = useState<GraphData>(SEED_GRAPH);

    useEffect(() => {
        fetch('/api/graph')
            .then((res) => res.json())
            .then((data: GraphData) => {
                if (data.nodes && data.nodes.length > 0) {
                    setGraphData(data);
                }
            })
            .catch(() => { });
    }, []);

    return <ForceGraph data={graphData} interactive={interactive} onNodeClick={onNodeClick} />;
}
