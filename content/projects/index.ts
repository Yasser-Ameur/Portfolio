export type ProjectWorldType =
  | "minigoogle"
  | "notifly"
  | "nexus"
  | "pulse"
  | "flowos";

export type DetailSection = {
  heading: string;
  points: string[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  technologies: string[];
  github: string;
  accent: string;
  worldType: ProjectWorldType;
  detail: {
    why: string[];
    architecture: DetailSection;
    decisions: string[];
    technology: string[];
    results: string[];
    learned: string[];
  };
};

/**
 * Structured project content. Every technical claim is grounded in the
 * repositories' READMEs and docs — nothing is invented, and planned work
 * is separated from implemented work.
 */
export const PROJECTS: Project[] = [
  {
    slug: "minigoogle",
    name: "MiniGoogle",
    tagline: "A distributed search engine built from the ground up",
    description:
      "Crawler, indexer, ranking, and query engine wired together without a single framework — from a single node to a gossip-coordinated cluster with automatic shard rebalancing.",
    technologies: ["Java 21", "Gradle", "Raft", "Gossip", "Consistent Hashing", "BM25", "PageRank", "HNSW", "REST", "Docker", "Kubernetes"],
    github: "https://github.com/Yasser-Ameur/minigoogle",
    accent: "var(--ember)",
    worldType: "minigoogle",
    detail: {
      why: [
        "I wanted to understand how search actually works — not from a tutorial, but by owning the whole pipeline end to end.",
        "Crawling, parsing, indexing, ranking, and serving queries are usually consumed as hosted services. Building them myself made every layer concrete.",
        "Distributed search adds the hard half: coordination, membership, and keeping data consistent across nodes.",
      ],
      architecture: {
        heading: "Acyclic layered architecture",
        points: [
          "core → storage / indexer → query / ranking → semantic → network → distributed → demo — a strict, acyclic dependency flow.",
          "Storage: memory-mapped segments, binary posting/dictionary files, WAL, compaction, and shard replication.",
          "Indexer: Unicode normalization, Porter stemming, gap-encoded posting lists, positional index.",
          "Query: lexer → parser (AST) → query planner supporting boolean, phrase, NOT, and wildcard expansion.",
          "Ranking: BM25 scoring plus iterative PageRank, popularity boosting, and cross-encoder re-ranking.",
          "Semantic: HNSW vector index with hybrid lexical + semantic retrieval and a RAG pipeline.",
          "Cluster: Raft leader election, gossip membership, consistent hashing, and automatic shard rebalancing.",
        ],
      },
      decisions: [
        "No DI framework — 218 source files wired by hand, which kept every dependency explicit.",
        "JDK HttpServer + HttpClient for the lightweight REST layer instead of a heavyweight server.",
        "A Google-style demo app with live autocomplete, spell correction, query expansion, and an analytics dashboard.",
        "Docker Compose runs a real 4-node cluster (coordinator, two search nodes, monitoring) and Kubernetes manifests are included.",
      ],
      technology: ["Java 21", "Gradle 8.7", "JDK HttpServer / HttpClient", "Jackson + Gson", "JSoup", "SLF4J / Logback", "JUnit 5 + Mockito", "Docker", "Kubernetes"],
      results: [
        "257 tests passing across the full stack, from the indexer to cluster coordination.",
        "218 source files across 13 packages — crawler, indexer, storage, query, ranking, semantic, network, distributed, and monitoring.",
        "A 4-node distributed deployment runnable with docker compose, with health checks on a bridge network.",
        "Performance targets (p50 < 50 ms, p99 < 200 ms, 100k-page index build < 10 min) with a dedicated benchmark suite.",
      ],
      learned: [
        "Distributed correctness is mostly about failure handling, not happy-path logic — Raft and gossip made that visceral.",
        "Indexing is a data-format problem: mmap segments, gap encoding, and compaction matter more than clever scoring.",
        "Semantic retrieval doesn't replace lexical search; a hybrid pipeline is what actually feels like a search engine.",
      ],
    },
  },
  {
    slug: "notifly",
    name: "NotiFly",
    tagline: "A notification platform for reliable delivery",
    description:
      "A channel-agnostic notification orchestration platform — one API for Email, Slack, Discord, Teams, and webhooks, with guaranteed delivery built in.",
    technologies: ["Python", "FastAPI", "SQLAlchemy", "Redis", "ARQ", "Jinja2", "Transactional Outbox", "Prometheus"],
    github: "https://github.com/Yasser-Ameur/notifly",
    accent: "var(--glacier)",
    worldType: "notifly",
    detail: {
      why: [
        "Sending a message is easy; not losing it is hard. I wanted delivery guarantees and provider extensibility to be first-class, not afterthoughts.",
        "A notification platform should be independent of its consumers, with a clean API and an SDK that any product can integrate in minutes.",
      ],
      architecture: {
        heading: "Strict clean architecture",
        points: [
          "presentation → application → domain → infrastructure, with no business logic in routes and no domain dependency on infrastructure.",
          "A transactional outbox guarantees no notification is lost — the database is the source of truth.",
          "Providers are small adapters behind a capabilities-based interface; adding one is a class and a registration line.",
          "A first-party, fully typed Python SDK lets products like FlowOS integrate without touching the platform.",
        ],
      },
      decisions: [
        "Transactional outbox with idempotency keys so retries never duplicate delivery.",
        "Exponential-backoff retries plus a dead-letter queue with manual retry.",
        "DB-backed, restart-safe scheduling for future sends.",
        "Scoped API keys hashed at rest, correlation IDs end-to-end, structured JSON logs, and Prometheus metrics.",
        "Per-channel templates with declared, validated variables and sandboxed Jinja2 rendering.",
      ],
      technology: ["Python", "FastAPI", "SQLAlchemy", "Redis", "ARQ", "Jinja2", "Alembic", "Prometheus", "Docker Compose"],
      results: [
        "Providers: Email (SMTP), Slack, Discord, Microsoft Teams, and generic webhooks.",
        "Delivery pipeline with tracking, audit logs, scheduling, rate limiting, and an operations API.",
        "CI pipeline with automated tests and a documented deployment story.",
      ],
      learned: [
        "Idempotency keys and an outbox turn 'at most once' into 'exactly once in practice' — the mental model changed how I design any async system.",
        "A provider is an adapter, not a feature. The capabilities interface kept the platform from leaking channel quirks.",
      ],
    },
  },
  {
    slug: "nexus",
    name: "NEXUS",
    tagline: "An autonomous knowledge-discovery platform",
    description:
      "A knowledge intelligence engine paired with a fault-tolerant research runtime — agents plan, decompose, execute, critique, and synthesize against a knowledge graph.",
    technologies: ["Python", "Knowledge Graph", "GraphRAG", "Hybrid Retrieval", "Distributed Task Queue", "SQLite", "Agent Runtime"],
    github: "https://github.com/Project-Nexus-YR/NEXUS",
    accent: "var(--alpine)",
    worldType: "nexus",
    detail: {
      why: [
        "The interesting frontier for agents isn't chat — it's reliable knowledge work: planning, executing, critiquing, and synthesizing with durable, inspectable state.",
        "I wanted the loop to be epistemic: observations against current knowledge, measurable gaps, and evidence-proven updates.",
      ],
      architecture: {
        heading: "Engine + runtime, cleanly separated",
        points: [
          "nexus_knowledge — ingests heterogeneous sources into a knowledge graph and exposes hybrid retrieval (lexical / vector / entity / graph), GraphRAG evidence extraction, and uncertainty, contradiction, and gap analysis with reproducible benchmarks.",
          "nexus_runtime — a provider-neutral, fault-tolerant research runtime: planning, task decomposition, distributed execution, critique, and synthesis.",
          "The runtime consumes the engine through the knowledge-service boundary and proposes knowledge updates — it never reads the engine's database.",
          "Phase 4 (autonomous investigation) closes the loop: scored, budget-aware investigation plans execute through the agent harness, and provenance-complete evidence is fused and applied.",
        ],
      },
      decisions: [
        "A dynamic, cycle-safe distributed task queue with priority aging and worker leases.",
        "At-least-once delivery with idempotency-key deduplication, retries, timeouts, cancellation, backpressure, and failed-worker recovery.",
        "Versioned domain events with an in-memory bus and a durable SQLite checkpoint/event store.",
        "Capability policy checks and structured outputs; model, tools, and memory behind provider interfaces.",
        "A deterministic local multi-worker simulator reusing the same Coordinator / Worker / scheduler interfaces as production adapters.",
      ],
      technology: ["Python 3.11+", "NumPy", "SQLite", "Knowledge graphs", "GraphRAG", "Hybrid retrieval", "Local embedding provider", "CLI"],
      results: [
        "Phase 3 — a provider-neutral distributed execution layer with mock-provider end-to-end and failure-injection tests.",
        "Atomic in-memory and SQLite TaskStore adapters, worker identities and capacity, durable cancellation, dead letters, and coordinator restart.",
        "Deterministic, reproducible evaluation harness for the knowledge engine (bench output as JSON).",
        "Phase 4 autonomous investigation is in progress — the investigation application, its CLI, and end-to-end tests are in place as the next milestone.",
      ],
      learned: [
        "Durable state is what makes an agent trustworthy — checkpoints and dead letters matter more than the model behind it.",
        "Separating the knowledge engine from the runtime keeps each half testable and lets the orchestration evolve without touching retrieval.",
      ],
    },
  },
  {
    slug: "pulse",
    name: "Pulse",
    tagline: "A durable event-streaming platform",
    description:
      "A distributed event-streaming platform built from the durable log up — topics, ordered partitions, acknowledgements, and a clean path toward clustering.",
    technologies: ["Go", "gRPC", "Protobuf", "Durable Log", "Segments", "CLI"],
    github: "https://github.com/Yasser-Ameur/pulse",
    accent: "var(--terracotta)",
    worldType: "pulse",
    detail: {
      why: [
        "I wanted a message broker I owned from the log format up — fsync, segments, recovery, and the wire protocol — instead of consuming a hosted one.",
        "Streaming infrastructure should be boring and correct: durable, ordered, replayable, and deterministic.",
      ],
      architecture: {
        heading: "Clean architecture with a deliberate clustering path",
        points: [
          "domain → application → adapters + infrastructure, with ports for metadata storage, time, logging, and metrics.",
          "An append-only segment log with sparse offset indexes and checksummed batches, and deterministic crash recovery via CRC-validated truncation.",
          "Replication, consumer groups, observability, and auth are designed as new adapters, not rewrites.",
        ],
      },
      decisions: [
        "Durable by default: publishes are acknowledged only after fsync — acknowledged messages are never lost.",
        "Deterministic by design: injectable clock, typed errors, total per-partition order, and one documented shutdown sequence.",
        "Single-node broker first (Phase 1). The storage engine is the current in-progress phase, and clustering is a documented, deliberate later phase (roadmap Phase 5) rather than a claim.",
      ],
      technology: ["Go", "gRPC", "Protobuf", "Append-only segments", "Sparse offset indexes", "CRC recovery", "CLI", "Testcontainers (planned)"],
      results: [
        "Phase 1 core broker: durable segment log, topics, publish/subscribe with acknowledgements, a gRPC API, and a CLI.",
        "Full test suite with the race detector in CI.",
        "Zero Docker dependency to build, test, or run — Go only.",
      ],
      learned: [
        "A durable log is a simple idea with exacting implementation details — checksums, indexes, and recovery order decide whether data survives.",
        "Separating what is implemented from what is designed (clustering) is how infrastructure earns trust.",
      ],
    },
  },
  {
    slug: "flowos",
    name: "FlowOS",
    tagline: "The orchestration layer that connects systems",
    description:
      "A workflow automation platform with a strictly-layered engine, a first-class plugin SDK, and bundled integration nodes for MiniGoogle, NotiFly, and Pulse — the connective layer of the engineering journey.",
    technologies: ["Python 3.13", "FastAPI", "asyncio", "Plugin SDK", "Compiled Plans", "SQLAlchemy", "Redis / ARQ", "React Flow", "OpenTelemetry"],
    github: "https://github.com/Yasser-Ameur/flow-os",
    accent: "var(--sand)",
    worldType: "flowos",
    detail: {
      why: [
        "Automation tools usually force you into their model. I wanted a workflow platform where the engine compiles a validated plan, the domain stays pure, and any plugin can plug in through an SDK.",
      ],
      architecture: {
        heading: "Strictly enforced clean architecture",
        points: [
          "presentation / application / domain + ports / infrastructure — the domain layer is pure Python with stdlib only, and dependencies point inward.",
          "An event-driven executor publishes to an internal bus; audit logs, WebSocket streams, metrics, and tracing are decoupled subscribers.",
          "A workflow is compiled once into a CompiledExecutionPlan (validated graph, topological order, parallel batches) — the engine never interprets raw JSON at runtime.",
          "The engine depends only on a JobQueue port: in-memory for development, ARQ-on-Redis in production.",
          "Durable execution checkpoints let a run resume from its latest frontier after a crash.",
        ],
      },
      decisions: [
        "A first-class plugin SDK: BaseNode, NodeContext, and NodeManifest, discovered via Python entry points — third-party plugins need zero core changes.",
        "Core nodes ship by default (constant, delay, http.request with an SSRF guard, template, condition, fail, noop).",
        "Bundled integration nodes for MiniGoogle, NotiFly, and Pulse, with the MiniGoogle search engine vendored as a submodule.",
        "Auth with JWT, OAuth2 password flow, Argon2id hashing, and Fernet secret encryption, plus RBAC.",
      ],
      technology: ["Python 3.13+", "FastAPI", "asyncio", "Pydantic v2", "SQLAlchemy 2 + Alembic", "Redis / ARQ", "JWT + Argon2id", "structlog", "Prometheus", "OpenTelemetry", "React 19 + React Flow + Monaco", "uv / Ruff / mypy strict"],
      results: [
        "Phases 0–6 complete (repository, tooling, domain, engine, persistence, API/WebSockets, and the React graph editor); phase 7 — docs, examples, release — is in progress.",
        "Strict typing and linting (mypy strict, Ruff) with 95%+ test coverage.",
        "Docker Compose stack for PostgreSQL, Redis, and the production-infrastructure path.",
      ],
      learned: [
        "Compiling a workflow once, instead of interpreting it per step, is what makes an engine fast and auditable.",
        "A plugin SDK with entry-point discovery turns a platform from a feature set into an ecosystem.",
      ],
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
