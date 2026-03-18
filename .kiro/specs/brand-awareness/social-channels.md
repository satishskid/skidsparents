# SKIDS Social Media Channels

## Official Channels

### Facebook
- **URL**: https://www.facebook.com/skids.health
- **Handle**: @skids.health
- **Content Strategy**: Daily posts, weekly live sessions, parent testimonials
- **UTM Source**: `facebook`

### Instagram
- **URL**: https://www.instagram.com/skids_clinic/
- **Handle**: @skids_clinic
- **Content Strategy**: Daily posts + 3 stories, health tips, visual content
- **UTM Source**: `instagram`

### Twitter/X
- **URL**: https://x.com/SKIDS58283752
- **Handle**: @SKIDS58283752
- **Content Strategy**: Daily health tips, quick updates, engagement
- **UTM Source**: `twitter`

### LinkedIn
- **URL**: https://www.linkedin.com/company/skids/
- **Handle**: @skids
- **Content Strategy**: Professional content, partnerships, thought leadership
- **UTM Source**: `linkedin`

### Medium
- **URL**: https://medium.com/@skids_health
- **Handle**: @skids_health
- **Content Strategy**: Long-form articles, in-depth health guides
- **UTM Source**: `medium`

## Implementation Notes

### Social Share Buttons
All content pages (blog, organs, H.A.B.I.T.S.) should include share buttons for:
- WhatsApp (direct share)
- Instagram (copy link with prompt to share)
- Facebook (Facebook Share Dialog)
- Twitter (Twitter Web Intent)
- LinkedIn (LinkedIn Share)
- Medium (copy link with prompt to publish)
- Copy Link (clipboard)

### UTM Parameters
All shared links must include UTM parameters:
```
utm_source: [platform]
utm_medium: social
utm_campaign: skids_[campaign_name]
utm_content: [content_type]_[content_id]
```

Example:
```
https://parent.skids.clinic/blog/vision-screening?utm_source=instagram&utm_medium=social&utm_campaign=skids_awareness_q1&utm_content=blog_vision-screening
```

### Footer Social Links
Add social media icons in footer linking to all official channels:
```tsx
<footer>
  <div className="social-links">
    <a href="https://www.facebook.com/skids.health" target="_blank" rel="noopener">
      <FacebookIcon />
    </a>
    <a href="https://www.instagram.com/skids_clinic/" target="_blank" rel="noopener">
      <InstagramIcon />
    </a>
    <a href="https://x.com/SKIDS58283752" target="_blank" rel="noopener">
      <TwitterIcon />
    </a>
    <a href="https://www.linkedin.com/company/skids/" target="_blank" rel="noopener">
      <LinkedInIcon />
    </a>
    <a href="https://medium.com/@skids_health" target="_blank" rel="noopener">
      <MediumIcon />
    </a>
  </div>
</footer>
```

### Content Cross-Posting Strategy

**Daily Workflow**:
1. Publish blog post on parent.skids.clinic
2. Share to Instagram (visual + caption)
3. Share to Facebook (link + description)
4. Share to Twitter (short tip + link)
5. Share to LinkedIn (professional angle)
6. Republish long-form on Medium (weekly)

**Content Adaptation**:
- **Instagram**: Visual-first, 60-second tips, stories
- **Facebook**: Community engagement, longer posts, live sessions
- **Twitter**: Quick tips, threads, engagement
- **LinkedIn**: Professional insights, partnerships, thought leadership
- **Medium**: In-depth articles, research-backed content

### Analytics Tracking
Track social media performance:
- Clicks from each platform (UTM tracking)
- Engagement rate per platform
- Conversion rate from social traffic
- Most shared content types
- Best performing platforms

### Automation Opportunities
Consider using tools like:
- Buffer/Hootsuite for scheduling
- Zapier for cross-posting automation
- Canva for visual content creation
- Analytics dashboards for performance tracking
