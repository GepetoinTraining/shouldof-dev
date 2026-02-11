import { db } from '@/db';
import { apiFunding, apiUsageLog } from '@/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Get the current API pool balance.
 * Balance = total funding - total usage cost
 */
export async function getPoolBalance(): Promise<number> {
    const [fundingResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${apiFunding.amount}), 0)` })
        .from(apiFunding);

    const [usageResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${apiUsageLog.costUsd}), 0)` })
        .from(apiUsageLog);

    return (fundingResult?.total || 0) - (usageResult?.total || 0);
}

/**
 * Get funding stats for the transparency widget.
 */
export async function getFundingStats() {
    const balance = await getPoolBalance();

    const [storiesResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(apiUsageLog);

    const [costResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${apiUsageLog.costUsd}), 0)` })
        .from(apiUsageLog);

    const [fundingTotal] = await db
        .select({ total: sql<number>`COALESCE(SUM(${apiFunding.amount}), 0)` })
        .from(apiFunding);

    const stories = storiesResult?.count || 0;
    const totalCost = costResult?.total || 0;
    const avgCost = stories > 0 ? totalCost / stories : 0.03; // estimate ~$0.03

    return {
        balance: Math.max(0, balance),
        storiesGenerated: stories,
        avgCostPerStory: avgCost,
        totalFunded: fundingTotal?.total || 0,
        totalSpent: totalCost,
        storiesPerDollar: avgCost > 0 ? Math.floor(1 / avgCost) : 33,
    };
}

/**
 * Check if the pool has enough balance to generate a wiki.
 * Returns true if balance > $0.10 (minimum threshold).
 */
export async function canGenerate(): Promise<boolean> {
    const balance = await getPoolBalance();
    return balance > 0.10;
}

/**
 * Log an API usage event.
 */
export async function logUsage(data: {
    packageName: string;
    packageSlug: string;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    model?: string;
}) {
    await db.insert(apiUsageLog).values({
        wikiPackageName: data.packageName,
        wikiPackageSlug: data.packageSlug,
        tokensIn: data.tokensIn,
        tokensOut: data.tokensOut,
        costUsd: data.costUsd,
        model: data.model || 'claude-sonnet-4-20250514',
    });
}

/**
 * Record a community funding contribution.
 */
export async function recordFunding(data: {
    userId?: number;
    amount: number;
    currency?: string;
    stripePaymentId?: string;
}) {
    await db.insert(apiFunding).values({
        userId: data.userId,
        amount: data.amount,
        currency: data.currency || 'USD',
        stripePaymentId: data.stripePaymentId,
    });
}
