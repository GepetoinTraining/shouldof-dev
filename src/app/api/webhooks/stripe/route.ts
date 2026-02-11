import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordFunding } from '@/lib/funding';

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY not configured');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
    });
}

/**
 * Stripe Webhook Handler
 * 
 * Listens for checkout.session.completed events and records
 * the funding contribution in the database.
 * 
 * Setup in Stripe Dashboard:
 * - Endpoint URL: https://shouldof.dev/api/webhooks/stripe
 * - Events: checkout.session.completed
 */
export async function POST(request: Request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process our funding payments
        if (session.metadata?.type === 'api_funding') {
            const amountUsd = parseFloat(session.metadata.amount_usd || '0');
            const amountFromSession = (session.amount_total || 0) / 100;
            const finalAmount = amountUsd || amountFromSession;

            if (finalAmount > 0) {
                try {
                    await recordFunding({
                        amount: finalAmount,
                        currency: 'USD',
                        stripePaymentId: session.payment_intent as string,
                    });
                    console.log(`💜 Funding recorded: $${finalAmount} (${session.payment_intent})`);
                } catch (error) {
                    console.error('Failed to record funding:', error);
                    // Still return 200 to Stripe so it doesn't retry
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
