# Task 4.1 Implementation: Add G4 Script to BaseLayout

## Summary

Successfully configured Google Analytics 4 (G4) tracking script in BaseLayout to use environment variables for the measurement ID, ensuring the script loads asynchronously without blocking content.

## Changes Made

### 1. Updated BaseLayout.astro
**File**: `src/layouts/BaseLayout.astro`

**Changes**:
- Modified G4 script to use `PUBLIC_GA4_MEASUREMENT_ID` environment variable instead of hardcoded value
- Added conditional rendering to only load G4 script when measurement ID is provided
- Maintained async loading to prevent blocking content
- Preserved existing brand and center configuration parameters

**Before**:
```astro
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SLTRDFVCVN"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SLTRDFVCVN', {
    brand: 'skids',
    center: 'online',
    send_page_view: true
  });
</script>
```

**After**:
```astro
{import.meta.env.PUBLIC_GA4_MEASUREMENT_ID && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA4_MEASUREMENT_ID}`}></script>
    <script is:inline define:vars={{ ga4Id: import.meta.env.PUBLIC_GA4_MEASUREMENT_ID }}>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ga4Id, {
        brand: 'skids',
        center: 'online',
        send_page_view: true
      });
    </script>
  </>
)}
```

### 2. Created .env.example
**File**: `.env.example`

**Purpose**: Document required environment variables for the project

**Content**:
```env
# Google Analytics 4 Measurement ID
# Get this from your Google Analytics 4 property settings
# Format: G-XXXXXXXXXX
PUBLIC_GA4_MEASUREMENT_ID=G-SLTRDFVCVN

# Admin Key for admin pages
ADMIN_KEY=

# Firebase Cloud Messaging VAPID Key
PUBLIC_VAPID_KEY=
```

### 3. Created Test Suite
**File**: `src/__tests__/layouts/base-layout-analytics.test.ts`

**Test Coverage**:
- ✅ BaseLayout component file exists
- ✅ G4 script uses PUBLIC_GA4_MEASUREMENT_ID environment variable
- ✅ G4 script loads asynchronously
- ✅ G4 configured with brand and center parameters
- ✅ Automatic page view tracking enabled
- ✅ G4 script conditionally renders only when measurement ID is provided
- ✅ .env.example documents PUBLIC_GA4_MEASUREMENT_ID

**Test Results**: All 8 tests passed ✅

## Requirements Validation

### Requirement 10.1: Conversion Funnel Analytics
✅ **Satisfied**: G4 tracking script is properly configured in BaseLayout and will track page views with brand and center parameters.

### Task Acceptance Criteria
✅ **Add G4 tracking script to BaseLayout**: Script is present and configured
✅ **Configure G4 measurement ID from environment variables**: Uses `PUBLIC_GA4_MEASUREMENT_ID`
✅ **Ensure script loads asynchronously without blocking content**: `async` attribute present on script tag

## Usage Instructions

### For Development
1. Create a `.env` file in the project root (if not exists)
2. Add your G4 measurement ID:
   ```env
   PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. The G4 script will automatically load with your measurement ID

### For Production
Set the `PUBLIC_GA4_MEASUREMENT_ID` environment variable in your deployment platform (Cloudflare Pages, etc.)

### Optional: Disable G4 Tracking
If you want to disable G4 tracking (e.g., in development), simply don't set the `PUBLIC_GA4_MEASUREMENT_ID` environment variable. The script will not load.

## Technical Notes

- **Astro Environment Variables**: Variables prefixed with `PUBLIC_` are exposed to the client-side code
- **Conditional Rendering**: The G4 script only renders when the environment variable is set, preventing errors in environments without analytics
- **Async Loading**: The `async` attribute ensures the script doesn't block page rendering
- **Brand Compliance**: Maintains existing brand='skids' and center='online' parameters for analytics consistency

## Testing

Run the test suite:
```bash
npx vitest run src/__tests__/layouts/base-layout-analytics.test.ts
```

All tests pass successfully ✅
