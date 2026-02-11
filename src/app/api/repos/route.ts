import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchUserRepos } from '@/lib/github';

export async function GET() {
    const session = await auth();

    if (!session?.user?.accessToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const repos = await fetchUserRepos(session.user.accessToken);
        return NextResponse.json(repos);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch repositories' },
            { status: 500 },
        );
    }
}
