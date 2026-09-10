const express = require("express");
const prisma = require("./src/config/db");
const path = require("path");

const app = express();
const PORT = process.env.STUDIO_PORT || 5555;

app.use(express.json());

const MODELS = [
  "User",
  "University",
  "Department",
  "InterviewExperience",
  "Doubt",
  "DoubtAnswer",
  "DoubtUpvote",
];

// Helper to get prisma delegate
function getDelegate(modelName) {
  const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  return prisma[key] || null;
}

// API: Get models with counts
app.get("/api/models", async (req, res) => {
  try {
    const counts = {};
    for (const m of MODELS) {
      const delegate = getDelegate(m);
      if (delegate) {
        counts[m] = await delegate.count().catch(() => 0);
      } else {
        counts[m] = 0;
      }
    }
    res.json({ success: true, models: counts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Get rows for a model
app.get("/api/data/:model", async (req, res) => {
  try {
    const { model } = req.params;
    const { search = "" } = req.query;
    const delegate = getDelegate(model);

    if (!delegate) {
      return res.status(404).json({ success: false, error: "Model not found" });
    }

    let records = [];
    if (model === "User") {
      records = await delegate.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { university: true, department: true },
      });
      if (search) {
        const s = search.toLowerCase();
        records = records.filter(
          (r) =>
            (r.name && r.name.toLowerCase().includes(s)) ||
            (r.email && r.email.toLowerCase().includes(s)) ||
            (r.rollNo && r.rollNo.toLowerCase().includes(s)) ||
            (r.role && r.role.toLowerCase().includes(s))
        );
      }
    } else {
      records = await delegate.findMany({ take: 100 });
    }

    res.json({ success: true, records, count: records.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Delete a record
app.delete("/api/data/:model/:id", async (req, res) => {
  try {
    const { model, id } = req.params;
    const delegate = getDelegate(model);
    if (!delegate) return res.status(404).json({ success: false, error: "Model not found" });
    await delegate.delete({ where: { id } });
    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend UI
app.use((req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Database Studio — Cryptic to Clear</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: #0d1117;
      color: #c9d1d9;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #161b22; }
    ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #8b949e; }
  </style>
</head>
<body class="flex h-screen overflow-hidden text-sm">
  <!-- Sidebar -->
  <aside class="w-64 border-r border-[#30363d] bg-[#161b22] flex flex-col flex-shrink-0">
    <div class="p-4 border-b border-[#30363d] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-bold text-base shadow-sm">
          ⚡
        </div>
        <div>
          <div class="font-bold text-white text-sm leading-tight">Database Studio</div>
          <div class="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Render Postgres
          </div>
        </div>
      </div>
      <button onclick="loadModels()" title="Refresh Models" class="text-xs text-gray-400 hover:text-white p-1 rounded hover:bg-[#21262d] transition">
        ↻
      </button>
    </div>

    <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      All Models
    </div>

    <nav id="modelsList" class="flex-1 overflow-y-auto px-2 space-y-1">
      <div class="text-xs text-gray-500 p-2">Loading models...</div>
    </nav>

    <div class="p-3 border-t border-[#30363d] text-[11px] text-gray-500">
      Connected via Prisma ORM (Binary Engine)
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
    <!-- Top Bar -->
    <header class="h-14 border-b border-[#30363d] bg-[#161b22] px-6 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <h1 id="currentModelTitle" class="text-lg font-bold text-white tracking-wide">User</h1>
        <span id="recordCountBadge" class="bg-[#21262d] text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-500/20">
          0 rows
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            id="searchInput"
            type="text"
            placeholder="Search in table..."
            oninput="handleSearch(this.value)"
            class="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 w-64"
          />
        </div>
        <button
          onclick="fetchData(currentModel)"
          class="bg-[#21262d] hover:bg-[#30363d] text-white text-xs px-3 py-1.5 rounded-lg border border-[#30363d] flex items-center gap-1.5 transition"
        >
          <span>Refresh</span>
        </button>
      </div>
    </header>

    <!-- Table Container -->
    <div class="flex-1 overflow-auto p-4" id="tableContainer">
      <div class="flex items-center justify-center h-full text-gray-500">
        Loading records...
      </div>
    </div>
  </main>

  <!-- Modal for Raw Record View -->
  <div id="detailModal" class="hidden fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
      <div class="p-4 border-b border-[#30363d] flex items-center justify-between">
        <h3 class="font-bold text-white text-sm" id="modalTitle">Record Details</h3>
        <button onclick="closeModal()" class="text-gray-400 hover:text-white text-lg">&times;</button>
      </div>
      <div class="p-4 flex-1 overflow-auto">
        <pre id="modalContent" class="text-xs font-mono bg-[#0d1117] p-3 rounded-lg border border-[#30363d] text-emerald-300 overflow-x-auto"></pre>
      </div>
      <div class="p-3 border-t border-[#30363d] flex justify-end">
        <button onclick="closeModal()" class="bg-[#21262d] hover:bg-[#30363d] text-white text-xs px-4 py-1.5 rounded-lg">Close</button>
      </div>
    </div>
  </div>

  <script>
    let currentModel = 'User';
    let modelsData = {};
    let allRecords = [];

    async function loadModels() {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        if (data.success) {
          modelsData = data.models;
          renderModelsList();
          fetchData(currentModel);
        }
      } catch (err) {
        console.error("Failed to load models", err);
      }
    }

    function renderModelsList() {
      const container = document.getElementById('modelsList');
      container.innerHTML = Object.entries(modelsData).map(([name, count]) => {
        const isActive = name === currentModel;
        return \`
          <button
            onclick="switchModel('\${name}')"
            class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition \${
              isActive 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                : 'text-gray-300 hover:bg-[#21262d] hover:text-white'
            }"
          >
            <span class="flex items-center gap-2">
              <span class="opacity-60 text-xs">◈</span>
              \${name}
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full \${
              isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-[#21262d] text-gray-400'
            }">
              \${count}
            </span>
          </button>
        \`;
      }).join('');
    }

    function switchModel(model) {
      currentModel = model;
      document.getElementById('currentModelTitle').innerText = model;
      document.getElementById('searchInput').value = '';
      renderModelsList();
      fetchData(model);
    }

    async function fetchData(model) {
      const container = document.getElementById('tableContainer');
      container.innerHTML = \`<div class="flex items-center justify-center h-64 text-gray-400 animate-pulse">Fetching \${model} records from Render database...</div>\`;

      try {
        const res = await fetch(\`/api/data/\${model}\`);
        const data = await res.json();
        if (data.success) {
          allRecords = data.records;
          document.getElementById('recordCountBadge').innerText = \`\${data.count} rows\`;
          renderTable(data.records);
        } else {
          container.innerHTML = \`<div class="p-6 text-red-400 bg-red-950/20 border border-red-800/40 rounded-xl">Error: \${data.error}</div>\`;
        }
      } catch (err) {
        container.innerHTML = \`<div class="p-6 text-red-400 bg-red-950/20 border border-red-800/40 rounded-xl">Fetch error: \${err.message}</div>\`;
      }
    }

    function handleSearch(val) {
      if (!val) {
        renderTable(allRecords);
        return;
      }
      const s = val.toLowerCase();
      const filtered = allRecords.filter(r => {
        return JSON.stringify(r).toLowerCase().includes(s);
      });
      renderTable(filtered);
    }

    function renderTable(records) {
      const container = document.getElementById('tableContainer');
      if (!records || records.length === 0) {
        container.innerHTML = \`
          <div class="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-[#30363d] rounded-xl">
            <div class="text-2xl mb-2">📭</div>
            <div class="font-medium text-gray-400">No records found</div>
            <div class="text-xs text-gray-600 mt-1">There are no rows in the \${currentModel} table</div>
          </div>
        \`;
        return;
      }

      // Extract keys
      const sample = records[0];
      const keys = Object.keys(sample).filter(k => typeof sample[k] !== 'object' || sample[k] === null);

      let html = \`
        <div class="border border-[#30363d] rounded-xl overflow-hidden shadow-lg bg-[#161b22]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#21262d] border-b border-[#30363d] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th class="p-3 w-10 text-center">#</th>
                \${keys.map(k => \`<th class="p-3 border-r border-[#30363d]/50">\${k}</th>\`).join('')}
                <th class="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#30363d]/40 text-xs font-mono">
      \`;

      records.forEach((row, idx) => {
        html += \`
          <tr class="hover:bg-[#21262d]/60 transition cursor-pointer" onclick="viewRow(\${idx})">
            <td class="p-3 text-center text-gray-500 select-none">\${idx + 1}</td>
        \`;

        keys.forEach(k => {
          let val = row[k];
          let display = val === null || val === undefined ? '<span class="text-gray-600 italic">null</span>' : String(val);

          // Custom renderers
          if (k === 'avatar' && val) {
            display = \`<div class="flex items-center gap-2"><img src="\${val}" class="w-6 h-6 rounded-full border border-amber-400/40 bg-black/40"><span class="truncate max-w-[120px] text-gray-400">\${val}</span></div>\`;
          } else if (k === 'role') {
            display = \`<span class="px-2 py-0.5 rounded text-[10px] font-semibold font-sans uppercase \${
              val === 'FACULTY' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/30' :
              val === 'ADMIN' ? 'bg-rose-900/60 text-rose-300 border border-rose-500/30' :
              'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
            }">\${val}</span>\`;
          } else if (k === 'email') {
            display = \`<span class="text-amber-300 font-medium font-sans">\${val}</span>\`;
          } else if (k === 'createdAt' || k === 'updatedAt') {
            try {
              display = \`<span class="text-gray-400 text-[11px]">\${new Date(val).toLocaleString()}</span>\`;
            } catch {}
          } else if (typeof val === 'string' && val.length > 40) {
            display = \`<span class="truncate max-w-[200px] inline-block" title="\${val}">\${val.slice(0, 40)}...</span>\`;
          }

          html += \`<td class="p-3 border-r border-[#30363d]/30 text-gray-300 align-middle">\${display}</td>\`;
        });

        html += \`
            <td class="p-3 text-center" onclick="event.stopPropagation()">
              <button onclick="viewRow(\${idx})" class="text-amber-400 hover:text-amber-300 text-xs px-2 py-1 bg-[#21262d] rounded hover:bg-[#30363d] transition">
                View JSON
              </button>
            </td>
          </tr>
        \`;
      });

      html += \`
            </tbody>
          </table>
        </div>
      \`;

      container.innerHTML = html;
    }

    function viewRow(idx) {
      const row = allRecords[idx];
      if (!row) return;
      document.getElementById('modalTitle').innerText = \`\${currentModel} Record #\${idx + 1}\`;
      document.getElementById('modalContent').innerText = JSON.stringify(row, null, 2);
      document.getElementById('detailModal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('detailModal').classList.add('hidden');
    }

    // Auto-load on open
    window.addEventListener('DOMContentLoaded', loadModels);
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log("\n=======================================================");
  console.log(`⚡ Database Studio is ready on http://localhost:${PORT}`);
  console.log("=======================================================\n");
});
