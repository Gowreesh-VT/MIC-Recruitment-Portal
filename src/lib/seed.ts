/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seed script — run once to populate departments and recruitment cycle.
 * Usage: npx tsx src/lib/seed.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// We import directly so this script can run standalone
async function run() {
  const uri = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URL or MONGODB_URI is not set in .env or .env.local");

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
              label: "What's your tech stack of choice right now?",
              type: "text" as const,
              placeholder: "e.g. React, Node.js, Next.js, TailwindCSS, Flutter, etc.",
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
              id: "cp_q1",
              label:
                "Why do you want to join the Competitive Programming team, and what do you hope to gain from this experience?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cp_q2",
              label:
                "Many people think DSA and Competitive Programming are the same. Do you agree? Why or why not?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cp_q3",
              label:
                "If selected, what initiatives or activities would you like to introduce to make the CP dept more engaging?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cp_q4",
              label:
                "Imagine you've been stuck on a problem for over an hour. What would you do next, and why?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cp_q5",
              label:
                "Do you have any prior experience in Competitive Programming (LeetCode, Codeforces, CodeChef, etc.), Mathematics Olympiads (IOQM, RMO, INMO, IMO, etc.), or any competitive coding/problem-solving events? If yes, please describe your experience and mention any ratings or achievements. If not, write \"NA\".",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "cp_q6",
              label:
                "Please share the links to your LeetCode, Codeforces, and CodeChef profiles (if applicable).\n\nExample:\n1) LeetCode: https://leetcode.com/username\n2) Codeforces: https://codeforces.com/profile/username\n3) CodeChef: https://www.codechef.com/users/username\n\nIf you do not have any of these profiles, please write \"NA\".",
              type: "url" as const,
              required: false,
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
      tagline:
        "UI/UX IS ABOUT GUIDING USERS THROUGH A STRUCTURE/FLOW, HELPING THEM NAVIGATE WITHOUT GETTING LOST",
      description:
        "PASSIONATE ABOUT HOW THINGS LOOK AND FEEL? JOIN UI/UX AND HELP DESIGN THE INTERFACES AND EXPERIENCES THAT CONNECT PEOPLE TO TECHNOLOGY — ONE THOUGHTFUL PIXEL AND FLOW AT A TIME.",
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
              id: "uiux_q1",
              label:
                "Why do you want to join the UI/UX Department? What skills or perspective do you bring to the team?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "uiux_q2",
              label:
                "What do you hope to contribute to the UI/UX Department? Tell us how you'd like to contribute to our team.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "uiux_q3",
              label:
                "Do you have any past experience in UI/UX? If yes, share your portfolio or previous work along with a short description.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "uiux_q4",
              label:
                "You spend a week designing a clean, minimal interface, but right before the deadline the team wants to cram in extra features and flashy stuff that'll mess with usability. How do you handle it without turning it into a fight?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "uiux_q5",
              label: "How do you stay updated on design trends?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "uiux_q6",
              label:
                "Do you think AI can do our job? Do you see it as a threat to UI/UX designers or just another tool?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
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
      tagline:
        "TEACHING MACHINES TO LEARN, PREDICT, AND REASON THROUGH DATA AND NEURAL ARCHITECTURES",
      description:
        "FASCINATED BY LLMS, COMPUTER VISION, AND DEEP LEARNING? JOIN AI/ML TO BUILD INTELLIGENT AGENTS, TRAIN NEURAL NETWORKS, AND PUSH THE FRONTIERS OF AI.",
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
              id: "aiml_q1",
              label:
                "Why should we recruit you into the AI/ML Department? Tell us about your strengths, experiences, and what makes you a valuable addition to the team.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "aiml_q2",
              label:
                "Describe your AI/ML experience. Share your experience with AI/ML, including the concepts, frameworks, tools, or technologies you have worked with. If you're still learning, tell us what you've explored so far and what you're currently learning.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "aiml_q3",
              label:
                "What do you hope to contribute to the AI/ML Department? We're interested in more than just coding. Tell us how you'd like to contribute through projects, workshops, research, competitions, mentoring, event organization, open source, or anything else.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "aiml_q4",
              label:
                "Case Study – Teamwork & Decision Making\nYou are working in a team of five on a project with a deadline in three days. Two members have barely contributed, one member wants to redo the entire project from scratch, and the remaining members are getting frustrated. As an active team member, how would you handle the situation while ensuring the project is completed on time?",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "aiml_q5",
              label:
                "AI & Critical Thinking\nRecently, there has been debate about whether AI assistants like Claude, ChatGPT, and Gemini are making people less capable of solving problems independently. Some argue these tools accelerate learning, while others believe they encourage over reliance and reduce critical thinking. What is your opinion? Do you think AI is making people \"dumber,\" or is it simply changing the way people learn? Support your answer with reasoning, examples, or personal experiences.",
              type: "textarea" as const,
              required: true,
              maxLength: 1200,
            },
            {
              id: "aiml_q6",
              label:
                "AI Safety vs Innovation\nRecently, one of the world's most advanced AI models was temporarily restricted after researchers demonstrated that it could be manipulated into generating potentially dangerous cybersecurity-related outputs. The model was later restored with stricter safety measures, but these changes also caused it to refuse some legitimate coding and debugging requests. The incident sparked a global debate on AI regulation, innovation, and safety.\nIf you were part of the committee responsible for deciding the model's future, what decision would you have made?\nIn your answer, discuss:\n- Whether the temporary restriction was justified.\n- How you would balance public safety with technological innovation.\n- What policies or safeguards you would introduce instead of (or alongside) restricting the model.\nThere is no \"correct\" answer—we are interested in your reasoning, ability to evaluate different perspectives, and how you justify your conclusions.",
              type: "textarea" as const,
              required: true,
              maxLength: 1500,
            },
            {
              id: "aiml_q7",
              label:
                "Have you built any AI/ML projects?\nIf yes, include:\n- Project name\n- GitHub repository\n- Deployed/demo link (if available)\n- A brief description of the project\n- Your individual contribution\n- Biggest challenge you faced and how you solved it\nIf you haven't built one yet, describe an AI/ML project you'd like to build.",
              type: "textarea" as const,
              required: true,
              maxLength: 1200,
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
      tagline:
        "PROTECTING DIGITAL ASSETS, ETHICAL HACKING, AND MASTERING THE ART OF DEFENSE AND OFFENSE",
      description:
        "READY TO CRACK CODES AND DEFEND SYSTEMS? JOIN CYBER SECURITY TO COMPETE IN CAPTURE-THE-FLAG (CTF) CONTESTS, PERFORM VULNERABILITY ASSESSMENTS, AND LEARN NETWORK SECURITY.",
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
              id: "cyber_q1",
              label: "Why do you want to join the Cybersecurity Department?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q2",
              label:
                "Why did you choose Cybersecurity over other domains like AI, Web Development, or App Development?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q3",
              label:
                "What do you hope to learn and contribute if you are selected?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q4",
              label:
                "If you're assigned a topic you've never heard of, how would you learn it? Mention the resources and steps you would follow.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q5",
              label: "Which cybersecurity domains interest you the most?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q6",
              label: "Which cybersecurity tools have you used?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q7",
              label: "How would you rate your current cybersecurity knowledge?",
              type: "radio" as const,
              options: ["Beginner", "Beginner+", "Intermediate", "Advanced"],
              required: true,
            },
            {
              id: "cyber_q8",
              label:
                "Imagine you're asked to find vulnerabilities in a website, but you've never done it before. What would your approach be?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q9",
              label:
                "Tell us about a project, competition, workshop, or achievement you're proud of. (It doesn't have to be related to cybersecurity.)",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "cyber_q10",
              label: "Why should we select you over other applicants?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
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
      tagline:
        "COMMUNICATING IDEAS AND STORIES THROUGH VISUAL ART, BRANDING, AND GRAPHIC MASTERY",
      description:
        "HAVE AN EYE FOR COLOR, TYPOGRAPHY, AND COMPOSITION? JOIN THE DESIGN QUEST TO CREATE STUNNING POSTERS, SOCIAL MEDIA ASSETS, AND BRANDING THAT DEFINE MIC.",
      skills: "PHOTOSHOP · ILLUSTRATOR · GRAPHIC ART · BRANDING",
      iconType: "design",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
          title: "Design Domain Questions",
          description: "Show us your creative eye and design sensibility.",
          formFields: [
            {
              id: "design_q1",
              label: "Why do you want to join the Design Department?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "design_q2",
              label: "What makes you a valuable addition to the team?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "design_q3",
              label:
                "What do you hope to gain from working with the Design Department? How would you like to contribute to the team?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "design_q4",
              label:
                "Do you have any previous design experience? If yes, include your experience and portfolio/previous work.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "design_q5",
              label:
                "You're staring at a blank canvas with a deadline in 4 hours and no clear idea. Describe exactly what you would do in the first 15 minutes to get unstuck.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "design_q6",
              label: "How many hours can you dedicate for the club per week?",
              type: "radio" as const,
              options: [
                "Less than 2 hours",
                "2–4 hours",
                "5–7 hours",
                "More than 7 hours",
              ],
              required: true,
            },
            {
              id: "design_q7",
              label:
                "You have to design a poster for a 24-hour hackathon. Describe your design process from brief to final export.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "design_q8",
              label: "Which design tools are you comfortable using?",
              type: "checkbox" as const,
              options: [
                "Canva",
                "Figma",
                "Adobe Illustrator",
                "Other",
              ],
              required: true,
            },
            {
              id: "design_q9",
              label:
                "You spend several hours creating a poster, but the department head asks for major changes just before publishing. How would you respond? Describe how you handle feedback and revisions in a collaborative environment.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "design_q10",
              label:
                "Do you use AI tools (ChatGPT, Canva AI, etc.) in your design work? If yes, where — ideation, drafts, final assets? If no, why not?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
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
      tagline:
        "ORCHESTRATING EVENTS, LEADING TEAMS, AND TURNING BIG IDEAS INTO SEAMLESS EXECUTION",
      description:
        "THRIVE ON LEADERSHIP, STRATEGY, AND ORGANIZING HACKATHONS AND WORKSHOPS? JOIN MANAGEMENT TO DIRECT MAJOR EVENTS, MANAGE LOGISTICS, AND CONNECT THE TECH ECOSYSTEM.",
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
              id: "mgmt_q1",
              label:
                "Why do you want to join the Management Department of Microsoft Innovations Club?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "mgmt_q2",
              label:
                "Are you currently a part of any clubs or chapters at VIT? If yes, mention the club(s) and department(s). If not, are you planning to apply to any other clubs during this recruitment season? Please specify.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "mgmt_q3",
              label:
                "Tell us about any experience you have in planning, managing, or contributing to events. Briefly describe your role and what you were responsible for. If you don't have any prior experience, feel free to mention any similar responsibilities you've taken up in school, college, or elsewhere.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "mgmt_q4",
              label:
                "In your opinion, what does being a part of a management team actually mean? Please describe it in your own words.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "mgmt_q5",
              label:
                "Imagine MIC is setting up a stall at expo. You have a budget of ₹500, 2 volunteers, a table, and limited space. Design one activity or game that would attract the maximum number of students while staying relevant to technology or innovation. Briefly explain how it works, the materials required, and why students would want to participate.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "mgmt_q6",
              label:
                "What skills, strengths, or qualities do you bring that would make you a good fit for the Management Department? You're also welcome to share any past experiences where you felt something could have been managed better, or ideas you've had for improving planning, coordination, or execution.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "mgmt_q7",
              label:
                "What would you prioritize? Club or Academics & CGPA? Why?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "mgmt_q8",
              label: "What do you think our club mascot should be?",
              type: "textarea" as const,
              required: true,
              maxLength: 500,
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
      tagline:
        "IDENTIFYING MARKET GAPS, PITCHING VENTURES, AND TRANSFORMING PROJECTS INTO STARTUPS",
      description:
        "DREAM OF LAUNCHING YOUR OWN STARTUP? JOIN ENTREPRENEURSHIP TO LEARN PITCHING, BUSINESS MODELS, PRODUCT INCUBATION, AND BUILD THE NEXT GENERATION OF DISRUPTIVE VENTURES.",
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
              label:
                "Do you have a startup idea you're working on or have thought about? Describe it briefly.",
              type: "textarea" as const,
              placeholder: "Problem, solution, target market...",
              required: true,
              maxLength: 600,
            },
            {
              id: "problemSolving",
              label:
                "Describe a real-world problem you've identified in your campus or community. How would you solve it?",
              type: "textarea" as const,
              placeholder: "Problem → solution → impact",
              required: true,
              maxLength: 600,
            },
            {
              id: "epExperience",
              label:
                "Have you been part of any startup, incubator, or entrepreneurship cell?",
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
              label:
                "How comfortable are you with business concepts like unit economics, PMF, or go-to-market?",
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
      name: "Social Media",
      type: "non-tech" as const,
      totalStages: 1,
      desc: "CONTENT CREATION, VIDEO PRODUCTION, SOCIAL MEDIA PRESENCE, AND PUBLIC RELATIONS.",
      tagline:
        "CAPTURING STORIES, DIRECTING MEDIA, AND CRAFTING COMPELLING NARRATIVES FOR THE WORLD",
      description:
        "PASSIONATE ABOUT FILMING, EDITING, COPYWRITING, AND SOCIAL MEDIA? JOIN SOCIAL MEDIA TO BROADCAST MIC'S IMPACT, DIRECT CREATIVE REELS, AND ENGAGE OUR COMMUNITY.",
      skills: "VIDEO EDITING · COPYWRITING · SOCIAL MEDIA · PR",
      iconType: "media",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
          title: "Social Media Domain Questions",
          description:
            "We create stories, content, and media that define MIC's voice. Show us yours.",
          formFields: [
            {
              id: "media_q1",
              label:
                "Why should we recruit you into the Social Media Department? Tell us about your strengths, experiences, and what makes you a valuable addition to the team. Share how you can contribute beyond creating posts.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "media_q2",
              label: "Describe your social media/content creation experience.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "media_q3",
              label:
                "Share your experience with platforms like Instagram, LinkedIn, YouTube, or others. Mention any content you've created, pages you've managed, design/editing tools you've used (Canva, CapCut, Premiere Pro, Photoshop, etc.), or skills you're currently learning.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "media_q4",
              label:
                "Many people believe social media is becoming repetitive because everyone follows the same trends. Others believe trends are the best way to grow. What's your opinion? How would you balance originality with trending content? Support your answer with examples.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "media_q5",
              label:
                "Imagine our club wants to increase student engagement over the next month. Without spending any money, what three content ideas or campaigns would you propose? Explain why you think they would work.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "media_q6",
              label:
                "You've designed a post you're proud of, but the department head asks for major changes just before publishing. How would you respond? Describe how you handle feedback and revisions in a collaborative environment.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "media_q7",
              label:
                "Have you worked on any content creation or social media projects?\nIf yes, include:\n- Project/page/event name\n- Your role\n- Instagram/portfolio/GitHub/drive link (if available)\n- A brief description\n- Your individual contribution\n- Biggest challenge you faced and how you solved it",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "media_q8",
              label:
                "A viral trend is gaining traction, but it doesn't align with the club's identity or values. Would you still use it? Why or why not? If not, how would you adapt the trend to fit the club?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "media_q9",
              label:
                "You post a reel that receives significantly fewer views than expected. Walk us through how you would analyze what went wrong and what you'd change for the next post.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "media_q10",
              label:
                "Tell us about the types of content you've edited (reels, cinematic videos, event recaps, interviews, vlogs, promotional videos, etc.), the software you use, and your editing style.",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
          ],
        },
      ],
    },

    {
      slug: "iot",
      name: "IoT",
      type: "tech" as const,
      totalStages: 1,
      desc: "EMBEDDED SYSTEMS, MICROCONTROLLERS, SENSORS, FIRMWARE, AND HARDWARE-TO-CLOUD INTEGRATION",
      tagline:
        "CONNECTING THE PHYSICAL WORLD TO THE DIGITAL REALM THROUGH HARDWARE, FIRMWARE, AND EDGE COMPUTING",
      description:
        "FASCINATED BY EMBEDDED SYSTEMS, ARDUINO, ESP32, SENSORS, AND AUTOMATION? JOIN THE IOT DEPARTMENT TO BUILD SMART DEVICES, HARDWARE PROTOTYPES, AND CONNECTED EDGE SYSTEMS.",
      skills: "EMBEDDED C/C++ · ARDUINO/ESP32 · CIRCUIT DESIGN · MQTT/HTTP · FIRMWARE",
      iconType: "iot",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
          title: "IoT Domain Questions",
          description:
            "Tell us about your hardware experience, tinkering mindset, and technical skills.",
          formFields: [
            {
              id: "iot_q1",
              label: "Why do you want to join the IoT Department?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "iot_q2",
              label:
                "Why did you choose IoT over other tech domains like Web Development, AI/ML, or Cyber Security?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "iot_q3",
              label:
                "What do you hope to learn and contribute if you are selected for the IoT team?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "iot_q4",
              label:
                "If you are assigned an IoT component, sensor, or protocol you have never used before, how would you approach learning and integrating it?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "iot_q5",
              label:
                "What microcontrollers, boards, or development platforms (e.g., Arduino, ESP32, Raspberry Pi) are you most comfortable working with, and what communication protocols have you used?",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "iot_q6",
              label:
                "Where do your primary strengths lie: circuit design/hardware assembly, firmware development, or cloud/backend integration?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "iot_q7",
              label:
                "Hardware projects rarely work on the first try, and components can fail right before a deadline. How do you handle high-pressure failures, and how do you keep your cool when troubleshooting under tight timelines?",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "iot_q8",
              label:
                "How do you approach optimizing code and power consumption for resource-constrained edge devices?",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "iot_q9",
              label:
                "Give one practical IoT project idea that our club could build for campus automation or a hackathon showcase.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "iot_q10",
              label:
                "What technical skills do you bring to the team, and how do you plan to upskill in areas where you lack experience?",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "iot_q11",
              label:
                "Commitment: I understand that being part of the IoT Department requires hands-on involvement in lab sessions, project builds, hardware maintenance, and event prep.",
              type: "radio" as const,
              options: ["I Agree", "I Do Not Agree"],
              required: true,
            },
          ],
        },
      ],
    },

    {
      slug: "outreach",
      name: "Outreach",
      type: "non-tech" as const,
      totalStages: 1,
      desc: "COMMUNITY BUILDING, PUBLIC RELATIONS, SPONSORSHIPS, AND INTER-CLUB COLLABORATIONS",
      tagline:
        "CONNECTING MIC TO THE WORLD, BUILDING THRIVING COMMUNITIES, AND DRIVING STRATEGIC PARTNERSHIPS",
      description:
        "PASSIONATE ABOUT COMMUNITY ENGAGEMENT, PARTNERSHIPS, AND SPONSORSHIPS? JOIN THE OUTREACH DEPARTMENT TO EXPAND MIC'S REACH, DRIVE COLLABORATIONS, AND CONNECT WITH THE TECH ECOSYSTEM.",
      skills: "COMMUNITY MANAGEMENT · SPONSORSHIPS · PR · NETWORKING",
      iconType: "outreach",
      stageToggles: { "1": true, "2": false, "3": false },
      stages: [
        {
          stage: 1,
          title: "Outreach Domain Questions",
          description:
            "Tell us about your community mindset, networking skills, and collaboration ideas.",
          formFields: [
            {
              id: "outreach_q1",
              label: "What do you think outreach is and why are you interested in joining it?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "outreach_q2",
              label:
                "Do you have any prior experience with being the community manager of a team or a brand? How do you think it affects the community's image?",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "outreach_q3",
              label: "How will you benefit from being a part of outreach department?",
              type: "textarea" as const,
              required: true,
              maxLength: 800,
            },
            {
              id: "outreach_q4",
              label:
                "Outreach involves building a community, maintaining it and boasting collaborations. Give some ideas you have regarding it.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "outreach_q5",
              label:
                "Collaborations and Sponsorship is a key role for a community to function and is also a part of outreach process. Explain why you align with this responsibility.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "outreach_q6",
              label:
                "This will be our team of connecting MIC to everyone. Give one idea that we can work on to engage as a tech community.",
              type: "textarea" as const,
              required: true,
              maxLength: 1000,
            },
            {
              id: "outreach_q7",
              label:
                "Commitment: I understand that being a part of this department requires regular participation in meetings, events and department activities.",
              type: "radio" as const,
              options: ["I Agree", "I Do Not Agree"],
              required: true,
            },
          ],
        },
      ],
    },
  ];

  // -------------------------------------------------------------------------
  // Upsert departments
  // -------------------------------------------------------------------------
  const TASKS_BASE = "/tasks";

  const DEPT_TASKS: Record<string, { title: string; description: string; pdf: string }> = {
    development: {
      title: "Development Task",
      description: "Build a responsive Next.js application that integrates with a public API (e.g. Weather, GitHub, or NASA) and displays data interactively. Add a search filter and persistent local storage.",
      pdf: `${TASKS_BASE}/development-task.pdf`,
    },
    "competitive-coding": {
      title: "Competitive Coding Task",
      description: "Solve the set of 3 advanced data structure and dynamic programming problems hosted on HackerRank/Codeforces. Ensure optimal time complexity.",
      pdf: `${TASKS_BASE}/cc-task.pdf`,
    },
    "ui-ux": {
      title: "UI/UX Task",
      description: "Redesign the dashboard UI for a modern digital wallet application. Create high-fidelity wireframes and interactive prototypes in Figma with micro-interactions.",
      pdf: `${TASKS_BASE}/uiux-task.pdf`,
    },
    "ai-ml": {
      title: "AI/ML Task",
      description: "Build a predictive machine learning model using PyTorch or Scikit-learn. Perform EDA on the provided dataset, train the model, and submit a Jupyter notebook.",
      pdf: `${TASKS_BASE}/aiml-task.pdf`,
    },
    "cyber-security": {
      title: "Cyber Security Task",
      description: "Find and exploit the vulnerabilities in the target virtual machine. Provide a detailed walkthrough of your flags captured and a mitigation report.",
      pdf: `${TASKS_BASE}/cyber-task.pdf`,
    },
    design: {
      title: "Design Task",
      description: "Design a poster, social media banner, and a custom sticker sheet for MIC's upcoming annual hackathon 'DevSpace'. Maintain cohesive branding.",
      pdf: `${TASKS_BASE}/design-task.pdf`,
    },
    management: {
      title: "Management Task",
      description: "Draft a comprehensive event proposal for a 24-hour campus hackathon. Include timeline, logistics checklist, sponsor outreach email drafts, and budget.",
      pdf: `${TASKS_BASE}/mgmt-task.pdf`,
    },
    entrepreneurship: {
      title: "Entrepreneurship Task",
      description: "Prepare a 10-slide pitch deck and a Lean Canvas for a SaaS startup solving a student lifestyle problem. Focus on value prop and unit economics.",
      pdf: `${TASKS_BASE}/ep-task.pdf`,
    },
    "content-media": {
      title: "Social Media Task",
      description: "Create a 60-second video trailer promoting MIC recruitments. Write a copy deck with 3 sample Instagram posts and captions.",
      pdf: `${TASKS_BASE}/media-task.pdf`,
    },
    iot: {
      title: "IoT Task",
      description: "Design and simulate an ESP32/Arduino circuit with temperature/humidity sensors and relay actuation. Create firmware in Wokwi/Tinkercad with MQTT telemetry.",
      pdf: `${TASKS_BASE}/iot-task.pdf`,
    },
    outreach: {
      title: "Outreach Task",
      description: "Draft an outreach campaign proposal for an inter-college tech summit. Include 3 sponsor pitch emails, a community growth strategy, and a collaboration roadmap.",
      pdf: `${TASKS_BASE}/outreach-task.pdf`,
    },
  };

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
