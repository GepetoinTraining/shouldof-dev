'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconRefresh } from '@tabler/icons-react';

export default function AdminRegenButton({ slug }: { slug: string }) {
    const [regenerating, setRegenerating] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    async function handleRegenerate() {
        setRegenerating(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/regenerate-wiki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, force: true }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`✨ Regenerated! Cost: $${data.cost?.toFixed(4) || '?'}`);
                setTimeout(() => router.refresh(), 1500);
            } else {
                setMessage(data.error || 'Failed to regenerate');
            }
        } catch {
            setMessage('Network error');
        } finally {
            setRegenerating(false);
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: 8,
                    color: 'var(--accent-violet-light)',
                    fontSize: 13, fontWeight: 600,
                    cursor: regenerating ? 'wait' : 'pointer',
                    opacity: regenerating ? 0.6 : 1,
                }}
            >
                <IconRefresh size={14} style={regenerating ? { animation: 'spin 1s linear infinite' } : {}} />
                {regenerating ? 'Regenerating...' : '⟳ Regenerate Wiki'}
            </button>
            {message && (
                <span style={{
                    fontSize: 12,
                    color: message.startsWith('✨') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                }}>
                    {message}
                </span>
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
