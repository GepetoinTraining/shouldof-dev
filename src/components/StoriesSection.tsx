import { db } from '@/db';
import { packages } from '@/db/schema';
import { isNotNull } from 'drizzle-orm';
import StoryCard from '@/components/StoryCard';

// Alternating accent colors from brand palette
const ACCENT_COLORS = ['#f43f5e', '#7c3aed', '#4ade80', '#06b6d4', '#f59e0b', '#ec4899'];

interface StoryEntry {
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    accent: string;
}

/**
 * Server component that fetches all wiki stories from the DB
 * and renders them as StoryCards. Falls back to static stories
 * if DB is empty or unavailable.
 */
export default async function StoriesSection() {
    let stories: StoryEntry[] = [];

    try {
        const rows = await db
            .select({
                slug: packages.slug,
                name: packages.name,
                backstoryMd: packages.backstoryMd,
                creatorName: packages.creatorName,
                description: packages.description,
            })
            .from(packages)
            .where(isNotNull(packages.backstoryMd))
            .limit(20); // Cap at 20 for performance

        stories = rows
            .map((row, i) => {
                try {
                    const backstory = JSON.parse(row.backstoryMd!);
                    // Strip citations from excerpt
                    const rawExcerpt = backstory.sections?.who || backstory.who || row.description || '';
                    const excerpt = rawExcerpt
                        .replace(/<cite[^>]*>[\s\S]*?<\/cite>/g, '')
                        .replace(/<cite[^>]*\/>/g, '')
                        .slice(0, 200);

                    return {
                        slug: row.slug,
                        title: backstory.title || row.creatorName || row.name,
                        subtitle: row.name,
                        excerpt,
                        accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
                    };
                } catch {
                    return null;
                }
            })
            .filter((s): s is StoryEntry => s !== null);
    } catch {
        // DB unavailable — fall back to empty
    }

    // Fallback: static stories if DB has nothing
    if (stories.length === 0) {
        stories = [
            {
                slug: 'markdown',
                title: 'John Gruber & Aaron Swartz',
                subtitle: 'Markdown (.md)',
                excerpt: "The format everything is written in. Gruber wanted readable plain text for the web. Aaron Swartz co-designed the spec at age 17.",
                accent: '#f43f5e',
            },
            {
                slug: 'mermaid',
                title: 'Knut Sveidqvist',
                subtitle: 'Mermaid.js',
                excerpt: "74,000 GitHub stars. 8 million users. 3 Medium followers. He built diagrams from text — and nobody said thank you.",
                accent: '#7c3aed',
            },
        ];
    }

    return (
        <section
            style={{
                padding: '64px 24px',
                maxWidth: 900,
                margin: '0 auto',
            }}
        >
            <h2
                style={{
                    fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 48,
                    letterSpacing: '-0.02em',
                }}
            >
                Stories Behind the Code
            </h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 24,
                }}
            >
                {stories.map((story) => (
                    <StoryCard
                        key={story.slug}
                        slug={story.slug}
                        title={story.title}
                        subtitle={story.subtitle}
                        excerpt={story.excerpt}
                        accent={story.accent}
                    />
                ))}
            </div>
        </section>
    );
}
