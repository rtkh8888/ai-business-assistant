# implementation_plan.md

# AI Business Research & Outreach Assistant (Agentic Workflow)

## Project Goal

Build an AI-powered lead research application that accepts a business
website URL, extracts relevant information, performs rule-based and
LLM-assisted analysis, recommends a suitable service, generates
personalized outreach, scores the lead, and stores the results for
review.

**MVP Principles** - Human-in-the-loop (no automatic outreach) -
Single-agent workflow - One website at a time - Structured JSON
outputs - Modular architecture - Provider-agnostic LLM layer

------------------------------------------------------------------------

# Phase 0 -- Project Setup

## Tasks

-   [x] Create Next.js project
-   [x] Configure TypeScript
-   [x] Configure Supabase
-   [x] Configure environment variables
-   [x] Configure linting/formatting
-   [x] Create folder structure
-   [x] Add README

## Testing

-   [x] App runs locally
-   [ ] Environment variables load
-   [ ] Supabase connection succeeds

------------------------------------------------------------------------

# Phase 1 -- Database

## Tasks

-   [x] Design Leads table
-   [x] Create Analysis table (optional if normalized)
-   [x] Add timestamps
-   [x] Add status enum
-   [x] Seed sample data
-   [x] Repository/data access layer

Suggested Lead fields: - id - website_url - business_name - industry -
summary - weaknesses (JSON) - strengths (JSON) - recommended_service -
outreach_message - opportunity_score - status - created_at - updated_at

## Testing

-   [ ] Insert lead
-   [ ] Update lead
-   [ ] Read lead
-   [ ] Delete lead

------------------------------------------------------------------------

# Phase 2 -- UI Skeleton

## Tasks

-   [x] Landing page
-   [x] Website URL input
-   [x] Analyse button
-   [x] Results page layout
-   [x] Lead list page
-   [x] Loading states
-   [x] Error states

## Testing

-   [x] Navigation works
-   [ ] Invalid URL handled
-   [x] Loading indicator shown

------------------------------------------------------------------------

# Phase 3 -- Website Extraction

## Tasks

-   [ ] Fetch homepage
-   [ ] Parse HTML
-   [ ] Extract title
-   [ ] Extract headings
-   [ ] Extract body text
-   [ ] Extract buttons
-   [ ] Extract links
-   [ ] Remove navigation/footer/cookie noise
-   [ ] Return structured object

## Testing

-   [ ] Extract 10 different websites
-   [ ] Handles missing pages
-   [ ] Handles timeout
-   [ ] Clean text verified

------------------------------------------------------------------------

# Phase 4 -- Rule-based Analysis

## Tasks

-   [ ] Detect WhatsApp
-   [ ] Detect booking links/forms
-   [ ] Detect testimonials
-   [ ] Detect contact page
-   [ ] Detect pricing
-   [ ] Detect CTA buttons
-   [ ] Produce structured findings

## Testing

-   [ ] Rules validated against known sites
-   [ ] False positives reviewed

------------------------------------------------------------------------

# Phase 5 -- LLM Analysis Engine

## Tasks

-   [ ] Create provider abstraction
-   [ ] Build prompt template
-   [ ] Send extracted content
-   [ ] Require JSON output
-   [ ] Validate JSON schema
-   [ ] Retry invalid responses
-   [ ] Handle failures gracefully

Required JSON: - business_name - industry - target_customer -
business_summary - strengths - weaknesses - recommended_service -
outreach_message

## Testing

-   [ ] JSON validates
-   [ ] Hallucinations minimized
-   [ ] Missing data returns "Unknown"

------------------------------------------------------------------------

# Phase 6 -- Opportunity Scoring

## Tasks

-   [ ] Define scoring rules
-   [ ] Combine rule-based and AI insights
-   [ ] Generate score (0--100)
-   [ ] Generate score explanation

## Testing

-   [ ] Known examples score reasonably
-   [ ] Edge cases reviewed

------------------------------------------------------------------------

# Phase 7 -- Save Analysis

## Tasks

-   [ ] Persist analysis
-   [ ] Persist score
-   [ ] Persist outreach
-   [ ] Persist status
-   [ ] Duplicate detection by URL

## Testing

-   [ ] Saved data matches UI
-   [ ] Duplicate handling works

------------------------------------------------------------------------

# Phase 8 -- Results Dashboard

## Tasks

-   [ ] Business summary card
-   [ ] Weakness list
-   [ ] Recommended service
-   [ ] Opportunity score
-   [ ] Outreach editor
-   [ ] Save changes

## Testing

-   [ ] Editing works
-   [ ] Refresh persists changes

------------------------------------------------------------------------

# Phase 9 -- Lead Management

## Tasks

-   [ ] Lead table
-   [ ] Search
-   [ ] Filter by status
-   [ ] Filter by score
-   [ ] Sort
-   [ ] View lead details
-   [ ] Status updates

Statuses: - New - Reviewed - Ready - Contacted - Replied - Won - Lost

## Testing

-   [ ] Filters correct
-   [ ] Status updates persist

------------------------------------------------------------------------

# Phase 10 -- Reliability

## Tasks

-   [ ] Central logging
-   [ ] API error handling
-   [ ] Timeouts
-   [ ] Rate limiting
-   [ ] Retry logic
-   [ ] Input validation

## Testing

-   [ ] Simulate API failures
-   [ ] Simulate invalid URLs
-   [ ] Simulate malformed JSON

------------------------------------------------------------------------

# Phase 11 -- Polish

## Tasks

-   [ ] Responsive UI
-   [ ] Empty states
-   [ ] Better loading UX
-   [ ] Better error messages
-   [ ] Documentation
-   [ ] Screenshots
-   [ ] Resume-ready README

## Testing

-   [ ] Desktop
-   [ ] Tablet
-   [ ] Mobile
-   [ ] Lighthouse review

------------------------------------------------------------------------

# Backlog (Not MVP)

-   [ ] Bulk URL import
-   [ ] Screenshot analysis
-   [ ] Visual website audit
-   [ ] Multi-agent architecture
-   [ ] Gmail integration
-   [ ] n8n automation
-   [ ] CRM integrations
-   [ ] Competitor comparison
-   [ ] Multi-user authentication
-   [ ] SaaS billing
-   [ ] Analytics dashboard
-   [ ] Follow-up generation

------------------------------------------------------------------------

# Definition of Done

The project is complete when a user can:

-   [ ] Enter a website URL
-   [ ] Extract website information
-   [ ] Run rule-based analysis
-   [ ] Run LLM analysis
-   [ ] Receive structured business insights
-   [ ] Receive opportunity score
-   [ ] Receive recommended service
-   [ ] Receive personalized outreach draft
-   [ ] Save results
-   [ ] Review and manage leads from a dashboard


