import { ProjectMember, ProjectRole, StudentProfile, TeamBalanceBreakdown } from '../types';

export function calculateTeamBalance(
  members: ProjectMember[],
  openRoles: ProjectRole[] = []
): TeamBalanceBreakdown {
  if (members.length === 0) {
    return {
      engineering: 0,
      design: 0,
      aiData: 0,
      productPitch: 0,
      domainStrategy: 0,
      overallScore: 0,
      healthStatus: 'Critical Gaps',
      keyGapAlerts: [
        'Team has no confirmed members yet. Start by inviting a core lead.',
      ],
      strengths: [],
    };
  }

  let engPoints = 0;
  let designPoints = 0;
  let aiPoints = 0;
  let pitchPoints = 0;
  let domainPoints = 0;

  members.forEach((m) => {
    const spec = m.specialty;
    const skills = (m.skills || []).map((s) => s.toLowerCase());

    // Specialty weight
    if (spec === 'Engineering') engPoints += 45;
    if (spec === 'UI/UX Design') designPoints += 55;
    if (spec === 'AI / ML') aiPoints += 55;
    if (spec === 'Product & Pitch') pitchPoints += 55;
    if (spec === 'Data Science') {
      aiPoints += 35;
      engPoints += 20;
    }
    if (spec === 'Mobile & IoT') {
      engPoints += 40;
      designPoints += 15;
    }

    // Keyword skill analysis
    skills.forEach((s) => {
      if (/react|typescript|python|node|backend|frontend|java|go|rust|docker|api|sql/.test(s)) {
        engPoints += 12;
      }
      if (/figma|ui|ux|wireframing|design|prototyping|css|tailwind|branding/.test(s)) {
        designPoints += 14;
      }
      if (/ai|ml|machine learning|llm|gemini|pytorch|tensorflow|nlp|vision|data|rag/.test(s)) {
        aiPoints += 14;
      }
      if (/pitch|presentation|deck|business|strategy|storytelling|marketing|finance|market research/.test(s)) {
        pitchPoints += 16;
      }
      if (/research|domain|health|fintech|climate|security|bio/.test(s)) {
        domainPoints += 15;
      }
    });
  });

  const engScore = Math.min(100, Math.round(engPoints));
  const designScore = Math.min(100, Math.round(designPoints));
  const aiScore = Math.min(100, Math.round(aiPoints));
  const pitchScore = Math.min(100, Math.round(pitchPoints));
  const domainScore = Math.min(100, Math.round(domainPoints + (members.length * 15)));

  // Weighted overall calculation:
  // A balanced winning team has tech, design, innovation, and pitch!
  // In hackathons/competitions, lack of pitch or UI is the #1 reason why technical teams lose.
  const scores = [engScore, designScore, aiScore, pitchScore];
  const minScore = Math.min(...scores);
  const avgScore = (engScore * 0.28) + (designScore * 0.24) + (aiScore * 0.24) + (pitchScore * 0.24);

  // Penalty if a critical pillar is completely 0 (e.g. 0 design or 0 pitch)
  const penalty = scores.filter((s) => s < 20).length * 12;
  const rawOverall = Math.max(10, Math.round(avgScore - penalty + (minScore > 35 ? 10 : 0)));
  const overallScore = Math.min(99, rawOverall);

  const keyGapAlerts: string[] = [];
  const strengths: string[] = [];

  if (engScore >= 60) strengths.push('Strong Technical & Code Execution foundation');
  else if (engScore < 30) keyGapAlerts.push('Needs Core Engineering: High risk of unable to build functional MVP');

  if (designScore >= 60) strengths.push('High UI/UX Fidelity & User Delight ready');
  else if (designScore < 25) keyGapAlerts.push('Missing UI/UX Specialist: Projects with rough aesthetics score 40% lower in judging');

  if (aiScore >= 60) strengths.push('Advanced AI / Data capabilities unlocked');
  else if (aiScore < 25) keyGapAlerts.push('AI/Data component needs reinforcement for competitive edge');

  if (pitchScore >= 60) strengths.push('Compelling Storytelling & Pitch Presentation secured');
  else if (pitchScore < 25) keyGapAlerts.push('Critical Pitch Gap: No dedicated presenter/storyteller. Hackathons are won on demo day!');

  // Check if open roles will fix gaps
  const openCategories = openRoles.filter((r) => r.status === 'open').map((r) => r.category);
  if (openCategories.includes('Design') && designScore < 50) {
    keyGapAlerts.push('Recruiting open Design role will eliminate the UX bottleneck.');
  }
  if (openCategories.includes('Product/Pitch') && pitchScore < 50) {
    keyGapAlerts.push('Recruiting open Pitch Lead role will secure winning demo delivery.');
  }

  let healthStatus: TeamBalanceBreakdown['healthStatus'] = 'Critical Gaps';
  if (overallScore >= 80) healthStatus = 'Balanced & Formidable';
  else if (overallScore >= 60) healthStatus = 'Good Foundation';
  else if (overallScore >= 40) healthStatus = 'Skill Imbalance Detected';

  return {
    engineering: engScore,
    design: designScore,
    aiData: aiScore,
    productPitch: pitchScore,
    domainStrategy: domainScore,
    overallScore,
    healthStatus,
    keyGapAlerts,
    strengths,
  };
}

// What-If Simulation: calculates balance if candidate joins
export function simulateCandidateImpact(
  currentMembers: ProjectMember[],
  candidate: StudentProfile,
  openRoles: ProjectRole[] = []
): {
  newBreakdown: TeamBalanceBreakdown;
  scoreDelta: number;
  highlightBenefit: string;
} {
  const simulatedMember: ProjectMember = {
    userId: candidate.id,
    name: candidate.name,
    role: candidate.specialty,
    specialty: candidate.specialty,
    avatar: candidate.avatar,
    skills: candidate.skills.map((s) => s.name),
  };

  const current = calculateTeamBalance(currentMembers, openRoles);
  const updated = calculateTeamBalance([...currentMembers, simulatedMember], openRoles);
  const scoreDelta = updated.overallScore - current.overallScore;

  let highlightBenefit = `Adds strong ${candidate.specialty} skills.`;
  if (candidate.specialty === 'UI/UX Design' && current.design < 40) {
    highlightBenefit = `Resolves critical design bottleneck! Team UI fidelity jumps by +${updated.design - current.design}%.`;
  } else if (candidate.specialty === 'Product & Pitch' && current.productPitch < 40) {
    highlightBenefit = `Secures your demo day pitch! Pitch readiness jumps by +${updated.productPitch - current.productPitch}%.`;
  } else if (candidate.specialty === 'AI / ML' && current.aiData < 40) {
    highlightBenefit = `Injects vital AI/Data intelligence (+${updated.aiData - current.aiData}% boost).`;
  } else if (scoreDelta > 0) {
    highlightBenefit = `Increases overall team synergy and diversity by +${scoreDelta} points!`;
  }

  return {
    newBreakdown: updated,
    scoreDelta,
    highlightBenefit,
  };
}
