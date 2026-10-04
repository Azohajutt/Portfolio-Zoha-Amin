import type { SiteContent } from "@/types/content";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_RE = /(?:\+92[\s-]*)?(?:0)?3\d{2}[\s-]?\d{7}/g;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%.-]+\/?/gi;
const GITHUB_PROFILE_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)(?=\/?(?:[\s)\].,;:'"]|$))/gi;
const PERSONAL_INBOX = /(gmail|googlemail|outlook|hotmail|yahoo|icloud|proton)/i;
const NAME_LIKE = /(zoha|amin)/i;

export type ChatContact = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  allowedUrls: string[];
  allowedPlaces: string[];
};

function stripTrail(value: string) {
  return value.replace(/[.,;:)]+$/, "");
}

function sameEmail(left: string, right: string) {
  return stripTrail(left).toLowerCase() === right.toLowerCase();
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function phoneMatches(found: string, official: string) {
  const got = digits(found);
  const want = digits(official);
  if (!got || !want) return false;
  return got === want || got === want.replace(/^92/, "0") || `92${got.replace(/^0/, "")}` === want;
}

function githubUser(url: string) {
  try {
    const path = new URL(url.startsWith("http") ? url : `https://${url}`).pathname;
    return path.split("/").filter(Boolean)[0]?.toLowerCase() || "";
  } catch {
    return "";
  }
}

function linkedinPath(url: string) {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return "";
  }
}

export function contactFromContent(content: SiteContent): ChatContact {
  const allowedUrls = [
    content.github,
    content.linkedin,
    ...content.projects.flatMap((project) => [project.repoUrl, project.demoUrl]),
    ...content.certifications.map((cert) => cert.url),
  ].filter((url): url is string => Boolean(url));

  const allowedPlaces = [content.location, ...content.experiences.map((job) => job.location)].filter(Boolean);

  return {
    email: content.email,
    phone: content.phone,
    linkedin: content.linkedin,
    github: content.github,
    location: content.location,
    allowedUrls,
    allowedPlaces,
  };
}

export function canonicalizeEmails(text: string, email?: string) {
  if (!email?.includes("@")) return text;

  const local = email.split("@")[0];
  let out = text;

  if (local.length >= 3) {
    const escaped = local.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b(?!@)`, "gi"), email);
  }

  return out.replace(EMAIL_RE, (found) => {
    const clean = stripTrail(found);
    if (sameEmail(clean, email)) return found;
    if (PERSONAL_INBOX.test(clean) || NAME_LIKE.test(clean)) {
      return email + found.slice(clean.length);
    }
    return found;
  });
}

export function canonicalizeContact(text: string, contact: ChatContact) {
  let out = canonicalizeEmails(text, contact.email);

  if (contact.phone) {
    out = out.replace(PHONE_RE, (found) => (phoneMatches(found, contact.phone) ? found : contact.phone));
  }

  if (contact.linkedin) {
    const official = linkedinPath(contact.linkedin);
    out = out.replace(LINKEDIN_RE, (found) => (linkedinPath(found) === official ? found : contact.linkedin));
  }

  if (contact.github) {
    const allowedUsers = new Set(
      [contact.github, ...contact.allowedUrls].map(githubUser).filter(Boolean),
    );
    out = out.replace(GITHUB_PROFILE_RE, (found, user: string) => {
      if (allowedUsers.has(user.toLowerCase())) return found;
      return contact.github;
    });
  }

  return out;
}
