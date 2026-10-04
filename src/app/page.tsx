import { AskZoha } from "@/components/chat/ask-zoha";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Education } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { SiteHeader } from "@/components/site-header";
import { getLiveContent } from "@/lib/get-content";

export default async function HomePage() {
  const content = await getLiveContent();

  return (
    <>
      <SiteHeader resumePath={content.resumePath} />
      <main>
        <Hero content={content} />
        <About content={content} />
        <Experience content={content} />
        <Work content={content} />
        <Skills content={content} />
        <Education content={content} />
        <Contact content={content} />
      </main>
      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
        © {new Date().getFullYear()} {content.name}. Built for hiring conversations.
      </footer>
      <AskZoha content={content} />
    </>
  );
}
