# shouldof.dev — Brand Guide

## The Mark

A person (green dot) standing at the apex of a shoulder (purple arc), connected by thin lines to dependency nodes along the arc. It reads as:
- Standing on the shoulders of giants
- A human at the center of a dependency graph
- An upward arc of support — the open source community lifting someone up

The green dot matches the Node Zero center node on the live graph. The purple matches the package nodes. The brand IS the product.

## Colors

```css
:root {
  /* Primary */
  --shoulder-purple: #a78bfa;       /* Dependency nodes, links, accents */
  --shoulder-purple-deep: #6d28d9;  /* Hover states, strong accents */
  
  /* Accent */
  --shoulder-green: #4ade80;        /* The person — CTAs, success, active states */
  
  /* Background */
  --shoulder-bg: #0f0a1a;           /* Deep dark — the space behind the graph */
  --shoulder-surface: #1a1225;      /* Cards, elevated surfaces */
  --shoulder-surface-hover: #241a33;
  
  /* Text */
  --shoulder-text: #e2e0e8;         /* Primary text */
  --shoulder-text-muted: #9890a8;   /* Secondary text */
  --shoulder-text-dim: #6b6280;     /* Tertiary, labels */
  
  /* Semantic */
  --shoulder-warmth: linear-gradient(135deg, #4ade80, #a78bfa);  /* The human-to-graph connection */
}
```

## Typography

**Headings**: Use the same font family already on the site. Keep it clean and legible.
**Body**: System font stack or whatever Mantine provides — this isn't a fashion brand, it's a gratitude engine. Readability > personality.
**The hero text** "Every npm install is a person." should be the boldest, largest element on any page.

## Voice

- Direct. Not corporate.
- Warm. Not sentimental.
- Names matter. Always use real names, real places, real stories.
- Never say "open source community" when you can say "Andrii in Ukraine" or "Glauber in Brazil"
- The tone is: "Here's a person. Here's what they did. Here's a button to say thank you."

## Favicon Files

```
favicon.svg          — Vector source (scalable)
favicon.ico          — Classic favicon (16/32/48)
favicon-16x16.png    — Small tab icon
favicon-32x32.png    — Standard tab icon  
favicon-192x192.png  — Android home screen
favicon-512x512.png  — PWA / large displays
apple-touch-icon.png — iOS home screen (180x180)
```

### HTML Head Tags
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
```

### Web Manifest (for PWA)
```json
{
  "name": "shouldof.dev — The Gratitude Graph",
  "short_name": "shouldof.dev",
  "icons": [
    { "src": "/favicon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0f0a1a",
  "background_color": "#0f0a1a",
  "display": "standalone"
}
```

## Social / OG Image Concept

For X/Twitter cards and OpenGraph:
- Dark background (#0f0a1a)
- The graph visualization as hero (screenshot or render)
- "Every npm install is a person." in large text
- shouldof.dev in bottom corner
- 1200x630px

## What The Brand Is NOT

- Not flashy. Not startup-y. Not "disrupting" anything.
- No gradients-on-white. No rounded-everything. No AI slop.
- This is a hall of honor. The brand should feel like entering a quiet, well-lit room where names are written on walls.
