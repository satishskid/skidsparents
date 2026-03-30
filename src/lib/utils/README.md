# Analytics Utilities

This directory contains helper utilities for tracking events with Google Analytics 4 (G4).

## Files

- `analytics.ts` - Core tracking utilities with type-safe event tracking
- `analytics.test.ts` - Unit tests for the analytics utilities
- `analytics.example.ts` - Example usage patterns for common tracking scenarios

## Usage

### Basic Event Tracking

```typescript
import { trackEvent } from '@/lib/utils/analytics'

// Track a simple event
trackEvent('button_click', {
  button_name: 'sign_up',
  page: '/homepage'
})
```

### Page View Tracking

```typescript
trackEvent('page_view', {
  page_type: 'blog',
  page_path: '/blog/article-1',
  page_title: 'How to Track Your Child\'s Health'
})
```

### Sign-In Prompt Tracking

```typescript
trackEvent('sign_in_prompt_view', {
  prompt_type: 'chat',
  page: '/timeline',
  feature: 'dr_skids_chat'
})
```

### Authentication Tracking

```typescript
// Track sign-up
trackEvent('sign_up', {
  method: 'google',
  is_new_user: true
})

// Track login
trackEvent('login', {
  method: 'phone',
  is_new_user: false
})
```

### Upgrade Prompt Tracking

```typescript
trackEvent('upgrade_prompt_view', {
  prompt_type: 'usage_limit',
  current_tier: 'free',
  questions_remaining: 0
})
```

### Subscription Tracking

```typescript
// Track subscription flow initiation
trackEvent('begin_checkout', {
  tier: 'premium'
})

// Track subscription completion
trackEvent('purchase', {
  tier: 'premium',
  value: 9.99,
  currency: 'USD'
})
```

## Type Safety

The `trackEvent` function accepts a `TrackEventParams` object which ensures type safety for event parameters:

```typescript
interface TrackEventParams {
  [key: string]: string | number | boolean | undefined
}
```

## Error Handling

The tracking utilities handle errors gracefully:

- If `window.gtag` is not available (SSR or ad blockers), events are silently ignored
- If tracking throws an error, it's caught and logged to the console without breaking the application

## Testing

Run the unit tests with:

```bash
npx vitest run src/lib/utils/analytics.test.ts
```

## Requirements

This implementation satisfies **Requirement 10.1** from the public-onboarding-navigation spec:

> THE Navigation_System SHALL track blog views, discover page views, and community page views using G4 and Meta pixel

The utilities provide type-safe event tracking with proper parameter types and window.gtag type definitions.
