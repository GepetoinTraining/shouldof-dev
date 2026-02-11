'use client';

import Link from 'next/link';
import { useState } from 'react';

interface StoryCardProps {
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    accent: string;
}

export default function StoryCard({ slug, title, subtitle, excerpt, accent }: StoryCardProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={`/wiki/${slug}`}
            style={{
                display: 'block',
                padding: '28px 24px',
                background: 'var(--bg-surface)',
                border: `1px solid ${hovered ? accent : 'rgba(124, 58, 237, 0.1)'}`,
                borderRadius: 16,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered ? `0 8px 32px ${accent}20` : 'none',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: accent,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                }}
            >
                {subtitle}
            </div>
            <h3
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 12,
                    lineHeight: 1.3,
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                }}
            >
                {excerpt}
            </p>
            <div
                style={{
                    marginTop: 16,
                    fontSize: 13,
                    fontWeight: 500,
                    color: accent,
                }}
            >
                Read their story →
            </div>
        </Link>
    );
}
