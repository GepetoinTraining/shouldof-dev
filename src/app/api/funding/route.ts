import { NextResponse } from 'next/server';
import { getFundingStats } from '@/lib/funding';

export async function GET() {
    try {
        const stats = await getFundingStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Funding stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch funding stats' },
            { status: 500 },
        );
    }
}
