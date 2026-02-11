import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, projects, thankYouMessages, apiFunding, packages } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubId = (session.user as any).githubId;
    if (!githubId) {
        return NextResponse.json({ error: 'No GitHub ID in session' }, { status: 400 });
    }

    try {
        // Get user record
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.githubId, String(githubId)))
            .limit(1);

        // Get user's projects
        const userProjects = await db
            .select()
            .from(projects)
            .where(eq(projects.ownerGithubId, String(githubId)));

        // Get thank-you messages with package names
        let thankYous: any[] = [];
        if (user) {
            thankYous = await db
                .select({
                    id: thankYouMessages.id,
                    message: thankYouMessages.message,
                    createdAt: thankYouMessages.createdAt,
                    packageName: packages.name,
                    packageSlug: packages.slug,
                })
                .from(thankYouMessages)
                .leftJoin(packages, eq(thankYouMessages.packageId, packages.id))
                .where(eq(thankYouMessages.userId, user.id));
        }

        // Get funding contributions
        let funding: any[] = [];
        if (user) {
            funding = await db
                .select({
                    id: apiFunding.id,
                    amount: apiFunding.amount,
                    currency: apiFunding.currency,
                    createdAt: apiFunding.createdAt,
                })
                .from(apiFunding)
                .where(eq(apiFunding.userId, user.id));
        }

        return NextResponse.json({
            user: user || {
                githubId: String(githubId),
                githubUsername: (session.user as any).githubUsername,
                name: session.user.name,
                email: session.user.email,
                avatarUrl: session.user.image,
            },
            projects: userProjects,
            thankYous,
            funding,
            stats: {
                projectCount: userProjects.length,
                thankYouCount: thankYous.length,
                totalFunded: funding.reduce((sum, f) => sum + f.amount, 0),
            },
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
