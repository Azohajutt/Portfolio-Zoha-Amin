"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import type { FlowEdge, FlowIcon, FlowKind, FlowNode, ProjectDiagram } from "@/types/content";
import { normalizeDiagram } from "@/lib/diagram";
import { cn } from "@/lib/utils";

const COL_W = 196;
const NODE_W = 150;
const NODE_H = 48;
const ROW_H = 72;
const PAD_X = 24;
const TOP = 52;
const GUTTER = COL_W - NODE_W;
const STEP_MS = 750;
const HOLD_STEPS = 4;

const KIND: Record<FlowKind, { color: string; name: string; icon: FlowIcon }> = {
  source: { color: "#8a9aa6", name: "Input", icon: "doc" },
  process: { color: "var(--accent)", name: "Process", icon: "gear" },
  model: { color: "var(--accent)", name: "AI model", icon: "spark" },
  store: { color: "#8b7cf6", name: "Data store", icon: "db" },
  external: { color: "#4f9cf9", name: "External API", icon: "globe" },
  decision: { color: "#f0a92e", name: "Decision", icon: "branch" },
  output: { color: "#22c08a", name: "Output", icon: "check" },
};

const LEGEND: FlowKind[] = ["model", "store", "external", "decision", "output"];

function Glyph({ name, color }: { name: FlowIcon; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "user":
      return (
        <g {...common}>
          <circle cx="7" cy="4.8" r="2.6" />
          <path d="M2.5 13c0-3 2-4.6 4.5-4.6s4.5 1.6 4.5 4.6" />
        </g>
      );
    case "phone":
      return (
        <g {...common}>
          <path d="M4 1.8h2l1 3-1.4 1a7 7 0 0 0 3.6 3.6l1-1.4 3 1v2A1.6 1.6 0 0 1 11.6 12.6 10.6 10.6 0 0 1 1.4 2.4 1.6 1.6 0 0 1 3 .8z" />
        </g>
      );
    case "mic":
      return (
        <g {...common}>
          <rect x="5" y="1.5" width="4" height="7" rx="2" />
          <path d="M3 7a4 4 0 0 0 8 0M7 11v2" />
        </g>
      );
    case "db":
      return (
        <g {...common}>
          <ellipse cx="7" cy="3.4" rx="4.6" ry="1.8" />
          <path d="M2.4 3.4v7.2c0 1 2 1.8 4.6 1.8s4.6-.8 4.6-1.8V3.4M2.4 7c0 1 2 1.8 4.6 1.8S11.6 8 11.6 7" />
        </g>
      );
    case "doc":
      return (
        <g {...common}>
          <path d="M3.5 1.5h5l2.5 2.5v8.5h-7.5zM8.5 1.5V4H11M5.5 7.5h3.5M5.5 10h3.5" />
        </g>
      );
    case "spark":
      return (
        <g {...common}>
          <path d="M7 1.2l1.4 4.2 4.2 1.6-4.2 1.4L7 12.8 5.6 8.4 1.4 7l4.2-1.6z" />
        </g>
      );
    case "gear":
      return (
        <g {...common}>
          <circle cx="7" cy="7" r="2" />
          <circle cx="7" cy="7" r="5" strokeDasharray="2 1.7" />
        </g>
      );
    case "branch":
      return (
        <g {...common}>
          <path d="M7 1.4L12.6 7 7 12.6 1.4 7z" />
          <path d="M7 4.6v3M7 9.4v.01" />
        </g>
      );
    case "check":
      return (
        <g {...common}>
          <circle cx="7" cy="7" r="5.6" />
          <path d="M4.4 7.2l1.8 1.8 3.4-3.6" />
        </g>
      );
    case "globe":
      return (
        <g {...common}>
          <circle cx="7" cy="7" r="5.6" />
          <path d="M1.4 7h11.2M7 1.4c2 2 2 9.2 0 11.2M7 1.4c-2 2-2 9.2 0 11.2" />
        </g>
      );
    case "camera":
      return (
        <g {...common}>
          <rect x="1.4" y="3.8" width="11.2" height="8.4" rx="1.6" />
          <circle cx="7" cy="8" r="2.2" />
          <path d="M5 3.8l1-1.8h2l1 1.8" />
        </g>
      );
    case "image":
      return (
        <g {...common}>
          <rect x="1.4" y="2" width="11.2" height="10" rx="1.6" />
          <circle cx="5" cy="5.4" r="1.1" />
          <path d="M1.6 10.6l3.4-3.4 3 3 2-2 2.4 2.4" />
        </g>
      );
    case "chart":
      return (
        <g {...common}>
          <path d="M1.8 12.4h10.6M4 10V7M7 10V3.8M10 10V5.8" />
        </g>
      );
    case "speaker":
      return (
        <g {...common}>
          <path d="M2 5.4h2.4L7.6 2.6v8.8L4.4 8.6H2zM10 4.6a3.4 3.4 0 0 1 0 4.8" />
        </g>
      );
    case "calendar":
      return (
        <g {...common}>
          <rect x="1.6" y="2.6" width="10.8" height="9.8" rx="1.6" />
          <path d="M1.6 5.6h10.8M4.6 1.2v2.6M9.4 1.2v2.6" />
        </g>
      );
    case "search":
      return (
        <g {...common}>
          <circle cx="6" cy="6" r="4" />
          <path d="M9 9l3.6 3.6" />
        </g>
      );
    case "game":
      return (
        <g {...common}>
          <rect x="1.4" y="3.8" width="11.2" height="6.8" rx="3.2" />
          <path d="M4.4 5.8v2.8M3 7.2h2.8M9.6 6.6v.01M10.8 8v.01" />
        </g>
      );
    case "shield":
      return (
        <g {...common}>
          <path d="M7 1.4l5 2v3.6c0 3-2.2 5-5 5.8-2.8-.8-5-2.8-5-5.8V3.4z" />
        </g>
      );
    case "wave":
      return (
        <g {...common}>
          <path d="M1.4 7h1.4M4.4 4.2v5.6M7 2v10M9.6 4.2v5.6M11.2 7h1.4" />
        </g>
      );
    case "layers":
      return (
        <g {...common}>
          <path d="M7 1.6l5.6 3-5.6 3-5.6-3zM1.4 7.4l5.6 3 5.6-3M1.4 10.2l5.6 3 5.6-3" />
        </g>
      );
    case "graph":
      return (
        <g {...common}>
          <circle cx="3" cy="3.4" r="1.7" />
          <circle cx="11" cy="3.4" r="1.7" />
          <circle cx="7" cy="11" r="1.7" />
          <path d="M4.7 3.4h4.6M3.9 4.9l2.3 4.6M10.1 4.9l-2.3 4.6" />
        </g>
      );
    case "code":
      return (
        <g {...common}>
          <path d="M4.8 3.6L1.6 7l3.2 3.4M9.2 3.6L12.4 7l-3.2 3.4" />
        </g>
      );
    case "bell":
      return (
        <g {...common}>
          <path d="M3.4 10V6.4a3.6 3.6 0 0 1 7.2 0V10l1.2 1.4H2.2zM5.8 13h2.4" />
        </g>
      );
    case "target":
      return (
        <g {...common}>
          <circle cx="7" cy="7" r="5.6" />
          <circle cx="7" cy="7" r="2.6" />
          <circle cx="7" cy="7" r=".5" fill={color} />
        </g>
      );
  }
}

type Box = { x: number; y: number; cx: number; cy: number };

function boxOf(node: FlowNode): Box {
  const x = PAD_X + node.col * COL_W;
  const y = TOP + node.row * ROW_H;
  return { x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
}

function edgeGeometry(from: FlowNode, to: FlowNode, loopY: number) {
  const a = boxOf(from);
  const b = boxOf(to);

  if (to.col > from.col) {
    const sx = a.x + NODE_W;
    const sy = a.cy;
    const tx = b.x - 3;
    const ty = b.cy;
    const dx = (tx - sx) / 2;
    return {
      d: `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`,
      labelX: (sx + tx) / 2,
      labelY: (sy + ty) / 2,
    };
  }

  if (to.col === from.col) {
    const down = to.row > from.row;
    const sy = down ? a.y + NODE_H : a.y;
    const ty = down ? b.y - 3 : b.y + NODE_H + 3;
    return { d: `M ${a.cx} ${sy} L ${b.cx} ${ty}`, labelX: a.cx + 6, labelY: (sy + ty) / 2, side: true };
  }

  const sx = a.x;
  const sy = a.cy + 12;
  const tx = b.x + NODE_W + 3;
  const ty = b.cy + 12;
  const gx1 = a.x - GUTTER / 2;
  const gx2 = b.x + NODE_W + GUTTER / 2;
  if (Math.abs(gx1 - gx2) < 1) {
    return { d: `M ${sx} ${sy} H ${gx1} V ${ty} H ${tx}`, labelX: gx1, labelY: (sy + ty) / 2 };
  }
  return {
    d: `M ${sx} ${sy} H ${gx1} V ${loopY} H ${gx2} V ${ty} H ${tx}`,
    labelX: (gx1 + gx2) / 2,
    labelY: loopY,
  };
}

const subscribeNoop = () => () => {};

function isLongLoop(edge: FlowEdge, byId: Map<string, FlowNode>) {
  const from = byId.get(edge.from);
  const to = byId.get(edge.to);
  return Boolean(from && to && to.col < from.col - 1);
}

export function SystemVisualizer({
  diagram,
  title,
  className,
}: {
  diagram: ProjectDiagram | unknown;
  title: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const prefersReducedMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const reduceMotion = mounted && Boolean(prefersReducedMotion);
  const flow = useMemo(() => normalizeDiagram(diagram, title), [diagram, title]);
  const byId = useMemo(() => new Map(flow.nodes.map((node) => [node.id, node])), [flow.nodes]);

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  const scenario = flow.scenarios[scenarioIndex] ?? flow.scenarios[0];
  const path = useMemo(() => scenario?.path ?? [], [scenario]);

  useEffect(() => {
    if (!playing || reduceMotion || path.length === 0) return;
    const id = window.setInterval(() => {
      setStep((current) => {
        if (current < path.length - 1 + HOLD_STEPS) return current + 1;
        setScenarioIndex((index) => (index + 1) % flow.scenarios.length);
        return 0;
      });
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [playing, reduceMotion, path.length, flow.scenarios.length]);

  const effectiveStep = reduceMotion ? path.length - 1 : step;
  const visited = useMemo(() => new Set(path.slice(0, effectiveStep + 1)), [path, effectiveStep]);
  const currentId = effectiveStep < path.length ? path[effectiveStep] : null;

  const cols = Math.max(...flow.nodes.map((node) => node.col)) + 1;
  const maxRow = Math.max(...flow.nodes.map((node) => node.row));
  const contentBottom = TOP + maxRow * ROW_H + NODE_H;
  const hasLongLoop = flow.edges.some((edge) => isLongLoop(edge, byId));
  const loopY = contentBottom + 22;
  const width = PAD_X * 2 + (cols - 1) * COL_W + NODE_W;
  const height = contentBottom + (hasLongLoop ? 42 : 20);

  const neighbors = useMemo(() => {
    if (!hovered) return null;
    const set = new Set([hovered]);
    flow.edges.forEach((edge) => {
      if (edge.from === hovered) set.add(edge.to);
      if (edge.to === hovered) set.add(edge.from);
    });
    return set;
  }, [hovered, flow.edges]);

  const edgeLit = (edge: FlowEdge) =>
    hovered ? edge.from === hovered || edge.to === hovered : visited.has(edge.from) && visited.has(edge.to);

  const nodeOpacity = (id: string) => {
    if (neighbors) return neighbors.has(id) ? 1 : 0.28;
    if (visited.has(id)) return 1;
    if (path.includes(id)) return 0.6;
    return 0.32;
  };

  const selectScenario = (index: number) => {
    setScenarioIndex(index);
    setStep(0);
  };

  const stepNumber = Math.min(effectiveStep, path.length - 1) + 1;
  const stepNode = byId.get(path[Math.min(effectiveStep, path.length - 1)]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_78%,var(--panel))]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            {playing && !reduceMotion ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            ) : null}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">System architecture</p>
            <p className="text-sm font-medium">{flow.engine}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            {LEGEND.map((kind) => (
              <span key={kind} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                <span className="h-2 w-2 rounded-sm" style={{ background: KIND[kind].color }} />
                {KIND[kind].name}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--fg)]"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full min-w-[720px]"
          role="img"
          aria-label={`${title} system architecture`}
        >
          <defs>
            <marker id={`${uid}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L8 4L0 8z" fill="var(--border)" />
            </marker>
            <marker id={`${uid}-arrow-lit`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L8 4L0 8z" fill="var(--accent)" />
            </marker>
            <pattern id={`${uid}-grid`} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="var(--border)" />
            </pattern>
          </defs>

          <rect x="0" y="0" width={width} height={height} fill={`url(#${uid}-grid)`} opacity="0.55" />

          {flow.lanes.slice(0, cols).map((lane, index) => {
            const x = PAD_X + index * COL_W;
            return (
              <g key={`lane-${index}`}>
                <rect
                  x={x - GUTTER / 2 + 8}
                  y={30}
                  width={COL_W - 16}
                  height={contentBottom - 30 + 12}
                  rx="14"
                  style={{ fill: "color-mix(in oklab, var(--fg) 2.5%, transparent)" }}
                />
                <text x={x} y={22} fontSize="9" letterSpacing="1.6" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
                  <tspan fill="var(--accent)">{String(index + 1).padStart(2, "0")}</tspan>
                  {` / ${lane.toUpperCase()}`}
                </text>
              </g>
            );
          })}

          {flow.edges.map((edge) => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);
            if (!from || !to) return null;
            const geometry = edgeGeometry(from, to, loopY);
            const lit = edgeLit(edge);
            return (
              <g key={`edge-${edge.from}-${edge.to}`}>
                <path
                  d={geometry.d}
                  fill="none"
                  stroke={lit ? "var(--accent)" : "var(--border)"}
                  strokeWidth={lit ? 1.8 : 1.2}
                  strokeDasharray={edge.dashed ? "5 5" : undefined}
                  strokeLinejoin="round"
                  markerEnd={`url(#${uid}-${lit ? "arrow-lit" : "arrow"})`}
                  style={{ transition: "stroke 300ms ease, stroke-width 300ms ease" }}
                />
                {lit && !reduceMotion ? (
                  <circle key={`p-${scenarioIndex}-${hovered ?? ""}`} r="3" fill="var(--accent)">
                    <animateMotion dur="1.4s" repeatCount="indefinite" path={geometry.d} />
                    <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                ) : null}
                {edge.label ? (
                  <g transform={`translate(${geometry.labelX}, ${geometry.labelY})`}>
                    <rect
                      x={geometry.side ? 0 : -(edge.label.length * 2.6 + 6)}
                      y="-7"
                      width={edge.label.length * 5.2 + 12}
                      height="14"
                      rx="7"
                      style={{ fill: "color-mix(in oklab, var(--bg) 92%, var(--panel))" }}
                      stroke={lit ? "var(--accent)" : "var(--border)"}
                      strokeWidth="0.8"
                    />
                    <text
                      x={geometry.side ? edge.label.length * 2.6 + 6 : 0}
                      y="3"
                      textAnchor="middle"
                      fontSize="8"
                      fill={lit ? "var(--fg)" : "var(--muted)"}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {edge.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {flow.nodes.map((node) => {
            const box = boxOf(node);
            const style = KIND[node.kind];
            const isCurrent = node.id === currentId && !hovered;
            const lit = neighbors ? neighbors.has(node.id) : visited.has(node.id);
            const label = node.label.length > 18 ? `${node.label.slice(0, 17)}…` : node.label;
            const sub = node.sub && node.sub.length > 22 ? `${node.sub.slice(0, 21)}…` : node.sub;
            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${box.x}, ${box.y})`}
                opacity={nodeOpacity(node.id)}
                style={{ transition: "opacity 300ms ease", cursor: "pointer" }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {isCurrent ? (
                  <rect
                    x="-4"
                    y="-4"
                    width={NODE_W + 8}
                    height={NODE_H + 8}
                    rx="14"
                    fill="none"
                    stroke={style.color}
                    strokeWidth="1.2"
                  >
                    {!reduceMotion ? (
                      <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
                    ) : null}
                  </rect>
                ) : null}
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="11"
                  strokeWidth={lit ? 1.4 : 1}
                  strokeDasharray={node.kind === "external" ? "4 3" : undefined}
                  style={{
                    fill: `color-mix(in oklab, ${style.color} ${node.kind === "model" ? 16 : 8}%, var(--bg))`,
                    stroke: lit ? style.color : `color-mix(in oklab, ${style.color} 40%, var(--border))`,
                    filter: isCurrent ? `drop-shadow(0 0 10px ${style.color})` : undefined,
                    transition: "stroke 300ms ease",
                  }}
                />
                <rect
                  x="9"
                  y="10"
                  width="28"
                  height="28"
                  rx="8"
                  style={{ fill: `color-mix(in oklab, ${style.color} 18%, transparent)` }}
                />
                <g transform="translate(16, 17)">
                  <Glyph name={node.icon ?? style.icon} color={style.color} />
                </g>
                <text x="45" y={sub ? 21 : 28} fontSize="11" fontWeight="600" fill="var(--fg)">
                  {label}
                </text>
                {sub ? (
                  <text x="45" y="35" fontSize="8.5" fill="var(--muted)">
                    {sub}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-[var(--border)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {flow.scenarios.map((item, index) => (
            <button
              key={`scenario-${item.name}`}
              type="button"
              onClick={() => selectScenario(index)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-medium transition",
                index === scenarioIndex
                  ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-[var(--fg)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {item.name}
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Step {String(stepNumber).padStart(2, "0")} / {String(path.length).padStart(2, "0")}
            {stepNode ? <span className="text-[var(--accent)]"> · {stepNode.label}</span> : null}
          </span>
        </div>
        <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-[var(--muted)]">{scenario?.caption}</p>
      </div>
    </div>
  );
}
