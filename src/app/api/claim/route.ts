import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.githubUsername) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { slug } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
        }

        // Find the package
        const [pkg] = await db
            .select()
            .from(packages)
            .where(eq(packages.slug, slug))
            .limit(1);

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        if (pkg.claimed) {
            return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
        }

        // Auto-verify if GitHub username matches creator
        const isAutoVerified = pkg.creatorGithub &&
            pkg.creatorGithub.toLowerCase() === session.user.githubUsername.toLowerCase();

        await db.update(packages)
            .set({
                claimed: true,
                claimedBy: session.user.githubUsername,
                backstoryVerified: isAutoVerified ? true : pkg.backstoryVerified,
            })
            .where(eq(packages.id, pkg.id));

        return NextResponse.json({
            success: true,
            autoVerified: isAutoVerified,
            message: isAutoVerified
                ? 'Claimed and verified! Your GitHub username matches the package creator.'
                : 'Claim submitted. We\'ll verify your identity.',
        });
    } catch (error) {
        console.error('Claim error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
