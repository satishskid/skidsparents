# BHASH WhatsApp API Reference

## API Endpoint

```
http://bhashsms.com/api/sendmsg.php
```

## Authentication

Credentials are stored in Cloudflare environment secrets:
- `BHASH_USER`: API username (e.g., 'Santaan_01')
- `BHASH_PASS`: API password
- `BHASH_SENDER`: Sender ID (e.g., 'BUZWAP')

## Request Format

**Method**: GET

**Parameters**:
- `user` (required): BHASH API username
- `pass` (required): BHASH API password
- `sender` (required): Sender ID (BUZWAP)
- `phone` (required): Recipient phone number (10 digits, no +91 prefix)
- `text` (required): Message content
- `priority` (required): Set to `wa` for WhatsApp
- `stype` (required): Set to `normal` for standard delivery

## Example Request

```
http://bhashsms.com/api/sendmsg.php?user=Santaan_01&pass=123456&sender=BUZWAP&phone=9742100448&text=santaan_dem&priority=wa&stype=normal
```

## Implementation Example

```typescript
// src/lib/distribution/whatsapp.ts

interface BHASHConfig {
  apiUrl: string
  user: string
  pass: string
  sender: string
}

interface WhatsAppMessage {
  to: string // 10-digit phone number (e.g., '9742100448')
  message: string
}

class BHASHService {
  private config: BHASHConfig

  constructor(env: any) {
    this.config = {
      apiUrl: 'http://bhashsms.com/api/sendmsg.php',
      user: env.BHASH_USER,
      pass: env.BHASH_PASS,
      sender: env.BHASH_SENDER
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<void> {
    // Validate phone number (should be 10 digits)
    const phone = this.normalizePhoneNumber(message.to)
    
    const params = new URLSearchParams({
      user: this.config.user,
      pass: this.config.pass,
      sender: this.config.sender,
      phone: phone,
      text: message.message,
      priority: 'wa',
      stype: 'normal'
    })

    const url = `${this.config.apiUrl}?${params.toString()}`
    
    try {
      const response = await fetch(url)
      const result = await response.text()
      
      // Check for success/failure in response
      if (!response.ok || result.includes('error')) {
        throw new Error(`BHASH API error: ${result}`)
      }
      
      return result
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      throw error
    }
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove +91 prefix if present
    let normalized = phone.replace(/^\+91/, '')
    
    // Remove any non-digit characters
    normalized = normalized.replace(/\D/g, '')
    
    // Ensure it's 10 digits
    if (normalized.length !== 10) {
      throw new Error(`Invalid phone number: ${phone}. Must be 10 digits.`)
    }
    
    return normalized
  }

  async sendDailyTip(tip: string, mediaUrl?: string): Promise<void> {
    // Get all subscribed parents from database
    const subscribers = await this.getSubscribers('daily_tip')
    
    for (const subscriber of subscribers) {
      await this.sendMessage({
        to: subscriber.phone,
        message: tip
      })
      
      // Add delay to avoid rate limiting (e.g., 1 second between messages)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  async sendPersonalizedContent(parentId: string, content: string): Promise<void> {
    // Get parent's phone number from database
    const parent = await this.getParentById(parentId)
    
    if (!parent.phone) {
      throw new Error(`Parent ${parentId} has no phone number`)
    }
    
    await this.sendMessage({
      to: parent.phone,
      message: content
    })
  }

  private async getSubscribers(type: string): Promise<any[]> {
    // Query whatsapp_subscriptions table
    // Return list of subscribers with phone numbers
  }

  private async getParentById(parentId: string): Promise<any> {
    // Query parents table
    // Return parent with phone number
  }
}

export { BHASHService }
```

## Phone Number Format

**Important**: BHASH API expects 10-digit phone numbers WITHOUT the +91 country code.

Examples:
- ✅ Correct: `9742100448`
- ❌ Incorrect: `+919742100448`
- ❌ Incorrect: `919742100448`

## Message Length Limits

- Maximum message length: Check with BHASH (typically 1000-1600 characters for WhatsApp)
- Recommended: Keep messages under 500 characters for better deliverability

## Rate Limiting

- Add delays between bulk messages (recommended: 1 second per message)
- Implement retry logic with exponential backoff for failures
- Monitor API response for rate limit errors

## Error Handling

Common error scenarios:
1. Invalid phone number format
2. API authentication failure
3. Rate limit exceeded
4. Network timeout
5. Invalid sender ID

Implement retry logic:
```typescript
async sendWithRetry(message: WhatsAppMessage, maxRetries = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.sendMessage(message)
      return // Success
    } catch (error) {
      if (attempt === maxRetries) {
        throw error // Final attempt failed
      }
      
      // Exponential backoff: 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

## Testing

Test the API with a single message before implementing bulk broadcasts:

```bash
curl "http://bhashsms.com/api/sendmsg.php?user=Santaan_01&pass=YOUR_PASSWORD&sender=BUZWAP&phone=YOUR_PHONE&text=Test%20message&priority=wa&stype=normal"
```

## Security Notes

1. **Never expose credentials in client-side code**
2. Store credentials in Cloudflare environment secrets
3. Only call BHASH API from server-side API routes
4. Validate and sanitize all phone numbers before sending
5. Log all API calls for debugging and audit purposes

## Environment Setup

Set credentials using wrangler:

```bash
# For local development (.dev.vars file)
BHASH_USER=Santaan_01
BHASH_PASS=your_password
BHASH_SENDER=BUZWAP

# For production (Cloudflare secrets)
wrangler pages secret put BHASH_USER
wrangler pages secret put BHASH_PASS
wrangler pages secret put BHASH_SENDER
```
