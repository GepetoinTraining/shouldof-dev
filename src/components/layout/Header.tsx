'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { IconBrandGithub } from '@tabler/icons-react';
import SearchBar from '@/components/SearchBar';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="site-header">
            <Link href="/" className="site-logo">
                <span className="logo-dot" />
                shouldof.dev
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <SearchBar />
                <nav className="nav-links" style={{ margin: 0 }}>
                    <Link href="/fund" className="nav-link">Fund</Link>
                    <Link href="/connect" className="nav-link">Connect</Link>
                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="nav-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                        >
                            Sign out
                        </button>
                    ) : (
                        <button
                            onClick={() => signIn('github')}
                            className="nav-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <IconBrandGithub size={16} />
                            Sign in
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
