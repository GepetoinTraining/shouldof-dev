import { db } from '@/db';
import { packages, projects, projectDependencies, packageConnections } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { GraphData, GraphNode, GraphLink } from '@/components/graph/ForceGraph';

// Wiki pages that exist as static content
const STATIC_WIKI_SLUGS = new Set(['markdown', 'mermaid']);

export async function getGraphData(): Promise<GraphData> {
    try {
        const allPackages = await db.select().from(packages).where(eq(packages.optedOut, false));
        const allProjects = await db.select().from(projects);
        const allDeps = await db.select().from(projectDependencies);
        const allConnections = await db.select().from(packageConnections);

        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // Add package nodes
        for (const pkg of allPackages) {
            nodes.push({
                id: `pkg-${pkg.id}`,
                name: pkg.name,
                slug: pkg.slug,
                type: 'package',
                userCount: pkg.userCount || 0,
                thankYouCount: pkg.thankYouCount || 0,
                creatorName: pkg.creatorName || undefined,
                hasWiki: !!(pkg.backstoryMd) || STATIC_WIKI_SLUGS.has(pkg.slug),
            });
        }

        // Add project nodes
        for (const proj of allProjects) {
            nodes.push({
                id: `proj-${proj.id}`,
                name: proj.name,
                slug: `project-${proj.id}`,
                type: 'project',
                userCount: 0,
                thankYouCount: 0,
                tag: proj.tag || 'other',
                hasWiki: false,
            });
        }

        // Add project → package edges
        for (const dep of allDeps) {
            links.push({
                source: `proj-${dep.projectId}`,
                target: `pkg-${dep.packageId}`,
                type: dep.depType as GraphLink['type'],
            });
        }

        // Add package ↔ package edges
        for (const conn of allConnections) {
            links.push({
                source: `pkg-${conn.packageAId}`,
                target: `pkg-${conn.packageBId}`,
                type: conn.relationship as GraphLink['type'],
            });
        }

        return { nodes, links };
    } catch {
        // If DB isn't set up yet, return empty graph
        return { nodes: [], links: [] };
    }
}

// Get data for the stats bar
export async function getGraphStats() {
    try {
        const packageCount = await db.select({ count: sql<number>`count(*)` }).from(packages);
        const projectCount = await db.select({ count: sql<number>`count(*)` }).from(projects);

        return {
            packages: packageCount[0]?.count || 0,
            developers: projectCount[0]?.count || 0,
            thankYous: 0, // TODO: count from thankYouMessages
        };
    } catch {
        return { packages: 0, developers: 0, thankYous: 0 };
    }
}
