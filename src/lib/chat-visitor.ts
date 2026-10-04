export type VisitorKind = "recruiter" | "technical" | "general";

/** Hint for Gemini — not a script. The model still decides how to answer. */
export function inferVisitor(texts: string[]): VisitorKind {
  const blob = texts.join(" ").toLowerCase();

  if (
    /hire|hiring|recruiter|talent|interview|notice|visa|salary|headcount|why (should i )?hire|what makes (you|her) different|enough experience|actual contribution|just an api wrapper/.test(
      blob,
    )
  ) {
    return "recruiter";
  }

  if (
    /architect|langgraph|langchain|embedding|latency|pipeline|wrapper|stack|model|fastapi|whisper|rag\b|vector|fine-?tun|tradeoff|why did (you|she) choose/.test(
      blob,
    )
  ) {
    return "technical";
  }

  return "general";
}
