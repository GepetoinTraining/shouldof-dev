import { NextResponse } from 'next/server';
import { recordFunding } from '@/lib/funding';
// import Stripe from 'stripe'; // Uncomment when Stripe keys are set

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount } = body;

        if (!amount || amount < 1) {
            return NextResponse.json({ error: 'Minimum $1' }, { status: 400 });
        }

        // TODO: Stripe checkout session creation
        // When STRIPE_SECRET_KEY is set, create a checkout session here
        // For now, record directly (for testing / manual entry)

        /*
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Fund the Storyteller',
                description: `$${amount} → ${Math.floor(amount / 0.03)} AI-generated wiki stories`,
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.NEXTAUTH_URL}/fund?success=true`,
          cancel_url: `${process.env.NEXTAUTH_URL}/fund`,
          metadata: { type: 'api_funding' },
        });
        return NextResponse.json({ sessionUrl: session.url });
        */

        // Placeholder: direct recording for development
        await recordFunding({ amount, currency: 'USD' });

        return NextResponse.json({
            success: true,
            message: `$${amount} added to the storyteller pool`,
            storiesUnlocked: Math.floor(amount / 0.03),
        });
    } catch (error) {
        console.error('Funding error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
