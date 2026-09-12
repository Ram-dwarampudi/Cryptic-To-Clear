const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing tables (in order of relations)
  await prisma.doubtUpvote.deleteMany();
  await prisma.doubtAnswer.deleteMany();
  await prisma.doubt.deleteMany();
  await prisma.interviewExperience.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.university.deleteMany();

  // 1. Create Universities
  const uni = await prisma.university.create({
    data: {
      name: "Vishnu Educational Society",
      code: "VES",
      domain: "vishnu.edu.in",
      city: "Bhimavaram",
      state: "Andhra Pradesh",
      country: "India",
      logo: "https://api.dicebear.com/7.x/identicon/svg?seed=VESUni",
    },
  });

  // 2. Create Departments
  const cseDept = await prisma.department.create({
    data: {
      name: "Computer Science & Engineering",
      code: "CSE",
      universityId: uni.id,
    },
  });

  const csbsDept = await prisma.department.create({
    data: {
      name: "Computer Science & Business Systems",
      code: "CSBS",
      universityId: uni.id,
    },
  });

  // 3. Create Users
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const facultyPasswordHash = await bcrypt.hash("Faculty123!", 10);

  const ramStudent = await prisma.user.create({
    data: {
      id: "77127a83-4add-435a-90f7-bf73471c23d2",
      email: "24pa1a5720@vishnu.edu.in",
      name: "Ram Dwarampudi",
      passwordHash,
      role: "STUDENT",
      rollNo: "24PA1A5720",
      batchYear: 2028,
      karmaPoints: 120,
      overallScore: 1000,
      bio: "CSE undergraduate passionate about distributed systems and competitive programming.",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=RoboForge",
      collegeName: "Vishnu Educational Society",
      stream: "Computer Science & Engineering",
      branch: "CSE",
      section: "A",
      codechefHandle: "ram_dwarampudi",
      leetcodeHandle: "Ram_Dwarampudi",
      codeforcesHandle: "ramdwarampudi",
      hackerrankHandle: "ramdwarampudi19",
      githubHandle: "Ram-dwarampudi",
      universityId: uni.id,
      departmentId: cseDept.id,
    },
  });

  const facultyUser = await prisma.user.create({
    data: {
      id: "usr_faculty_demo",
      email: "faculty@cryptictoclear.io",
      name: "Dr. B.V. N. Rani",
      passwordHash: facultyPasswordHash,
      role: "FACULTY",
      rollNo: "FAC_CSE_01",
      karmaPoints: 120,
      bio: "Professor of Computer Science, Specialization in Compiler Design and Systems.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DrRani",
      collegeName: "Vishnu Educational Society",
      stream: "Computer Science & Engineering",
      branch: "CSE",
      universityId: uni.id,
      departmentId: cseDept.id,
    },
  });

  const samrudhStudent = await prisma.user.create({
    data: {
      id: "99a7bcf2-7c11-4924-b9e3-5e959ffa5ce3",
      email: "24pa1a5713@vishnu.edu.in",
      name: "Samrudh",
      passwordHash,
      role: "STUDENT",
      rollNo: "24PA1A5713",
      batchYear: 2028,
      karmaPoints: 40,
      overallScore: 162,
      bio: "CSBS student interested in full-stack architecture and data algorithms.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=24pa1a5713%40vishnu.edu.in",
      collegeName: "Vishnu Educational Society",
      stream: "Computer Science & Business Systems",
      branch: "CSBS",
      section: "A",
      leetcodeHandle: "rupasamrudh",
      universityId: uni.id,
      departmentId: csbsDept.id,
    },
  });

  const saiStudent = await prisma.user.create({
    data: {
      id: "30743284-a08d-4236-b592-6d36213fadf5",
      email: "24pa1a5730@vishnu.edu.in",
      name: "Sai Katreddy",
      passwordHash,
      role: "STUDENT",
      rollNo: "24PA1A5730",
      batchYear: 2028,
      karmaPoints: 35,
      overallScore: 68,
      bio: "CSBS student active in community doubt resolution and systems design.",
      avatar: "https://media.licdn.com/dms/image/v2/D5603AQE2SqPqvBSR-Q/profile-displayphoto-scale_200_200/B56ZwDPTSXK0AY-/0/1769580885033?e=2147483647&v=beta&t=49xdigAB6zIKnmrmLs3Mhze0n0hy39taFjPj_rACgCU",
      collegeName: "Vishnu Educational Society",
      stream: "Computer Science & Business Systems",
      branch: "CSBS",
      section: "A",
      leetcodeHandle: "vYeuVxyec7",
      codechefHandle: "svkatreddy",
      hackerrankHandle: "24pa1a5730",
      githubHandle: "svkatreddy",
      universityId: uni.id,
      departmentId: csbsDept.id,
    },
  });

  const praneethaStudent = await prisma.user.create({
    data: {
      id: "b8fc6314-a8a3-4544-b73e-811c3e90f289",
      email: "24pa1a5757@vishnu.edu.in",
      name: "Praneetha",
      passwordHash,
      role: "STUDENT",
      rollNo: "24PA1A5757",
      batchYear: 2028,
      karmaPoints: 25,
      overallScore: 50,
      bio: "CSBS student learning data structures and algorithmic efficiency.",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=LinusDev-8",
      collegeName: "Vishnu Educational Society",
      stream: "Computer Science & Business Systems",
      branch: "CSBS",
      section: "A",
      universityId: uni.id,
      departmentId: csbsDept.id,
    },
  });

  // 4. Create Interview Experiences
  await prisma.interviewExperience.create({
    data: {
      companyName: "Google",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      roleTitle: "Software Development Engineer - I",
      jobType: "FULL_TIME",
      packageCTC: "32 LPA (22 Base + Stock)",
      location: "Bangalore / Hyderabad",
      driveType: "ON_CAMPUS",
      difficulty: "HARD",
      selectionStatus: "SELECTED",
      graduationYear: 2025,
      studentId: ramStudent.id,
      universityId: uni.id,
      isAnonymous: false,
      summary: "Cracked Google On-Campus drive in Sept 2025. 1 OA round + 3 Technical interviews + 1 Googleyness fit round.",
      tips: "Never jump straight into coding! Explain brute force first, discuss time/space complexities, write modular code, and test with corner cases like empty arrays and integer overflows.",
      preparationResources: "LeetCode Top 150 Interview Questions, NeetCode 150, Striver's SDE Sheet, System Design Primer.",
      roundsData: JSON.stringify([
        {
          roundNumber: 1,
          roundName: "Online Assessment (OA)",
          roundType: "Coding",
          duration: "90 mins",
          details: "2 algorithmic problems on HackerEarth platform. Time was key.",
          questions: [
            "Given a tree with N weighted nodes, find the maximum path sum between any two leaves with an additional parity constraint.",
            "Dynamic Programming: Minimum number of operations to convert string A to B with custom character insertion penalties."
          ]
        },
        {
          roundNumber: 2,
          roundName: "Technical Round 1 (DSA & Core)",
          roundType: "Technical",
          duration: "45 mins",
          details: "Google Meet + Google Docs. Clean code and reasoning were scrutinized.",
          questions: [
            "Design an LRU Cache with Time-To-Live (TTL) expiration on each key. Required O(1) get and put.",
            "Variation: What happens when two threads call put() concurrently? Discuss lock-free approaches."
          ]
        },
        {
          roundNumber: 3,
          roundName: "Technical Round 2 (Algorithms & Graphs)",
          roundType: "Technical",
          duration: "45 mins",
          details: "Focused heavily on Graph Traversal and Topological sorting.",
          questions: [
            "Course Schedule II variation with cycle detection and lexicographically smallest order.",
            "Discussion on memory overhead of adjacency matrix vs adjacency list."
          ]
        },
        {
          roundNumber: 4,
          roundName: "Googleyness & Behavioral",
          roundType: "HR / Culture",
          duration: "30 mins",
          details: "Scenario questions about teamwork, handling constructive criticism, and managing deadlines.",
          questions: [
            "Tell me about a time you disagreed with a team lead on a technical approach.",
            "How do you handle ambiguous requirements when building a software component?"
          ]
        }
      ]),
      upvotes: 38,
    },
  });

  await prisma.interviewExperience.create({
    data: {
      companyName: "Amazon",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      roleTitle: "Software Development Engineer - I",
      jobType: "FULL_TIME",
      packageCTC: "28.5 LPA (17.5 Base + 7 Signon + RSUs)",
      location: "Hyderabad",
      driveType: "ON_CAMPUS",
      difficulty: "MEDIUM",
      selectionStatus: "SELECTED",
      graduationYear: 2025,
      studentId: samrudhStudent.id,
      universityId: uni.id,
      isAnonymous: false,
      summary: "Amazon Campus Hiring 2025. 1 OA round + 2 Technical Interviews combining DSA and Leadership Principles.",
      tips: "Amazon evaluates Leadership Principles in every single round! Format every story using STAR (Situation, Task, Action, Result). Know 'Customer Obsession' and 'Deliver Results' inside out.",
      preparationResources: "Amazon LP Guide, Leetcode Amazon Tagged Questions, Cracking the Coding Interview.",
      roundsData: JSON.stringify([
        {
          roundNumber: 1,
          roundName: "Online Assessment (OA)",
          roundType: "Coding + Work Simulation",
          duration: "105 mins",
          details: "2 Coding problems + 20 mins Work Style Assessment.",
          questions: [
            "Package delivery truck optimization (0/1 Knapsack variation with maximum weight constraint).",
            "String manipulation: Count pairs of substrings that form valid anagrams."
          ]
        },
        {
          roundNumber: 2,
          roundName: "Technical Interview 1",
          roundType: "Technical + LP",
          duration: "60 mins",
          details: "20 mins LP questions followed by 40 mins live coding.",
          questions: [
            "LP: Describe a time when you took calculated risk to complete a project on time.",
            "Coding: Binary Tree Vertical Order Traversal using BFS and Column indexing.",
            "Follow-up: How to handle duplicate values occurring at the exact same row and column."
          ]
        },
        {
          roundNumber: 3,
          roundName: "Technical Interview 2",
          roundType: "Technical + LP",
          duration: "60 mins",
          details: "Heavy focus on OOPS and Data Structure selection.",
          questions: [
            "LP: Tell me about a time you had to dive deep to fix a stubborn bug in production.",
            "Design an Autocomplete Search Suggestion system using Trie with frequency-based top 3 recommendations."
          ]
        }
      ]),
      upvotes: 29,
    },
  });

  await prisma.interviewExperience.create({
    data: {
      companyName: "Microsoft",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      roleTitle: "Software Engineer",
      jobType: "FULL_TIME",
      packageCTC: "24 LPA",
      location: "Bangalore / Noida",
      driveType: "ON_CAMPUS",
      difficulty: "MEDIUM",
      selectionStatus: "SELECTED",
      graduationYear: 2025,
      studentId: saiStudent.id,
      universityId: uni.id,
      isAnonymous: false,
      summary: "Campus recruitment drive in August 2025. 1 Codility test + 3 rounds of technical and managerial interviews.",
      tips: "Microsoft loves clean, production-level code. They check for null pointers, integer bounds, and code reusability.",
      preparationResources: "LeetCode Microsoft Tagged, Operating System internals by Galvin, DBMS normalization.",
      roundsData: JSON.stringify([
        {
          roundNumber: 1,
          roundName: "Codility Online Test",
          roundType: "Coding",
          duration: "90 mins",
          details: "3 coding tasks with strict edge-case validation.",
          questions: [
            "Minimum deletions required to make character frequencies unique.",
            "Traverse a 2D matrix representing connected grid islands with obstacle constraints."
          ]
        },
        {
          roundNumber: 2,
          roundName: "Technical Round 1",
          roundType: "Technical",
          duration: "45 mins",
          details: "DSA & OS concepts.",
          questions: [
            "Reverse nodes in k-Group in a Linked List in O(1) extra space.",
            "OS: Explain virtual memory, page fault handling, and deadlock prevention."
          ]
        },
        {
          roundNumber: 3,
          roundName: "Technical Round 2 & Fit",
          roundType: "Technical / Managerial",
          duration: "45 mins",
          details: "Project discussion and low-level design.",
          questions: [
            "Deep dive into project architecture: How does your compiler execute user code safely?",
            "Design a Parking Lot system using Object-Oriented principles."
          ]
        }
      ]),
      upvotes: 22,
    },
  });

  await prisma.interviewExperience.create({
    data: {
      companyName: "TCS",
      companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
      roleTitle: "Digital Cadre - Systems Engineer",
      jobType: "FULL_TIME",
      packageCTC: "7.5 LPA",
      location: "Pan India",
      driveType: "POOL_CAMPUS",
      difficulty: "EASY",
      selectionStatus: "SELECTED",
      graduationYear: 2025,
      studentId: praneethaStudent.id,
      universityId: uni.id,
      isAnonymous: true, // Anonymous showcase
      summary: "National Qualifier Test (NQT) followed by Technical + HR Interview. Digital cutoff was cleared easily with good practice.",
      tips: "Practice aptitude, logical reasoning, and basic coding on string/arrays. For technical round, know SQL joins, OOPS, and your final year project thoroughly.",
      preparationResources: "IndiaBix for Aptitude, GeeksforGeeks Top 50 Array Problems, SQL 50 LeetCode.",
      roundsData: JSON.stringify([
        {
          roundNumber: 1,
          roundName: "TCS NQT Exam",
          roundType: "Aptitude + Advanced Coding",
          duration: "180 mins",
          details: "Foundational Section (Quant/Verbal/Reasoning) + Advanced Coding.",
          questions: [
            "Rotate an array to the right by K steps in O(N) time and O(1) space.",
            "Calculate minimum cost to connect N ropes using a Min-Heap."
          ]
        },
        {
          roundNumber: 2,
          roundName: "Technical + MR + HR Interview",
          roundType: "Interview",
          duration: "35 mins",
          details: "Combined panel of 3 interviewers.",
          questions: [
            "What is the difference between Abstract Class and Interface in Java?",
            "Write an SQL query to find the second highest salary without using LIMIT.",
            "Why do you want to join TCS Digital instead of Ninja cadre?"
          ]
        }
      ]),
      upvotes: 18,
    },
  });

  // 5. Create Doubt Posts and Answers
  const doubt1 = await prisma.doubt.create({
    data: {
      title: "Why does recursive quicksort cause RecursionError on already sorted arrays in Python?",
      description: "I implemented standard quicksort picking the first element as pivot. It passes random test cases, but when I input a sorted array of 5,000 integers, Python crashes with `RecursionError: maximum recursion depth exceeded`. How can I make it robust against sorted inputs?",
      codeSnippet: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0] # Picking first element as pivot
    left = [x for x in arr[1:] if x <= pivot]
    right = [x for x in arr[1:] if x > pivot]
    return quicksort(left) + [pivot] + quicksort(right)

# Crashes here:
sorted_list = list(range(5000))
print(quicksort(sorted_list))`,
      language: "python",
      tags: JSON.stringify(["Algorithms", "QuickSort", "Recursion", "Python"]),
      privacy: "PUBLIC",
      status: "RESOLVED",
      authorId: ramStudent.id,
      universityId: uni.id,
      views: 64,
    },
  });

  const ans1 = await prisma.doubtAnswer.create({
    data: {
      content: "When you pick `arr[0]` as pivot on an already sorted array, one partition gets 0 elements and the other gets `N-1` elements! This degrades your recurrence from $O(N \\log N)$ to $O(N^2)$ with a recursion tree depth of $N=5000$, which exceeds Python's default stack limit (1000). To fix this, pick a randomized pivot or use 3-way partitioning!",
      codeSnippet: `import random

def quicksort_safe(arr):
    if len(arr) <= 1:
        return arr
    # Pick a random pivot to avoid O(N^2) on sorted inputs
    pivot_idx = random.randint(0, len(arr) - 1)
    pivot = arr[pivot_idx]
    
    left = [x for i, x in enumerate(arr) if x < pivot and i != pivot_idx]
    mid = [x for x in arr if x == pivot]
    right = [x for i, x in enumerate(arr) if x > pivot and i != pivot_idx]
    
    return quicksort_safe(left) + mid + quicksort_safe(right)

print(len(quicksort_safe(list(range(5000))))) # Works instantly!`,
      isAccepted: true,
      isFacultyEndorsed: true,
      endorsedByFacultyName: "Dr. B.V. N. Rani",
      doubtId: doubt1.id,
      authorId: saiStudent.id,
      upvotes: 14,
    },
  });

  // Link accepted answer to doubt
  await prisma.doubt.update({
    where: { id: doubt1.id },
    data: { resolvedAnswerId: ans1.id },
  });

  const doubt2 = await prisma.doubt.create({
    data: {
      title: "Segmentation fault when freeing a binary tree in C - what am I doing wrong?",
      description: "My post-order free function works for small trees but throws a segmentation fault on skewed trees. Is my pointer traversal invalid?",
      codeSnippet: `typedef struct Node {
    int val;
    struct Node* left;
    struct Node* right;
} Node;

void freeTree(Node* root) {
    if (root == NULL) return;
    free(root); // Freeing root before subtrees!
    freeTree(root->left);
    freeTree(root->right);
}`,
      language: "c",
      tags: JSON.stringify(["C", "Pointers", "MemoryManagement", "Trees"]),
      privacy: "ANONYMOUS_PEERS", // Posted anonymously to peers
      status: "RESOLVED",
      authorId: samrudhStudent.id,
      universityId: uni.id,
      views: 42,
    },
  });

  const ans2 = await prisma.doubtAnswer.create({
    data: {
      content: "You are calling `free(root)` before calling `freeTree(root->left)` and `freeTree(root->right)`! Once you free `root`, accessing `root->left` is an illegal dereference of freed memory (Use-After-Free). In a proper post-order traversal, always free subtrees first, then free the root.",
      codeSnippet: `void freeTree(Node* root) {
    if (root == NULL) return;
    freeTree(root->left);   // 1. Free left subtree
    freeTree(root->right);  // 2. Free right subtree
    free(root);             // 3. Finally free root node safely
}`,
      isAccepted: true,
      isFacultyEndorsed: true,
      endorsedByFacultyName: "Dr. B.V. N. Rani",
      doubtId: doubt2.id,
      authorId: facultyUser.id,
      upvotes: 11,
    },
  });

  await prisma.doubt.update({
    where: { id: doubt2.id },
    data: { resolvedAnswerId: ans2.id },
  });

  const doubt3 = await prisma.doubt.create({
    data: {
      title: "Why does Java ConcurrentHashMap not allow null keys or values unlike standard HashMap?",
      description: "In standard HashMap, `map.put(null, null)` works fine, but ConcurrentHashMap throws NullPointerException. What is the architectural reason behind this design decision?",
      codeSnippet: `Map<String, String> map = new ConcurrentHashMap<>();
map.put(null, "value"); // Throws NullPointerException! Why?`,
      language: "java",
      tags: JSON.stringify(["Java", "Concurrency", "Collections", "Multithreading"]),
      privacy: "PUBLIC",
      status: "OPEN",
      authorId: praneethaStudent.id,
      universityId: uni.id,
      views: 31,
    },
  });

  await prisma.doubtAnswer.create({
    data: {
      content: "Doug Lea (the author of java.util.concurrent) explained this: in a multithreaded map, `map.get(key) == null` creates ambiguity. Does the key not exist, or does the key map to `null`? In single-threaded HashMap, you could verify with `map.containsKey(key)`. But in a concurrent map, another thread could insert or remove the key between your `get()` and `containsKey()` calls! To eliminate this race condition, `null` is completely prohibited.",
      codeSnippet: null,
      isAccepted: false,
      isFacultyEndorsed: false,
      doubtId: doubt3.id,
      authorId: ramStudent.id,
      upvotes: 8,
    },
  });

  console.log("✅ Seeding completed successfully!");
  console.log(`   - 1 University (${uni.name})`);
  console.log(`   - 2 Departments`);
  console.log(`   - 5 Users (1 Faculty, 4 Real Students)`);
  console.log(`   - 4 Rich Interview Experiences (Google, Amazon, Microsoft, TCS)`);
  console.log(`   - 3 Real Doubt Threads with Code & Faculty Endorsements`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
