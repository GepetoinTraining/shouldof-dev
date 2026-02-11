import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { packages, projects, projectDependencies, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fetchPackageJson } from '@/lib/github';
import { fetchNpmPackageInfo, extractAuthorName, extractRepoUrl, slugify } from '@/lib/npm';
import { z } from 'zod';

const connectSchema = z.object({
    repoFullName: z.string().min(1),
    repoUrl: z.string().url(),
    repoName: z.string().min(1),
    repoDescription: z.string().nullable().optional(),
    tag: z.enum(['edutech', 'fintech', 'healthtech', 'blog', 'saas', 'game', 'tool', 'other']),
});

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.accessToken || !session.user.githubId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const input = connectSchema.parse(body);

        // 1. Ensure user exists in DB
        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.githubId, session.user.githubId))
            .limit(1);

        if (!user) {
            const [newUser] = await db.insert(users).values({
                githubId: session.user.githubId,
                githubUsername: session.user.githubUsername || session.user.name || 'unknown',
                name: session.user.name,
                email: session.user.email,
                avatarUrl: session.user.image,
                projectCount: 0,
            }).returning();
            user = newUser;
        }

        // 2. Fetch package.json from GitHub
        const packageJson = await fetchPackageJson(session.user.accessToken, input.repoFullName);
        if (!packageJson) {
            return NextResponse.json(
                { error: 'No package.json found in this repository' },
                { status: 404 },
            );
        }

        // 3. Create project
        const [project] = await db.insert(projects).values({
            ownerGithubId: session.user.githubId,
            repoUrl: input.repoUrl,
            repoFullName: input.repoFullName,
            name: input.repoName,
            description: input.repoDescription || undefined,
            tag: input.tag,
            packageCount: 0,
        }).returning();

        // 4. Process dependencies
        const allDeps: { name: string; version: string; type: string }[] = [];

        if (packageJson.dependencies) {
            for (const [name, version] of Object.entries(packageJson.dependencies)) {
                allDeps.push({ name, version, type: 'dependency' });
            }
        }
        if (packageJson.devDependencies) {
            for (const [name, version] of Object.entries(packageJson.devDependencies)) {
                allDeps.push({ name, version, type: 'devDependency' });
            }
        }

        let packageCount = 0;

        for (const dep of allDeps) {
            const depSlug = slugify(dep.name);

            // Check if package exists
            let [existingPkg] = await db
                .select()
                .from(packages)
                .where(eq(packages.slug, depSlug))
                .limit(1);

            if (!existingPkg) {
                // Fetch from npm registry
                const npmInfo = await fetchNpmPackageInfo(dep.name);

                const [newPkg] = await db.insert(packages).values({
                    name: dep.name,
                    registry: 'npm',
                    slug: depSlug,
                    versionLatest: dep.version.replace(/[\^~>=<]/g, ''),
                    description: npmInfo?.description,
                    creatorName: npmInfo ? extractAuthorName(npmInfo.author) : undefined,
                    repoUrl: npmInfo ? extractRepoUrl(npmInfo.repository) : undefined,
                    npmUrl: `https://www.npmjs.com/package/${dep.name}`,
                    homepageUrl: npmInfo?.homepage,
                    userCount: 1,
                    backstoryGeneratedBy: null,
                }).returning();

                existingPkg = newPkg;
            } else {
                // Increment user count
                await db
                    .update(packages)
                    .set({ userCount: (existingPkg.userCount || 0) + 1 })
                    .where(eq(packages.id, existingPkg.id));
            }

            // Create edge: project → package
            await db.insert(projectDependencies).values({
                projectId: project.id,
                packageId: existingPkg.id,
                depth: 1,
                depType: dep.type,
            });

            packageCount++;
        }

        // 5. Update project package count and user project count
        await db.update(projects)
            .set({ packageCount })
            .where(eq(projects.id, project.id));

        await db.update(users)
            .set({ projectCount: (user.projectCount || 0) + 1 })
            .where(eq(users.id, user.id));

        return NextResponse.json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                packageCount,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.issues },
                { status: 400 },
            );
        }
        console.error('Connect error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
