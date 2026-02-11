import { auth } from '@/lib/auth';

/**
 * Check if the current session user is an admin (Pedro).
 * Compares session's GitHub ID against the ADMIN_GITHUB_ID env var.
 */
export async function isAdmin(): Promise<boolean> {
    const session = await auth();
    if (!session?.user) return false;

    const githubId = (session.user as any).githubId;
    return String(githubId) === process.env.ADMIN_GITHUB_ID;
}
