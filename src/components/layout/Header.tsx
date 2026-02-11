'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { IconBrandGithub } from '@tabler/icons-react';
import SearchBar from '@/components/SearchBar';

export default function Header() {
    const { data: session } = useSession();
    const user = session?.user as any;

    return (
        <header className="site-header">
            <Link href="/" className="site-logo">
                <img src="/favicon.svg" alt="" width={20} height={20} style={{ display: 'block' }} />
                shouldof.dev
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <SearchBar />
                <nav className="nav-links" style={{ margin: 0 }}>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/fund" className="nav-link">Fund</Link>
                    {session ? (
                        <>
                            <Link href="/connect" className="nav-link">Connect</Link>
                            <Link
                                href="/profile"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '4px 12px 4px 4px',
                                    background: 'rgba(124, 58, 237, 0.08)',
                                    border: '1px solid rgba(124, 58, 237, 0.15)',
                                    borderRadius: 20,
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {user?.image ? (
                                    <img
                                        src={user.image}
                                        alt=""
                                        width={24}
                                        height={24}
                                        style={{ borderRadius: '50%' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 24, height: 24,
                                        borderRadius: '50%',
                                        background: 'var(--accent-violet)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 700, color: 'white',
                                    }}>
                                        {(user?.name || user?.githubUsername || '?')[0].toUpperCase()}
                                    </div>
                                )}
                                {user?.githubUsername || user?.name || 'Profile'}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/connect" className="nav-link">Connect</Link>
                            <button
                                onClick={() => signIn('github')}
                                className="nav-link"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <IconBrandGithub size={16} />
                                Sign in
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
