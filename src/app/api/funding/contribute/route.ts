import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount < 1 || amount > 500) {
      return NextResponse.json({ error: 'Amount must be between $1 and $500' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured yet. Check back soon!' },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXTAUTH_URL || 'https://shouldof.dev';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Fund the Storyteller',
            description: `$${amount} → ~${Math.floor(amount / 0.03)} AI-generated wiki stories about open source creators`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/fund?success=true`,
      cancel_url: `${baseUrl}/fund?cancelled=true`,
      metadata: {
        type: 'api_funding',
        amount_usd: String(amount),
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
