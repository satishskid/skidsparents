/**
 * Example usage of the G4 tracking helper utilities
 * 
 * This file demonstrates how to use the trackEvent function
 * to track various events throughout the application.
 */

import { trackEvent } from './analytics'

// Example 1: Track page views
export function trackPageView(pageType: string, pagePath: string, pageTitle: string) {
  trackEvent('page_view', {
    page_type: pageType,
    page_path: pagePath,
    page_title: pageTitle
  })
}

// Example 2: Track sign-in prompt views
export function trackSignInPromptView(promptType: string, page: string, feature: string) {
  trackEvent('sign_in_prompt_view', {
    prompt_type: promptType,
    page: page,
    feature: feature
  })
}

// Example 3: Track authentication events
export function trackSignUp(method: 'google' | 'phone') {
  trackEvent('sign_up', {
    method: method
  })
}

export function trackLogin(method: 'google' | 'phone', isNewUser: boolean) {
  trackEvent('login', {
    method: method,
    is_new_user: isNewUser
  })
}

// Example 4: Track upgrade prompt views
export function trackUpgradePromptView(
  promptType: 'usage_limit' | 'health_score' | 'multiple_children',
  currentTier: 'free' | 'premium'
) {
  trackEvent('upgrade_prompt_view', {
    prompt_type: promptType,
    current_tier: currentTier
  })
}

// Example 5: Track subscription events
export function trackSubscriptionStart(tier: string) {
  trackEvent('begin_checkout', {
    tier: tier
  })
}

export function trackSubscriptionComplete(tier: string, value: number, currency: string) {
  trackEvent('purchase', {
    tier: tier,
    value: value,
    currency: currency
  })
}

// Example 6: Track engagement depth
export function trackFeatureExplored(featureName: string) {
  trackEvent('feature_explored', {
    feature_name: featureName
  })
}
