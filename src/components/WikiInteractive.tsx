'use client';

import { useState } from 'react';
import { IconHeart } from '@tabler/icons-react';
import ThankYouForm from '@/components/ThankYouForm';
import ThankYouWall from '@/components/ThankYouWall';

interface WikiInteractiveProps {
    slug: string;
    noDonateButton?: boolean;
    donateAlternative?: string;
    claimed?: boolean;
    claimedBy?: string;
}

export default function WikiInteractive({
    slug,
    noDonateButton,
    donateAlternative,
    claimed,
    claimedBy,
}: WikiInteractiveProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <>
            {/* Donate / Thank You */}
            {noDonateButton ? (
                <section className="wiki-section" style={{ marginTop: 40 }}>
                    <div
                        style={{
                            padding: '20px 24px',
                            background: 'var(--bg-surface)',
                            borderRadius: 12,
                            border: '1px solid rgba(244, 63, 94, 0.15)',
                            fontStyle: 'italic',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            fontSize: 15,
                        }}
                    >
                        {donateAlternative}
                    </div>
                </section>
            ) : (
                <section className="wiki-section" style={{ marginTop: 40 }}>
                    <h2 className="wiki-section-title">
                        <IconHeart size={18} style={{ marginRight: 8, color: 'var(--accent-violet-light)' }} />
                        Say Thank You
                    </h2>
                    <ThankYouForm
                        packageSlug={slug}
                        onSubmitted={() => setRefreshKey((k) => k + 1)}
                    />
                </section>
            )}

            {/* Thank You Wall */}
            <section className="thank-you-wall" style={{ marginTop: 24 }}>
                <h2 className="wiki-section-title">Thank-You Wall</h2>
                <ThankYouWall packageSlug={slug} refreshKey={refreshKey} />
            </section>

            {/* Claimed badge */}
            {claimed && claimedBy && (
                <div
                    style={{
                        marginTop: 24,
                        padding: '10px 16px',
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--accent-emerald)',
                        textAlign: 'center',
                    }}
                >
                    ✅ Page claimed by @{claimedBy}
                </div>
            )}
        </>
    );
}
