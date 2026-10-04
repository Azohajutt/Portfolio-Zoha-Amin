export type FlowKind = "source" | "process" | "model" | "store" | "external" | "decision" | "output";

export type FlowIcon =
  | "user"
  | "phone"
  | "mic"
  | "db"
  | "doc"
  | "spark"
  | "gear"
  | "branch"
  | "check"
  | "globe"
  | "camera"
  | "image"
  | "chart"
  | "speaker"
  | "calendar"
  | "search"
  | "game"
  | "shield"
  | "wave"
  | "layers"
  | "graph"
  | "code"
  | "bell"
  | "target";

export type FlowNode = {
  id: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  kind: FlowKind;
  icon?: FlowIcon;
};

export type FlowEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

export type FlowScenario = {
  name: string;
  caption: string;
  path: string[];
};

export type ProjectDiagram = {
  engine: string;
  lanes: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  scenarios: FlowScenario[];
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  tier: "flagship" | "range";
  problem: string;
  solution: string;
  impact: string;
  tech: string[];
  coverImage?: string;
  repoUrl?: string;
  demoUrl?: string;
  confidential: boolean;
  diagram: ProjectDiagram;
};

export type Experience = {
  company: string;
  role: string;
  start: string;
  end: string | null;
  location: string;
  highlights: string[];
};

export type SkillGroup = {
  name: string;
  skills: string[];
};

export type Stat = {
  value: string;
  label: string;
};

export type SiteContent = {
  name: string;
  headline: string;
  positioning: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  resumePath: string;
  github: string;
  linkedin: string;
  stats: Stat[];
  experiences: Experience[];
  projects: Project[];
  skillGroups: SkillGroup[];
  education: {
    institution: string;
    degree: string;
    years: string;
    grade: string;
  };
  certifications: { name: string; issuer: string; url?: string }[];
  chatStarters: string[];
  welcomeMessage?: string;
};
