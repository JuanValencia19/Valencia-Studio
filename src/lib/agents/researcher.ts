import type {
  AgentResult,
  SocialMediaLinks,
  DigitalPresenceSignals,
} from "@/types";

interface ResearcherInput {
  leadId: string;
  websiteUrl?: string;
  name: string;
}

interface ResearcherOutput {
  socialMedia: SocialMediaLinks;
  digitalPresence: DigitalPresenceSignals;
}

export async function runResearcher(
  input: ResearcherInput
): Promise<AgentResult<ResearcherOutput>> {
  const startTime = Date.now();

  try {
    const socialMedia = await findSocialMedia(input.name);
    const digitalPresence = await analyzeDigitalPresence(input.websiteUrl);

    return {
      success: true,
      data: { socialMedia, digitalPresence },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Researcher failed",
      duration: Date.now() - startTime,
    };
  }
}

async function findSocialMedia(
  businessName: string
): Promise<SocialMediaLinks> {
  const socialMedia: SocialMediaLinks = {};

  try {
    const searchQuery = `"${businessName}" dentista instagram facebook`;
    const response = await fetch(
      `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&hl=es`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ValenciaStudioBot/1.0)",
        },
      }
    );

    const html = await response.text();

    const instagramMatch = html.match(
      /https?:\/\/(?:www\.)?instagram\.com\/[^"'\s<>]+/
    );
    if (instagramMatch) socialMedia.instagram = instagramMatch[0];

    const facebookMatch = html.match(
      /https?:\/\/(?:www\.)?facebook\.com\/[^"'\s<>]+/
    );
    if (facebookMatch) socialMedia.facebook = facebookMatch[0];

    const twitterMatch = html.match(
      /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^"'\s<>]+/
    );
    if (twitterMatch) socialMedia.twitter = twitterMatch[0];
  } catch {
    // Social media search failed silently
  }

  return socialMedia;
}

async function analyzeDigitalPresence(
  websiteUrl: string | undefined
): Promise<DigitalPresenceSignals> {
  const signals: DigitalPresenceSignals = {
    hasWebsite: !!websiteUrl,
    hasSocialMedia: false,
    hasOnlineBooking: false,
    hasWhatsApp: false,
    hasContactForm: false,
  };

  if (!websiteUrl) return signals;

  try {
    const response = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ValenciaStudioBot/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    const html = await response.text();

    signals.hasOnlineBooking =
      /book|reservar|cita|appointment/i.test(html);
    signals.hasWhatsApp = /wa\.me|whatsapp|api\.whatsapp/i.test(html);
    signals.hasContactForm = /<form[\s\S]*?(contact|contacto)/i.test(html);

    const instagramMatch = html.match(
      /https?:\/\/(?:www\.)?instagram\.com\/[^"'\s<>]+/
    );
    if (instagramMatch) signals.instagram = instagramMatch[0];

    const facebookMatch = html.match(
      /https?:\/\/(?:www\.)?facebook\.com\/[^"'\s<>]+/
    );
    if (facebookMatch) signals.facebook = facebookMatch[0];

    signals.hasSocialMedia = !!(signals.instagram || signals.facebook);
  } catch {
    // Website analysis failed silently
  }

  return signals;
}
