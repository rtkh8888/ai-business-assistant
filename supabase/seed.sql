insert into public.leads (
  original_url,
  normalized_url,
  canonical_url,
  website_host,
  business_name,
  industry,
  target_customer,
  business_summary,
  strengths,
  weaknesses,
  recommended_service_key,
  recommended_service_label,
  recommended_service_reason,
  outreach_message,
  opportunity_score,
  score_explanation,
  status
)
values (
  'https://example.com',
  'https://example.com',
  'https://example.com',
  'example.com',
  'Example Business',
  'Unknown',
  'Unknown',
  'Sample lead record for local development.',
  '["Clear call to action"]'::jsonb,
  '["No pricing visible"]'::jsonb,
  'website_conversion_audit',
  'Website Conversion Audit',
  'The site shows clear demand but could improve conversion clarity.',
  'Hi, I took a quick look at your site and noticed a few opportunities to make the next step clearer for visitors. A few conversion improvements could help turn more of your current traffic into inquiries.',
  62,
  'Sample seeded record for local development.',
  'new'
)
on conflict (normalized_url) do nothing;
