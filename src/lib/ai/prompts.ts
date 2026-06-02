// ============================================================
// AI Prompt Templates — Anti-hallucination, ATS-focused prompts
// ============================================================

/**
 * Extract skills from parsed resume text.
 * Returns structured JSON with skill names, categories, and confidence levels.
 */
export function extractSkillsFromResumePrompt(resumeText: string): string {
  return `You are a technical recruiter analyzing a resume. Extract all technical and professional skills mentioned in this resume.

For each skill, determine:
- name: the canonical skill name (e.g., "TypeScript" not "TS", "PostgreSQL" not "Postgres")
- category: one of "language", "framework", "tool", "platform", "database", "concept", "soft_skill", or "other"
- confidence: a score from 0.0 to 1.0 indicating how strongly this skill is demonstrated (1.0 = extensive evidence, 0.3 = briefly mentioned)

Rules:
- Only extract skills that are ACTUALLY mentioned or clearly demonstrated
- Do NOT infer skills that are not present
- Normalize skill names to their canonical forms
- Include both hard and soft skills

Resume text:
---
${resumeText}
---

Respond with valid JSON only. No markdown, no code blocks, no explanations.

{
  "skills": [
    { "name": "string", "category": "string", "confidence": 0.0 }
  ]
}`
}

/**
 * Extract required and preferred skills from a job description.
 */
export function extractSkillsFromJDPrompt(jobDescription: string): string {
  return `You are an ATS analysis engine. Extract all required and preferred skills from this job description.

Categorize skills into:
- required_skills: explicitly stated as required, must-have, or essential
- preferred_skills: listed as nice-to-have, preferred, or bonus
- keywords: important industry terms, technologies, and buzzwords that an ATS scanner would look for

Rules:
- Use canonical skill names (e.g., "React" not "ReactJS")
- Include both technical skills and domain knowledge
- Extract specific version requirements if mentioned (e.g., "Python 3.x")
- Include certifications if mentioned as requirements

Job Description:
---
${jobDescription}
---

Respond with valid JSON only. No markdown, no code blocks, no explanations.

{
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "keywords": ["string"]
}`
}

/**
 * Generate a comprehensive ATS compatibility report comparing user skills against JD requirements.
 */
export function generateATSReportPrompt(
  jdSkills: { required: string[]; preferred: string[]; keywords: string[] },
  userSkills: string[]
): string {
  return `You are an ATS (Applicant Tracking System) analysis engine. Generate a detailed compatibility report comparing a candidate's skills against a job description's requirements.

Job Description Skills:
- Required: ${JSON.stringify(jdSkills.required)}
- Preferred: ${JSON.stringify(jdSkills.preferred)}
- Keywords: ${JSON.stringify(jdSkills.keywords)}

Candidate's Verified Skills:
${JSON.stringify(userSkills)}

Analysis rules:
- Match skills case-insensitively and account for common aliases (e.g., "JS" = "JavaScript")
- overall_score: 0-100 weighted score (required skills matter most)
- keyword_match.match_percentage: percentage of JD keywords found in candidate's skills
- skills_gap: clearly separate what the candidate has vs what they're missing
- recommendations: specific, actionable suggestions to improve ATS score (max 5)
- format_score: rate 0-100 (assume ATS-optimized format since we generate it)
- content_score: rate 0-100 based on skill coverage and keyword density

Respond with valid JSON only. No markdown, no code blocks, no explanations.

{
  "overall_score": 0,
  "keyword_match": {
    "matched": ["string"],
    "missing": ["string"],
    "match_percentage": 0
  },
  "skills_gap": {
    "required": ["string"],
    "user_has": ["string"],
    "user_missing": ["string"]
  },
  "recommendations": ["string"],
  "format_score": 0,
  "content_score": 0
}`
}

/**
 * Generate tailored resume content using ONLY verified skills.
 * This is the core anti-hallucination prompt — it must never fabricate experience.
 */
export function generateResumePrompt(
  userProfile: {
    full_name: string
    email: string
    location?: string | null
    experience_years?: number | null
    github_username?: string | null
  },
  verifiedSkills: string[],
  jobDescription: string,
  atsReport: {
    keyword_match: { matched: string[]; missing: string[] }
    recommendations: string[]
  },
  existingResumeText?: string | null
): string {
  return `You are a professional resume writer specializing in ATS-optimized resumes. Generate a tailored resume for this candidate.

STRICT RULES — VIOLATIONS ARE UNACCEPTABLE:
1. Use ONLY the verified skills provided below. Do NOT add skills the candidate hasn't verified.
2. Use concise, ATS-friendly language with strong action verbs.
3. NO fluff, NO filler words, NO vague statements.
4. NO fake metrics or fabricated numbers. If quantifying impact, use realistic estimates based on context.
5. NO unsupported claims. Every bullet point must be grounded in the provided data.
6. Optimize for the matched keywords from the ATS report.
7. Address skill gaps from the ATS report by emphasizing transferable skills where appropriate.
8. Keep bullet points to 1-2 lines maximum.
9. Use industry-standard section ordering.

Candidate Profile:
- Name: ${userProfile.full_name}
- Email: ${userProfile.email}
- Location: ${userProfile.location ?? 'Not specified'}
- Experience: ${userProfile.experience_years ?? 'Not specified'} years
- GitHub: ${userProfile.github_username ? `github.com/${userProfile.github_username}` : 'Not connected'}

Verified Skills:
${JSON.stringify(verifiedSkills)}

Target Job Description:
---
${jobDescription}
---

ATS Matched Keywords: ${JSON.stringify(atsReport.keyword_match.matched)}
ATS Missing Keywords: ${JSON.stringify(atsReport.keyword_match.missing)}
ATS Recommendations: ${JSON.stringify(atsReport.recommendations)}

${existingResumeText ? `Existing Resume Content (use as source of truth for experience/education):\n---\n${existingResumeText}\n---` : 'No existing resume provided. Generate a professional summary and skills section. Leave experience and education with placeholder entries that the user should fill in.'}

Generate a complete resume in this exact JSON structure:

{
  "personal": {
    "name": "string",
    "email": "string",
    "phone": "string or omit",
    "location": "string or omit",
    "linkedin": "string or omit",
    "github": "string or omit",
    "website": "string or omit"
  },
  "summary": "2-3 sentence professional summary tailored to the target role",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "MMM YYYY",
      "end_date": "MMM YYYY or null for current",
      "bullets": ["action-oriented bullet points"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "graduation_date": "YYYY",
      "gpa": "string or omit",
      "highlights": ["string"]
    }
  ],
  "skills": [
    { "category": "string", "items": ["string"] }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string or omit",
      "bullets": ["string"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "url": "string or omit"
    }
  ]
}

Respond with valid JSON only. No markdown, no code blocks, no explanations.`
}
