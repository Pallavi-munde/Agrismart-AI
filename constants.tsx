
import { JobDescription, CandidatePerformance } from './types';

export const MOCK_JOBS: JobDescription[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'EcoTech Solutions',
    location: 'San Francisco, CA',
    description: 'Looking for a rockstar developer with aggressive problem-solving skills to dominate the React ecosystem.',
    extractedSkills: ['React', 'TypeScript', 'Tailwind', 'Node.js'],
    biasScore: 65,
    biasFlags: ['rockstar', 'aggressive', 'dominate'],
    isTech: true
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Inclusive Minds',
    location: 'Remote',
    description: 'We are seeking a collaborative designer to build empathetic user experiences across our mobile platforms.',
    extractedSkills: ['Figma', 'UI/UX', 'Prototyping', 'Accessibility'],
    biasScore: 95,
    biasFlags: [],
    isTech: false
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'LogicFlow AI',
    location: 'New York, NY',
    description: 'Join our elite squad of data wizards to crunch massive datasets and deliver hyper-competitive insights.',
    extractedSkills: ['Python', 'SQL', 'PyTorch', 'Statistics'],
    biasScore: 40,
    biasFlags: ['elite squad', 'wizards', 'crunch', 'hyper-competitive'],
    isTech: true
  }
];

export const MOCK_CANDIDATES: CandidatePerformance[] = [
  {
    id: 'c1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'Senior Frontend Engineer',
    resumeScore: 88,
    aptitudeScore: 92,
    techScore1: 85,
    techScore2: 90,
    hackathonProject: 'Inclusive UI Kit',
    hackathonRank: 1,
    currentStage: 'HACKATHON',
    isFlagged: false
  }
];

export const HACKATHON_LEADERBOARD = [
  { id: 'l1', name: 'Alex Rivera', project: 'Inclusive UI Kit', rank: 1, score: 98, role: 'Senior Frontend Engineer' },
  { id: 'l2', name: 'Sarah Chen', project: 'EcoTracker Pro', rank: 2, score: 95, role: 'Full Stack Developer' },
  { id: 'l3', name: 'Marcus Thorne', project: 'Green Ledger', rank: 3, score: 92, role: 'Backend Engineer' },
  { id: 'l4', name: 'Priya Patel', project: 'SustainaBot', rank: 4, score: 89, role: 'AI Specialist' },
  { id: 'l5', name: 'David Kim', project: 'Carbon Zero', rank: 5, score: 85, role: 'Frontend Developer' },
  { id: 'l6', name: 'Elena Rossi', project: 'EthicalScout', rank: 6, score: 82, role: 'Product Designer' },
  { id: 'l7', name: 'Jordan Lee', project: 'ImpactMap', rank: 7, score: 79, role: 'Data Scientist' },
];

export const ASSESSMENT_QUESTIONS = {
  APTITUDE: [
    { id: 1, q: "If 5 machines can build 5 cars in 5 hours, how many machines would it take to build 100 cars in 100 hours?", options: ["5", "20", "100", "50"], correct: 0 },
    { id: 2, q: "Find the next number in the series: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "48"], correct: 2 },
    { id: 3, q: "Which word does not belong with the others? (Unicorn, Mermaid, Pegasus, Horse)", options: ["Unicorn", "Mermaid", "Pegasus", "Horse"], correct: 3 }
  ],
  TECHNICAL: [
    { id: 1, q: "What is the time complexity of searching in a balanced Binary Search Tree?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1 },
    { id: 2, q: "Which of these is NOT a React Hook?", options: ["useState", "useEffect", "useHistory", "useAction"], correct: 3 }
  ]
};

export const HACKATHON_PROBLEMS = [
  { 
    id: 'h1', 
    company: 'EcoTech Solutions', 
    title: 'Carbon Tracker Dashboard', 
    description: 'Build a real-time carbon footprint tracker using the provided JSON dataset. Focus on accessibility and visualization performance.',
    tags: ['Frontend', 'Charts', 'A11y']
  },
  { 
    id: 'h2', 
    company: 'LogicFlow AI', 
    title: 'Anonymized Recruitment Engine', 
    description: 'Develop a microservice that automatically masks personal identifiers from PDFs while preserving skill context.',
    tags: ['Backend', 'NLP', 'Privacy']
  }
];

export const MARKET_TRENDS_DATA = [
  { name: 'React', demand: 85, supply: 60 },
  { name: 'Python', demand: 92, supply: 70 },
  { name: 'Figma', demand: 75, supply: 45 },
  { name: 'TypeScript', demand: 80, supply: 50 }
];
