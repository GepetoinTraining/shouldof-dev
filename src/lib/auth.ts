import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'read:user repo',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.githubId = profile.id?.toString();
                token.githubUsername = profile.login;
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).githubId = token.githubId;
                (session.user as any).githubUsername = token.githubUsername;
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
});
