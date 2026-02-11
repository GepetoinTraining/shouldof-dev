import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, projectDependencies, packages } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubId = (session.user as any).githubId;
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
        return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    try {
        // Verify ownership
        const [project] = await db
            .select()
            .from(projects)
            .where(
                and(
                    eq(projects.id, projectId),
                    eq(projects.ownerGithubId, String(githubId))
                )
            )
            .limit(1);

        if (!project) {
            return NextResponse.json({ error: 'Project not found or not yours' }, { status: 404 });
        }

        // Get affected package IDs before deletion
        const deps = await db
            .select({ packageId: projectDependencies.packageId })
            .from(projectDependencies)
            .where(eq(projectDependencies.projectId, projectId));

        // Delete dependencies
        await db
            .delete(projectDependencies)
            .where(eq(projectDependencies.projectId, projectId));

        // Decrement userCount on affected packages
        for (const dep of deps) {
            await db
                .update(packages)
                .set({
                    userCount: sql`MAX(0, ${packages.userCount} - 1)`,
                })
                .where(eq(packages.id, dep.packageId));
        }

        // Delete the project
        await db.delete(projects).where(eq(projects.id, projectId));

        return NextResponse.json({
            success: true,
            removed: project.name,
            packagesAffected: deps.length,
        });
    } catch (error) {
        console.error('Project deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
