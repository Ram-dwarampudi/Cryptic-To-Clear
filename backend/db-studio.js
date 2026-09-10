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
  res.sendFile(path.join(__dirname, "studio.html"));
});

app.listen(PORT, () => {
  console.log("\n=======================================================");
  console.log(`⚡ Database Studio is ready on http://localhost:${PORT}`);
  console.log("=======================================================\n");
});
