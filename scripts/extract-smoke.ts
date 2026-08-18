import { extractWebsite } from "../src/lib/extract";

type FetchResponseLike = {
  text: () => Promise<string>;
  ok: boolean;
  status: number;
  url: string;
};

function mockFetch(html: string, url: string, status = 200) {
  return async () =>
    ({
      text: async () => html,
      ok: status >= 200 && status < 300,
      status,
      url,
    }) satisfies FetchResponseLike;
}

async function run() {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = mockFetch(
      `<!doctype html>
      <html>
        <head>
          <title>Acme Studio</title>
          <meta name="description" content="Acme Studio builds conversion-focused websites.">
          <link rel="canonical" href="https://acmestudio.example/">
        </head>
        <body>
          <nav>Navigation</nav>
          <h1>Acme Studio</h1>
          <h2>We design high-converting websites</h2>
          <p>Our clients love the testimonials and transparent pricing.</p>
          <a href="/contact">Contact us</a>
          <a href="https://wa.me/123456789">WhatsApp</a>
          <a href="/book">Book a call</a>
          <button>Request Quote</button>
          <form action="/contact" method="post">
            <input name="email" />
          </form>
          <footer>Footer</footer>
        </body>
      </html>`,
      "https://acmestudio.example/",
    ) as unknown as typeof fetch;

    const rich = await extractWebsite("https://acmestudio.example/");
    if (rich.title !== "Acme Studio") throw new Error("Rich title extraction failed");
    if (!rich.detected_signals.has_contact_page) throw new Error("Contact signal missing");
    if (!rich.detected_signals.has_booking_link) throw new Error("Booking signal missing");
    if (!rich.detected_signals.has_testimonials) throw new Error("Testimonials signal missing");
    if (!rich.detected_signals.has_pricing) throw new Error("Pricing signal missing");
    if (!rich.detected_signals.has_whatsapp) throw new Error("WhatsApp signal missing");
    if (rich.headings.length < 2) throw new Error("Heading extraction failed");
    if (rich.forms.length !== 1) throw new Error("Form extraction failed");

    globalThis.fetch = mockFetch(
      `<!doctype html>
      <html>
        <head>
          <title>Loading...</title>
        </head>
        <body>
          <div id="__next"></div>
        </body>
      </html>`,
      "https://spa.example/",
    ) as unknown as typeof fetch;

    const sparse = await extractWebsite("https://spa.example/", {
      browserFallbackRenderer: async () =>
        `<!doctype html>
        <html>
          <head>
            <title>Rendered SPA</title>
            <meta name="description" content="Rendered content.">
          </head>
          <body>
            <h1>Rendered SPA</h1>
            <p>Book a demo now. We help service businesses turn more visitors into booked calls.</p>
            <a href="/contact">Contact</a>
            <a href="/pricing">Pricing</a>
            <button>Request a Quote</button>
          </body>
        </html>`,
    });

    if (sparse.title !== "Rendered SPA") throw new Error("Fallback title extraction failed");
    if (sparse.needs_browser_rendering) throw new Error("Browser fallback flag not cleared");
    if (!sparse.detected_signals.has_cta) throw new Error("Fallback CTA signal missing");
    if (!sparse.detected_signals.has_pricing) throw new Error("Fallback pricing signal missing");

    globalThis.fetch = mockFetch(
      `<!doctype html>
      <html>
        <head>
          <title>Not Found</title>
        </head>
        <body>
          <h1>Page not found</h1>
        </body>
      </html>`,
      "https://missing.example/",
      404,
    ) as unknown as typeof fetch;

    const missing = await extractWebsite("https://missing.example/");
    if (missing.final_url !== "https://missing.example/") throw new Error("Missing page final URL mismatch");
    if (missing.extraction_quality !== "partial") throw new Error("Missing page quality mismatch");
    if (missing.title !== "Not Found") throw new Error("Missing page title should still be parsed");

    globalThis.fetch = (async () => {
      throw Object.assign(new Error("The operation was aborted."), { name: "AbortError" });
    }) as unknown as typeof fetch;

    const timedOut = await extractWebsite("https://timeout.example/", {
      timeoutMs: 1,
    });
    if (timedOut.title !== "Unknown") throw new Error("Timeout should return empty result");
    if (!timedOut.fallback_reason) throw new Error("Timeout fallback reason missing");
    if (timedOut.final_url !== "https://timeout.example/") throw new Error("Timeout final URL mismatch");

    const fixtures = [
      {
        url: "https://site-one.example/",
        title: "Studio One",
        html: "<html><head><title>Studio One</title></head><body><h1>Studio One</h1><p>Creative agency.</p><a href='/contact'>Contact</a></body></html>",
      },
      {
        url: "https://site-two.example/",
        title: "Clinic Two",
        html: "<html><head><title>Clinic Two</title></head><body><h1>Clinic Two</h1><h2>Trusted care</h2><p>Book appointments online.</p></body></html>",
      },
      {
        url: "https://site-three.example/",
        title: "Cafe Three",
        html: "<html><head><title>Cafe Three</title></head><body><main><p>Fresh coffee daily.</p><button>Order Now</button></main></body></html>",
      },
      {
        url: "https://site-four.example/",
        title: "Law Four",
        html: "<html><head><title>Law Four</title></head><body><h1>Law Four</h1><a href='/pricing'>Pricing</a><a href='/reviews'>Reviews</a></body></html>",
      },
      {
        url: "https://site-five.example/",
        title: "Gym Five",
        html: "<html><head><title>Gym Five</title></head><body><h1>Gym Five</h1><p>Starting at $49 per month.</p></body></html>",
      },
      {
        url: "https://site-six.example/",
        title: "Spa Six",
        html: "<html><head><title>Spa Six</title></head><body><h1>Spa Six</h1><p>What our clients say.</p></body></html>",
      },
      {
        url: "https://site-seven.example/",
        title: "Builder Seven",
        html: "<html><head><title>Builder Seven</title></head><body><h1>Builder Seven</h1><a href='https://wa.me/123'>Chat on WhatsApp</a></body></html>",
      },
      {
        url: "https://site-eight.example/",
        title: "Retail Eight",
        html: "<html><head><title>Retail Eight</title></head><body><h1>Retail Eight</h1><form action='/lead' method='post'><input name='email'/></form></body></html>",
      },
      {
        url: "https://site-nine.example/",
        title: "Agency Nine",
        html: "<html><head><title>Agency Nine</title></head><body><h1>Agency Nine</h1><a href='/book'>Schedule a call</a></body></html>",
      },
      {
        url: "https://site-ten.example/",
        title: "School Ten",
        html: "<html><head><title>School Ten</title></head><body><h1>School Ten</h1><p>Contact us today.</p></body></html>",
      },
    ];

    for (const fixture of fixtures) {
      globalThis.fetch = mockFetch(fixture.html, fixture.url) as unknown as typeof fetch;
      const extracted = await extractWebsite(fixture.url);
      if (extracted.title !== fixture.title) throw new Error(`Fixture title mismatch for ${fixture.url}`);
      if (!extracted.body_text) throw new Error(`Fixture body text missing for ${fixture.url}`);
    }

    console.log("EXTRACTION_SMOKE_OK");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

run().catch((error) => {
  console.error(`EXTRACTION_SMOKE_FAIL:${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
