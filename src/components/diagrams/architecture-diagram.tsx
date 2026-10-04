"use client";

import type { ProjectDiagram } from "@/types/content";
import { SystemVisualizer } from "@/components/diagrams/system-visualizer";

export function ArchitectureDiagram({ diagram, title }: { diagram: ProjectDiagram; title: string }) {
  return <SystemVisualizer diagram={diagram} title={title} />;
}
