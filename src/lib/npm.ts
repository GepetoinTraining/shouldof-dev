// npm registry API helpers
// Used to fetch package metadata (author, description, repo URL, etc.)

export interface NpmPackageInfo {
    name: string;
    description?: string;
    version?: string;
    author?: { name?: string; email?: string; url?: string } | string;
    repository?: { type?: string; url?: string } | string;
    homepage?: string;
    keywords?: string[];
    license?: string;
    time?: { created?: string; modified?: string };
}

export async function fetchNpmPackageInfo(packageName: string): Promise<NpmPackageInfo | null> {
    try {
        // Handle scoped packages (e.g., @mantine/core)
        const encodedName = encodeURIComponent(packageName).replace('%40', '@');
        const res = await fetch(`https://registry.npmjs.org/${encodedName}`, {
            headers: { Accept: 'application/json' },
        });

        if (!res.ok) return null;

        const data = await res.json();
        const latestVersion = data['dist-tags']?.latest;
        const latest = latestVersion ? data.versions?.[latestVersion] : null;

        return {
            name: data.name,
            description: data.description || latest?.description,
            version: latestVersion,
            author: data.author || latest?.author,
            repository: data.repository || latest?.repository,
            homepage: data.homepage || latest?.homepage,
            keywords: data.keywords || latest?.keywords,
            license: data.license || latest?.license,
            time: data.time,
        };
    } catch {
        return null;
    }
}

export function extractAuthorName(author: NpmPackageInfo['author']): string | undefined {
    if (!author) return undefined;
    if (typeof author === 'string') {
        // Parse "Name <email> (url)" format
        const match = author.match(/^([^<(]+)/);
        return match ? match[1].trim() : author;
    }
    return author.name;
}

export function extractRepoUrl(repository: NpmPackageInfo['repository']): string | undefined {
    if (!repository) return undefined;
    const url = typeof repository === 'string' ? repository : repository.url;
    if (!url) return undefined;
    // Normalize git+https://github.com/user/repo.git → https://github.com/user/repo
    return url
        .replace(/^git\+/, '')
        .replace(/^git:\/\//, 'https://')
        .replace(/\.git$/, '');
}

export function slugify(name: string): string {
    return name
        .replace(/^@/, '')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/gi, '-')
        .toLowerCase();
}
