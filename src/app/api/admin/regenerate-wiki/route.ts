import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWikiForPackage } from '@/lib/ai-wiki';
import { logUsage } from '@/lib/funding';

export async function POST(request: Request) {
    // Gate: admin only
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { slug, force } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
        }

        const [pkg] = await db
            .select()
            .from(packages)
            .where(eq(packages.slug, slug))
            .limit(1);

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        // force=true skips the verified check (admin override)
        if (pkg.backstoryVerified && !force) {
            return NextResponse.json({
                message: 'Wiki is verified. Pass force=true to override.',
                wiki: pkg.backstoryMd ? JSON.parse(pkg.backstoryMd) : null,
            });
        }

        // Generate fresh wiki with upgraded pipeline
        const { wiki, readmeExcerpt, weeklyDownloads } = await generateWikiForPackage(
            pkg.name,
            {
                description: pkg.description,
                creatorName: pkg.creatorName,
                repoUrl: pkg.repoUrl,
                homepageUrl: pkg.homepageUrl,
                npmUrl: pkg.npmUrl,
            }
        );

        const backstoryData = {
            ...wiki.sections,
            title: wiki.title,
            subtitle: wiki.subtitle,
            location: wiki.location,
        };

        await db.update(packages)
            .set({
                backstoryMd: JSON.stringify(backstoryData),
                backstoryGeneratedBy: wiki.generatedBy,
                backstoryVerified: false, // reset verified on regen
                generatedAt: new Date().toISOString(),
                githubReadmeExcerpt: readmeExcerpt,
                npmWeeklyDownloads: weeklyDownloads,
                creatorName: wiki.title || pkg.creatorName,
            })
            .where(eq(packages.id, pkg.id));

        // Log usage for cost tracking
        await logUsage({
            packageName: pkg.name,
            packageSlug: pkg.slug,
            tokensIn: wiki.tokensIn,
            tokensOut: wiki.tokensOut,
            costUsd: wiki.costUsd,
            model: wiki.generatedBy,
        });

        return NextResponse.json({
            success: true,
            wiki: backstoryData,
            generatedBy: wiki.generatedBy,
            cost: wiki.costUsd,
            regenerated: true,
        });
    } catch (error) {
        console.error('Wiki regeneration error:', error);
        return NextResponse.json(
            { error: 'Failed to regenerate wiki' },
            { status: 500 },
        );
    }
}
