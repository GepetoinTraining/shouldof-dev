/**
 * Retroactive Wiki Cleanup Script
 * 
 * Strips <cite> tags and other web search artifacts from existing
 * wiki articles stored in the database.
 * 
 * Usage: npx tsx scripts/cleanup-wikis.ts
 * 
 * Reads .env.local for TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually (no dotenv dependency needed)
function loadEnv() {
    try {
        const envPath = resolve(process.cwd(), '.env.local');
        const content = readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const key = trimmed.slice(0, eqIndex).trim();
            const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch {
        // .env.local not found — rely on existing env vars
    }
}

loadEnv();

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL) {
    console.error('❌ TURSO_DATABASE_URL not set');
    process.exit(1);
}

const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
});

function stripCitations(text: string): string {
    return text
        .replace(/<cite[^>]*>[\s\S]*?<\/cite>/g, '')
        .replace(/<cite[^>]*\/>/g, '')
        .trim();
}

function cleanBackstory(backstoryJson: string): { cleaned: string; changed: boolean } {
    try {
        const data = JSON.parse(backstoryJson);
        let changed = false;

        // Clean all section fields
        if (data.sections) {
            for (const key of Object.keys(data.sections)) {
                if (typeof data.sections[key] === 'string') {
                    const cleaned = stripCitations(data.sections[key]);
                    if (cleaned !== data.sections[key]) {
                        data.sections[key] = cleaned;
                        changed = true;
                    }
                }
            }
        }

        // Clean top-level text fields too
        for (const key of ['title', 'subtitle', 'location', 'who', 'the_moment', 'what_it_does', 'impact', 'connections']) {
            if (typeof data[key] === 'string') {
                const cleaned = stripCitations(data[key]);
                if (cleaned !== data[key]) {
                    data[key] = cleaned;
                    changed = true;
                }
            }
        }

        return { cleaned: JSON.stringify(data), changed };
    } catch {
        return { cleaned: backstoryJson, changed: false };
    }
}

async function main() {
    console.log('🧹 Wiki Cleanup — stripping <cite> tags from existing articles\n');

    // Fetch all packages with backstories
    const result = await client.execute(
        'SELECT id, name, slug, backstory_md FROM packages WHERE backstory_md IS NOT NULL'
    );

    console.log(`Found ${result.rows.length} wiki articles to check\n`);

    let cleaned = 0;
    let skipped = 0;

    for (const row of result.rows) {
        const id = row.id as number;
        const name = row.name as string;
        const backstoryMd = row.backstory_md as string;

        const { cleaned: cleanedJson, changed } = cleanBackstory(backstoryMd);

        if (changed) {
            await client.execute({
                sql: 'UPDATE packages SET backstory_md = ? WHERE id = ?',
                args: [cleanedJson, id],
            });
            console.log(`  ✅ ${name} — citations stripped`);
            cleaned++;
        } else {
            console.log(`  ⏭️  ${name} — already clean`);
            skipped++;
        }
    }

    console.log(`\n📊 Results: ${cleaned} cleaned, ${skipped} already clean`);
    console.log('Done!');
}

main().catch(console.error);
