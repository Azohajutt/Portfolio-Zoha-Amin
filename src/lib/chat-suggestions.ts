import type { SiteContent } from "@/types/content";

export type SuggestionKind = "hire" | "voice" | "live" | "stack" | "experience" | "project" | "general";

export type ChatSuggestion = {
  question: string;
  title: string;
  detail: string;
  kind: SuggestionKind;
};

function kindFor(question: string): SuggestionKind {
  const q = question.toLowerCase();
  if (/hire|different|why should/.test(q)) return "hire";
  if (/live|demo/.test(q)) return "live";
  if (/voice|call|phone/.test(q)) return "voice";
  if (/stack|tech|rag|lang/.test(q)) return "stack";
  if (/experience|worked|role|company|7 kings|sabasoft|devticks/.test(q)) return "experience";
  if (/project|ship|production|built|system/.test(q)) return "project";
  return "general";
}

function titleFor(question: string, content: SiteContent) {
  const q = question.toLowerCase();
  const company = content.experiences.find((job) => q.includes(job.company.toLowerCase()));
  if (company) return company.company;
  const project = content.projects.find((item) => q.includes(item.title.toLowerCase()));
  if (project) return project.title.split(" ").slice(0, 3).join(" ");
  if (/hire|different/.test(q)) return "Why hire her";
  if (/live|demo/.test(q)) return "Try a live demo";
  if (/voice/.test(q)) return "Voice AI";
  if (/rag|stack|tech/.test(q)) return "Tech stack";
  if (/experience|worked|role|summarize/.test(q)) return "Experience";
  if (/project|ship|production/.test(q)) return "Shipped work";
  return question.replace(/[?]+$/, "").split(/\s+/).slice(0, 3).join(" ");
}

/** Suggestions come from CMS/portfolio data, not a fixed FAQ. */
export function chatSuggestions(content: SiteContent): ChatSuggestion[] {
  const questions = [...content.chatStarters.filter(Boolean)];
  const live = content.projects.filter((project) => project.demoUrl);
  if (live.length && !questions.some((item) => /live|demo/i.test(item))) {
    questions.push("Which projects can I try live?");
  }

  return questions.slice(0, 2).map((question) => ({
    question,
    title: titleFor(question, content),
    detail: question.replace(/[?]+$/, "").trim(),
    kind: kindFor(question),
  }));
}

export function followUpSuggestions(answer: string, content: SiteContent, asked: Set<string>) {
  const lower = answer.toLowerCase();
  const ideas: ChatSuggestion[] = [];
  const push = (title: string, question: string, kind: SuggestionKind) => {
    if (!asked.has(question.toLowerCase())) {
      ideas.push({ question, title, detail: question, kind });
    }
  };

  for (const project of content.projects) {
    if (lower.includes(project.title.toLowerCase())) {
      push(project.title.split(" ").slice(0, 2).join(" "), `What was the architecture of ${project.title}?`, "project");
    }
  }
  for (const job of content.experiences) {
    if (lower.includes(job.company.toLowerCase())) {
      push(job.company, `What did she actually own at ${job.company}?`, "experience");
    }
  }
  if (content.projects.some((project) => project.demoUrl)) {
    push("Live demos", "Which projects can I try live?", "live");
  }
  push("Tech stack", "What technologies does she use most?", "stack");

  const seen = new Set<string>();
  return ideas
    .filter((idea) => {
      if (seen.has(idea.question)) return false;
      seen.add(idea.question);
      return true;
    })
    .slice(0, 2);
}
