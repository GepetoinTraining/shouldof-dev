import { NextResponse } from 'next/server';
import { db } from '@/db';
import { thankYouMessages, packages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const thankYouSchema = z.object({
    packageSlug: z.string().min(1),
    message: z.string().min(1).max(500),
    authorName: z.string().min(1).max(100),
});

// POST — submit a thank-you message
export async function POST(request: Request) {
    const session = await auth();

    try {
        const body = await request.json();
        const input = thankYouSchema.parse(body);

        // Find the package
        const [pkg] = await db
            .select()
            .from(packages)
            .where(eq(packages.slug, input.packageSlug))
            .limit(1);

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        // Insert message
        const [msg] = await db.insert(thankYouMessages).values({
            userId: session?.user?.githubId ? undefined : undefined, // optional auth
            packageId: pkg.id,
            authorName: input.authorName,
            message: input.message,
        }).returning();

        // Increment thank-you count
        await db.update(packages)
            .set({ thankYouCount: (pkg.thankYouCount || 0) + 1 })
            .where(eq(packages.id, pkg.id));

        return NextResponse.json({ success: true, message: msg });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Thank-you error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET — list thank-you messages for a package
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
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

    // Get messages
    const messages = await db
        .select()
        .from(thankYouMessages)
        .where(eq(thankYouMessages.packageId, pkg.id))
        .orderBy(thankYouMessages.createdAt);

    return NextResponse.json(messages);
}
