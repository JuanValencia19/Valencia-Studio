import { Instagram, Linkedin } from "lucide-react";

// COPY DIRECTION:
//   aria-label — FIXED es_CO: "Valencia Studio en <Red>" carries the
//   accessible name. Icons are aria-hidden; no visible text accompanies
//   them (user-locked decision #1: solo-iconos silencioso).
// Honesty invariant: only LinkedIn + Instagram (real handles — obs #28).
// Do NOT invent X / GitHub / YouTube / TikTok / Facebook.

const SOCIALS = [
  {
    label: "Valencia Studio en LinkedIn",
    href: "https://www.linkedin.com/in/juan-jose-valencia-trejos-a9b952272/",
    Icon: Linkedin,
  },
  {
    label: "Valencia Studio en Instagram",
    href: "https://www.instagram.com/juanchitovt/",
    Icon: Instagram,
  },
] as const;

export function SocialNav() {
  return (
    <ul className="mt-4 flex items-center gap-3">
      {SOCIALS.map(({ label, href, Icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="size-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
