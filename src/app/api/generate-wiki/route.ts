import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWikiForPackage } from '@/lib/ai-wiki';

export async function POST(request: Request) {
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

        // Don't regenerate if already has a verified backstory
        if (pkg.backstoryMd && pkg.backstoryVerified) {
            return NextResponse.json({
                message: 'Wiki already verified',
                wiki: JSON.parse(pkg.backstoryMd),
            });
        }

        // Generate the wiki
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

        // Store result in DB
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
                backstoryVerified: false,
                generatedAt: new Date().toISOString(),
                githubReadmeExcerpt: readmeExcerpt,
                npmWeeklyDownloads: weeklyDownloads,
                // Also update creator info if we got better data
                creatorName: pkg.creatorName || wiki.title,
            })
            .where(eq(packages.id, pkg.id));

        return NextResponse.json({
            success: true,
            wiki: backstoryData,
            generatedBy: wiki.generatedBy,
        });
    } catch (error) {
        console.error('Wiki generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate wiki' },
            { status: 500 },
        );
    }
}
