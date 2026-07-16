/**
 * Seed script — run once to populate departments and recruitment cycle.
 * Usage: npx tsx src/lib/seed.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// We import directly so this script can run standalone
async function run() {
  const uri = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URL is not set in .env.local");

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Dynamic imports after connection
  const { default: Department } = await import("../models/Department");
  const { default: RecruitmentCycle } = await import(
    "../models/RecruitmentCycle"
  );

  // -------------------------------------------------------------------------
  // Stage 1 — Personal Info (shared across all departments)
  // -------------------------------------------------------------------------
  const personalInfoStage = {
    stage: 1,
    title: "Personal Information",
    description:
      "Tell us about yourself. This information will be used across your entire application.",
    formFields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text" as const,
        placeholder: "e.g. Priya Sharma",
        required: true,
        maxLength: 80,
      },
      {
        id: "phone",
        label: "Phone Number",
        type: "text" as const,
        placeholder: "e.g. 9876543210",
        required: true,
        maxLength: 15,
      },
      {
        id: "regNo",
        label: "Registration Number",
        type: "text" as const,
        placeholder: "e.g. 23BCE1234",
        required: true,
        maxLength: 20,
      },
      {
        id: "year",
        label: "Year of Study",
        type: "select" as const,
        options: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        required: true,
      },
      {
        id: "branch",
        label: "Branch / Programme",
        type: "text" as const,
        placeholder: "e.g. B.Tech CSE",
        required: true,
        maxLength: 60,
      },
      {
        id: "whyMic",
        label: "Why do you want to join MIC?",
        type: "textarea" as const,
        placeholder: "Tell us what excites you about MIC...",
        required: true,
        maxLength: 500,
      },
    ],
  };

  // -------------------------------------------------------------------------
  // Department definitions with Stage 2 questions
  // -------------------------------------------------------------------------
  const departments = [
    // ── TECH ──────────────────────────────────────────────────────────────
    {
      slug: "development",
      name: "Development",
      type: "tech" as const,
      totalStages: 2,
      maxCapacity: 20,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Development Domain Questions",
          description:
            "Show us your technical depth. Answer honestly — we value clarity over jargon.",
          formFields: [
            {
              id: "devExperience",
              label: "What technologies/languages have you worked with? List your strongest ones.",
              type: "textarea" as const,
              placeholder: "e.g. JavaScript, React, Node.js, Python...",
              required: true,
              maxLength: 400,
            },
            {
              id: "projectDesc",
              label: "Describe a project you've built — what it does, how you built it, and the challenges you faced.",
              type: "textarea" as const,
              placeholder: "Walk us through your best work...",
              required: true,
              maxLength: 800,
            },
            {
              id: "githubUrl",
              label: "GitHub Profile URL",
              type: "url" as const,
              placeholder: "https://github.com/yourhandle",
              required: false,
            },
            {
              id: "portfolioUrl",
              label: "Portfolio / Personal Website URL",
              type: "url" as const,
              placeholder: "https://yourportfolio.dev",
              required: false,
            },
            {
              id: "techInterest",
              label: "Which area of development excites you the most?",
              type: "radio" as const,
              options: [
                "Frontend (Web UI)",
                "Backend / APIs",
                "Full-Stack",
                "Mobile",
                "DevOps / Infrastructure",
                "Open Source",
              ],
              required: true,
            },
            {
              id: "openSource",
              label: "Have you contributed to any open-source projects? If yes, describe briefly.",
              type: "textarea" as const,
              placeholder: "PRs, issues, repos...",
              required: false,
              maxLength: 400,
            },
          ],
        },
      ],
    },

    {
      slug: "competitive-coding",
      name: "Competitive Coding",
      type: "tech" as const,
      totalStages: 2,
      maxCapacity: 15,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Competitive Coding Domain Questions",
          description:
            "We want to know how you think algorithmically. Be specific.",
          formFields: [
            {
              id: "platform",
              label: "Which competitive programming platforms do you actively use?",
              type: "checkbox" as const,
              options: [
                "Codeforces",
                "LeetCode",
                "HackerRank",
                "CodeChef",
                "AtCoder",
                "SPOJ",
                "Other",
              ],
              required: true,
            },
            {
              id: "rating",
              label: "Your highest rating / rank on any platform (mention the platform).",
              type: "text" as const,
              placeholder: "e.g. Codeforces Rating 1450 (Specialist)",
              required: false,
              maxLength: 100,
            },
            {
              id: "profileUrl",
              label: "Link to your best competitive programming profile",
              type: "url" as const,
              placeholder: "https://codeforces.com/profile/...",
              required: false,
            },
            {
              id: "favAlgo",
              label: "What is your favourite algorithm or data structure and why?",
              type: "textarea" as const,
              placeholder: "Segment Trees, Dijkstra, Union-Find...",
              required: true,
              maxLength: 400,
            },
            {
              id: "hardProblem",
              label: "Describe the hardest problem you've solved. What was your approach?",
              type: "textarea" as const,
              placeholder: "Problem name, platform, your thinking...",
              required: true,
              maxLength: 600,
            },
            {
              id: "contest",
              label: "Have you participated in any ICPC / national-level contests?",
              type: "radio" as const,
              options: ["Yes", "No"],
              required: true,
            },
          ],
        },
      ],
    },

    {
      slug: "ui-ux",
      name: "UI/UX",
      type: "tech" as const,
      totalStages: 2,
      maxCapacity: 12,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "UI/UX Domain Questions",
          description:
            "We want to understand how you think about design problems and users.",
          formFields: [
            {
              id: "tools",
              label: "Which design tools are you comfortable with?",
              type: "checkbox" as const,
              options: [
                "Figma",
                "Adobe XD",
                "Sketch",
                "Photoshop",
                "Illustrator",
                "Protopie",
                "Other",
              ],
              required: true,
            },
            {
              id: "figmaUrl",
              label: "Link to your best Figma project or design portfolio",
              type: "url" as const,
              placeholder: "https://www.figma.com/...",
              required: false,
            },
            {
              id: "uxProcess",
              label: "Walk us through your design process for a new feature — from idea to handoff.",
              type: "textarea" as const,
              placeholder: "Research → wireframes → prototype → test → iterate...",
              required: true,
              maxLength: 600,
            },
            {
              id: "caseStudy",
              label: "Describe a UI/UX project you're proud of. What problem did it solve?",
              type: "textarea" as const,
              placeholder: "Problem, users, your solution, outcome...",
              required: true,
              maxLength: 700,
            },
            {
              id: "uxPrinciple",
              label: "Which UX principle do you find most critical and why?",
              type: "textarea" as const,
              placeholder: "Accessibility, Feedback, Consistency...",
              required: true,
              maxLength: 400,
            },
          ],
        },
      ],
    },

    {
      slug: "ai-ml",
      name: "AI/ML",
      type: "tech" as const,
      totalStages: 2,
      maxCapacity: 15,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "AI/ML Domain Questions",
          description:
            "Tell us about your machine learning journey. Both beginners and advanced learners are welcome.",
          formFields: [
            {
              id: "mlFrameworks",
              label: "Which ML/DL frameworks have you used?",
              type: "checkbox" as const,
              options: [
                "PyTorch",
                "TensorFlow / Keras",
                "Scikit-learn",
                "Hugging Face",
                "JAX",
                "OpenCV",
                "None yet — I'm learning",
              ],
              required: true,
            },
            {
              id: "mlProject",
              label: "Describe an ML project or experiment you've done. What was the dataset, model, and result?",
              type: "textarea" as const,
              placeholder: "Classification, regression, NLP, CV...",
              required: true,
              maxLength: 700,
            },
            {
              id: "kaggleUrl",
              label: "Kaggle profile or any relevant notebook link",
              type: "url" as const,
              placeholder: "https://kaggle.com/...",
              required: false,
            },
            {
              id: "mlArea",
              label: "Which area of AI/ML interests you most?",
              type: "radio" as const,
              options: [
                "Computer Vision",
                "Natural Language Processing",
                "Reinforcement Learning",
                "Generative AI / LLMs",
                "Data Science / Analytics",
                "MLOps",
                "Still exploring",
              ],
              required: true,
            },
            {
              id: "mathComfort",
              label: "How comfortable are you with the math behind ML (linear algebra, calculus, probability)?",
              type: "radio" as const,
              options: [
                "Very comfortable — I can derive things from scratch",
                "Comfortable — I understand the concepts",
                "Basic — I know enough to use libraries",
                "Still learning",
              ],
              required: true,
            },
          ],
        },
      ],
    },

    {
      slug: "cyber-security",
      name: "Cyber Security",
      type: "tech" as const,
      totalStages: 2,
      maxCapacity: 12,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Cyber Security Domain Questions",
          description:
            "We want ethical hackers, defenders, and curious minds. Tell us where you stand.",
          formFields: [
            {
              id: "ctfExperience",
              label: "Have you participated in any CTF (Capture the Flag) competitions?",
              type: "radio" as const,
              options: ["Yes, multiple", "Yes, once or twice", "No, but I want to", "No"],
              required: true,
            },
            {
              id: "ctfTeam",
              label: "CTF team name or CTFtime profile link (if applicable)",
              type: "text" as const,
              placeholder: "Team name or CTFtime URL",
              required: false,
              maxLength: 200,
            },
            {
              id: "cyberArea",
              label: "Which area of cyber security interests you most?",
              type: "radio" as const,
              options: [
                "Web Application Security",
                "Network Security",
                "Reverse Engineering",
                "Cryptography",
                "Forensics",
                "Malware Analysis",
                "Pen Testing",
                "Still exploring",
              ],
              required: true,
            },
            {
              id: "cyberProject",
              label: "Describe a security challenge you've solved or a vulnerability you've found (ethically).",
              type: "textarea" as const,
              placeholder: "CTF write-up, bug bounty find, lab exercise...",
              required: true,
              maxLength: 600,
            },
            {
              id: "tools",
              label: "Which security tools have you used?",
              type: "checkbox" as const,
              options: [
                "Burp Suite",
                "Wireshark",
                "Metasploit",
                "Nmap",
                "Ghidra / IDA",
                "Volatility",
                "None yet",
              ],
              required: false,
            },
          ],
        },
      ],
    },

    // ── NON-TECH ──────────────────────────────────────────────────────────
    {
      slug: "design",
      name: "Design",
      type: "non-tech" as const,
      totalStages: 2,
      maxCapacity: 15,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Design Domain Questions",
          description:
            "Show us your creative eye and design sensibility.",
          formFields: [
            {
              id: "designTools",
              label: "Which design tools do you use?",
              type: "checkbox" as const,
              options: [
                "Adobe Photoshop",
                "Adobe Illustrator",
                "Canva",
                "Figma",
                "Procreate",
                "After Effects",
                "Other",
              ],
              required: true,
            },
            {
              id: "portfolioUrl",
              label: "Portfolio link (Behance, Dribbble, Instagram, Drive, etc.)",
              type: "url" as const,
              placeholder: "https://www.behance.net/...",
              required: false,
            },
            {
              id: "designStyle",
              label: "How would you describe your design style?",
              type: "textarea" as const,
              placeholder: "Minimalist, bold, illustrative, typographic...",
              required: true,
              maxLength: 400,
            },
            {
              id: "designProject",
              label: "Tell us about a design project you're proud of — the brief, your process, and the outcome.",
              type: "textarea" as const,
              placeholder: "Poster, branding, logo, social media set...",
              required: true,
              maxLength: 700,
            },
            {
              id: "designInspiration",
              label: "Which designers, studios, or brands inspire you? Why?",
              type: "textarea" as const,
              placeholder: "Share names and what you love about their work",
              required: true,
              maxLength: 400,
            },
          ],
        },
      ],
    },

    {
      slug: "management",
      name: "Management",
      type: "non-tech" as const,
      totalStages: 2,
      maxCapacity: 15,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Management Domain Questions",
          description:
            "We're looking for leaders who can execute. Tell us about your experience.",
          formFields: [
            {
              id: "leadershipExp",
              label: "Describe a leadership role you've held — what was the team, what did you achieve?",
              type: "textarea" as const,
              placeholder: "Club role, event org, team project lead...",
              required: true,
              maxLength: 600,
            },
            {
              id: "eventOrganized",
              label: "Have you organized or co-organized any event? Describe the scale and your responsibilities.",
              type: "textarea" as const,
              placeholder: "Type of event, attendees, what you handled...",
              required: true,
              maxLength: 600,
            },
            {
              id: "conflictRes",
              label: "Describe a time you had to resolve a conflict within a team. What was your approach?",
              type: "textarea" as const,
              placeholder: "Situation, your action, the result...",
              required: true,
              maxLength: 500,
            },
            {
              id: "mgmtTools",
              label: "Which project management or productivity tools have you used?",
              type: "checkbox" as const,
              options: ["Notion", "Trello", "Jira", "Google Workspace", "Slack", "Monday.com", "None"],
              required: false,
            },
            {
              id: "whyMgmt",
              label: "Why specifically Management over other MIC departments?",
              type: "textarea" as const,
              placeholder: "Be honest — what draws you to ops and leadership?",
              required: true,
              maxLength: 400,
            },
          ],
        },
      ],
    },

    {
      slug: "entrepreneurship",
      name: "Entrepreneurship",
      type: "non-tech" as const,
      totalStages: 2,
      maxCapacity: 12,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Entrepreneurship Domain Questions",
          description:
            "We want builders who think in problems and solutions. Tell us how you see the world.",
          formFields: [
            {
              id: "startupIdea",
              label: "Do you have a startup idea you're working on or have thought about? Describe it briefly.",
              type: "textarea" as const,
              placeholder: "Problem, solution, target market...",
              required: true,
              maxLength: 600,
            },
            {
              id: "problemSolving",
              label: "Describe a real-world problem you've identified in your campus or community. How would you solve it?",
              type: "textarea" as const,
              placeholder: "Problem → solution → impact",
              required: true,
              maxLength: 600,
            },
            {
              id: "epExperience",
              label: "Have you been part of any startup, incubator, or entrepreneurship cell?",
              type: "radio" as const,
              options: ["Yes", "No"],
              required: true,
            },
            {
              id: "epDetails",
              label: "If yes, describe your role and what you learned.",
              type: "textarea" as const,
              placeholder: "Optional but great to share",
              required: false,
              maxLength: 500,
            },
            {
              id: "businessModel",
              label: "How comfortable are you with business concepts like unit economics, PMF, or go-to-market?",
              type: "radio" as const,
              options: [
                "Very — I actively study and apply them",
                "Moderate — I understand the basics",
                "Beginner — I'm learning",
              ],
              required: true,
            },
          ],
        },
      ],
    },

    {
      slug: "content-media",
      name: "Content & Media",
      type: "non-tech" as const,
      totalStages: 2,
      maxCapacity: 12,
      stages: [
        personalInfoStage,
        {
          stage: 2,
          title: "Content & Media Domain Questions",
          description:
            "We create stories, content, and media that define MIC's voice. Show us yours.",
          formFields: [
            {
              id: "contentType",
              label: "Which content types are you most comfortable creating?",
              type: "checkbox" as const,
              options: [
                "Short-form video (Reels, Shorts)",
                "Long-form video / editing",
                "Copywriting / blogs",
                "Photography",
                "Podcast / audio",
                "Social media strategy",
                "Graphic posts",
              ],
              required: true,
            },
            {
              id: "portfolioUrl",
              label: "Link to any content you've created (YouTube, Instagram, blog, Drive, etc.)",
              type: "url" as const,
              placeholder: "https://...",
              required: false,
            },
            {
              id: "contentProject",
              label: "Describe a piece of content you created that you're proud of — what was the goal, how did you make it, and what was the reception?",
              type: "textarea" as const,
              placeholder: "Video, article, campaign, reel...",
              required: true,
              maxLength: 700,
            },
            {
              id: "editingTools",
              label: "Which editing / creative tools do you use?",
              type: "checkbox" as const,
              options: [
                "Premiere Pro",
                "Final Cut Pro",
                "DaVinci Resolve",
                "CapCut",
                "After Effects",
                "Canva",
                "Lightroom",
                "Other",
              ],
              required: false,
            },
            {
              id: "micStory",
              label: "If you had to create one piece of content to showcase MIC to the entire VIT campus, what would it be and why?",
              type: "textarea" as const,
              placeholder: "Be creative — format, concept, execution...",
              required: true,
              maxLength: 500,
            },
          ],
        },
      ],
    },
  ];

  // -------------------------------------------------------------------------
  // Upsert departments
  // -------------------------------------------------------------------------
  for (const dept of departments) {
    await Department.findOneAndUpdate(
      { slug: dept.slug },
      { $set: dept },
      { upsert: true, new: true }
    );
    console.log(`✅ Upserted department: ${dept.name}`);
  }

  // -------------------------------------------------------------------------
  // Upsert recruitment cycle (open by default for dev)
  // -------------------------------------------------------------------------
  await RecruitmentCycle.findOneAndUpdate(
    { cycleId: "2026-27" },
    {
      $setOnInsert: {
        cycleId: "2026-27",
        isOpen: true,
        openedAt: new Date(),
        label: "MIC Recruitment 2026–27",
      },
    },
    { upsert: true, new: true }
  );
  console.log("✅ Recruitment cycle 2026-27 ready");

  await mongoose.disconnect();
  console.log("🎉 Seed complete!");
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
