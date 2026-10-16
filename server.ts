import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint: AI Smart Team Role Architect
app.post("/api/gemini/team-architect", async (req: Request, res: Response) => {
  try {
    const { title, description, category, teamSize } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: "Title and description are required" });
      return;
    }

    const ai = getGemini();
    const prompt = `Analyze this student project/hackathon idea and design an optimal multidisciplinary team structure.
Project Title: "${title}"
Category: "${category || "Hackathon"}"
Target Team Size: ${teamSize || 4}
Description: "${description}"

Determine the optimal team composition to ensure diversity across:
1. Technical / Engineering
2. UI/UX & User Experience
3. Domain / AI / Data
4. Product Strategy & Pitch / Presentation

Return JSON matching the schema with recommended roles, responsibilities, required skills, and why this role is vital to winning or succeeding.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Brief analysis of project requirements and winning strategy",
            },
            balanceTip: {
              type: Type.STRING,
              description: "Key advice to ensure team diversity and presentation readiness",
            },
            roles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roleName: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: "Engineering | Design | AI/Data | Product/Pitch",
                  },
                  requiredSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  keyResponsibilities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  whyCrucial: { type: Type.STRING },
                },
                required: ["roleName", "category", "requiredSkills", "keyResponsibilities", "whyCrucial"],
              },
            },
          },
          required: ["summary", "balanceTip", "roles"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("AI team-architect using fallback:", error?.message);
    res.json({
      summary: "Balanced multidisciplinary student team recommended.",
      balanceTip: "Ensure at least one teammate focuses on the pitch deck and live demo polish early.",
      isTemplate: true,
      roles: [
        {
          roleName: "Frontend & Interaction Engineer",
          category: "Engineering",
          requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
          keyResponsibilities: ["Build responsive web views", "Integrate client states and polish UI"],
          whyCrucial: "Judges interact directly with the front-end user experience.",
        },
        {
          roleName: "AI / Data Pipeline Engineer",
          category: "AI/Data",
          requiredSkills: ["Python", "Gemini API / LLMs", "Prompt Engineering"],
          keyResponsibilities: ["Model integration", "Data transformation and prompt orchestration"],
          whyCrucial: "Drives the core intelligence and uniqueness of the application.",
        },
        {
          roleName: "UI/UX & Product Designer",
          category: "Design",
          requiredSkills: ["Figma", "Design Systems", "User Journeys", "Wireframing"],
          keyResponsibilities: ["Craft clear flow", "Prepare design assets and high-fidelity mockups"],
          whyCrucial: "Clean design and intuitive workflows set top projects apart.",
        },
        {
          roleName: "Pitch Lead & Product Strategist",
          category: "Product/Pitch",
          requiredSkills: ["Pitch Deck Creation", "Market Research", "Presentation", "Storytelling"],
          keyResponsibilities: ["Create compelling pitch presentation", "Script the 3-minute demo video"],
          whyCrucial: "Even great tech fails without a crystal clear problem-solution narrative.",
        },
      ],
    });
  }
});

// Endpoint: AI Match & Compatibility Analyzer
app.post("/api/gemini/match-analysis", async (req: Request, res: Response) => {
  const { project, candidate } = req.body || {};
  if (!project || !candidate) {
    res.status(400).json({ error: "Project and candidate data are required" });
    return;
  }

  try {
    const ai = getGemini();
    const prompt = `Evaluate how well this student collaborator fits the project requirements and team balance.
Project:
- Title: ${project.title}
- Description: ${project.description}
- Open Roles: ${JSON.stringify(project.openRoles || [])}
- Current Roster: ${JSON.stringify(project.members || [])}

Candidate Collaborator:
- Name: ${candidate.name}
- Specialty: ${candidate.specialty}
- Skills: ${JSON.stringify(candidate.skills || [])}
- Bio: ${candidate.bio}
- Experience Level: ${candidate.experienceLevel}
- Interests: ${JSON.stringify(candidate.interests || [])}

Assess the synergy, complimentary skill coverage, potential gaps filled, and provide 2 icebreaker/discussion questions for the team. Return JSON matching schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: {
              type: Type.INTEGER,
              description: "Fit percentage score between 0 and 100",
            },
            bestFitRole: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            gapCoverage: {
              type: Type.STRING,
              description: "How this person fills a missing piece in the team",
            },
            recommendationVerdict: {
              type: Type.STRING,
              description: "Strong Match | Great Fit | Good Potential | Complementary",
            },
            discussionQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 questions for the team intro chat",
            },
          },
          required: [
            "matchScore",
            "bestFitRole",
            "strengths",
            "gapCoverage",
            "recommendationVerdict",
            "discussionQuestions",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Error in match-analysis, using template fallback:", error?.message);
    res.json({
      matchScore: 89,
      bestFitRole: candidate?.specialty || "Complementary Specialist",
      strengths: [
        `Demonstrated depth in ${Array.isArray(candidate?.skills) ? candidate.skills.slice(0, 2).map((s: any) => typeof s === 'string' ? s : s.name).join(' and ') : 'relevant technical areas'}`,
        `High alignment with ${project?.category || 'hackathon'} project scope`,
        "Complementary strengths balancing the current team",
      ],
      gapCoverage: `Directly fills missing capabilities in ${candidate?.specialty || 'specialized development'}.`,
      recommendationVerdict: "Great Fit",
      discussionQuestions: [
        "How do you usually collaborate on git/code or design handoffs during hackathon sprints?",
        "What part of this project's vision excites you the most?",
      ],
      isTemplate: true,
    });
  }
});

// Endpoint: AI Pitch / Join Request Generator
app.post("/api/gemini/generate-pitch", async (req: Request, res: Response) => {
  try {
    const { projectName, projectDescription, targetRole, applicantProfile } = req.body;

    const ai = getGemini();
    const prompt = `Write a compelling, genuine, and concise 3-4 sentence message from a student collaborator asking to join a project.
Project: ${projectName} (${projectDescription})
Role applied for: ${targetRole}
Student Profile: Name: ${applicantProfile.name}, Specialty: ${applicantProfile.specialty}, Key Skills: ${(applicantProfile.skills || []).join(", ")}, Experience: ${applicantProfile.experienceLevel}.
Tone: Enthusiastic, collegiate, professional, showcasing specific value they will bring to the team.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ pitch: response.text?.trim() || "I would love to collaborate on this project and contribute my skills to the team!" });
  } catch (error: any) {
    console.warn("Error in generate-pitch, using template pitch:", error?.message);
    const { projectName, targetRole, applicantProfile } = req.body || {};
    const skillSample = Array.isArray(applicantProfile?.skills) ? applicantProfile.skills.slice(0, 2).join(", ") : "relevant tools";
    res.json({
      pitch: `Hi! I saw ${projectName || "your project"} and would love to contribute as your ${targetRole || "teammate"}. With my background in ${applicantProfile?.specialty || "product development"} and experience with ${skillSample}, I can help build an exceptional prototype and polish our final presentation.`,
      isTemplate: true,
    });
  }
});

// Endpoint: AI TeamForge Assistant / FAQ Chatbot
app.post("/api/gemini/support-chat", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGemini();
    const systemPrompt = `You are TeamForge Assistant, the official in-app expert guide for TeamForge.
TeamForge is a multidisciplinary team matching and formation platform built for student hackathons, competitions, and collaborative research projects.

Key knowledge about TeamForge:
1. Core Mission: Solves the "friend group echo chamber" problem where student hackathon teams end up with 4 identical developers and zero designers, storytellers, or pitch presenters.
2. Projects Tab: Browse hackathon/competition projects with specified open roles, deadlines, categories, and live Team Balance Scores.
3. Collaborators Tab: Discover talented peers filtered by primary specialty (Engineering, UI/UX Design, AI/Data, Product & Pitch, Research), tool stack, weekly commitment (hours/week), and verified competition badges.
4. Team Balance Studio: An interactive simulation workspace where team leaders can test different member combinations to optimize their multidisciplinary synergy score (0-100%) across 4 pillars: Technical Engineering, Design/UX, AI/Data, and Pitch/Presentation.
5. Requests Hub: Manage sent and received project invitations, team applications, and statuses (Pending, Accepted, Declined).
6. My Teams: View projects you own or have joined, with quick access to the balance studio and applicant review.
7. Profile & Auth: Sign in with Google / Firebase, customize student avatar/photo, adjust skill tags, weekly hours, and competition track record.

Guidelines:
- Provide friendly, clear, concise, and actionable guidance directly answering the user's question about TeamForge.
- When relevant, tell the user where to click in the app (e.g. "Go to the Projects tab", "Open the Team Balance Studio", "Check your Requests Hub").
- Keep formatting clean using short paragraphs and bullet points if needed. Avoid unnecessary fluff.`;

    const conversationContext = Array.isArray(history) && history.length > 0
      ? history.slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join("\n") + `\nUser: ${message}`
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: conversationContext,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({
      reply: response.text?.trim() || "I'm here to help with all things TeamForge! How can I assist you with your projects, team balance, or finding collaborators today?",
    });
  } catch (error: any) {
    console.warn("Support chat AI error, using fallback responder:", error?.message);
    const msg = (req.body?.message || "").toLowerCase();
    let reply = "TeamForge is your platform for building balanced hackathon and competition teams! You can explore open projects, search for teammates with complementary skills (design, engineering, AI, pitch), or use the Team Balance Studio to optimize your team's synergy score.";

    if (msg.includes("project") || msg.includes("post") || msg.includes("create")) {
      reply = "To post a project, click the '+ Post a Project' button in the top navigation or on the Projects tab. You can specify the hackathon name, deadline, and the exact roles you need (like UI/UX Designer, ML Engineer, or Pitch Lead).";
    } else if (msg.includes("balance") || msg.includes("score") || msg.includes("studio") || msg.includes("synergy")) {
      reply = "The Team Balance Score evaluates how well-rounded your squad is across 4 vital pillars: Engineering, Design/UX, AI/Data, and Product/Pitch. Open the 'Team Balance Studio' from the left corner menu to simulate and test different roster combinations in real time!";
    } else if (msg.includes("apply") || msg.includes("join") || msg.includes("invite") || msg.includes("request")) {
      reply = "To join a team, click any project card to open its details and choose 'Apply to Role'. Project leads can also invite candidates directly from the Collaborators tab. Track all sent and received requests inside the 'Requests Hub'.";
    } else if (msg.includes("who are you") || msg.includes("what is teamforge")) {
      reply = "I'm the TeamForge Assistant! TeamForge helps students break out of identical-skill echo chambers and build winning, multidisciplinary teams for hackathons, capstones, and competitions.";
    }

    res.json({ reply, isFallback: true });
  }
});

// Server setup with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
