# System Architecture & Website Feature Workflow Guide

This document describes the architectural flow, component modules, and website features represented in the **Cryptic to Clear (CodeMentor AI)** architecture diagram.

---

## 1. Diagram Assets

The diagram has been updated with clear, human-readable, explainable language representing the exact features of this website:

| File Name | Format | Best Used For |
|-----------|--------|---------------|
| [`system_architecture_diagram.png`](./system_architecture_diagram.png) | High-Resolution PNG (Raster) | Direct insertion into **Microsoft Word**, **Google Docs**, **Overleaf/LaTeX**, **Notion**, or **PowerPoint**. |
| [`system_architecture_diagram.svg`](./system_architecture_diagram.svg) | Scalable Vector Graphics (SVG) | Infinite scaling, print thesis, project documentation, Figma, or Illustrator. |
| [`diagram_preview.html`](./diagram_preview.html) | Interactive HTML Viewer | Open in any browser to inspect, print as PDF, or export 300 DPI images with 1 click. |

---

## 2. Website Features & Diagram Block Mapping

The diagram maps directly to what is available on the website:

```
[ User Code & Inputs ]   [ Compiler Output & Errors ]   [ Faculty & Learning Tasks ]
         │                              │                             │
         └──────────────────────┬───────┴─────────────────────────────┘
                                ▼
        ┌────────────────────────────────────────────────────────────┐
        │             Website Backend & Error Processor              │
        │  (Express API Server, Path Cleaner, Context Builder)       │
        └──────────────────────────────┬─────────────────────────────┘
                                       ▼
                         ┌───────────────────────────┐
                         │   AI Intelligence Engine  │
                         │    (Groq LLaMA 3.3 70B)   │
                         └─────────────┬─────────────┘
                                       │ (AI Diagnostics & Fix Suggestions)
                                       ▼
┌──────────────────────────┐    ┌───────────────────────────────┐
│ Code Execution Sandboxes │───►│ Core Analysis & Fixing Engine │
│ (GCC, Java, Python, etc.)│    │ (Plain-English Explanations,  │
└──────────────────────────┘    │  Line Diffs, Flowcharts)      │
             ▲                  └──────────────┬────────────────┘
             │ (Run Code Feedback)             │
┌──────────────────────────┐                   ▼
│  Interactive Website UI  │    ┌───────────────────────────────┐
│ (Monaco, Diff Modal,     │───►│    Final Results & Exports    │
│  Visual Debugger, Chat)  │    │ (Fixed Code, PDF/MD Reports,  │
└──────────────────────────┘    │  Faculty Auto-Grading)        │
                                └───────────────────────────────┘
```

### Explanation of Each Block:

1. **User Code & Inputs (Coral Red / Top-Left)**
   - **Monaco Code Editor**: Where users write their code in C, C++, Java, or Python.
   - **Custom STDIN**: Tab where users can pass input parameters directly into their programs.
   - **User AI Prompts**: Chat box where students ask questions about their code.

2. **Compiler Output & Errors (Light Green / Top-Center)**
   - **Terminal STDOUT**: Captures normal program execution output.
   - **STDERR Stack Traces**: Captures compiler errors, syntax bugs, null-pointer exceptions, and segmentation faults.

3. **Faculty & Learning Tasks (Soft Purple / Top-Right)**
   - **Teacher Assignments**: Instructors create and assign coding problems with test suites.
   - **Learning Mode & Quizzes**: Interactive concept explainers and practice multiple-choice questions for students.

4. **Website Backend & Error Processor (Sky Blue / 3D Beveled Slab)**
   - **Express API Server**: Handles `/api/execute`, `/api/explain`, `/api/analyze`, `/api/debug`, and `/api/faculty`.
   - **Path Cleaner**: Strips local temporary folders (`/backend/tmp/exec-*`) from error logs so messages are clean and safe.

5. **AI Intelligence Engine (Golden Yellow / Center)**
   - **Groq LLaMA 3.3 70B**: High-speed AI model that inspects the source code and error messages to pinpoint root causes.
   - **Failover to NVIDIA NIM & Google Gemini**: Ensures continuous uptime even during high traffic.

6. **Core Analysis & Fixing Engine (Slate Blue / Decision Hub)**
   - **Plain-English Error Explainer**: Explains what went wrong in conversational, beginner-friendly terms.
   - **Line-by-Line Code Fix**: Generates the exact replacement code for buggy lines.
   - **Code Quality & Complexity Audit**: Calculates Time/Space Complexity, readability score, and code smells.
   - **Mermaid Flowchart Builder**: Auto-generates logic diagrams illustrating program branches.

7. **Code Execution Sandboxes (Coral Red / Left Box)**
   - **Local Isolated Compilers**: Runs code using local `gcc`, `g++`, `javac`, and `python3`.
   - **Remote Fallback**: Automatically routes to the Piston API or Judge0 sandbox if local compilers are absent.

8. **Interactive Website Features (Soft Teal / Lower Box)**
   - **Side-by-Side Diff Modal**: Compares original code with the AI's fix with a 1-click "Apply Fix" button.
   - **Visual Step Debugger**: Tracks variable values, memory allocations, and call stacks step-by-step.
   - **AI Chat Companion**: Floating assistant for follow-up questions.

9. **Final Results & Exports (Soft Peach / Orange Box)**
   - **One-Click Working Code**: Directly injects corrected code back into the Monaco editor.
   - **Export Reports**: Downloads structured PDF or Markdown debugging summaries.
   - **Faculty Auto-Grading**: Automatically scores student code against test cases and logs results.

---

## 3. How to Use in Your Documentation

### In Microsoft Word or Google Docs
1. Click **Insert** → **Pictures** → **This Device**.
2. Select [`docs/architecture/system_architecture_diagram.png`](./system_architecture_diagram.png).
3. Set Text Wrapping to **"In Line with Text"** or **"Top and Bottom"**.

### In LaTeX / Overleaf
```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.92\textwidth]{docs/architecture/system_architecture_diagram.png}
    \caption{Architecture and Feature Workflow of Cryptic to Clear (CodeMentor AI)}
    \label{fig:website_architecture}
\end{figure}
```

### In GitHub README / Markdown
```markdown
![Cryptic to Clear Architecture](./docs/architecture/system_architecture_diagram.png)
```
