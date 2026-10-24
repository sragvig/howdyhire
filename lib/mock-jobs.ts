import type { JobPosting } from "@/types";

// Sample Aggie Job Board listings. Companies are fictional placeholders until a
// real feed is wired up.
export const AGGIE_JOB_BOARD: JobPosting[] = [
  {
    id: "ajb-001",
    source: "aggie-board",
    title: "Software Engineering Intern",
    company: "Brazos Valley Systems",
    location: "Bryan, TX",
    employmentType: "internship",
    category: "engineering",
    description:
      "Join a small product team building internal tools for logistics customers. You'll ship features end to end, take part in code review, and present your work to stakeholders at the end of the summer.",
    keyCompetencies: [
      { name: "Collaboration", description: "Working in a cross-functional team", weight: 5 },
      { name: "Learning Agility", description: "Picking up unfamiliar code quickly", weight: 4 },
      { name: "Ownership", description: "Driving a feature from spec to release", weight: 4 },
      { name: "Communication", description: "Explaining technical decisions", weight: 3 },
    ],
  },
  {
    id: "ajb-002",
    source: "aggie-board",
    title: "Mechanical Engineering Co-op",
    company: "Lone Star Aerospace",
    location: "Fort Worth, TX",
    employmentType: "co-op",
    category: "engineering",
    description:
      "Support the structures team on design reviews, test planning, and failure analysis for airframe components. Co-ops rotate through manufacturing and test labs.",
    keyCompetencies: [
      { name: "Attention to Detail", description: "Precision in analysis and documentation", weight: 5 },
      { name: "Problem Solving", description: "Root-causing test failures", weight: 5 },
      { name: "Safety Mindset", description: "Following and improving safety procedures", weight: 4 },
      { name: "Teamwork", weight: 3 },
    ],
  },
  {
    id: "ajb-003",
    source: "aggie-board",
    title: "Process Engineering Intern",
    company: "Gulf Coast Energy Partners",
    location: "Houston, TX",
    employmentType: "internship",
    category: "engineering",
    description:
      "Work with plant engineers to analyze unit performance data and propose efficiency improvements at a refining facility. Includes field time and a final capstone presentation.",
    keyCompetencies: [
      { name: "Analytical Thinking", description: "Drawing conclusions from process data", weight: 5 },
      { name: "Initiative", description: "Proposing improvements unprompted", weight: 4 },
      { name: "Safety Mindset", weight: 4 },
      { name: "Communication", description: "Presenting to senior engineers", weight: 3 },
    ],
  },
  {
    id: "ajb-004",
    source: "aggie-board",
    title: "Civil Engineer I",
    company: "Twelfth Man Infrastructure",
    location: "Austin, TX",
    employmentType: "full-time",
    category: "engineering",
    description:
      "Entry-level role on a transportation design team handling roadway and drainage projects for municipal clients. EIT required within the first year.",
    keyCompetencies: [
      { name: "Client Focus", description: "Managing municipal stakeholder needs", weight: 4 },
      { name: "Time Management", description: "Balancing multiple project deadlines", weight: 4 },
      { name: "Teamwork", weight: 4 },
      { name: "Integrity", description: "Upholding professional engineering standards", weight: 5 },
    ],
  },
  {
    id: "ajb-005",
    source: "aggie-board",
    title: "Electrical Engineering Intern – Embedded Systems",
    company: "Kyle Field Robotics",
    location: "College Station, TX",
    employmentType: "internship",
    category: "engineering",
    description:
      "Design and debug firmware and PCBs for agricultural robotics prototypes. Expect hands-on lab work and fast iteration with the hardware team.",
    keyCompetencies: [
      { name: "Problem Solving", description: "Debugging hardware/software issues", weight: 5 },
      { name: "Resilience", description: "Iterating after failed prototypes", weight: 4 },
      { name: "Collaboration", weight: 3 },
      { name: "Curiosity", weight: 3 },
    ],
  },
  {
    id: "ajb-006",
    source: "aggie-board",
    title: "Financial Analyst Intern",
    company: "Maroon Capital Advisors",
    location: "Dallas, TX",
    employmentType: "internship",
    category: "business",
    description:
      "Support the corporate finance team with forecasting, variance analysis, and board-deck preparation. Interns own one analysis project presented to the CFO.",
    keyCompetencies: [
      { name: "Analytical Thinking", weight: 5 },
      { name: "Attention to Detail", description: "Accuracy under deadline pressure", weight: 5 },
      { name: "Communication", description: "Summarizing findings for executives", weight: 4 },
      { name: "Integrity", weight: 3 },
    ],
  },
  {
    id: "ajb-007",
    source: "aggie-board",
    title: "Supply Chain Management Intern",
    company: "Reveille Retail Group",
    location: "San Antonio, TX",
    employmentType: "internship",
    category: "business",
    description:
      "Partner with distribution and vendor teams to reduce stockouts across regional stores. You'll analyze inventory data and lead a vendor improvement initiative.",
    keyCompetencies: [
      { name: "Leadership", description: "Leading without formal authority", weight: 4 },
      { name: "Problem Solving", weight: 4 },
      { name: "Negotiation", description: "Working with vendors toward shared goals", weight: 3 },
      { name: "Adaptability", description: "Responding to shifting demand", weight: 4 },
    ],
  },
  {
    id: "ajb-008",
    source: "aggie-board",
    title: "Associate Consultant",
    company: "Aggieland Strategy Group",
    location: "Houston, TX",
    employmentType: "full-time",
    category: "business",
    description:
      "Join client engagements across energy and healthcare, structuring ambiguous problems, building models, and presenting recommendations to client leadership.",
    keyCompetencies: [
      { name: "Structured Thinking", description: "Breaking down ambiguous problems", weight: 5 },
      { name: "Client Focus", weight: 4 },
      { name: "Teamwork", description: "Thriving on fast-moving case teams", weight: 4 },
      { name: "Executive Presence", description: "Presenting confidently to leaders", weight: 4 },
    ],
  },
  {
    id: "ajb-009",
    source: "aggie-board",
    title: "Marketing Analyst Intern",
    company: "Northgate Consumer Brands",
    location: "Remote (Texas)",
    employmentType: "internship",
    category: "business",
    description:
      "Measure campaign performance across digital channels and recommend budget shifts. Work closely with creative and product teams on launch planning.",
    keyCompetencies: [
      { name: "Data-Driven Decisions", weight: 4 },
      { name: "Creativity", description: "Proposing new campaign angles", weight: 3 },
      { name: "Collaboration", description: "Working with creative teams", weight: 4 },
      { name: "Communication", weight: 4 },
    ],
  },
];
