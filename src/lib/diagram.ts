import type { ProjectDiagram } from "@/types/content";

function isFlowDiagram(raw: unknown): raw is ProjectDiagram {
  if (!raw || typeof raw !== "object") return false;
  const value = raw as Partial<ProjectDiagram>;
  return Array.isArray(value.nodes) && Array.isArray(value.edges) && Array.isArray(value.scenarios) && Array.isArray(value.lanes);
}

export function defaultDiagram(title = "System"): ProjectDiagram {
  return {
    engine: title,
    lanes: ["Input", "Core", "Output"],
    nodes: [
      { id: "in", label: "Input", sub: "Data or request", col: 0, row: 0, kind: "source", icon: "doc" },
      { id: "core", label: "Core Engine", sub: "Main processing", col: 1, row: 0, kind: "model", icon: "spark" },
      { id: "out", label: "Output", sub: "Result", col: 2, row: 0, kind: "output", icon: "check" },
    ],
    edges: [
      { from: "in", to: "core" },
      { from: "core", to: "out" },
    ],
    scenarios: [{ name: "Flow", caption: "Input is processed by the core engine and returned as a result.", path: ["in", "core", "out"] }],
  };
}

export function normalizeDiagram(raw: unknown, title = "System"): ProjectDiagram {
  return isFlowDiagram(raw) ? raw : defaultDiagram(title);
}
