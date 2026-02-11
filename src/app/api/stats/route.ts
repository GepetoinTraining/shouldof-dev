import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, projects, thankYouMessages } from '@/db/schema';
import { sql, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        // Count packages with backstories (= stories told)
        const [storiesResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(packages)
            .where(isNotNull(packages.backstoryMd));

        // Count connected projects
        const [projectsResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(projects);

        // Count thank-you messages
        const [thankYousResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(thankYouMessages);

        return NextResponse.json({
            stories: storiesResult?.count || 0,
            projects: projectsResult?.count || 0,
            thankYous: thankYousResult?.count || 0,
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ stories: 0, projects: 0, thankYous: 0 });
    }
}
