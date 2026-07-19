import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { SavedJob } from "../models/SavedJob";
import mongoose from "mongoose";

const SAMPLE_JOBS: Array<{
  title: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "hybrid" | "onsite";
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  tags: string[];
}> = [
  {
    title: "Senior Frontend Engineer",
    location: "San Francisco, CA",
    type: "full-time",
    workMode: "hybrid",
    salaryMin: 150000,
    salaryMax: 190000,
    description:
      "Own the React front-end for our core product, working closely with design and backend teams to ship polished, accessible UI.",
    requirements: [
      "5+ years with React/TypeScript",
      "Experience with design systems",
      "Strong CSS fundamentals",
    ],
    tags: ["react", "typescript", "frontend"],
  },
  {
    title: "Backend Engineer (Node.js)",
    location: "Remote",
    type: "full-time",
    workMode: "remote",
    salaryMin: 130000,
    salaryMax: 170000,
    description:
      "Design and build scalable APIs and services powering our platform, with a focus on data integrity and performance.",
    requirements: [
      "Strong Node.js/Express experience",
      "MongoDB or similar NoSQL database",
      "API design experience",
    ],
    tags: ["node", "express", "mongodb", "backend"],
  },
  {
    title: "Product Designer",
    location: "New York, NY",
    type: "full-time",
    workMode: "onsite",
    salaryMin: 110000,
    salaryMax: 145000,
    description:
      "Lead end-to-end product design for new features, from research through high-fidelity prototypes.",
    requirements: [
      "Portfolio demonstrating end-to-end process",
      "Figma proficiency",
      "Experience with design systems",
    ],
    tags: ["design", "figma", "ux"],
  },
  {
    title: "DevOps Engineer",
    location: "Austin, TX",
    type: "contract",
    workMode: "remote",
    salaryMin: 90,
    salaryMax: 120,
    description:
      "Improve our CI/CD pipelines and cloud infrastructure reliability across AWS and Vercel.",
    requirements: [
      "GitHub Actions experience",
      "AWS or similar cloud platform",
      "Infrastructure as code",
    ],
    tags: ["devops", "aws", "ci-cd"],
  },
  {
    title: "Marketing Intern",
    location: "Remote",
    type: "internship",
    workMode: "remote",
    salaryMin: 20,
    salaryMax: 25,
    description:
      "Support the marketing team with content creation, social media, and campaign analytics.",
    requirements: [
      "Currently pursuing a degree in Marketing or related field",
      "Strong writing skills",
    ],
    tags: ["marketing", "internship"],
  },
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    SavedJob.deleteMany({}),
  ]);

  const employer = await User.create({
    name: "Dana Reyes",
    email: "employer@demo.io",
    password: "password@123",
    role: "employer",
    company: {
      name: "Northwind Labs",
      website: "https://northwind.example.com",
      about: "We build tools for remote teams.",
    },
  });

  const jobseeker = await User.create({
    name: "Jordan Lee",
    email: "jobseeker@demo.io",
    password: "password@123",
    role: "jobseeker",
    headline: "Full-stack developer",
    skills: ["JavaScript", "React", "Node.js"],
    location: "Remote",
  });

  await Job.insertMany(
    SAMPLE_JOBS.map((j) => ({
      ...j,
      companyName: employer.company?.name ?? "Northwind Labs",
      employer: employer._id,
    })),
  );

  // eslint-disable-next-line no-console
  console.log("Seeded database:");
  // eslint-disable-next-line no-console
  console.log(`  Employer login:  ${employer.email} / password@123`);
  // eslint-disable-next-line no-console
  console.log(`  Jobseeker login: ${jobseeker.email} / password@123`);
  // eslint-disable-next-line no-console
  console.log(`  Jobs created: ${SAMPLE_JOBS.length}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
