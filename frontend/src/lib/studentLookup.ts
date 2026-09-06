/**
 * Frontend Student Academic Information Resolver
 * Real-time parsing of Department/Stream, Batch, Graduation Year, and College/University
 * based on the Student's Registration / Roll Number and College Email.
 */

export interface ResolvedStudentDetails {
  rollNo: string;
  collegeName: string | null;
  stream: string | null;
  batchYear: number | null;
  graduationYear: number | null;
  identified: boolean;
}

const COLLEGE_CODE_MAP: Record<string, string> = {
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

const EMAIL_DOMAIN_MAP: Record<string, string> = {
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

const BRANCH_PATTERNS = [
  { regex: /(?:05|CSE|CS|BCS|BCE)(?![0-9A-Z])/i, name: "Computer Science & Engineering" },
  { regex: /(?:12|BIT|IT)(?![0-9A-Z])/i, name: "Information Technology" },
  { regex: /(?:04|ECE|EC|BEC)(?![0-9A-Z])/i, name: "Electronics & Communication Engineering" },
  { regex: /(?:42|CSM|AIML|AI)(?![0-9A-Z])/i, name: "Artificial Intelligence & Machine Learning" },
  { regex: /(?:54|AIDS|AD)(?![0-9A-Z])/i, name: "Artificial Intelligence & Data Science" },
  { regex: /(?:44|CSD|BDS|DS)(?![0-9A-Z])/i, name: "Data Science & Engineering" },
  { regex: /(?:62|CSC|CYBER|CYS)(?![0-9A-Z])/i, name: "Cyber Security" },
  { regex: /(?:57|CSBS)(?![0-9A-Z])/i, name: "Computer Science & Business Systems" },
  { regex: /(?:02|EEE|EE|BEE)(?![0-9A-Z])/i, name: "Electrical & Electronics Engineering" },
  { regex: /(?:03|ME|MECH|BME)(?![0-9A-Z])/i, name: "Mechanical Engineering" },
  { regex: /(?:01|CE|CIVIL)(?![0-9A-Z])/i, name: "Civil Engineering" },
  { regex: /(?:CH|CHEM|08)(?![0-9A-Z])/i, name: "Chemical Engineering" },
  { regex: /(?:BT|BIO|10)(?![0-9A-Z])/i, name: "Biotechnology Engineering" },
];

export function resolveStudentDetails(rollNo: string, email: string = ""): ResolvedStudentDetails {
  if (!rollNo || typeof rollNo !== "string") {
    return {
      rollNo: "",
      collegeName: null,
      stream: null,
      batchYear: null,
      graduationYear: null,
      identified: false,
    };
  }

  const cleanRoll = rollNo.trim().toUpperCase().replace(/[\s-]/g, "");
  const cleanEmail = (email || "").trim().toLowerCase();

  let batchYear: number | null = null;
  let graduationYear: number | null = null;
  let stream: string | null = null;
  let collegeName: string | null = null;
  let identified = false;

  // 1. Resolve Batch & Graduation Year
  const year4Match = cleanRoll.match(/^(20[12][0-9])/);
  const year2Match = cleanRoll.match(/^([12][0-9])/);

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

  // 2. Resolve Stream / Department
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
    for (const b of BRANCH_PATTERNS) {
      if (b.regex.test(cleanRoll)) {
        stream = b.name;
        identified = true;
        break;
      }
    }
  }

  if (!stream) {
    if (cleanRoll.includes("CSE") || cleanRoll.includes("CS")) stream = "Computer Science & Engineering";
    else if (cleanRoll.includes("IT")) stream = "Information Technology";
    else if (cleanRoll.includes("ECE")) stream = "Electronics & Communication Engineering";
    else if (cleanRoll.includes("EEE")) stream = "Electrical & Electronics Engineering";
    else if (cleanRoll.includes("MECH") || cleanRoll.includes("ME")) stream = "Mechanical Engineering";
    else if (cleanRoll.includes("CIVIL") || cleanRoll.includes("CE")) stream = "Civil Engineering";
  }

  // 3. Resolve College / University
  if (cleanEmail && cleanEmail.includes("@")) {
    const domain = cleanEmail.split("@")[1];
    if (EMAIL_DOMAIN_MAP[domain]) {
      collegeName = EMAIL_DOMAIN_MAP[domain];
      identified = true;
    } else if (domain.endsWith(".edu") || domain.endsWith(".ac.in") || domain.endsWith(".edu.in")) {
      const mainPart = domain.split(".")[0];
      collegeName = `${mainPart.toUpperCase()} Institute of Technology`;
      identified = true;
    }
  }

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
