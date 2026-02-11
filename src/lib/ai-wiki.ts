import Anthropic from '@anthropic-ai/sdk';
import { fetchNpmPackageInfo, extractAuthorName, extractRepoUrl } from './npm';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface WikiSections {
    who: string;
    the_moment: string;
    what_it_does: string;
    impact: string;
    connections: string;
}

export interface GeneratedWiki {
    sections: WikiSections;
    title: string;       // creator name or "The [package] Team"
    subtitle: string;    // one-line poetic summary
    location: string;    // creator's location or "Open Source"
    generatedBy: string; // model identifier
}

/**
 * Fetch README excerpt from a GitHub repo via the raw URL.
 */
export async function fetchReadmeExcerpt(repoUrl: string | null | undefined): Promise<string | null> {
    if (!repoUrl) return null;

    // Extract owner/repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) return null;

    const ownerRepo = match[1];

    // Try common README filenames
    for (const filename of ['README.md', 'readme.md', 'Readme.md']) {
        try {
            const res = await fetch(
                `https://raw.githubusercontent.com/${ownerRepo}/HEAD/${filename}`,
                { signal: AbortSignal.timeout(5000) }
            );
            if (res.ok) {
                const text = await res.text();
                return text.slice(0, 2000);
            }
        } catch {
            continue;
        }
    }

    return null;
}

/**
 * Fetch weekly download count from npm.
 */
export async function fetchNpmDownloads(packageName: string): Promise<number | null> {
    try {
        const encoded = encodeURIComponent(packageName).replace('%40', '@');
        const res = await fetch(
            `https://api.npmjs.org/downloads/point/last-week/${encoded}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.downloads ?? null;
    } catch {
        return null;
    }
}

/**
 * Generate a wiki page for a package using Claude.
 */
export async function generateWiki(
    packageName: string,
    metadata?: {
        description?: string | null;
        creatorName?: string | null;
        repoUrl?: string | null;
        homepageUrl?: string | null;
        npmUrl?: string | null;
        weeklyDownloads?: number | null;
        readmeExcerpt?: string | null;
        license?: string | null;
        keywords?: string[] | null;
    }
): Promise<GeneratedWiki> {
    const contextParts: string[] = [];

    if (metadata?.description) contextParts.push(`Description: ${metadata.description}`);
    if (metadata?.creatorName) contextParts.push(`Creator: ${metadata.creatorName}`);
    if (metadata?.repoUrl) contextParts.push(`Repository: ${metadata.repoUrl}`);
    if (metadata?.homepageUrl) contextParts.push(`Homepage: ${metadata.homepageUrl}`);
    if (metadata?.npmUrl) contextParts.push(`npm: ${metadata.npmUrl}`);
    if (metadata?.weeklyDownloads) contextParts.push(`Weekly downloads: ${metadata.weeklyDownloads.toLocaleString()}`);
    if (metadata?.license) contextParts.push(`License: ${metadata.license}`);
    if (metadata?.keywords?.length) contextParts.push(`Keywords: ${metadata.keywords.join(', ')}`);
    if (metadata?.readmeExcerpt) contextParts.push(`README excerpt:\n${metadata.readmeExcerpt}`);

    const context = contextParts.join('\n');

    const prompt = `You are writing for shouldof.dev — a platform that makes the humans behind open source software visible. Every npm install is a person.

Your job is to write a wiki page about the package "${packageName}" for this platform. The tone should be warm, human, and specific — not corporate or generic. Write like a journalist who deeply respects the craft of programming.

Here is everything we know about this package:
${context || 'Only the package name is known.'}

Write a JSON object with these exact keys:

{
  "title": "Creator's real name if known, otherwise 'The [package] Team'",
  "subtitle": "One poetic line describing what they built (e.g., 'Diagrams from text, like Markdown for visuals')",
  "location": "Creator's location if known from context, otherwise 'Open Source'",
  "sections": {
    "who": "2-3 sentences about the creator as a person. What do we know about them? If we know almost nothing, say that honestly — 'We don't know much about [name] yet, but their work speaks volumes.' Don't invent biographical details.",
    "the_moment": "2-3 sentences about why this package was created. What frustration or insight led to it? If unknown, describe the problem it solves in human terms.",
    "what_it_does": "2-3 sentences explaining what the package does in layperson terms. No marketing language. Be specific about the actual functionality.",
    "impact": "2-3 sentences about the package's real impact — download numbers, who uses it, how big its reach is. Use the actual numbers we provided if available.",
    "connections": "1-2 sentences about how this package connects to the broader ecosystem. What depends on it? What does it enable?"
  }
}

Rules:
- Be honest. If you don't know something, say so. Never fabricate biographical details.
- Be warm but not sycophantic. These are real humans, not heroes in a story.
- Use actual numbers when available. Don't round "3,247,891" to "millions".
- Keep each section to 2-3 sentences maximum. Brevity matters.
- Return ONLY valid JSON. No markdown fences, no explanation.`;

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse the JSON response
    const parsed = JSON.parse(text);

    return {
        sections: parsed.sections,
        title: parsed.title || metadata?.creatorName || `The ${packageName} Team`,
        subtitle: parsed.subtitle || metadata?.description || '',
        location: parsed.location || 'Open Source',
        generatedBy: 'claude-sonnet-4-20250514',
    };
}

/**
 * Full pipeline: gather context → generate wiki → return result.
 */
export async function generateWikiForPackage(
    packageName: string,
    existingMetadata?: {
        description?: string | null;
        creatorName?: string | null;
        repoUrl?: string | null;
        homepageUrl?: string | null;
        npmUrl?: string | null;
        license?: string | null;
        keywords?: string[] | null;
    }
): Promise<{
    wiki: GeneratedWiki;
    readmeExcerpt: string | null;
    weeklyDownloads: number | null;
}> {
    // Gather additional context in parallel
    const [readmeExcerpt, weeklyDownloads, npmInfo] = await Promise.all([
        fetchReadmeExcerpt(existingMetadata?.repoUrl),
        fetchNpmDownloads(packageName),
        existingMetadata?.description ? null : fetchNpmPackageInfo(packageName),
    ]);

    // Merge npm info if we didn't have metadata
    const metadata = {
        ...existingMetadata,
        description: existingMetadata?.description || npmInfo?.description,
        creatorName: existingMetadata?.creatorName || (npmInfo ? extractAuthorName(npmInfo.author) : undefined),
        repoUrl: existingMetadata?.repoUrl || (npmInfo ? extractRepoUrl(npmInfo.repository) : undefined),
        homepageUrl: existingMetadata?.homepageUrl || npmInfo?.homepage,
        npmUrl: existingMetadata?.npmUrl || `https://www.npmjs.com/package/${packageName}`,
        license: existingMetadata?.license || npmInfo?.license,
        keywords: existingMetadata?.keywords || npmInfo?.keywords,
        weeklyDownloads,
        readmeExcerpt,
    };

    const wiki = await generateWiki(packageName, metadata);

    return { wiki, readmeExcerpt, weeklyDownloads };
}
