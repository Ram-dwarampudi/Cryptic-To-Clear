import { DoubtItem, UserDoubtStats } from "./community-api";

export const CURATED_DOUBT_STATS: UserDoubtStats = {
  user: {
    id: "77127a83-4add-435a-90f7-bf73471c23d2",
    name: "Ram Dwarampudi",
    karmaPoints: 120,
    role: "STUDENT",
  },
  doubtsAsked: 3,
  doubtsResolved: 2,
  answersGiven: 4,
  solutionsAccepted: 2,
  karmaPoints: 120,
};

export const CURATED_DOUBTS: DoubtItem[] = [
  {
    id: "8eab10b6-cba3-41db-b930-d6da91e65f2a",
    title: "Why does recursive quicksort cause RecursionError on already sorted arrays in Python?",
    description:
      "I implemented standard quicksort picking the first element as pivot. It passes random test cases, but when I input a sorted array of 5,000 integers, Python crashes with RecursionError: maximum recursion depth exceeded. How can I make it robust against sorted inputs?",
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
    tags: ["Algorithms", "QuickSort", "Recursion", "Python"],
    privacy: "PUBLIC",
    status: "RESOLVED",
    views: 84,
    answersCount: 1,
    hasAcceptedAnswer: true,
    hasFacultyEndorsement: true,
    createdAt: "2025-11-04T12:00:00.000Z",
    author: {
      id: "77127a83-4add-435a-90f7-bf73471c23d2",
      name: "Ram Dwarampudi",
      role: "STUDENT",
      batchYear: 2028,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=RoboForge",
      department: { code: "CSE", name: "Computer Science & Engineering" },
    },
    answers: [
      {
        id: "ans_quicksort_safe",
        content:
          "When you pick arr[0] as pivot on an already sorted array, one partition gets 0 elements and the other gets N-1 elements! This degrades your recurrence from O(N log N) to O(N^2) with a recursion tree depth of N=5000, which exceeds Python's default stack limit (1000). To fix this, pick a randomized pivot or use 3-way partitioning!",
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
        upvotes: 14,
        createdAt: "2025-11-04T14:20:00.000Z",
        author: {
          id: "30743284-a08d-4236-b592-6d36213fadf5",
          name: "Sai Katreddy",
          role: "STUDENT",
          avatar: "https://media.licdn.com/dms/image/v2/D5603AQE2SqPqvBSR-Q/profile-displayphoto-scale_200_200/B56ZwDPTSXK0AY-/0/1769580885033?e=2147483647&v=beta&t=49xdigAB6zIKnmrmLs3Mhze0n0hy39taFjPj_rACgCU",
          karmaPoints: 35,
          department: { code: "CSBS" },
        },
      },
    ],
  },
  {
    id: "4f934e56-4c63-4268-986b-23dafb881203",
    title: "Segmentation fault when freeing a binary tree in C - what am I doing wrong?",
    description:
      "My post-order free function works for small trees but throws a segmentation fault on skewed trees. Is my pointer traversal invalid?",
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
    tags: ["C", "Pointers", "MemoryManagement", "Trees"],
    privacy: "PUBLIC",
    status: "RESOLVED",
    views: 56,
    answersCount: 1,
    hasAcceptedAnswer: true,
    hasFacultyEndorsement: false,
    createdAt: "2025-11-08T09:30:00.000Z",
    author: {
      id: "99a7bcf2-7c11-4924-b9e3-5e959ffa5ce3",
      name: "Samrudh",
      role: "STUDENT",
      batchYear: 2028,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=24pa1a5713%40vishnu.edu.in",
      department: { code: "CSBS", name: "Computer Science & Business Systems" },
    },
    answers: [
      {
        id: "ans_free_tree_fix",
        content:
          "You are freeing `root` BEFORE recursing into its children! Once `free(root)` executes, accessing `root->left` or `root->right` is undefined behavior (Use-After-Free). Free children first, then free root:",
        codeSnippet: `void freeTree(Node* root) {
    if (root == NULL) return;
    freeTree(root->left);
    freeTree(root->right);
    free(root); // Free root LAST in post-order!
}`,
        isAccepted: true,
        isFacultyEndorsed: false,
        upvotes: 9,
        createdAt: "2025-11-08T10:15:00.000Z",
        author: {
          id: "usr_faculty_demo",
          name: "Dr. B.V. N. Rani",
          role: "FACULTY",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DrRani",
          karmaPoints: 120,
          department: { code: "CSE" },
        },
      },
    ],
  },
  {
    id: "5bf4d1a2-e181-4e9b-95ea-3c79620e5c1a",
    title: "Why does Java ConcurrentHashMap not allow null keys or values unlike standard HashMap?",
    description:
      "When submitting 10,000 tasks to an ArrayBlockingQueue backed ThreadPoolExecutor with CallerRunsPolicy, why does my main thread block instead of processing downstream tasks?",
    codeSnippet: `ExecutorService executor = new ThreadPoolExecutor(
    4, 8, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy()
);`,
    language: "java",
    tags: ["Java", "Concurrency", "ThreadPool", "Multithreading"],
    privacy: "PUBLIC",
    status: "OPEN",
    views: 38,
    answersCount: 0,
    hasAcceptedAnswer: false,
    hasFacultyEndorsement: false,
    createdAt: "2025-11-12T16:00:00.000Z",
    author: {
      id: "b8fc6314-a8a3-4544-b73e-811c3e90f289",
      name: "Praneetha",
      role: "STUDENT",
      batchYear: 2028,
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=LinusDev-8",
      department: { code: "CSBS", name: "Computer Science & Business Systems" },
    },
    answers: [],
  },
];
