import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const [pkg] = await db
        .select()
        .from(packages)
        .where(eq(packages.slug, slug))
        .limit(1);

    if (!pkg) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...pkg,
        backstory: pkg.backstoryMd ? JSON.parse(pkg.backstoryMd) : null,
    });
}
