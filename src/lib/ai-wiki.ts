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
    tokensIn: number;
    tokensOut: number;
    costUsd: number;     // estimated cost based on claude-sonnet-4-20250514 pricing
}

/**
 * Fetch README excerpt from a GitHub repo — prioritizes human-relevant sections.
 */
export async function fetchReadmeExcerpt(repoUrl: string | null | undefined): Promise<string | null> {
    if (!repoUrl) return null;

    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) return null;

    const ownerRepo = match[1].replace(/\.git$/, '');

    for (const filename of ['README.md', 'readme.md', 'Readme.md']) {
        try {
            const res = await fetch(
                `https://raw.githubusercontent.com/${ownerRepo}/HEAD/${filename}`,
                { signal: AbortSignal.timeout(5000) }
            );
            if (res.ok) {
                const text = await res.text();
                const fullText = text.slice(0, 8000);

                // Extract human-relevant sections first
                const humanPatterns = /(?:^|\n)##?\s*(?:Why|Motivation|Background|Story|About|History|Origin|Philosophy|Vision|Mission|Credits|Acknowledgements|Authors?)[\s\S]*?(?=\n##?\s|$)/gi;
                const humanSections = fullText.match(humanPatterns);

                if (humanSections && humanSections.join('').length > 100) {
                    // Found substantial human sections — send those + first 1000 chars for context
                    return fullText.slice(0, 1000) + '\n\n---HUMAN SECTIONS---\n\n' + humanSections.join('\n\n').slice(0, 3000);
                }

                // No human sections found — send first 3000 chars
                return fullText.slice(0, 3000);
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
 * Generate a wiki page for a package using Claude with web search.
 * The prompt is person-first: find the human, tell their story.
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

    const prompt = `You are a researcher for shouldof.dev — a platform that makes the humans behind open source visible. Every npm install is a person. You have web search available — USE IT.

Your job: find the PERSON behind "${packageName}" and tell their story.

RESEARCH STEPS (do these in order):
1. Search for the creator's name + "interview" OR "blog" OR "conference talk" OR "podcast"
2. Search for "${packageName} origin story" OR "why I built ${packageName}"
3. Search for the creator's location, background, what they were doing when they built this
4. If the creator has a Twitter/X profile, search for it — bios reveal a lot

Here is what we already know (use this as starting context, not as your only source):
${context || 'Only the package name.'}

WRITING INSTRUCTIONS:

Write about the PERSON first, the package second. Specific human details matter:
- "Built during the pandemic while learning TypeScript" > "created to solve validation"
- "No VCs, no vacations, funded from savings" > "bootstrapped approach to development"
- "Ukrainian flag in his Twitter handle, building through a war" > "dedicated open source maintainer"
- "Lost a Visio file in 2014" > "saw a gap in diagramming tools"

If you find a direct quote from the creator, USE IT. Their words > your summary.

Include the SILENCE — the gap between impact and recognition:
- "[X] weekly downloads but only [Y] Twitter followers"
- "[X] GitHub stars but [Y] Medium followers"
- "Every AI model trained on his syntax. Collective response: silence."
The contrast IS the story. It's why this platform exists.

If you genuinely cannot find personal details after searching, say so HONESTLY:
"We couldn't find Colin's story yet — if you know him, help us write it"
NOT generic filler like "his approach to API design reveals someone who thinks deeply"

Return ONLY valid JSON (no markdown fences, no explanation):

{
  "title": "Creator's real name (never 'The X Team' if a real person exists)",
  "subtitle": "One poetic line. Specific > generic. 'Diagrams from text, like Markdown for visuals' > 'A powerful diagramming solution'",
  "location": "City, Country if found. 'Open Source' ONLY as genuine last resort",
  "sections": {
    "who": "The person. Where they're from, what they were doing, what shaped them. Real details from your research. 2-3 sentences.",
    "the_moment": "WHY this exists. The frustration, the accident, the side project that escaped. Not a feature description. 2-3 sentences.",
    "what_it_does": "What it actually does, explained to a human who doesn't code. 2-3 sentences.",
    "impact": "Real numbers (use exact counts, don't round) + the recognition gap. 2-3 sentences.",
    "connections": "What depends on this. What breaks without it. The invisible web. 1-2 sentences."
  }
}`;

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools: [
            {
                type: "web_search_20250305" as any,
                name: "web_search",
                max_uses: 5,
            } as any,
        ],
        messages: [{ role: 'user', content: prompt }],
    });

    // With web search, response contains multiple content blocks (text + tool_use + tool_result).
    // Extract all text blocks and concatenate.
    const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('');

    // Track token usage
    const tokensIn = response.usage?.input_tokens || 0;
    const tokensOut = response.usage?.output_tokens || 0;
    // Sonnet pricing: $3/M input, $15/M output + web search overhead
    const costUsd = (tokensIn * 3 / 1_000_000) + (tokensOut * 15 / 1_000_000);

    // Parse the JSON response — handle potential markdown fences
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const parsed = JSON.parse(jsonStr);

    return {
        sections: parsed.sections,
        title: parsed.title || metadata?.creatorName || `The ${packageName} Team`,
        subtitle: parsed.subtitle || metadata?.description || '',
        location: parsed.location || 'Open Source',
        generatedBy: 'claude-sonnet-4-20250514+web-search',
        tokensIn,
        tokensOut,
        costUsd,
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
