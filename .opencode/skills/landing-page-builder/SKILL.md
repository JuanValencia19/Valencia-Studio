---
name: landing-page-builder
description: Guía completa para crear landing pages de alta conversión para negocios locales. Incluye estructura de secciones, optimización de conversión, diseño responsive, SEO, y patrones de diseño modernos.
license: MIT
compatibility: opencode
metadata:
  stack: nextjs,tailwind
  audience: frontend, ui-designer
---

# Landing Page Builder - Guía de Alta Conversión

## Arquitectura de Conversión

Una landing page de alta conversión sigue una **secuencia psicológica de decisión específica**. Cada sección tiene UN trabajo.

### Blueprint de 7 Secciones (Orden basado en datos)

| # | Sección | Trabajo Psicológico | Tiempo de Lectura |
|---|---------|---------------------|-------------------|
| 1 | **Hero (Above Fold)** | Igualar intención, establecer relevancia en <3 segundos | 5s |
| 2 | **Problem Agitation** | Validar el dolor que trajo al visitante | 15s |
| 3 | **Solution Overview** | Presentar tu oferta como la respuesta | 20s |
| 4 | **Social Proof** | Transferir confianza de otros a tu oferta | 15s |
| 5 | **Detail/Features** | Satisfacer la mente analítica | 20s |
| 6 | **Objection Handling (FAQ)** | Remover las últimas barreras | 15s |
| 7 | **Final CTA** | Convertir al visitante convencido | 5s |

**Objetivo de engagement: 80-90 segundos de lectura para conversión pico.**

## Sección Hero (Primer Pantallazo)

### Especificaciones

- **Headline:** 7 palabras o menos nombrando un **RESULTADO ESPECÍFICO**
- **Subhead:** Una oración nombrando audiencia Y mecanismo
- **CTA Button:** 6 caracteres, verbo activo ("Start free", "Get quote", "Book demo")
- **UNA señal de confianza:** logos O "trusted by 1,200+ teams" O un testimonial
- **UNA visual del producto:** screenshot, loop corto, o ilustración (NO stock photos)
- **NO segundo CTA. NO menú de features. NO video autoplay con sonido.**

### Código de Ejemplo

```tsx
export function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center px-4 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
          Trusted by 200+ local businesses
        </p>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6">
          Get More Customers From Your Website
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
          We build high-converting landing pages for local businesses — 
          designed to turn your traffic into paying customers.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a 
            href="#contact" 
            className="w-full sm:w-auto px-8 py-4 bg-[var(--accent-primary)] text-white 
                       rounded-full font-medium text-lg hover:bg-[var(--accent-hover)] 
                       transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get My Free Quote
          </a>
          <a href="#how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] 
                     transition-colors duration-200 text-sm font-medium">
            See how it works →
          </a>
        </div>
        
        <p className="text-xs text-[var(--text-tertiary)]">
          No credit card required · Free consultation · Results in 48 hours
        </p>
      </div>
    </section>
  );
}
```

## Sección Cómo Funciona

### Especificaciones

- **3 pasos máximo**, cada uno una oración:
  1. Qué hace el visitante ("Connect your account")
  2. Qué hace el producto/service ("We build your custom landing page")
  3. El resultado ("You start getting leads in 48 hours")
- Los visitantes leen esta sección en ~12 segundos. Resistir 5 pasos.

### Código de Ejemplo

```tsx
export function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Tell us about your business",
      description: "Fill out a 2-minute form about your business, goals, and target customers.",
      icon: "📝"
    },
    {
      step: 2,
      title: "We build your landing page",
      description: "Our team creates a custom, high-converting page in under 48 hours.",
      icon: "⚡"
    },
    {
      step: 3,
      title: "Start getting more customers",
      description: "Launch your page and watch your leads and calls increase.",
      icon: "📈"
    }
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--bg-secondary)]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight">
          How It Works
        </h2>
        <p className="text-[var(--text-secondary)] text-center mb-16 max-w-xl mx-auto">
          Three simple steps to a landing page that actually converts.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] bg-opacity-10 
                            flex items-center justify-center text-2xl mx-auto mb-6">
                {s.icon}
              </div>
              <div className="text-sm font-semibold text-[var(--accent-primary)] mb-2">
                Step {s.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Sección Social Proof

### Especificaciones

- Colocar prueba en **TRES momentos estratégicos:**
  1. Justo debajo del hero (logos o testimonial grande)
  2. Adyacente a "cómo funciona" (cita con nombre)
  3. Justo antes del CTA final (burst de prueba reciente)
- **La especificidad convierte:** "saved us 18 hours a week" con nombre + foto gana a "loved by thousands"

### Código de Ejemplo

```tsx
export function Testimonials() {
  return (
    <section className="py-24 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
          What Our Clients Say
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-[var(--border-default)] bg-white">
            <div className="flex items-center gap-1 mb-4 text-amber-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <blockquote className="text-lg leading-relaxed mb-6">
              "Our landing page went live on Monday. By Friday we had 23 new 
              appointment bookings — up from 4 the previous week."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)]" />
              <div>
                <div className="font-semibold text-sm">Maria Rodriguez</div>
                <div className="text-xs text-[var(--text-tertiary)]">Owner, Bright Dental Clinic</div>
              </div>
            </div>
          </div>
          
          <div className="p-8 rounded-2xl border border-[var(--border-default)] bg-white">
            <div className="flex items-center gap-1 mb-4 text-amber-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <blockquote className="text-lg leading-relaxed mb-6">
              "We were spending $4,000/month on Google Ads sending traffic to our 
              homepage. The landing page doubled our conversion rate in the first month."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)]" />
              <div>
                <div className="font-semibold text-sm">James Chen</div>
                <div className="text-xs text-[var(--text-tertiary)]">Marketing Director, TechFlow Solutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Sección FAQ con Schema

```tsx
"use client";
import { useState } from "react";

const faqs = [
  {
    q: "How much does a landing page cost?",
    a: "Our landing pages for local businesses start at $500. The exact price depends on the features you need, but most clients invest between $500 and $2,000."
  },
  {
    q: "How long does it take to build?",
    a: "Most landing pages are delivered within 48-72 hours after we receive your business information."
  },
  {
    q: "Will it work on mobile?",
    a: "Yes. Every page we build is designed mobile-first. Over 70% of local business traffic comes from mobile."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 md:px-8 bg-[var(--bg-secondary)]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-[var(--border-default)] rounded-xl bg-white">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between 
                         hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <span className="font-semibold pr-4">{faq.q}</span>
                <span className="text-xl text-[var(--text-tertiary)] shrink-0">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(faq => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a
              }
            }))
          })
        }}
      />
    </section>
  );
}
```

## CTA Sticky Mobile

```tsx
"use client";
import { useState, useEffect } from "react";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm 
                  border-t border-[var(--border-default)] z-50 transition-transform 
                  duration-300 md:hidden
                  ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <a
        href="#contact"
        className="block w-full py-4 px-6 bg-[var(--accent-primary)] text-white 
                   text-center rounded-full font-semibold text-lg
                   hover:bg-[var(--accent-hover)] transition-colors"
      >
        Get My Free Quote
      </a>
      <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-2">
        No credit card required · Free consultation
      </p>
    </div>
  );
}
```

## Optimización de Conversión

### Las 10 Palancas de Optimización (por Impacto)

| Prioridad | Palancada | Impacto Típico | Esfuerzo |
|-----------|-----------|----------------|----------|
| 1 | **Message match** (headline refleja el ad) | 250-300% CVR lift | Bajo |
| 2 | **CTA único, sin navegación** | Hasta 266% lift | Bajo |
| 3 | **Velocidad de carga** (<2.5s) | 7% pérdida por segundo adicional | Medio |
| 4 | **Diseño mobile-first** | Afecta 60-83% del tráfico | Medio |
| 5 | **Reducir campos del form** (11 -> 4) | 120% aumento en completado | Bajo |
| 6 | **Social proof cerca del CTA** | +14-34% según formato | Bajo |
| 7 | **Headlines orientadas a beneficios** | 27-104% lift en conversión | Bajo |
| 8 | **Video en página** | +80-86% vs solo texto | Alto |
| 9 | **Exit-intent popups** | Recupera 10-15% de visitantes perdidos | Medio |
| 10 | **A/B testing** | Ganancias iterativas 5-30% | Medio |

### Optimización de Copy del CTA

**Jerarquía de verbos (por rendimiento):**
1. "Get" - implica recibir valor ("Get my free report")
2. "Start" - implica comenzar un viaje ("Start my free trial")
3. "Try" - bajo compromiso ("Try it free")
4. "Join" - implica comunidad ("Join 10,000+ teams")
5. "Claim" - implica urgencia ("Claim your spot")

**Palabras que NUNCA usar:** "Submit", "Click here", "Send", "Continue", "Next"

**Enmarcado en primera persona gana:** "Start my free trial" supera a "Start your free trial" por 90%.

**Longitud óptima del CTA:** 2-5 palabras (promedio ganador: 3.4 palabras).

### Microcopy Debajo del CTA

Agregar una línea reductora de ansiedad debajo del botón:
- "No credit card required"
- "Cancel anytime"
- "Takes 30 seconds"
- "Free for 14 days"

## Diseño Moderno (Estilo Linear/Stripe/Vercel)

### Los 4 Principios Compartidos

1. **Alto Contraste Agresivo:** Negro sobre blanco, blanco sobre negro, nada difuminado.
2. **Espacio Generoso:** Tomar el espaciado que se siente suficiente, luego duplicarlo.
3. **Base Monocromo + Un Acento:** 75-85% neutros, 10-15% brand, 5-10% acento.
4. **Tipografía Sharp:** Tight, geométrica, ligeramente fría. Sin fuentes redondeadas.

### Tokens de Color (Inspiration Vercel/Linear)

```css
/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #fafafa;
--bg-tertiary: #f5f5f5;
--bg-dark: #0a0a0a;

/* Text */
--text-primary: #171717;
--text-secondary: #525252;
--text-tertiary: #a3a3a3;

/* Accent (un color para todo lo interactivo) */
--accent-primary: #0070f3;
--accent-hover: #0060df;
--accent-light: #e8f4fd;

/* Borders */
--border-default: #e5e5e5;
--border-subtle: #f0f0f0;
```

### Tokens de Tipografía

```css
/* Display / Hero */
--font-display-size: clamp(36px, 5vw, 56px);
--font-display-weight: 700;
--font-display-tracking: -0.03em;
--font-display-line-height: 1.1;

/* Section Headline */
--font-h2-size: clamp(28px, 3.5vw, 40px);
--font-h2-weight: 600;
--font-h2-tracking: -0.02em;

/* Body */
--font-body-size: 16-18px;
--font-body-line-height: 1.6;
--font-body-max-width: 680px; /* 60-80 chars */
```

### 6 Microestados por Elemento Interactivo

1. Default
2. Hover
3. Focus (keyboard)
4. Active (pressed)
5. Disabled
6. Loading

Si falta un estado, el elemento no está terminado.

## SEO para Landing Pages

### Fundamentos On-Page

- **Title Tag:** 50-60 caracteres, keyword primaria al frente
- **Meta Description:** 130-160 caracteres con keyword y razón para clickear
- **Heading Structure:** UN H1, jerarquía H2/H3 lógica
- **Schema Markup:** LocalBusiness, FAQPage en JSON-LD

### Schema LocalBusiness

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "image": "https://example.com/logo.png",
  "url": "https://example.com",
  "telephone": "+1-555-555-5555",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

## Errores Comunes a Evitar

| # | Error | Impacto | Solución |
|---|-------|---------|----------|
| 1 | Múltiples CTAs compitiendo | Single-CTA: 13.5% CVR vs 10.5% con 5+ | Una acción principal, repetida |
| 2 | Headline vaga | 80% solo lee headline + primera oración | Resultado específico para audiencia específica |
| 3 | Features antes de beneficios | Copy de beneficios supera por 27% | Liderar con lo que el usuario gana |
| 4 | Sin social proof | Limita conversión a 1-2% | Agregar logos, números, testimonios |
| 5 | Página lenta y pesada | Cada segundo extra cuesta 7-12% conversión | Optimizar LCP <2.5s |
| 6 | Navegación en landing page | Cada link es un punto de salida | Eliminar nav en páginas standalone |
| 7 | CTA copy genérico | Hasta 60% menor CTR | Usar texto específico orientado a resultados |
| 8 | Demasiados campos en form | Cada campo extra = -10% completado | Máximo 3 campos para lead gen |
| 9 | Diseño desktop-first | 60-83% del tráfico es mobile | Diseñar mobile-first |
| 10 | Sin message match | Desconexión con la fuente de tráfico | Headline debe reflejar la fuente |

## Checklist Pre-Launch

### Messaging
- [ ] Headline promete un resultado específico
- [ ] Subhead nombra audiencia y mecanismo
- [ ] Propósito de la página claro en 3 segundos
- [ ] Message match con la fuente de tráfico

### CTA
- [ ] CTA primario visible above the fold
- [ ] Copy del CTA es específico, primera persona, orientado a resultados
- [ ] Una acción principal repetida 2-3 veces
- [ ] Microcopy debajo del CTA direciona objeciones
- [ ] CTA es el elemento de mayor contraste (ratio 6:1+)
- [ ] CTA sticky en mobile

### Diseño
- [ ] Layout de una columna, secciones de scroll
- [ ] Tipografía: H1 al menos 2x tamaño del body
- [ ] Espacio generoso (60px+ entre secciones)
- [ ] Sin menú de navegación en páginas standalone
- [ ] 6 microestados en todos los elementos interactivos

### Mobile
- [ ] CTA visible en viewport de 375px (iPhone SE)
- [ ] Touch targets mínimo 48x48px
- [ ] Sin scroll horizontal
- [ ] Forms usan tipos de input correctos (email, tel)
- [ ] Probado en dispositivo móvil real

### Performance
- [ ] LCP bajo 2.5 segundos
- [ ] INP bajo 200ms
- [ ] CLS bajo 0.1
- [ ] Imágenes comprimidas, formato WebP/AVIF
- [ ] LCP image tiene `loading="eager"` y `fetchpriority="high"`

### SEO
- [ ] Un H1, jerarquía H2/H3 lógica
- [ ] Title tag 50-60 caracteres con keyword primaria
- [ ] Meta description 130-160 caracteres
- [ ] Schema markup (LocalBusiness/FAQPage en JSON-LD)
- [ ] Todas las imágenes tienen alt text descriptivo
