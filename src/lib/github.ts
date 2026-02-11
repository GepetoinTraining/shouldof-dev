// GitHub API helpers
// Used to fetch user repos and read package.json contents

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    updated_at: string;
    private: boolean;
}

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30&type=owner', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
}

export interface PackageJson {
    name?: string;
    description?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}

export async function fetchPackageJson(
    accessToken: string,
    repoFullName: string,
): Promise<PackageJson | null> {
    const res = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/package.json`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        },
    );

    if (!res.ok) return null;

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
}
