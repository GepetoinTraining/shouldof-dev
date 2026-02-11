import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { like, or } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    const pattern = `%${q}%`;

    const results = await db
        .select({
            id: packages.id,
            name: packages.name,
            slug: packages.slug,
            creatorName: packages.creatorName,
            description: packages.description,
            userCount: packages.userCount,
            backstoryMd: packages.backstoryMd,
        })
        .from(packages)
        .where(
            or(
                like(packages.name, pattern),
                like(packages.creatorName, pattern),
                like(packages.description, pattern),
            )
        )
        .limit(10);

    return NextResponse.json(results.map(r => ({
        ...r,
        hasWiki: !!r.backstoryMd,
    })));
}
