import type { FlowIcon, FlowKind, FlowNode, ProjectDiagram } from "@/types/content";

function n(
  id: string,
  label: string,
  sub: string,
  col: number,
  row: number,
  kind: FlowKind,
  icon?: FlowIcon,
): FlowNode {
  return { id, label, sub, col, row, kind, icon };
}

export const projectDiagrams: Record<string, ProjectDiagram> = {
  "ai-sales-agent": {
    engine: "Real-time voice sales pipeline",
    lanes: ["Lead sources", "Campaign layer", "Real-time voice", "Call intelligence", "Outcomes"],
    nodes: [
      n("crm", "CRM Connectors", "10+ CRMs synced", 0, 0, "store", "db"),
      n("leads", "Lead Lists", "CSV · API import", 0, 1, "source", "doc"),
      n("inbound", "Inbound Calls", "Customer dials in", 0, 2, "source", "phone"),
      n("industry", "Industry Detect", "Classify each lead", 1, 0, "model", "spark"),
      n("campaign", "Campaign Engine", "Scripts · schedules", 1, 1, "process", "layers"),
      n("dialer", "SIP / VoIP Bridge", "7 VoIP providers", 1, 2, "external", "phone"),
      n("persona", "Persona Prompt", "Pitch per industry", 2, 0, "process", "user"),
      n("gemini", "Gemini Live", "Voice-to-voice · VAD", 2, 1, "model", "wave"),
      n("ivr", "IVR / Voicemail", "Detect & branch", 2, 2, "decision", "branch"),
      n("classify", "Outcome Classifier", "Interested · callback", 3, 0.5, "model", "spark"),
      n("transcript", "Transcript + Audio", "Stored per call", 3, 1.5, "store", "doc"),
      n("crmw", "CRM Write-back", "Notes · status", 4, 0, "output", "check"),
      n("meeting", "Meeting Booked", "Calendar invite", 4, 1, "output", "calendar"),
      n("monitor", "Live Monitor", "Calls · analytics", 4, 2, "output", "chart"),
    ],
    edges: [
      { from: "crm", to: "industry" },
      { from: "leads", to: "campaign" },
      { from: "industry", to: "persona" },
      { from: "campaign", to: "persona" },
      { from: "campaign", to: "dialer" },
      { from: "inbound", to: "dialer" },
      { from: "dialer", to: "gemini" },
      { from: "persona", to: "gemini" },
      { from: "dialer", to: "ivr" },
      { from: "ivr", to: "campaign", label: "retry", dashed: true },
      { from: "gemini", to: "classify" },
      { from: "gemini", to: "transcript" },
      { from: "classify", to: "crmw" },
      { from: "classify", to: "meeting" },
      { from: "transcript", to: "monitor" },
    ],
    scenarios: [
      {
        name: "Outbound pitch",
        caption:
          "A synced lead is classified by industry, the campaign picks the matching persona, and Gemini Live runs the call over SIP until a meeting is booked and logged.",
        path: ["crm", "industry", "leads", "campaign", "persona", "dialer", "gemini", "classify", "meeting", "crmw"],
      },
      {
        name: "Voicemail / IVR",
        caption:
          "Answering machines and IVR menus are detected before the pitch starts, and the lead is pushed back into the campaign for a retry.",
        path: ["leads", "campaign", "dialer", "ivr"],
      },
      {
        name: "Inbound call",
        caption:
          "Inbound callers reach the same voice core; every call is transcribed, visible on the live monitor, classified, and written back to the CRM.",
        path: ["inbound", "dialer", "persona", "gemini", "transcript", "monitor", "classify", "crmw"],
      },
    ],
  },

  "ai-recruitment-agent": {
    engine: "Autonomous screening pipeline",
    lanes: ["Sources", "Understanding", "Matching", "Voice screening", "Pipeline"],
    nodes: [
      n("ats", "ATS Systems", "Multi-ATS sync", 0, 0, "external", "layers"),
      n("uploads", "Resume Upload", "PDF · DOCX", 0, 1, "source", "doc"),
      n("role", "Role Brief", "Recruiter input", 0, 2, "source", "user"),
      n("parser", "CV Parser", "Structured profiles", 1, 0.5, "process", "doc"),
      n("jdgen", "JD Generator", "Tailored description", 1, 2, "model", "spark"),
      n("match", "CV ↔ JD Matching", "Semantic + keyword", 2, 1, "model", "search"),
      n("gate", "Shortlist Gate", "Score threshold", 3, 0, "decision", "branch"),
      n("call", "AI Phone Screen", "Gemini Live · VoIP", 3, 1, "model", "phone"),
      n("tech", "Technical Round", "Light Q&A", 3, 2, "process", "code"),
      n("crm", "ATS / CRM Sync", "Status write-back", 4, 0, "output", "layers"),
      n("score", "Eval Scorecard", "Transcript + rubric", 4, 1, "output", "chart"),
      n("next", "Next Stage", "Recruiter interview", 4, 2, "output", "check"),
    ],
    edges: [
      { from: "ats", to: "parser" },
      { from: "uploads", to: "parser" },
      { from: "role", to: "jdgen" },
      { from: "parser", to: "match" },
      { from: "jdgen", to: "match", label: "JD" },
      { from: "match", to: "gate" },
      { from: "gate", to: "call", label: "pass" },
      { from: "gate", to: "crm", label: "pool", dashed: true },
      { from: "call", to: "tech" },
      { from: "call", to: "score" },
      { from: "tech", to: "score" },
      { from: "score", to: "next" },
      { from: "score", to: "crm" },
    ],
    scenarios: [
      {
        name: "Resume to shortlist",
        caption:
          "Resumes are pulled from ATS systems and uploads, parsed into structured profiles, and matched against an AI-generated job description.",
        path: ["ats", "uploads", "parser", "role", "jdgen", "match", "gate"],
      },
      {
        name: "AI phone screen",
        caption:
          "Shortlisted candidates get a real phone call — screening plus a light technical round — and leave a scored transcript for the recruiter.",
        path: ["gate", "call", "tech", "score", "next"],
      },
      {
        name: "Pipeline sync",
        caption:
          "Every decision syncs back: below-threshold candidates join the talent pool, and scorecards update the ATS / CRM automatically.",
        path: ["match", "gate", "crm", "call", "score"],
      },
    ],
  },

  jobsshopper: {
    engine: "Two-sided hiring marketplace",
    lanes: ["Users", "Create", "Marketplace", "Hiring desk", "Decision"],
    nodes: [
      n("recruiter", "Recruiter", "Company account", 0, 0, "source", "user"),
      n("candidate", "Candidate", "Job seeker", 0, 2, "source", "user"),
      n("post", "Post a Job", "Role · requirements", 1, 0, "process", "doc"),
      n("profile", "Profile + Resume", "Upload CV", 1, 2, "process", "doc"),
      n("listings", "Job Board", "Live listings", 2, 0, "store", "layers"),
      n("search", "Search & Apply", "Filter · one-click", 2, 2, "process", "search"),
      n("review", "Review Applicants", "Resumes per role", 3, 0, "process", "search"),
      n("apps", "Applications", "Per-job inbox", 3, 1, "store", "db"),
      n("shortlist", "Shortlist", "Recruiter picks", 4, 0, "decision", "branch"),
      n("select", "Final Selection", "Hire made", 4, 1, "output", "check"),
      n("notify", "Candidate Update", "Status notified", 4, 2, "output", "bell"),
    ],
    edges: [
      { from: "recruiter", to: "post" },
      { from: "candidate", to: "profile" },
      { from: "post", to: "listings", label: "publish" },
      { from: "listings", to: "search", label: "discover" },
      { from: "profile", to: "search" },
      { from: "search", to: "apps", label: "apply" },
      { from: "apps", to: "review" },
      { from: "review", to: "shortlist" },
      { from: "shortlist", to: "select" },
      { from: "select", to: "notify" },
    ],
    scenarios: [
      {
        name: "Recruiter posts a role",
        caption: "Recruiters create a role with its requirements and publish it straight to the live job board.",
        path: ["recruiter", "post", "listings"],
      },
      {
        name: "Candidate applies",
        caption:
          "Candidates build a profile with their resume, discover roles on the board, and apply — landing in that job's application inbox.",
        path: ["candidate", "profile", "listings", "search", "apps"],
      },
      {
        name: "Review to hire",
        caption:
          "Recruiters review applicants per role, shortlist, make the final selection, and the candidate is notified of the outcome.",
        path: ["apps", "review", "shortlist", "select", "notify"],
      },
    ],
  },

  cortality: {
    engine: "Calibration-based gaze tracking",
    lanes: ["Capture", "Alignment", "Calibration", "Inference", "Clinical output"],
    nodes: [
      n("cam", "Webcam Feed", "Face + eye video", 0, 0.5, "source", "camera"),
      n("patient", "Patient Session", "Clinical protocol", 0, 2, "source", "user"),
      n("face", "Face Landmarks", "Eye-region crop", 1, 0, "process", "search"),
      n("pose", "Distance / Pose", "Quality gate", 1, 1, "decision", "branch"),
      n("screen", "Stimulus Targets", "On-screen points", 1, 2, "process", "target"),
      n("calib", "Calibration Map", "Per-user mapping", 2, 1, "model", "spark"),
      n("model", "Gaze Estimator", "Eye features → x,y", 3, 0.5, "model", "target"),
      n("quality", "Accuracy Check", "Error vs targets", 3, 1.75, "decision", "branch"),
      n("gaze", "Gaze Coordinates", "Real-time x,y", 4, 0, "output", "target"),
      n("stream", "Clinical Stream", "Research-ready", 4, 1, "output", "chart"),
      n("report", "Metrics Export", "Session report", 4, 2, "output", "doc"),
    ],
    edges: [
      { from: "cam", to: "face" },
      { from: "face", to: "pose" },
      { from: "pose", to: "cam", label: "adjust", dashed: true },
      { from: "pose", to: "calib", label: "ok" },
      { from: "patient", to: "screen" },
      { from: "screen", to: "calib", label: "targets" },
      { from: "calib", to: "model" },
      { from: "model", to: "quality" },
      { from: "quality", to: "calib", label: "redo", dashed: true },
      { from: "model", to: "gaze" },
      { from: "quality", to: "stream" },
      { from: "stream", to: "report" },
    ],
    scenarios: [
      {
        name: "Setup & alignment",
        caption:
          "Face landmarks are located and distance / pose is checked; the patient is asked to adjust until the frame is clinically usable.",
        path: ["cam", "face", "pose"],
      },
      {
        name: "Calibration",
        caption:
          "The patient follows on-screen targets to build a per-user calibration map; if the accuracy check fails, calibration is repeated.",
        path: ["patient", "screen", "pose", "calib", "model", "quality"],
      },
      {
        name: "Clinical tracking",
        caption:
          "The calibrated estimator streams real-time gaze coordinates into a research-ready clinical stream and exports session metrics.",
        path: ["calib", "model", "gaze", "quality", "stream", "report"],
      },
    ],
  },

  "medical-consultation-agent": {
    engine: "Private voice RAG consultation",
    lanes: ["Patient", "Local speech", "Retrieval", "Reasoning", "Response"],
    nodes: [
      n("mic", "Patient Voice", "Live microphone", 0, 0.5, "source", "mic"),
      n("stt", "Whisper STT", "Runs locally", 1, 0.5, "model", "wave"),
      n("embed", "Query Embedding", "Semantic vector", 2, 0, "process", "spark"),
      n("vdb", "Medical Vector DB", "Proprietary data", 2, 1, "store", "db"),
      n("history", "Session Memory", "Prior symptoms", 2, 2, "store", "db"),
      n("agent", "Consultation LLM", "Grounded answer", 3, 0.5, "model", "spark"),
      n("guard", "Safety Guard", "Red-flag check", 3, 1.75, "decision", "shield"),
      n("tts", "Kokoro TTS", "Local voice reply", 4, 0, "output", "speaker"),
      n("notes", "Consult Summary", "Notes for review", 4, 1, "output", "doc"),
      n("refer", "Doctor Referral", "Escalate urgent", 4, 2, "output", "user"),
    ],
    edges: [
      { from: "mic", to: "stt" },
      { from: "stt", to: "embed", label: "text" },
      { from: "embed", to: "vdb" },
      { from: "vdb", to: "agent", label: "context" },
      { from: "history", to: "agent" },
      { from: "agent", to: "guard" },
      { from: "guard", to: "tts", label: "safe" },
      { from: "guard", to: "refer", label: "urgent" },
      { from: "agent", to: "notes" },
      { from: "tts", to: "mic", label: "next turn", dashed: true },
    ],
    scenarios: [
      {
        name: "Patient speaks",
        caption:
          "Speech is transcribed locally by Whisper, embedded, and matched against the private medical knowledge base plus session memory.",
        path: ["mic", "stt", "embed", "vdb", "history", "agent"],
      },
      {
        name: "Safe spoken reply",
        caption:
          "The grounded answer passes a safety guard, is spoken back with local Kokoro TTS, and the conversation continues to the next turn.",
        path: ["agent", "guard", "tts", "notes", "mic"],
      },
      {
        name: "Escalation",
        caption: "Red-flag symptoms bypass the normal reply and are escalated to a doctor referral with a consult summary.",
        path: ["agent", "guard", "refer", "notes"],
      },
    ],
  },

  "facial-expression-recognition": {
    engine: "Real-time emotion recognition",
    lanes: ["Input", "Face detection", "Preprocess", "Classification", "Output"],
    nodes: [
      n("webcam", "Live Webcam", "Real-time video", 0, 0, "source", "camera"),
      n("upload", "Image Upload", "Single photo", 0, 1, "source", "image"),
      n("group", "Group Photo", "Many faces", 0, 2, "source", "user"),
      n("mtcnn", "MTCNN Detector", "Primary face finder", 1, 0.5, "model", "search"),
      n("haar", "Haar Cascade", "Fallback detector", 1, 1.75, "process", "search"),
      n("crop", "Face Crops", "Aligned · resized", 2, 1, "process", "image"),
      n("resnet", "ResNet-18", "RAF-DB transfer", 3, 0.5, "model", "spark"),
      n("softmax", "Softmax Head", "7 emotion classes", 3, 1.75, "process", "chart"),
      n("label", "Emotion Label", "Happy · sad · …", 4, 0, "output", "check"),
      n("conf", "Confidence", "Per-class score", 4, 1, "output", "chart"),
      n("annot", "Annotated Frame", "Box per face", 4, 2, "output", "image"),
    ],
    edges: [
      { from: "webcam", to: "mtcnn" },
      { from: "upload", to: "mtcnn" },
      { from: "group", to: "mtcnn" },
      { from: "mtcnn", to: "haar", label: "no face", dashed: true },
      { from: "mtcnn", to: "crop" },
      { from: "haar", to: "crop" },
      { from: "crop", to: "resnet" },
      { from: "resnet", to: "softmax" },
      { from: "softmax", to: "label" },
      { from: "softmax", to: "conf" },
      { from: "softmax", to: "annot" },
    ],
    scenarios: [
      {
        name: "Live video",
        caption:
          "Webcam frames go through MTCNN, aligned face crops are classified by a ResNet-18 fine-tuned on RAF-DB, and the emotion is shown with its confidence.",
        path: ["webcam", "mtcnn", "crop", "resnet", "softmax", "label", "conf"],
      },
      {
        name: "Detector fallback",
        caption: "When MTCNN misses a face, the Haar Cascade fallback takes over so the frame still reaches the classifier.",
        path: ["upload", "mtcnn", "haar", "crop", "resnet"],
      },
      {
        name: "Group photo",
        caption: "Every face in a group photo is detected and classified separately, then drawn as a labelled box on the annotated frame.",
        path: ["group", "mtcnn", "crop", "resnet", "softmax", "annot", "label"],
      },
    ],
  },

  "financial-advisory-assistant": {
    engine: "Conversational finance assistant",
    lanes: ["User", "Context", "Orchestration", "LLM", "Advice"],
    nodes: [
      n("query", "User Question", "Budget · invest", 0, 0.5, "source", "user"),
      n("profile", "Goals & Income", "Shared in chat", 0, 1.75, "source", "chart"),
      n("memory", "Chat Memory", "Session context", 1, 0.5, "store", "db"),
      n("router", "Topic Router", "Budget vs invest", 1, 1.75, "decision", "branch"),
      n("prompt", "Domain Prompt", "Finance guardrails", 2, 0, "process", "shield"),
      n("chain", "LangChain Chain", "Prompt + memory", 2, 1, "process", "layers"),
      n("llm", "Llama 3.3 70B", "Served via Groq", 3, 1, "model", "spark"),
      n("budget", "Budget Plan", "Spend · save split", 4, 0, "output", "chart"),
      n("invest", "Invest Insight", "Risk-aware ideas", 4, 1, "output", "chart"),
      n("reply", "Follow-up Turn", "Clarifying question", 4, 2, "output", "check"),
    ],
    edges: [
      { from: "query", to: "memory" },
      { from: "query", to: "router" },
      { from: "profile", to: "memory" },
      { from: "memory", to: "chain", label: "history" },
      { from: "router", to: "prompt" },
      { from: "prompt", to: "chain" },
      { from: "chain", to: "llm" },
      { from: "llm", to: "budget" },
      { from: "llm", to: "invest" },
      { from: "llm", to: "reply" },
      { from: "reply", to: "memory", label: "saved", dashed: true },
    ],
    scenarios: [
      {
        name: "Budget question",
        caption:
          "A budgeting question is routed to the finance prompt, assembled by LangChain, and answered by Llama 3.3 70B on Groq as a concrete budget plan.",
        path: ["query", "router", "prompt", "chain", "llm", "budget"],
      },
      {
        name: "Investment question",
        caption: "Investment questions reuse the conversation memory so the advice reflects what the user already shared.",
        path: ["query", "memory", "router", "prompt", "chain", "llm", "invest"],
      },
      {
        name: "Multi-turn memory",
        caption: "Goals and income shared earlier stay in session memory; every follow-up turn is saved back for the next answer.",
        path: ["profile", "memory", "chain", "llm", "reply"],
      },
    ],
  },

  "agentic-travel-booking-assistant": {
    engine: "LangGraph booking agent",
    lanes: ["Intent", "Agent graph", "Tools", "Reasoning", "Result"],
    nodes: [
      n("user", "Travel Request", "Natural language", 0, 0.5, "source", "user"),
      n("prefs", "Preferences", "Dates · budget", 0, 1.75, "source", "calendar"),
      n("planner", "LangGraph Agent", "Multi-step reasoning", 1, 0.5, "model", "graph"),
      n("state", "Graph State", "Shared memory", 1, 1.75, "store", "db"),
      n("rec", "Destination Tool", "Recommend places", 2, 0, "process", "globe"),
      n("flights", "Flight Search", "External API", 2, 1, "external", "globe"),
      n("rank", "Rank Options", "Fare · fit score", 3, 0.5, "process", "chart"),
      n("confirm", "User Confirms?", "Human-in-the-loop", 3, 1.75, "decision", "branch"),
      n("itinerary", "Trip Plan", "Destinations + days", 4, 0.5, "output", "calendar"),
      n("ticket", "Booked Flight", "Booking API", 4, 1.75, "output", "check"),
    ],
    edges: [
      { from: "user", to: "planner" },
      { from: "prefs", to: "planner" },
      { from: "planner", to: "state" },
      { from: "planner", to: "rec", label: "tool" },
      { from: "planner", to: "flights", label: "tool" },
      { from: "rec", to: "rank" },
      { from: "flights", to: "rank" },
      { from: "rank", to: "itinerary" },
      { from: "rank", to: "confirm" },
      { from: "confirm", to: "ticket", label: "book" },
      { from: "confirm", to: "planner", label: "revise", dashed: true },
    ],
    scenarios: [
      {
        name: "Plan the trip",
        caption:
          "The LangGraph agent reads the request and preferences into graph state, calls the destination tool, and ranks options into a trip plan.",
        path: ["user", "prefs", "planner", "state", "rec", "rank", "itinerary"],
      },
      {
        name: "Book a flight",
        caption: "Flight search results are ranked by fare and fit; once the user confirms, the booking API completes the reservation.",
        path: ["planner", "flights", "rank", "confirm", "ticket"],
      },
      {
        name: "Revise the plan",
        caption: "If the user rejects the options, control loops back to the agent, which re-plans with the updated constraints.",
        path: ["rank", "confirm", "planner", "rec"],
      },
    ],
  },

  "employee-attrition-predictor": {
    engine: "Explainable attrition ML",
    lanes: ["Data", "Preparation", "Training", "Prediction", "HR insight"],
    nodes: [
      n("raw", "IBM HR Dataset", "Features + labels", 0, 0.5, "store", "db"),
      n("employee", "Employee Record", "New prediction", 0, 1.75, "source", "user"),
      n("clean", "Clean + Encode", "Feature prep", 1, 0.5, "process", "layers"),
      n("split", "Train/Test Split", "Holdout set", 1, 1.75, "process", "gear"),
      n("smote", "SMOTE", "Balance minority", 2, 0, "process", "gear"),
      n("rf", "Random Forest", "Ensemble model", 2, 1, "model", "spark"),
      n("eval", "Evaluation", "Precision · recall", 2, 2, "decision", "chart"),
      n("risk", "Attrition Risk", "Leave likelihood", 3, 0, "output", "chart"),
      n("shap", "SHAP Explainer", "Per-prediction", 3, 1.5, "model", "spark"),
      n("drivers", "Top Drivers", "Overtime · stock", 4, 1, "output", "chart"),
      n("hr", "HR Action", "Retention focus", 4, 2, "output", "check"),
    ],
    edges: [
      { from: "raw", to: "clean" },
      { from: "employee", to: "clean" },
      { from: "clean", to: "split" },
      { from: "clean", to: "rf", label: "infer", dashed: true },
      { from: "split", to: "smote", label: "train" },
      { from: "split", to: "eval", label: "test" },
      { from: "smote", to: "rf" },
      { from: "rf", to: "eval" },
      { from: "rf", to: "risk" },
      { from: "rf", to: "shap" },
      { from: "shap", to: "drivers" },
      { from: "drivers", to: "hr" },
      { from: "risk", to: "hr" },
    ],
    scenarios: [
      {
        name: "Train the model",
        caption:
          "IBM HR data is cleaned and encoded, split into train / test, balanced with SMOTE, and used to train a Random Forest evaluated on the holdout set.",
        path: ["raw", "clean", "split", "smote", "rf", "eval"],
      },
      {
        name: "Predict risk",
        caption: "A new employee record is encoded the same way and scored by the trained forest to produce an attrition risk for HR.",
        path: ["employee", "clean", "rf", "risk", "hr"],
      },
      {
        name: "Explain the why",
        caption:
          "SHAP explains each prediction, surfacing drivers like overtime, stock option level, and job satisfaction for retention action.",
        path: ["rf", "shap", "drivers", "hr"],
      },
    ],
  },

  "research-paper-analyzer": {
    engine: "Multi-paper research RAG",
    lanes: ["Upload", "Ingestion", "Vector index", "Retrieval + LLM", "Outputs"],
    nodes: [
      n("pdfs", "PDF Papers", "One or many", 0, 0.5, "source", "doc"),
      n("extract", "PyMuPDF Extract", "Text per page", 1, 0, "process", "doc"),
      n("chunk", "Overlap Chunking", "Context windows", 1, 1, "process", "layers"),
      n("query", "Research Query", "Ask · compare", 1, 2, "source", "search"),
      n("embed", "MiniLM Embedder", "all-MiniLM-L6-v2", 2, 0.5, "model", "spark"),
      n("faiss", "FAISS Index", "Vector search", 2, 1.75, "store", "db"),
      n("retrieve", "Top-k Retrieval", "Relevant chunks", 3, 0.5, "process", "search"),
      n("llm", "Llama 3.3 70B", "Served via Groq", 3, 1.75, "model", "spark"),
      n("summary", "Summaries", "Per paper", 4, 0, "output", "doc"),
      n("compare", "Comparison Table", "Side by side", 4, 1, "output", "layers"),
      n("ideas", "Research Ideas", "8 gap-bridging", 4, 2, "output", "spark"),
    ],
    edges: [
      { from: "pdfs", to: "extract" },
      { from: "extract", to: "chunk" },
      { from: "chunk", to: "embed" },
      { from: "query", to: "embed" },
      { from: "embed", to: "faiss", label: "index" },
      { from: "faiss", to: "retrieve" },
      { from: "retrieve", to: "llm", label: "context" },
      { from: "llm", to: "summary" },
      { from: "llm", to: "compare" },
      { from: "llm", to: "ideas" },
    ],
    scenarios: [
      {
        name: "Ingest papers",
        caption: "PDFs are extracted with PyMuPDF, split into overlapping chunks, embedded with MiniLM, and stored in a FAISS index.",
        path: ["pdfs", "extract", "chunk", "embed", "faiss"],
      },
      {
        name: "Ask a question",
        caption: "The research query is embedded, the most relevant chunks are retrieved, and Llama 3.3 70B writes a grounded summary.",
        path: ["query", "embed", "faiss", "retrieve", "llm", "summary"],
      },
      {
        name: "Compare & ideate",
        caption: "Across papers, the LLM builds a side-by-side comparison table and proposes eight gap-bridging research directions.",
        path: ["faiss", "retrieve", "llm", "compare", "ideas"],
      },
    ],
  },

  "skin-disease-classifier": {
    engine: "Dermatology image classifier",
    lanes: ["Data", "Preprocess", "Model", "Head", "Conditions"],
    nodes: [
      n("kaggle", "Kaggle Dataset", "Labelled images", 0, 0.5, "store", "db"),
      n("photo", "User Photo", "Skin close-up", 0, 2.5, "source", "camera"),
      n("aug", "Augmentation", "Flip · rotate · zoom", 1, 0.5, "process", "layers"),
      n("prep", "Resize / Normalize", "Model input", 1, 2.5, "process", "image"),
      n("cnn", "CNN Classifier", "Transfer learning", 2, 1.5, "model", "spark"),
      n("val", "Validation", "Held-out accuracy", 3, 0, "decision", "chart"),
      n("softmax", "Softmax Head", "4-class probs", 3, 1.5, "process", "chart"),
      n("acne", "Acne", "Predicted class", 4, 0, "output", "check"),
      n("eczema", "Eczema", "Predicted class", 4, 1, "output", "check"),
      n("rosacea", "Rosacea", "Predicted class", 4, 2, "output", "check"),
      n("vitiligo", "Vitiligo", "Predicted class", 4, 3, "output", "check"),
    ],
    edges: [
      { from: "kaggle", to: "aug" },
      { from: "aug", to: "cnn", label: "train" },
      { from: "photo", to: "prep" },
      { from: "prep", to: "cnn", label: "infer" },
      { from: "cnn", to: "val" },
      { from: "cnn", to: "softmax" },
      { from: "softmax", to: "acne" },
      { from: "softmax", to: "eczema" },
      { from: "softmax", to: "rosacea" },
      { from: "softmax", to: "vitiligo" },
    ],
    scenarios: [
      {
        name: "Training",
        caption: "Kaggle skin images are augmented and used to fine-tune the CNN, which is validated on held-out images.",
        path: ["kaggle", "aug", "cnn", "val"],
      },
      {
        name: "Predict: eczema",
        caption: "A user photo is resized and normalized, passed through the CNN, and the softmax head picks the most likely condition.",
        path: ["photo", "prep", "cnn", "softmax", "eczema"],
      },
      {
        name: "Predict: vitiligo",
        caption: "The same inference path separates visually similar conditions across all four classes.",
        path: ["photo", "prep", "cnn", "softmax", "vitiligo"],
      },
    ],
  },

  "game-intelligence-system": {
    engine: "Reinforcement-learning NPC loop",
    lanes: ["Game world", "Perception", "Policy", "Decision", "NPC output"],
    nodes: [
      n("player", "Player Input", "Moves · actions", 0, 0, "source", "game"),
      n("env", "Unity World", "Physics · puzzles", 0, 1.5, "external", "game"),
      n("obs", "Observation", "State vector", 1, 0.5, "process", "layers"),
      n("reward", "Reward Signal", "Outcome feedback", 1, 1.75, "process", "chart"),
      n("policy", "RL Policy", "Context-aware", 2, 0.5, "model", "spark"),
      n("learn", "Policy Update", "Training loop", 2, 1.75, "process", "gear"),
      n("act", "Action Select", "Best next move", 3, 0.5, "decision", "branch"),
      n("npc", "NPC Behaviour", "Executed in Unity", 4, 0, "output", "game"),
      n("adapt", "Adaptive Play", "Difficulty tuning", 4, 1, "output", "chart"),
    ],
    edges: [
      { from: "player", to: "obs" },
      { from: "env", to: "obs" },
      { from: "env", to: "reward" },
      { from: "obs", to: "policy" },
      { from: "reward", to: "learn" },
      { from: "learn", to: "policy" },
      { from: "policy", to: "act" },
      { from: "act", to: "npc" },
      { from: "act", to: "adapt" },
      { from: "npc", to: "env", label: "acts in world", dashed: true },
    ],
    scenarios: [
      {
        name: "Perceive & decide",
        caption: "Player actions and world state become an observation; the RL policy picks the best next move for the NPC.",
        path: ["player", "obs", "policy", "act", "npc"],
      },
      {
        name: "Learn from reward",
        caption: "Outcomes in the Unity world produce a reward signal that updates the policy in a continuous training loop.",
        path: ["env", "reward", "learn", "policy"],
      },
      {
        name: "Adapt the world",
        caption: "NPC actions change the world and tune difficulty, which feeds straight back into the next observation.",
        path: ["act", "adapt", "npc", "env", "obs"],
      },
    ],
  },
};
