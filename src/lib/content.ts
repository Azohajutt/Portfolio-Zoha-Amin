import { projectDiagrams } from "@/lib/project-diagrams";
import type { SiteContent } from "@/types/content";

export const siteContent: SiteContent = {
  name: "Zoha Amin",
  headline: "AI Engineer | Voice AI & Agentic Systems | RAG | Computer Vision",
  positioning: "I build AI agents that hold real conversations — on the phone, at scale.",
  summary:
    "AI engineer with 2.5 years of experience building production AI systems: voice and calling agents, retrieval-augmented knowledge platforms, and computer-vision pipelines for healthcare. Comfortable owning a project end to end, from model selection and agent architecture through backend APIs and deployment. Recent work at 7 Kings Code includes a multilingual sales calling agent, an AI recruitment platform, and a gaze-tracking system built with an international healthcare research team.",
  location: "Lahore, Pakistan",
  email: "azoha6966@gmail.com",
  phone: "+92 304 9320060",
  avatar: "/images/zoha.jpg",
  resumePath: "/resume/Zoha_Amin_AI_Engineer_Resume.pdf",
  github: "https://github.com/Azohajutt",
  linkedin: "https://www.linkedin.com/in/zoha-amin/",
  stats: [
    { value: "50+", label: "Languages" },
    { value: "100+", label: "Calls / day" },
    { value: "10+", label: "CRM integrations" },
    { value: "7", label: "VoIP providers" },
  ],
  experiences: [
    {
      company: "7 Kings Code",
      role: "AI Engineer",
      start: "Sep 2025",
      end: null,
      location: "Lahore, Pakistan",
      highlights: [
        "Built a sales cold calling agent supporting 50+ languages across outbound and inbound calling, handling 100+ calls per day, and integrating with 10+ CRM platforms and 7 VoIP providers; identifies each lead's industry, lets users configure campaigns and AI pitch scripts, and logs call outcomes back into the CRM automatically. Offered to clients as tiered service plans.",
        "Built a conversational recruitment calling agent integrated with 5+ CRMs and the same VoIP providers, calling candidates for screening and light technical interviews; pulls resumes from multiple applicant tracking systems, generates a tailored job description, matches CVs against it, and advances shortlisted candidates to the next stage.",
        "Partnered with an international research team to align Cortality, a gaze-tracking system, with real-world clinical and healthcare requirements.",
        "Directed Jobsshopper, an end-to-end hiring platform where recruiters post jobs, candidates apply with their resumes, and recruiters review applicants and select the right talent, taking hiring from job posting to final selection in one place.",
      ],
    },
    {
      company: "SabaSoft Games Studio",
      role: "AI Engineer",
      start: "Dec 2024",
      end: "Sep 2025",
      location: "Lahore, Pakistan",
      highlights: [
        "AI-Driven Game Intelligence System: Designed a system that lets NPCs make context-aware decisions, adapt to changing gameplay environments, and respond dynamically to player interactions. Technologies: Python, Reinforcement Learning, Unity, Machine Learning.",
        "Predictive Player Analytics & Personalized Gaming Experience Engine: Developed a machine learning solution that analyses player behaviour, identifies gameplay patterns, predicts player engagement, and supports personalized gaming experiences. Technologies: Python, Scikit-learn, Pandas.",
      ],
    },
    {
      company: "Devticks",
      role: "Junior AI Engineer",
      start: "Jun 2024",
      end: "Dec 2024",
      location: "Bahawalpur, Pakistan",
      highlights: [
        "Built a RAG chatbot that answers user questions from a continuously updated knowledge base rather than a fixed set of documents.",
        "Built a deep learning image classification model for skin disease detection, trained on Kaggle skin images to classify four conditions: acne, eczema, rosacea, and vitiligo.",
      ],
    },
  ],
  projects: [
    {
      slug: "ai-sales-agent",
      title: "AI Sales Agent",
      tagline: "Multilingual cold-calling agent for outbound and inbound sales.",
      tier: "flagship",
      problem:
        "Sales teams struggle to run high-volume outbound and inbound calling across languages, CRMs, and VoIP stacks without losing lead context or call outcomes.",
      solution:
        "A voice-to-voice sales agent on Gemini Live that identifies each lead's industry, runs configurable campaigns and AI pitch scripts, handles 100+ calls/day in 50+ languages, and writes outcomes back to the CRM automatically. Integrates with 10+ CRMs and 7 VoIP providers; sold as tiered service plans.",
      impact:
        "Gives sales teams a production calling layer that scales conversations without rewriting campaign logic for every CRM or language.",
      tech: ["Gemini Live", "Voice AI", "CRM Integrations", "VoIP", "LangChain", "FastAPI"],
      demoUrl: "https://aisaleagent.com/",
      confidential: false,
      diagram: projectDiagrams["ai-sales-agent"],
    },
    {
      slug: "ai-recruitment-agent",
      title: "AI Recruitment Agent",
      tagline: "Conversational phone screening with CRM and ATS integrations.",
      tier: "flagship",
      problem:
        "Recruiters spend hours on first-round screens and resume triage before a human interview ever happens.",
      solution:
        "A conversational recruitment calling agent integrated with 5+ CRMs and the same VoIP providers. It pulls resumes from multiple ATS systems, generates a tailored job description, matches CVs, calls candidates for screening and light technical interviews, and advances shortlisted candidates.",
      impact:
        "Automates the first screening round so recruiters focus on shortlisted, phone-qualified candidates.",
      tech: ["Gemini Live", "ATS Sync", "CV Matching", "Voice Interviews", "CRM", "FastAPI"],
      demoUrl: "https://dev.airecruitmentagent.com/",
      confidential: false,
      diagram: projectDiagrams["ai-recruitment-agent"],
    },
    {
      slug: "jobsshopper",
      title: "Jobsshopper",
      tagline: "End-to-end hiring from job posting to final selection.",
      tier: "flagship",
      problem:
        "Hiring is often split across tools for posting jobs, collecting resumes, reviewing applicants, and making a final selection.",
      solution:
        "Directed Jobsshopper, an end-to-end hiring platform where recruiters post jobs, candidates apply with their resumes, and recruiters review applicants and select the right talent, taking hiring from job posting to final selection in one place.",
      impact:
        "Gives recruiters and candidates one place to move from open roles to hired talent.",
      tech: ["Job Posting", "Resume Applications", "Applicant Review", "Hiring Workflow"],
      demoUrl: "https://jobsshopper.com/",
      confidential: false,
      diagram: projectDiagrams["jobsshopper"],
    },
    {
      slug: "cortality",
      title: "Cortality Gaze Tracking",
      tagline: "Calibration-based gaze tracking for clinical healthcare use.",
      tier: "range",
      problem:
        "Clinical and healthcare teams need gaze-tracking systems that align with real-world research and care requirements, not lab-only demos.",
      solution:
        "Worked with an international research team as an AI engineer to align Cortality's calibration-based gaze-tracking system with clinical and healthcare requirements.",
      impact:
        "Bridges research-grade gaze tracking with practical healthcare constraints through calibration-focused engineering.",
      tech: ["Gaze Tracking", "Calibration", "Computer Vision", "Healthcare AI"],
      demoUrl: "https://cortality.com/",
      coverImage: "/images/gaze-eyes.jpg",
      confidential: false,
      diagram: projectDiagrams["cortality"],
    },
    {
      slug: "medical-consultation-agent",
      title: "Medical Consultation Agent",
      tagline: "Voice medical agent with local STT/TTS and healthcare RAG.",
      tier: "range",
      problem:
        "Healthcare consultations need private, real-time voice interaction grounded in trusted medical knowledge rather than open-ended chat.",
      solution:
        "Built a voice-based medical consultation agent using retrieval-augmented generation trained on proprietary healthcare data, with local Whisper speech-to-text and Kokoro text-to-speech for secure, real-time consultations.",
      impact:
        "Enables secure, real-time voice consultations grounded in proprietary healthcare data.",
      tech: ["Whisper", "Kokoro", "RAG", "Healthcare AI", "Voice AI"],
      repoUrl: "https://github.com/Azohajutt/Voice-Medical-Chatbot",
      confidential: false,
      diagram: projectDiagrams["medical-consultation-agent"],
    },
    {
      slug: "facial-expression-recognition",
      title: "Facial Expression Recognition",
      tagline: "Real-time video emotion classification across seven classes.",
      tier: "range",
      problem:
        "Applications need reliable emotion labels from live or uploaded faces, including group photos.",
      solution:
        "A real-time computer vision system that detects faces with MTCNN (Haar Cascade fallback) and classifies seven emotion classes using ResNet-18 transfer learning trained on RAF-DB, reaching 80% accuracy.",
      impact:
        "Delivers annotated multi-face emotion detection with confidence scores in a Flask/Docker app.",
      tech: ["ResNet-18", "MTCNN", "PyTorch", "Flask", "Docker", "RAF-DB"],
      repoUrl: "https://github.com/Azohajutt/Facial-Expression-Recognition",
      confidential: false,
      diagram: projectDiagrams["facial-expression-recognition"],
    },
    {
      slug: "financial-advisory-assistant",
      title: "Financial Advisory Assistant",
      tagline: "Retrieval-based budgeting and investment guidance.",
      tier: "range",
      problem:
        "People need clear budgeting and investment explanations without losing conversation context.",
      solution:
        "A conversational assistant that gives personalized budgeting guidance and investment insights through retrieval-based dialogue, orchestrated with LangChain and Llama 3.3 70B via Groq.",
      impact:
        "Delivers concise, session-aware financial guidance for savings, budgeting, and investment questions.",
      tech: ["LangChain", "Llama 3.3 70B", "Groq", "Conversation Memory"],
      repoUrl: "https://github.com/Azohajutt/Financial-Chatbot",
      confidential: false,
      diagram: projectDiagrams["financial-advisory-assistant"],
    },
    {
      slug: "agentic-travel-booking-assistant",
      title: "Agentic Travel Booking Assistant",
      tagline: "LangGraph agent for destination recommendations and flight booking.",
      tier: "range",
      problem:
        "Travel planning and booking usually require jumping between recommendation tools and separate booking flows.",
      solution:
        "Built an agentic AI system with LangGraph that recommends travel destinations and completes flight bookings through multi-step reasoning and API orchestration.",
      impact:
        "Turns travel intent into destination recommendations and booked flights in one agentic workflow.",
      tech: ["LangGraph", "Agentic AI", "API Orchestration", "Multi-step Reasoning"],
      confidential: false,
      diagram: projectDiagrams["agentic-travel-booking-assistant"],
    },
    {
      slug: "employee-attrition-predictor",
      title: "Employee Attrition Predictor",
      tagline: "IBM HR Analytics model with imbalance handling and explanations.",
      tier: "range",
      problem:
        "HR teams need to predict who may leave and understand why, despite imbalanced attrition labels.",
      solution:
        "A Random Forest pipeline on IBM HR Analytics data using SMOTE for imbalance handling and SHAP values to explain the factors behind each prediction.",
      impact:
        "Surfaces attrition risk with ranked drivers such as stock option level, job satisfaction, involvement, environment satisfaction, and overtime.",
      tech: ["Scikit-learn", "SMOTE", "SHAP", "Pandas", "Random Forest"],
      repoUrl: "https://github.com/Azohajutt/Employee-Attrition-Predictor",
      confidential: false,
      diagram: projectDiagrams["employee-attrition-predictor"],
    },
    {
      slug: "research-paper-analyzer",
      title: "Research Paper Analyzer",
      tagline: "Multi-PDF summarization, comparison, and idea generation with RAG.",
      tier: "range",
      problem:
        "Researchers need to summarize and compare multiple papers quickly without losing fidelity.",
      solution:
        "An AI research tool that extracts PDF text, embeds chunks with Sentence-Transformers into FAISS, and uses Llama 3.3 70B via Groq for summaries, comparisons, and novel research ideas.",
      impact:
        "Turns a stack of papers into structured summaries, comparison tables, and eight gap-bridging research directions.",
      tech: ["FAISS", "Sentence-Transformers", "Llama 3.3 70B", "Groq", "Streamlit", "PyMuPDF"],
      repoUrl: "https://github.com/Azohajutt/Research-Paper-Analyzer",
      confidential: false,
      diagram: projectDiagrams["research-paper-analyzer"],
    },
    {
      slug: "skin-disease-classifier",
      title: "Skin Disease Image Classifier",
      tagline: "Four-class dermatology image classifier trained on Kaggle data.",
      tier: "range",
      problem:
        "Early visual triage for common skin conditions needs a model that can separate visually similar classes.",
      solution:
        "A deep learning image classification model trained on Kaggle skin images to classify four conditions: acne, eczema, rosacea, and vitiligo.",
      impact:
        "Demonstrates applied computer vision for healthcare image classification across four clinically relevant labels.",
      tech: ["Deep Learning", "Image Classification", "Computer Vision", "Kaggle"],
      confidential: false,
      diagram: projectDiagrams["skin-disease-classifier"],
    },
    {
      slug: "game-intelligence-system",
      title: "AI-Driven Game Intelligence",
      tagline: "Context-aware NPC decisions that adapt to gameplay.",
      tier: "range",
      problem:
        "Puzzle and physics games need NPCs that adapt to the player instead of following fixed scripts.",
      solution:
        "Designed a system that lets NPCs make context-aware decisions, adapt to changing gameplay environments, and respond dynamically to player interactions using Python, reinforcement learning, Unity, and machine learning.",
      impact:
        "Improves gameplay interaction through adaptive NPC behaviour rather than static rule trees.",
      tech: ["Python", "Reinforcement Learning", "Unity", "Machine Learning"],
      confidential: false,
      diagram: projectDiagrams["game-intelligence-system"],
    },
  ],
  skillGroups: [
    {
      name: "Agentic AI / LLM",
      skills: [
        "LangChain",
        "LangGraph",
        "LlamaIndex",
        "LangSmith",
        "Hugging Face Transformers",
        "Prompt engineering",
        "Fine-tuning (LoRA / QLoRA)",
        "N8N",
      ],
    },
    {
      name: "RAG",
      skills: ["Pinecone", "Chroma", "Embeddings", "Semantic search", "Dynamic knowledge retrieval"],
    },
    {
      name: "Voice AI",
      skills: [
        "OpenAI Realtime API",
        "Whisper (STT)",
        "Kokoro (TTS)",
        "Gemini Live",
        "Multilingual phone interviewing",
        "Support & cold calling",
      ],
    },
    {
      name: "ML / Computer Vision",
      skills: [
        "Regression / classification",
        "Predictive analytics",
        "Feature engineering",
        "Object detection",
        "YOLOv8",
        "CUDA",
        "ViT",
        "Segmentation",
      ],
    },
    {
      name: "MLOps / Cloud",
      skills: ["AWS EC2", "ECR", "S3", "IAM", "Lambda", "Docker", "GitHub Actions", "MLflow", "DVC", "Microservices"],
    },
    {
      name: "Backend / Databases",
      skills: ["FastAPI", "Flask", "Django", "PostgreSQL", "MySQL", "MongoDB"],
    },
  ],
  education: {
    institution: "Islamia University of Bahawalpur",
    degree: "Bachelor of Science, Information Technology",
    years: "",
    grade: "CGPA 3.74 / 4.00",
  },
  certifications: [
    {
      name: "Deep Learning Specialization",
      issuer: "DeepLearning.AI / Coursera",
      url: "/certificates/deep-learning.jpg",
    },
    {
      name: "Generative AI for Developers",
      issuer: "Coursera / Pearson",
      url: "/certificates/generative-ai-for-developers.jpg",
    },
    {
      name: "Learn Python",
      issuer: "Coursera",
      url: "/certificates/learn-python.jpg",
    },
  ],
  chatStarters: [
    "Why should I hire Zoha?",
    "What production systems has she shipped?",
    "Which projects can I try live?",
    "What’s her Voice AI and RAG stack?",
  ],
};

export function getProject(slug: string) {
  return siteContent.projects.find((p) => p.slug === slug);
}

export function buildChatKnowledge(content: SiteContent = siteContent) {
  const lines: string[] = [
    `# ${content.name} — ${content.headline}`,
    content.summary,
    `Location: ${content.location} | Email: ${content.email} | Phone: ${content.phone}`,
    `GitHub: ${content.github} | LinkedIn: ${content.linkedin}`,
    `Stats: ${content.stats.map((s) => `${s.value} ${s.label}`).join("; ")}`,
    "",
    "## Experience",
  ];

  for (const job of content.experiences) {
    lines.push(`### ${job.role} @ ${job.company} (${job.start} – ${job.end ?? "Present"}, ${job.location})`);
    for (const item of job.highlights) lines.push(`- ${item}`);
  }

  lines.push("", "## Projects");
  for (const p of content.projects) {
    const links = [p.demoUrl && `demo: ${p.demoUrl}`, p.repoUrl && `code: ${p.repoUrl}`].filter(Boolean).join(", ");
    lines.push(
      `### ${p.title} — ${p.tagline}`,
      `Problem: ${p.problem}`,
      `Solution: ${p.solution}`,
      `Impact: ${p.impact}`,
      `Tech: ${p.tech.join(", ")}${links ? ` | ${links}` : ""}`,
    );
  }

  lines.push("", "## Skills");
  for (const group of content.skillGroups) lines.push(`- ${group.name}: ${group.skills.join(", ")}`);

  const edu = content.education;
  if (edu.degree || edu.institution) {
    lines.push("", "## Education", `${[edu.degree, edu.institution, edu.years, edu.grade].filter(Boolean).join(" | ")}`);
  }

  if (content.certifications.length) {
    lines.push("", "## Certifications");
    for (const cert of content.certifications) lines.push(`- ${cert.name} (${cert.issuer})`);
  }

  return lines.join("\n");
}
