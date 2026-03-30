/**
 * Client-side error logging utility
 * Logs errors for debugging without exposing technical details to users.
 * Sends sanitized error events to analytics (G4) via window.skidsTrack or window.gtag.
 *
 * Requirement 17.5: Log client-side errors for debugging without exposing technical details to users
 */

/**
 * Extracts a safe, sanitized message from an unknown error value.
 * Never includes stack traces or internal details.
 */
function getSafeMessage(error: unknown): string {
  if (error instanceof Error) {
    // Use the message only — never the stack trace
    return error.message || 'Unknown error'
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

/**
 * Log a client-side error for debugging.
 *
 * - In development: logs to console.error
 * - Always: sends a `client_error` custom event to G4 via window.skidsTrack (preferred) or window.gtag
 * - Never throws — errors in the logger itself are silently swallowed
 *
 * @param error - The error to log (any type)
 * @param context - Optional context string describing where the error occurred
 */
export function logError(error: unknown, context?: string): void {
  try {
    const safeMessage = getSafeMessage(error)

    // Log to console in development only
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error('[error-logger]', context ? `[${context}]` : '', error)
    }

    // Send to analytics — never expose stack traces
    if (typeof window === 'undefined') return

    const eventParams: Record<string, string> = {
      error_message: safeMessage,
      ...(context ? { error_context: context } : {}),
    }

    if (typeof (window as any).skidsTrack === 'function') {
      ;(window as any).skidsTrack('client_error', eventParams)
    } else if (typeof window.gtag === 'function') {
      window.gtag('event', 'client_error', eventParams)
    }
  } catch {
    // Never throw from the error logger
  }
}
