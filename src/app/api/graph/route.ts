import { NextResponse } from 'next/server';
import { getGraphData } from '@/lib/graph-data';

export async function GET() {
    try {
        const data = await getGraphData();
        return NextResponse.json(data);
    } catch {
        // Return empty graph if DB isn't available yet
        return NextResponse.json({ nodes: [], links: [] });
    }
}
