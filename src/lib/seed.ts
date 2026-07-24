/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // Department definitions with Stage 1 questions
  // -------------------------------------------------------------------------
  const departments = [
    // ── TECH ──────────────────────────────────────────────────────────────
    {
      slug: "development",
      name: "Development",
      type: "tech" as const,
      totalStages: 1,
      desc: "CONSTRUCTING SYSTEMS/PRODUCTS THAT NEED TO STAND, SCALE, AND FUNCTION RELIABLY",
      tagline: "BUILDING THE ARCHITECTURE AND CORE MOTORS THAT POWER DIGITAL PRODUCTS AND PLATFORMS",
      description: "FROM FRONTEND WIZARDRY TO ROBUST BACKEND PIPELINES, JOIN DEVELOPMENT TO WRITE CLEAN CODE, SOLVE REAL-WORLD ENGINEERING PROBLEMS, AND SHIP PRODUCTION-READY APPS.",
      skills: "REACT · NEXT.JS · NODE.JS · SYSTEM DESIGN",
      iconType: "dev",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
          title: "Development Domain Questions",
          description:
            "Select your primary track and answer the technical depth questions for your experience level.",
          formFields: [
            // Track Selection
            {
              id: "devTrack",
              label: "Which track are you applying for?",
              type: "radio" as const,
              options: ["Web Dev", "Mobile Dev", "Web3"],
              required: true,
              subDomain: "common",
              targetYears: ["all"],
            },

            // ── WEB DEV: 1st Year (Freshers) ──────────────────────────────────
            {
              id: "web_1st_1",
              label: "A webpage looks perfect on your laptop but broken on your phone — what do you think is going wrong?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_2",
              label: "What's the difference between a page that fully reloads vs. one that updates content without refreshing (like Instagram's feed) — why does that matter for user experience?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_3",
              label: "Two people edit a Google Doc at the same time and both changes show up instantly — what do you think is happening behind the scenes?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_4",
              label: "You're building a login form — what are 2–3 things that could go wrong if you don't validate what the user types?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_5",
              label: "A website takes 8 seconds to load — from a user's perspective (not code), what 2–3 things could be causing that?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_6",
              label: "You fill out a form, hit submit, and see 'Thank you' — but the data never actually saved anywhere. What went wrong, and where?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_7",
              label: "Why do some websites ask you to log in again after a while, even if you never logged out yourself?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web_1st_8",
              label: "A link a friend sends you shows a preview (image + title) on WhatsApp before you click it — how do you think that preview is generated?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },

            // ── WEB DEV: Senior Years (2nd, 3rd, 4th Year) ───────────────────
            {
              id: "web_sr_1",
              label: "A user says 'the site logged me out randomly' — what 2–3 things would you suspect first? (cookies, tokens, CORS, etc.)",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_2",
              label: "Walk through, at a high level, what happens between a browser sending a request and a page appearing on screen (DNS, request, response, render).",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_3",
              label: "How do you handle authentication state across a Next.js frontend and a separate backend — cookies vs. tokens vs. sessions?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_4",
              label: "A useEffect runs twice in dev only — bug or expected? Why?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_5",
              label: "What is CORS, why does it exist, and how have you actually fixed a CORS error before?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_6",
              label: "Two users submit the same form within milliseconds — how do you prevent a duplicate database entry?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_7",
              label: "What is WebRTC, and what kind of application would need it that a normal HTTP request/response can't handle?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web_sr_8",
              label: "What's the difference between cache-busting with a hash/version vs. just setting a short expiry time?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },

            // ── MOBILE DEV: 1st Year (Freshers) ──────────────────────────────
            {
              id: "mobile_1st_1",
              label: "An app works fine on WiFi but breaks or freezes on mobile data — what do you think could be different?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_2",
              label: "You scroll Instagram, switch to WhatsApp, and come back 10 minutes later — Instagram is exactly where you left it. How do you think it 'remembered' that?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_3",
              label: "An app needs to show a list of items and let you tap one to see details — how many 'screens' do you think that involves, and how would they connect?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_4",
              label: "What do you think happens when you tap an app icon on your phone — what has to load for the app to open?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_5",
              label: "Why can't Android and iOS apps just be the same code copy-pasted, even though they do the same thing?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_6",
              label: "Why do you think mobile apps ask for permissions (camera, location, notifications) instead of just having access to everything automatically?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_7",
              label: "What's the difference between a bug that crashes the app immediately vs. one that just makes something 'look wrong' (e.g., a broken layout)? Which is usually easier to find, and why?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_8",
              label: "You update an app from the Play Store/App Store — where does the old data (like your saved settings) go? Does it just vanish?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "mobile_1st_9",
              label: "What do you think an 'API' is, in the context of a mobile app pulling data from a server?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["1st Year"],
              maxLength: 800,
            },

            // ── MOBILE DEV: Senior Years (2nd, 3rd, 4th Year) ────────────────
            {
              id: "mobile_sr_1",
              label: "A user loses internet mid-action (e.g., submitting a form) — what should the app do?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "mobile_sr_2",
              label: "What's the difference between an app being 'backgrounded' and actually 'killed' by the OS — and why does this matter for how you save state?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "mobile_sr_3",
              label: "What causes a long list or feed to feel 'janky' when scrolling, and what's the general fix regardless of framework?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "mobile_sr_4",
              label: "What's actually happening under the hood when a cross-platform framework (Flutter/React Native) renders UI — is it really 'native,' or something else?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "mobile_sr_5",
              label: "When is it better to use local storage (SQLite, Room, CoreData) rather than calling an API every time?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "mobile_sr_6",
              label: "At a high level, how does a backend server actually get a notification to show up on a specific user's phone?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "mobile_sr_7",
              label: "What are a couple of reasons a mobile app's build size balloons over time, and how would you go about reducing it?",
              type: "textarea" as const,
              required: true,
              subDomain: "Mobile Dev",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },

            // ── WEB3: 1st Year (Freshers) ──────────────────────────────────────
            {
              id: "web3_1st_1",
              label: "If blockchain records are visible to everyone, why can't someone else spend your crypto just by seeing your wallet address?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_2",
              label: "What do you think a 'wallet' actually stores — is it storing your crypto, or something else?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_3",
              label: "Sending money through a bank takes 'processing time,' but people say crypto transactions are faster or slower depending on the situation — what do you think affects that speed?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_4",
              label: "If you've heard the term 'mining' or 'staking,' what's your guess at what's actually happening — what are people's computers or money doing?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_5",
              label: "Why do you think some cryptocurrencies (like Bitcoin) have a fixed total supply, while regular currency (like the Rupee) doesn't?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_6",
              label: "If a smart contract is just code, why can't someone just edit it later to fix a bug, the way you'd edit an app?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_7",
              label: "What's your understanding of the difference between a centralized exchange (like CoinDCX/WazirX) and a decentralized one — why would that distinction matter to a user?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },
            {
              id: "web3_1st_8",
              label: "If two people make a bet and want a smart contract to automatically pay the winner, why would they trust code instead of trusting each other?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["1st Year"],
              maxLength: 800,
            },

            // ── WEB3: Senior Years (2nd, 3rd, 4th Year) ──────────────────────
            {
              id: "web3_sr_1",
              label: "What's the difference between a private key and a seed phrase — and why is losing one recoverable but losing the other isn't?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_2",
              label: "What's a reentrancy attack, and why was it significant enough to cause one of the biggest hacks in crypto history?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_3",
              label: "Why can't a smart contract just fetch data (like a stock price) from the internet directly — what problem do oracles like Chainlink solve?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_4",
              label: "What's the difference between an ERC-20 and an ERC-721 token at a technical level — not just 'fungible vs. non-fungible,' but why that distinction exists in the contract code?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_5",
              label: "When a dApp says 'Connect Wallet' and you click MetaMask, what's actually happening behind the scenes between the browser and your wallet?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_6",
              label: "A user clicks 'Buy' and the transaction is 'pending' for 2 minutes. What's happening during that time, and what could make it fail even after waiting?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_7",
              label: "If someone wants to move a token from Ethereum to Polygon, what's really happening — is the token 'moving,' or something else entirely?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },
            {
              id: "web3_sr_8",
              label: "Why do most serious dApps use something like The Graph instead of just querying the blockchain directly for data to display in the UI?",
              type: "textarea" as const,
              required: true,
              subDomain: "Web3",
              targetYears: ["Senior Years", "2nd Year", "3rd Year", "4th Year"],
              maxLength: 800,
            },

            // ── COMMON SHARED FIELDS ──────────────────────────────────────────
            {
              id: "outsideCoursework",
              label: "Have you built anything outside coursework? Share a link (GitHub, deployed project, Play Store, anything). If you haven't yet, that's fine — just say so.",
              type: "textarea" as const,
              placeholder: "Links, projects, repos...",
              required: true,
              subDomain: "common",
              targetYears: ["all"],
              maxLength: 800,
            },
            {
              id: "whyDept",
              label: "In 2–3 sentences, why this department and not another club or department?",
              type: "textarea" as const,
              placeholder: "Tell us what draws you to Development...",
              required: true,
              subDomain: "common",
              targetYears: ["all"],
              maxLength: 600,
            },
            {
              id: "hackathonPace",
              label: "This club involves late nights before events and hackathons — are you comfortable with that kind of pace?",
              type: "radio" as const,
              options: ["Yes, absolutely", "Yes, with prior notice", "No"],
              required: true,
              subDomain: "common",
              targetYears: ["all"],
            },
            {
              id: "techStack",
              label: "What's your tech stack of choice right now? (HTML/CSS, JS, React, Node, Express, MongoDB, SQL/Postgres, Next.js, Tailwind, React Native, Flutter, Kotlin, Swift, MetaMask, Remix, …)",
              type: "text" as const,
              placeholder: "e.g. React, Node.js, TailwindCSS",
              required: true,
              subDomain: "common",
              targetYears: ["all"],
              maxLength: 300,
            },
            {
              id: "githubUrl",
              label: "GitHub Profile URL",
              type: "url" as const,
              placeholder: "https://github.com/yourhandle",
              required: false,
              subDomain: "common",
              targetYears: ["all"],
            },
            {
              id: "portfolioUrl",
              label: "Portfolio / Personal Website URL",
              type: "url" as const,
              placeholder: "https://yourportfolio.dev",
              required: false,
              subDomain: "common",
              targetYears: ["all"],
            },
            {
              id: "projectPdf",
              label: "Upload your Task Project PDF",
              type: "file" as const,
              required: true,
              subDomain: "common",
              targetYears: ["all"],
            },
            {
              id: "taskGithubUrl",
              label: "GitHub Repository URL for the task",
              type: "url" as const,
              required: true,
              subDomain: "common",
              targetYears: ["all"],
            },
            {
              id: "taskDeployedUrl",
              label: "Deployed Project Link (if applicable)",
              type: "url" as const,
              required: false,
              subDomain: "common",
              targetYears: ["all"],
            },
          ],
        },
      ],
    },

    {
      slug: "competitive-coding",
      name: "Competitive Coding",
      type: "tech" as const,
      totalStages: 1,
      desc: "LITERALLY ADVERSARIAL/COMPETITIVE, PUZZLE-SOLVING UNDER RULES AND TIME PRESSURE",
      tagline: "MASTERING ALGORITHMS, DATA STRUCTURES, AND SPEED TO CONQUER COMPLEX LOGICAL CHALLENGES",
      description: "LOVE CRUSHING TIMEOUTS AND OPTIMIZING CODE TO O(1)? JOIN COMPETITIVE CODING TO TRAIN FOR HACKATHONS, ICPC, CONTESTS, AND BECOME AN ALGORITHMIC NINJA.",
      skills: "C++ · PYTHON · DSA · DYNAMIC PROGRAMMING",
      iconType: "cc",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
      totalStages: 1,
      desc: "DESIGNING STRUCTURAL FLOWS AND SYSTEMS USERS NAVIGATE — ARCHITECTURE OF EXPERIENCE",
      tagline: "UI/UX IS ABOUT GUIDING USERS THROUGH A STRUCTURE/FLOW, HELPING THEM NAVIGATE WITHOUT GETTING LOST",
      description: "PASSIONATE ABOUT HOW THINGS LOOK AND FEEL? JOIN UI/UX AND HELP DESIGN THE INTERFACES AND EXPERIENCES THAT CONNECT PEOPLE TO TECHNOLOGY — ONE THOUGHTFUL PIXEL AND FLOW AT A TIME.",
      skills: "FIGMA · UI CRAFT · FRAMES",
      iconType: "uiux",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
            {
              id: "projectPdf",
              label: "Upload your Task Design PDF / Presentation",
              type: "file" as const,
              required: true,
            },
            {
              id: "taskFigmaUrl",
              label: "Figma File URL for the task",
              type: "url" as const,
              required: true,
            },
            {
              id: "taskDeployedUrl",
              label: "Live Prototype Link (if applicable)",
              type: "url" as const,
              required: false,
            },
          ],
        },
      ],
    },

    {
      slug: "ai-ml",
      name: "AI/ML",
      type: "tech" as const,
      totalStages: 1,
      desc: "HEAVY EXPERIMENTATION, ITERATION, TINKERING WITH MODELS/DATA UNTIL SOMETHING WORKS — CRAFT-DRIVEN",
      tagline: "TEACHING MACHINES TO LEARN, PREDICT, AND REASON THROUGH DATA AND NEURAL ARCHITECTURES",
      description: "FASCINATED BY LLMS, COMPUTER VISION, AND DEEP LEARNING? JOIN AI/ML TO BUILD INTELLIGENT AGENTS, TRAIN NEURAL NETWORKS, AND PUSH THE FRONTIERS OF AI.",
      skills: "PYTORCH · TENSORFLOW · LLMS · DATA SCIENCE",
      iconType: "aiml",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
            {
              id: "projectPdf",
              label: "Upload your Task Analysis/Report PDF",
              type: "file" as const,
              required: true,
            },
            {
              id: "taskGithubUrl",
              label: "GitHub/Colab URL for the task",
              type: "url" as const,
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
      totalStages: 1,
      desc: "ATTACKER-VS-DEFENDER MINDSET, CTF CULTURE, EXPLOITING/PATCHING CAT-AND-MOUSE",
      tagline: "PROTECTING DIGITAL ASSETS, ETHICAL HACKING, AND MASTERING THE ART OF DEFENSE AND OFFENSE",
      description: "READY TO CRACK CODES AND DEFEND SYSTEMS? JOIN CYBER SECURITY TO COMPETE IN CAPTURE-THE-FLAG (CTF) CONTESTS, PERFORM VULNERABILITY ASSESSMENTS, AND LEARN NETWORK SECURITY.",
      skills: "CTF · ETHICAL HACKING · CRYPTOGRAPHY · PEN TESTING",
      iconType: "cyber",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
      totalStages: 1,
      desc: "CRAFTING THE CLUB'S VISUAL IDENTITIES, MERCHANDISE, POSTERS, AND DIGITAL ART.",
      tagline: "COMMUNICATING IDEAS AND STORIES THROUGH VISUAL ART, BRANDING, AND GRAPHIC MASTERY",
      description: "HAVE AN EYE FOR COLOR, TYPOGRAPHY, AND COMPOSITION? JOIN THE DESIGN QUEST TO CREATE STUNNING POSTERS, SOCIAL MEDIA ASSETS, AND BRANDING THAT DEFINE MIC.",
      skills: "PHOTOSHOP · ILLUSTRATOR · GRAPHIC ART · BRANDING",
      iconType: "design",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
      totalStages: 1,
      desc: "THE BACKBONE OF CLUB OPERATIONS, EVENT LOGISTICS, AND PEOPLE LEADERSHIP.",
      tagline: "ORCHESTRATING EVENTS, LEADING TEAMS, AND TURNING BIG IDEAS INTO SEAMLESS EXECUTION",
      description: "THRIVE ON LEADERSHIP, STRATEGY, AND ORGANIZING HACKATHONS AND WORKSHOPS? JOIN MANAGEMENT TO DIRECT MAJOR EVENTS, MANAGE LOGISTICS, AND CONNECT THE TECH ECOSYSTEM.",
      skills: "EVENT MANAGEMENT · STRATEGY · LEADERSHIP · OPERATIONS",
      iconType: "mgmt",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
      totalStages: 1,
      desc: "INNOVATION MEETS BUSINESS STRATEGY, PRODUCT MARKET FIT, AND PITCH DECKS.",
      tagline: "IDENTIFYING MARKET GAPS, PITCHING VENTURES, AND TRANSFORMING PROJECTS INTO STARTUPS",
      description: "DREAM OF LAUNCHING YOUR OWN STARTUP? JOIN ENTREPRENEURSHIP TO LEARN PITCHING, BUSINESS MODELS, PRODUCT INCUBATION, AND BUILD THE NEXT GENERATION OF DISRUPTIVE VENTURES.",
      skills: "PITCHING · BUSINESS STRATEGY · PRODUCT INCUBATION",
      iconType: "ep",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
      totalStages: 1,
      desc: "CONTENT CREATION, VIDEO PRODUCTION, SOCIAL MEDIA PRESENCE, AND PUBLIC RELATIONS.",
      tagline: "CAPTURING STORIES, DIRECTING MEDIA, AND CRAFTING COMPELLING NARRATIVES FOR THE WORLD",
      description: "PASSIONATE ABOUT FILMING, EDITING, COPYWRITING, AND SOCIAL MEDIA? JOIN CONTENT & MEDIA TO BROADCAST MIC'S IMPACT, DIRECT CREATIVE REELS, AND ENGAGE OUR COMMUNITY.",
      skills: "VIDEO EDITING · COPYWRITING · SOCIAL MEDIA · PR",
      iconType: "media",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
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
  const S3_BASE = `https://${process.env.AWS_S3_BUCKET_NAME || "mic-recruitment-portal-files"}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/tasks`;

  const DEPT_TASKS: Record<string, { title: string; description: string; pdf: string }> = {
    development: {
      title: "Development Task",
      description: "Build a responsive Next.js application that integrates with a public API (e.g. Weather, GitHub, or NASA) and displays data interactively. Add a search filter and persistent local storage.",
      pdf: `${S3_BASE}/development-task.pdf`,
    },
    "competitive-coding": {
      title: "Competitive Coding Task",
      description: "Solve the set of 3 advanced data structure and dynamic programming problems hosted on HackerRank/Codeforces. Ensure optimal time complexity.",
      pdf: `${S3_BASE}/cc-task.pdf`,
    },
    "ui-ux": {
      title: "UI/UX Task",
      description: "Redesign the dashboard UI for a modern digital wallet application. Create high-fidelity wireframes and interactive prototypes in Figma with micro-interactions.",
      pdf: `${S3_BASE}/uiux-task.pdf`,
    },
    "ai-ml": {
      title: "AI/ML Task",
      description: "Build a predictive machine learning model using PyTorch or Scikit-learn. Perform EDA on the provided dataset, train the model, and submit a Jupyter notebook.",
      pdf: `${S3_BASE}/aiml-task.pdf`,
    },
    "cyber-security": {
      title: "Cyber Security Task",
      description: "Find and exploit the vulnerabilities in the target virtual machine. Provide a detailed walkthrough of your flags captured and a mitigation report.",
      pdf: `${S3_BASE}/cyber-task.pdf`,
    },
    design: {
      title: "Design Task",
      description: "Design a poster, social media banner, and a custom sticker sheet for MIC's upcoming annual hackathon 'DevSpace'. Maintain cohesive branding.",
      pdf: `${S3_BASE}/design-task.pdf`,
    },
    management: {
      title: "Management Task",
      description: "Draft a comprehensive event proposal for a 24-hour campus hackathon. Include timeline, logistics checklist, sponsor outreach email drafts, and budget.",
      pdf: `${S3_BASE}/mgmt-task.pdf`,
    },
    entrepreneurship: {
      title: "Entrepreneurship Task",
      description: "Prepare a 10-slide pitch deck and a Lean Canvas for a SaaS startup solving a student lifestyle problem. Focus on value prop and unit economics.",
      pdf: `${S3_BASE}/ep-task.pdf`,
    },
    "content-media": {
      title: "Content & Media Task",
      description: "Create a 60-second video trailer promoting MIC recruitments. Write a copy deck with 3 sample Instagram posts and captions.",
      pdf: `${S3_BASE}/media-task.pdf`,
    },
  };

  for (const dept of departments) {
    const taskInfo = DEPT_TASKS[dept.slug];
    if (taskInfo) {
      (dept as any).totalStages = 2;
      (dept as any).stages = [
        ...dept.stages,
        {
          stage: 2,
          title: taskInfo.title,
          description: taskInfo.description,
          taskPdf: taskInfo.pdf,
          formFields: [
            {
              id: "githubUrl",
              label: "GitHub Repository URL",
              type: "url" as const,
              placeholder: "https://github.com/username/repo",
              required: true,
            },
            {
              id: "demoUrl",
              label: "Live Demo / Deployment URL",
              type: "url" as const,
              placeholder: "https://project-demo.vercel.app",
              required: false,
            },
            {
              id: "comments",
              label: "Additional Notes / Comments",
              type: "textarea" as const,
              placeholder: "Explain your design choices, setup instructions, or assumptions...",
              required: false,
              maxLength: 600,
            },
          ],
        }
      ];
    }

    await Department.findOneAndUpdate(
      { slug: dept.slug },
      { $set: dept },
      { upsert: true, new: true }
    );
    console.log(`✅ Upserted department: ${dept.name} with totalStages: ${(dept as any).totalStages}`);
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
