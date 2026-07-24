import type { RawLead } from "@/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PlacesResponse {
  results: Array<{
    name?: string;
    place_id?: string;
    formatted_address?: string;
    formatted_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  next_page_token?: string;
}

export interface PlacesSearchParams {
  queries: string[];
  location: string;
  radius: number;
  maxResults: number;
  placeType?: string;
  language?: string;
}

export async function searchPlaces(
  params: PlacesSearchParams
): Promise<RawLead[]> {
  const {
    queries,
    location,
    radius,
    maxResults,
    placeType,
    language = "es",
  } = params;

  const results: RawLead[] = [];
  const seen = new Set<string>();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  for (const q of queries) {
    if (results.length >= maxResults) break;

    let pageToken: string | undefined;

    do {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/textsearch/json"
      );
      url.searchParams.set("query", q);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("language", language);
      url.searchParams.set("location", location);
      url.searchParams.set("radius", String(radius));

      if (placeType) {
        url.searchParams.set("type", placeType);
      }

      if (pageToken) {
        url.searchParams.set("pagetoken", pageToken);
      }

      const response = await fetch(url.toString());
      const data: PlacesResponse = await response.json();

      for (const place of data.results || []) {
        if (results.length >= maxResults) break;
        if (!place.place_id || seen.has(place.place_id)) continue;

        seen.add(place.place_id);
        results.push({
          name: place.name || "",
          placeId: place.place_id,
          address: place.formatted_address || "",
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          reviewsCount: place.user_ratings_total,
          mapsUrl: place.url,
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
        });
      }

      pageToken = data.next_page_token;
      if (pageToken) await sleep(2000);
    } while (pageToken);
  }

  return results;
}
