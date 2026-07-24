import { openai } from "@ai-sdk/openai";
import { streamText, zodSchema } from "ai";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `Eres el asistente de Valencia Studio, una plataforma de generación de leads para negocios locales.
Puedes ayudar al usuario con:
- Consultar información sobre leads
- Analizar métricas del pipeline
- Sugerir estrategias de outreach
- Responder preguntas sobre el sistema

Responde siempre en español de forma concisa y útil.`,
    messages,
    tools: {
      getLeadDetails: {
        description: "Obtener detalles completos de un lead específico",
        inputSchema: zodSchema(z.object({
          leadId: z.string().describe("ID del lead a consultar"),
        })),
        execute: async ({ leadId }) => {
          const supabase = createAdminClient();
          const { data } = await supabase
            .from("leads")
            .select("*, web_audits(*), proposals(*)")
            .eq("id", leadId)
            .single();
          return data || { error: "Lead no encontrado" };
        },
      },
      searchLeads: {
        description: "Buscar leads por nombre o estado",
        inputSchema: zodSchema(z.object({
          query: z.string().optional().describe("Texto de búsqueda"),
          status: z.string().optional().describe("Filtrar por estado"),
          limit: z.number().optional().describe("Número máximo de resultados"),
        })),
        execute: async ({ query, status, limit }) => {
          const supabase = createAdminClient();
          let supabaseQuery = supabase
            .from("leads")
            .select("id, name, status, opportunity_score, city, industry_id");

          if (query) {
            supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
          }
          if (status) {
            supabaseQuery = supabaseQuery.eq("status", status);
          }

          const { data } = await supabaseQuery
            .order("opportunity_score", { ascending: false })
            .limit(limit || 10);

          return data || [];
        },
      },
      getAnalytics: {
        description: "Obtener métricas y analytics del dashboard",
        inputSchema: zodSchema(z.object({})),
        execute: async () => {
          const supabase = createAdminClient();
          const { data } = await supabase
            .from("dashboard_summary")
            .select("*")
            .single();
          return data || {};
        },
      },
      suggestOutreach: {
        description: "Sugerir estrategia de outreach para un lead",
        inputSchema: zodSchema(z.object({
          leadId: z.string().describe("ID del lead"),
        })),
        execute: async ({ leadId }) => {
          const supabase = createAdminClient();
          const { data: lead } = await supabase
            .from("leads")
            .select("*, web_audits(*), proposals(*)")
            .eq("id", leadId)
            .single();

          if (!lead) return { error: "Lead no encontrado" };

          const suggestions = [];

          if (!lead.website_url) {
            suggestions.push("Este lead no tiene website. Priorizar propuesta de landing page.");
          }

          if (lead.google_rating && lead.google_rating < 4) {
            suggestions.push("Rating bajo. Enfocarse en mejorar su presencia digital.");
          }

          if (lead.google_reviews_count > 50) {
            suggestions.push("Muchas reseñas = negocio estable. Buen candidato para servicios premium.");
          }

          if (lead.web_audits?.[0]?.pagespeed_mobile_score < 50) {
            suggestions.push("PageSpeed muy bajo. Web lenta es una venta fácil.");
          }

          if (lead.proposals?.length > 0) {
            suggestions.push("Ya tiene propuesta. Considerar follow-up en lugar de nueva propuesta.");
          }

          return {
            lead: lead.name,
            score: lead.opportunity_score,
            suggestions: suggestions.length > 0 ? suggestions : ["Lead estándar. Seguir proceso normal de outreach."],
          };
        },
      },
      getTopOpportunities: {
        description: "Obtener los leads con mayor puntuación de oportunidad",
        inputSchema: zodSchema(z.object({
          limit: z.number().optional().describe("Número de leads a retornar"),
        })),
        execute: async ({ limit }) => {
          const supabase = createAdminClient();
          const { data } = await supabase
            .from("leads")
            .select("id, name, opportunity_score, status, city")
            .not("opportunity_score", "is", null)
            .order("opportunity_score", { ascending: false })
            .limit(limit || 5);

          return data || [];
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
