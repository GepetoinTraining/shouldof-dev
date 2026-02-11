'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { IconBrandGithub } from '@tabler/icons-react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="site-header">
            <Link href="/" className="site-logo">
                <span className="logo-dot" />
                shouldof.dev
            </Link>
            <nav className="nav-links">
                <Link href="/wiki/markdown" className="nav-link">Wiki</Link>
                {session ? (
                    <>
                        <Link href="/connect" className="nav-link">
                            Connect
                        </Link>
                        <button
                            className="nav-link"
                            onClick={() => signOut()}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {session.user?.name || session.user?.githubUsername}
                        </button>
                    </>
                ) : (
                    <button
                        className="hero-cta"
                        onClick={() => signIn('github')}
                        style={{ padding: '8px 20px', fontSize: '13px' }}
                    >
                        <IconBrandGithub size={16} />
                        Sign in
                    </button>
                )}
            </nav>
        </header>
    );
}
