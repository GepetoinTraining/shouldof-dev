'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';

interface SearchResult {
    id: number;
    name: string;
    slug: string;
    creatorName: string | null;
    description: string | null;
    userCount: number;
    hasWiki: boolean;
}

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setOpen(data.length > 0);
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'relative', maxWidth: 320, width: '100%' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                    borderRadius: 8,
                }}
            >
                <IconSearch size={14} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search packages..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        outline: 'none',
                    }}
                />
            </div>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 4,
                        background: 'var(--bg-deeper)',
                        border: '1px solid rgba(124, 58, 237, 0.15)',
                        borderRadius: 10,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        zIndex: 100,
                        overflow: 'hidden',
                    }}
                >
                    {results.map((r) => (
                        <div
                            key={r.id}
                            onClick={() => {
                                router.push(`/wiki/${r.slug}`);
                                setOpen(false);
                                setQuery('');
                            }}
                            style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(124, 58, 237, 0.05)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                                {r.name}
                                {r.hasWiki && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent-violet-light)' }}>📖</span>}
                            </div>
                            {r.creatorName && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    by {r.creatorName} · {r.userCount} users
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
