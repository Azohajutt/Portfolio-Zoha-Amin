"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { SiteContent } from "@/types/content";
import { Button } from "@/components/ui/button";

export function Hero({ content }: { content: SiteContent }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden section-pad pt-10 md:pt-16">
      <div className="signal-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm uppercase tracking-[0.22em] text-[var(--accent)]"
          >
            {content.headline}
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {content.name}
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)] text-pretty"
          >
            {content.positioning}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#work">
              <Button>See my work</Button>
            </a>
            <a href={content.resumePath} target="_blank" rel="noreferrer">
              <Button variant="secondary">Download resume</Button>
            </a>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                window.dispatchEvent(new Event("open-ask-zoha"));
              }}
            >
              Ask my AI
            </Button>
          </motion.div>

          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {content.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-4 backdrop-blur">
                <dt className="text-2xl font-semibold tracking-tight text-[var(--accent)]">{stat.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,var(--glow),transparent_60%)]" />
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] shadow-[0_30px_80px_-40px_var(--glow)]">
            <Image
              src={content.avatar}
              alt={`${content.name} at work`}
              width={900}
              height={1100}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
