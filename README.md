# Sovereign On-Premise Agentic AI Workbench

**SIH 2026 — Problem Statement ID 26117**
Organization: Mangalore Refinery and Petrochemicals Limited (MRPL)

A fully self-hosted, air-gapped AI workbench for confidential industrial knowledge work — approval notes, engineering calculations, scanned inspection reports, internal code, and correspondence — that never sends data outside the organization's own infrastructure.

---

## What this is

Refineries, PSUs, and defence-linked manufacturing units generate large volumes of sensitive knowledge work that cannot go through cloud AI assistants. This project is a **local, multi-model, agentic AI workbench** that:

- Runs entirely on-premise on the organization's own GPU server — zero external network calls, provably.
- Supports multiple open-weight models simultaneously and **auto-selects** the right model per task (coding vs. document summarization vs. vision/OCR).
- Acts as a real **agent**: plans multi-step work, calls local tools (file I/O, sandboxed code execution, spreadsheet work, document search), and iterates instead of answering once.
- Handles **multimodal input**: scanned PDFs, handwritten notes, engineering drawings, and photographs via on-device OCR and vision models.
- Produces **real deliverables**: Word/PowerPoint/Excel files, working verified code, and calculations with visible steps — not just chat replies.
- Grounds itself in the organization's own manuals, SOPs, and correspondence via a local RAG knowledge base.

---

## Architecture

```
Browser UI (LAN only)
        │
API Gateway / Orchestrator (FastAPI)
   ├── Task Classifier → Model Router
   ├── Agent Loop (planner + tool executor)
   └── Audit Logger
        │
   ┌────┼────────┬─────────────┐
Model    Tool     RAG /        Sandbox
Serving  Layer    Vector DB    (code exec,
(multi-  (files,  (Qdrant +    network=none)
model)   docgen,  local embed)
         OCR/VLM)
        │
Network isolation layer — all external egress dropped, live monitor proves it
```

Full details in [`docs/architecture.md`](docs/architecture.md).

---

## Hardware profiles

This project is designed to run on modest hardware and scale up when available — the **same code**, different model registry:

| Profile | Target hardware | Models |
|---|---|---|
| `dev` | 4–8GB GPU (e.g. RTX 3050) | Qwen3 1.7B/4B, Qwen2.5-Coder 3B, Qwen2.5-VL 3B — all Q4 quantized, loaded sequentially via Ollama |
| `venue` | Larger GPU if available at demo venue | Larger-class open-weight models (30B+), same router/agent logic |

Set `HARDWARE_PROFILE=dev` or `HARDWARE_PROFILE=venue` in `.env` — everything else is unchanged. See [`docs/model_registry_guide.md`](docs/model_registry_guide.md) for how to add a new model.

---

## Quickstart

### Prerequisites
- Docker & Docker Compose
- [Ollama](https://ollama.com) installed locally
- NVIDIA GPU + drivers (CUDA) — tested on RTX 3050 (4GB)
- Node.js 20+, Python 3.11+

### 1. Clone and configure
```bash
git clone https://github.com/<your-username>/sih26117-sovereign-workbench.git
cd sih26117-sovereign-workbench
cp .env.example .env
```

### 2. Pull the models (dev profile)
```bash
ollama pull qwen3:1.7b
ollama pull qwen3:4b
ollama pull qwen2.5-coder:3b
ollama pull qwen2.5vl:3b
```

### 3. Start the stack
```bash
docker-compose up --build
```
This brings up: FastAPI backend, Qdrant vector DB, the sandbox runner, and the frontend dev server.

### 4. Seed the knowledge base
```bash
python scripts/seed_kb.py
```

### 5. Open the app
- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`

### 6. Verify the sovereignty claim
```bash
./scripts/verify_no_egress.sh
```
Runs a full agent task while asserting zero non-LAN network connections were made.

---

## Demo scenarios

1. **Agentic document workflow** — feed a scanned inspection report → agent extracts key findings via OCR/vision → drafts and saves an approval note as a `.docx`.
2. **Coding task** — natural-language request → routed to the coding model → executed and verified in a network-isolated sandbox.
3. **Multimodal understanding** — image/scanned document → structured extraction → grounded answer using the local RAG knowledge base.

Run all three in sequence: `./scripts/run_demo_scenarios.sh`

---

## Project structure

```
├── infra/            # network isolation, docker, systemd
├── models/           # model registry + serving launchers
├── backend/          # FastAPI orchestrator, agent, RAG, multimodal, audit
├── frontend/          # Next.js UI — landing page + workbench
├── knowledge_base/    # sample SOPs / reports for RAG demo
├── data/              # runtime uploads, outputs, audit logs (gitignored)
├── scripts/            # seeding, demo runner, egress verification
└── docs/                # architecture, model registry guide, demo script
```

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown.

---

## Status

Currently implemented (as of this commit):
- [x] FastAPI backend skeleton + single-model tool loop
- [x] ReAct-style agent loop with file I/O and sandboxed code execution tools
- [x] Document generation (docx/pptx/xlsx)
- [x] Model registry + task classifier + router (multi-model auto-selection)
- [x] RAG knowledge base (Qdrant + local embeddings)
- [ ] Multimodal OCR/vision pipeline
- [ ] Network isolation + live sovereignty monitor
- [ ] Audit trail UI
- [ ] Landing page / final frontend polish

---

## Team

_Add team member names and roles here._

## License

_Add license here (or note this is a hackathon submission for SIH 2026, not yet licensed for external use)._
