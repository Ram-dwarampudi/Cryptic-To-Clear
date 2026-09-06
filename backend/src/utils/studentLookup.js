/**
 * Student Academic Information Resolver
 * Resolves Department/Stream, Batch Year, Graduation Year, and College/University
 * based on the Student's Registration / Roll Number and College Email domain.
 */

// Institutional Roster & Known College Codes
const COLLEGE_CODE_MAP = {
  PA: "Vishnu Institute of Technology (VITB)",
  B8: "CVR College of Engineering",
  A9: "Aditya Engineering College",
  MH: "Aditya College of Engineering",
  L3: "Vignan's Institute of Information Technology",
  "12": "Mohan Babu University",
  "69": "Madanapalle Institute of Technology & Science",
  VITB: "Vishnu Institute of Technology (VITB)",
  VIT: "Vellore Institute of Technology",
  SRM: "SRM Institute of Science and Technology",
  BITS: "BITS Pilani",
};

// Domain to University Name Map
const EMAIL_DOMAIN_MAP = {
  "vitb.ac.in": "Vishnu Institute of Technology (VITB)",
  "vishnu.edu.in": "Vishnu Educational Society",
  "srit.ac.in": "Srinivasa Ramanujan Institute of Technology",
  "vit.ac.in": "Vellore Institute of Technology",
  "srmist.edu.in": "SRM Institute of Science and Technology",
  "bits-pilani.ac.in": "BITS Pilani",
  "iitb.ac.in": "IIT Bombay",
  "iitd.ac.in": "IIT Delhi",
  "iitm.ac.in": "IIT Madras",
  "iitk.ac.in": "IIT Kanpur",
  "iitkgp.ac.in": "IIT Kharagpur",
  "nitw.ac.in": "NIT Warangal",
  "nitt.edu": "NIT Trichy",
  "gvpce.ac.in": "GVP College of Engineering",
  "cvr.ac.in": "CVR College of Engineering",
  "vignan.ac.in": "Vignan University",
};

// Branch code map (covers JNTU, Anna University, Deemed universities, and acronyms)
const BRANCH_PATTERNS = [
  { regex: /(?:05|CSE|CS|BCS|BCE)(?![0-9A-Z])/i, name: "Computer Science & Engineering", code: "CSE" },
  { regex: /(?:12|BIT|IT)(?![0-9A-Z])/i, name: "Information Technology", code: "IT" },
  { regex: /(?:04|ECE|EC|BEC)(?![0-9A-Z])/i, name: "Electronics & Communication Engineering", code: "ECE" },
  { regex: /(?:42|CSM|AIML|AI)(?![0-9A-Z])/i, name: "Artificial Intelligence & Machine Learning", code: "AI-ML" },
  { regex: /(?:54|AIDS|AD)(?![0-9A-Z])/i, name: "Artificial Intelligence & Data Science", code: "AI-DS" },
  { regex: /(?:44|CSD|BDS|DS)(?![0-9A-Z])/i, name: "Data Science & Engineering", code: "DS" },
  { regex: /(?:62|CSC|CYBER|CYS)(?![0-9A-Z])/i, name: "Cyber Security", code: "CS-CY" },
  { regex: /(?:57|CSBS)(?![0-9A-Z])/i, name: "Computer Science & Business Systems", code: "CSBS" },
  { regex: /(?:02|EEE|EE|BEE)(?![0-9A-Z])/i, name: "Electrical & Electronics Engineering", code: "EEE" },
  { regex: /(?:03|ME|MECH|BME)(?![0-9A-Z])/i, name: "Mechanical Engineering", code: "MECH" },
  { regex: /(?:01|CE|CIVIL)(?![0-9A-Z])/i, name: "Civil Engineering", code: "CIVIL" },
  { regex: /(?:CH|CHEM|08)(?![0-9A-Z])/i, name: "Chemical Engineering", code: "CHEM" },
  { regex: /(?:BT|BIO|10)(?![0-9A-Z])/i, name: "Biotechnology Engineering", code: "BIOTECH" },
];

/**
 * Parses and resolves student academic profile based on registration number & college email.
 * @param {string} rollNo - Student registration or roll number (e.g., "24PA1A0501", "22BCE1042", "23CSE015")
 * @param {string} [email] - College email address (e.g., "ram@vitb.ac.in")
 * @returns {object} { collegeName, stream, batchYear, graduationYear, identified: boolean }
 */
function resolveStudentFromRegistration(rollNo, email = "") {
  if (!rollNo || typeof rollNo !== "string") {
    return {
      collegeName: null,
      stream: null,
      batchYear: null,
      graduationYear: null,
      identified: false,
    };
  }

  const cleanRoll = rollNo.trim().toUpperCase().replace(/[\s-]/g, "");
  const cleanEmail = (email || "").trim().toLowerCase();

  let batchYear = null;
  let graduationYear = null;
  let stream = null;
  let collegeName = null;
  let identified = false;

  // 1. Resolve Batch & Graduation Year
  // Check standard 2-digit prefix: 20, 21, 22, 23, 24, 25, 26, 27, 28
  const year2Match = cleanRoll.match(/^([12][0-9])/);
  const year4Match = cleanRoll.match(/^(20[12][0-9])/);

  if (year4Match) {
    batchYear = parseInt(year4Match[1], 10);
    graduationYear = batchYear + 4;
    identified = true;
  } else if (year2Match) {
    const yr = parseInt(year2Match[1], 10);
    if (yr >= 18 && yr <= 35) {
      batchYear = 2000 + yr;
      graduationYear = batchYear + 4;
      identified = true;
    }
  }

  // 2. Resolve Stream / Department from branch codes
  // Standard JNTU/State format: 24PA1A0501 -> "05" is CSE
  const jntuMatch = cleanRoll.match(/^[0-9]{2}[A-Z0-9]{2}[0-9][A-Z]([0-9]{2})/);
  if (jntuMatch && jntuMatch[1]) {
    const branchCode = jntuMatch[1];
    const match = BRANCH_PATTERNS.find((b) => b.regex.test(branchCode));
    if (match) {
      stream = match.name;
      identified = true;
    }
  }

  if (!stream) {
    // Check general regex across roll number
    for (const b of BRANCH_PATTERNS) {
      if (b.regex.test(cleanRoll)) {
        stream = b.name;
        identified = true;
        break;
      }
    }
  }

  // If still not matched, check if contains any known abbreviations
  if (!stream) {
    if (cleanRoll.includes("CSE") || cleanRoll.includes("CS")) stream = "Computer Science & Engineering";
    else if (cleanRoll.includes("IT")) stream = "Information Technology";
    else if (cleanRoll.includes("ECE")) stream = "Electronics & Communication Engineering";
    else if (cleanRoll.includes("EEE")) stream = "Electrical & Electronics Engineering";
    else if (cleanRoll.includes("MECH") || cleanRoll.includes("ME")) stream = "Mechanical Engineering";
    else if (cleanRoll.includes("CIVIL") || cleanRoll.includes("CE")) stream = "Civil Engineering";
  }

  // 3. Resolve College / University
  // A. From College Email domain
  if (cleanEmail && cleanEmail.includes("@")) {
    const domain = cleanEmail.split("@")[1];
    if (EMAIL_DOMAIN_MAP[domain]) {
      collegeName = EMAIL_DOMAIN_MAP[domain];
      identified = true;
    } else if (domain.endsWith(".edu") || domain.endsWith(".ac.in") || domain.endsWith(".edu.in")) {
      // Cleanly format domain
      const mainPart = domain.split(".")[0];
      collegeName = `${mainPart.toUpperCase()} Institute of Technology`;
      identified = true;
    }
  }

  // B. From Registration Number college code (e.g. 24PA1A... -> PA is VITB)
  if (!collegeName) {
    const codeMatch = cleanRoll.match(/^[0-9]{2}([A-Z0-9]{2})/);
    if (codeMatch && COLLEGE_CODE_MAP[codeMatch[1]]) {
      collegeName = COLLEGE_CODE_MAP[codeMatch[1]];
      identified = true;
    }
  }

  return {
    rollNo: cleanRoll,
    collegeName: collegeName || null,
    stream: stream || (identified ? "Computer Science & Engineering" : null),
    batchYear: batchYear || (identified ? 2024 : null),
    graduationYear: graduationYear || (batchYear ? batchYear + 4 : null),
    identified,
  };
}

module.exports = {
  resolveStudentFromRegistration,
  COLLEGE_CODE_MAP,
  EMAIL_DOMAIN_MAP,
};
