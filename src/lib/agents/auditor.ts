import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { AgentResult } from "@/types";

interface AuditorInput {
  leadId: string;
  websiteUrl: string;
}

interface AuditorOutput {
  pagespeed: {
    mobileScore: number;
    desktopScore: number;
    metrics: {
      fcp: string | null;
      lcp: string | null;
      tbt: string | null;
      cls: string | null;
      si: string | null;
    };
  };
  seo: {
    score: number;
    hasMetaDescription: boolean;
    hasOgTags: boolean;
    hasSitemap: boolean;
    hasRobotsTxt: boolean;
    hasSsl: boolean;
    mobileFriendly: boolean;
  };
  ux: {
    score: number;
    hasCtaAboveFold: boolean;
    hasTestimonials: boolean;
    hasContactForm: boolean;
    hasOnlineBooking: boolean;
    hasWhatsApp: boolean;
    responsiveDesign: boolean;
  };
  content: {
    score: number;
    pageTitle: string;
    metaDescription: string | null;
    headings: { level: number; text: string }[];
    imageCount: number;
    imagesWithoutAlt: number;
  };
  conversion: {
    score: number;
    hasPhoneNumber: boolean;
    hasEmailVisible: boolean;
    hasMapEmbed: boolean;
  };
  aiSummary: string;
  aiRecommendations: {
    category: string;
    issue: string;
    impact: "high" | "medium" | "low";
    fix: string;
  }[];
}

async function getPageSpeedData(url: string) {
  const strategies = ["mobile", "desktop"] as const;
  const results: Record<string, unknown> = {};

  for (const strategy of strategies) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices`
      );

      if (response.ok) {
        const data = await response.json();
        results[strategy] = {
          score: Math.round(
            (data.lighthouseResult?.categories?.performance?.score || 0) * 100
          ),
          seo: Math.round(
            (data.lighthouseResult?.categories?.seo?.score || 0) * 100
          ),
          metrics: {
            fcp: data.lighthouseResult?.audits?.["first-contentful-paint"]
              ?.displayValue,
            lcp: data.lighthouseResult?.audits?.["largest-contentful-paint"]
              ?.displayValue,
            tbt: data.lighthouseResult?.audits?.["total-blocking-time"]
              ?.displayValue,
            cls: data.lighthouseResult?.audits?.["cumulative-layout-shift"]
              ?.displayValue,
            si: data.lighthouseResult?.audits?.["speed-index"]?.displayValue,
          },
        };
      }
    } catch {
      // PageSpeed request failed
    }
  }

  return results;
}

async function analyzeHTML(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ValenciaStudioBot/1.0)" },
    signal: AbortSignal.timeout(15000),
  });

  const html = await response.text();

  const metaDescMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  const ogTitle = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i.test(html);
  const ogDesc = /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i.test(html);
  const ogImage = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.test(html);

  const headingMatches = html.match(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi) || [];
  const headings = headingMatches.map((h) => {
    const levelMatch = h.match(/<h([1-6])/);
    const textMatch = h.match(/>([^<]+)</);
    return {
      level: levelMatch ? parseInt(levelMatch[1]) : 1,
      text: textMatch ? textMatch[1].trim() : "",
    };
  });

  const imageCount = (html.match(/<img[\s>]/gi) || []).length;
  const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;

  return {
    title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "",
    metaDescription: metaDescMatch?.[1] || null,
    hasOgTags: ogTitle && ogDesc && ogImage,
    headings,
    imageCount,
    imagesWithoutAlt,
    hasContactForm: /<form[\s\S]*?(contact|contacto)/i.test(html),
    hasWhatsApp: /wa\.me|whatsapp|api\.whatsapp/i.test(html),
    hasOnlineBooking: /book|reservar|cita|appointment/i.test(html),
    hasPhone: /href=["']tel:/i.test(html),
    hasEmail: /href=["']mailto:/i.test(html),
    hasMap: /iframe[^>]*src=["'][^"']*maps/i.test(html),
    hasCtaAboveFold: /class=["'][^"']*(cta|btn|button)[^"']*["']/i.test(html),
    hasTestimonials:
      /class=["'][^"']*(testimonial|review|opinion)[^"']*["']/i.test(html),
  };
}

export async function runAuditor(
  input: AuditorInput
): Promise<AgentResult<AuditorOutput>> {
  const startTime = Date.now();

  try {
    const [pagespeedData, htmlAnalysis] = await Promise.all([
      getPageSpeedData(input.websiteUrl),
      analyzeHTML(input.websiteUrl),
    ]);

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        seoScore: z.number().min(0).max(100),
        uxScore: z.number().min(0).max(100),
        contentScore: z.number().min(0).max(100),
        conversionScore: z.number().min(0).max(100),
        hasSitemap: z.boolean(),
        hasRobotsTxt: z.boolean(),
        hasSsl: z.boolean(),
        mobileFriendly: z.boolean(),
        responsiveDesign: z.boolean(),
        aiSummary: z.string(),
        aiRecommendations: z.array(
          z.object({
            category: z.string(),
            issue: z.string(),
            impact: z.enum(["high", "medium", "low"]),
            fix: z.string(),
          })
        ),
      }),
      prompt: `Analyze this dental clinic website and provide scores and recommendations.

PageSpeed Data:
${JSON.stringify(pagespeedData, null, 2)}

HTML Analysis:
${JSON.stringify(htmlAnalysis, null, 2)}

Provide:
1. SEO score (0-100) based on meta tags, structure, SSL, mobile-friendly
2. UX score (0-100) based on layout, CTAs, testimonials, navigation
3. Content score (0-100) based on headings, images, text quality
4. Conversion score (0-100) based on contact options, booking, CTAs
5. AI summary of the website's current state
6. Top 5 recommendations for improvement`,
      temperature: 0.3,
    });

    const mobile = pagespeedData.mobile as
      | { score: number; metrics: Record<string, string | null> }
      | undefined;
    const desktop = pagespeedData.desktop as
      | { score: number; metrics: Record<string, string | null> }
      | undefined;

    return {
      success: true,
      data: {
        pagespeed: {
          mobileScore: mobile?.score || 0,
          desktopScore: desktop?.score || 0,
          metrics: {
            fcp: mobile?.metrics?.fcp || desktop?.metrics?.fcp || null,
            lcp: mobile?.metrics?.lcp || desktop?.metrics?.lcp || null,
            tbt: mobile?.metrics?.tbt || desktop?.metrics?.tbt || null,
            cls: mobile?.metrics?.cls || desktop?.metrics?.cls || null,
            si: mobile?.metrics?.si || desktop?.metrics?.si || null,
          },
        },
        seo: {
          score: object.seoScore,
          hasMetaDescription: !!htmlAnalysis.metaDescription,
          hasOgTags: htmlAnalysis.hasOgTags,
          hasSitemap: object.hasSitemap,
          hasRobotsTxt: object.hasRobotsTxt,
          hasSsl: object.hasSsl,
          mobileFriendly: object.mobileFriendly,
        },
        ux: {
          score: object.uxScore,
          hasCtaAboveFold: htmlAnalysis.hasCtaAboveFold,
          hasTestimonials: htmlAnalysis.hasTestimonials,
          hasContactForm: htmlAnalysis.hasContactForm,
          hasOnlineBooking: htmlAnalysis.hasOnlineBooking,
          hasWhatsApp: htmlAnalysis.hasWhatsApp,
          responsiveDesign: object.responsiveDesign,
        },
        content: {
          score: object.contentScore,
          pageTitle: htmlAnalysis.title,
          metaDescription: htmlAnalysis.metaDescription,
          headings: htmlAnalysis.headings,
          imageCount: htmlAnalysis.imageCount,
          imagesWithoutAlt: htmlAnalysis.imagesWithoutAlt,
        },
        conversion: {
          score: object.conversionScore,
          hasPhoneNumber: htmlAnalysis.hasPhone,
          hasEmailVisible: htmlAnalysis.hasEmail,
          hasMapEmbed: htmlAnalysis.hasMap,
        },
        aiSummary: object.aiSummary,
        aiRecommendations: object.aiRecommendations,
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Auditor failed",
      duration: Date.now() - startTime,
    };
  }
}
