'use client';

import { useState, useEffect } from 'react';

interface ThankYouMessage {
    id: number;
    authorName: string;
    message: string;
    createdAt: string;
}

interface ThankYouWallProps {
    packageSlug: string;
    refreshKey?: number; // increment to trigger refetch
}

export default function ThankYouWall({ packageSlug, refreshKey }: ThankYouWallProps) {
    const [messages, setMessages] = useState<ThankYouMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            try {
                const res = await fetch(`/api/thank-you?slug=${encodeURIComponent(packageSlug)}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch {
                // silent fail
            } finally {
                setLoading(false);
            }
        }
        fetchMessages();
    }, [packageSlug, refreshKey]);

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Loading messages...
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Be the first to say thank you. 💜
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    style={{
                        padding: '14px 18px',
                        background: 'var(--bg-surface)',
                        border: '1px solid rgba(124, 58, 237, 0.08)',
                        borderRadius: 10,
                    }}
                >
                    <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                        &ldquo;{msg.message}&rdquo;
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-violet-light)' }}>
                            — {msg.authorName}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
