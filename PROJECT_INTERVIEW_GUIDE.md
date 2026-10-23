# CarvAi — Infosys SP/DSE Project Interview Guide

> **Repository:** `Varshanth2025/carvAi`  
> Based on inspected code in `actions/`, `app/`, `lib/`, `middleware.js`, `prisma/schema.prisma`, and `package.json`. README-only claims are marked for verification.

## 1. Purpose and architecture

CarvAi is an AI-assisted career platform. The inspected implementation supports authenticated user onboarding, cached industry insights, AI-generated cover letters, resume storage/improvement, and AI-generated technical quizzes with saved assessment history.

Architecture:

- **UI/routing:** Next.js App Router under `app/`.
- **Business logic:** Server actions in `actions/*.js` using `"use server"`.
- **Authentication:** Clerk through `auth()` and `currentUser()`.
- **Database:** PostgreSQL through Prisma (`lib/prisma.js`, `prisma/schema.prisma`).
- **AI:** Google Gemini `gemini-2.5-flash`.
- **Background work:** Inngest weekly industry-insight refresh.
- **UI libraries:** React, Tailwind, Radix/shadcn-style components, React Hook Form, Recharts, Markdown/PDF-related dependencies.

### End-to-end flow

1. `middleware.js` uses Clerk and protects `/dashboard`, `/resume`, `/interview`, `/ai-cover-letter`, and `/onboarding`.
2. `checkUser()` in `lib/checkUser.js` maps the Clerk user to a local Prisma `User`, creating it if absent.
3. `app/(main)/dashboard/page.jsx` calls `getUserOnboardingStatus()` and redirects to `/onboarding` when `User.industry` is missing.
4. `updateUser()` in `actions/user.js` loads the authenticated local user, checks for an `IndustryInsight`, generates one with Gemini if missing, and updates the profile plus insight inside a Prisma transaction. Gemini generation is deliberately outside the transaction.
5. `getIndustryInsights()` loads the user’s related insight; if absent, it calls `generateAIInsights()`, parses the JSON response, creates the row, and sets `nextUpdate` seven days ahead.
6. `app/(main)/resume/page.jsx` calls `getResume()`. `saveResume()` uses Prisma `upsert`, while `improveWithAI()` sends a resume section to Gemini.
7. `generateCoverLetter()` combines job details with the user’s industry, experience, skills, and bio, asks Gemini for Markdown, and saves the result in `Coverletter`.
8. `generateQuiz()` uses user industry and skills to request ten four-option questions. `saveQuizResult()` compares submitted answers, generates optional feedback for wrong answers, and stores the assessment.
9. `app/(main)/interview/page.jsx` calls `getAssessments()` and passes results to `StatsCards`, `PerformanceChart`, and `QuizList`.
10. `lib/inngest/functions.js` runs `generateIndustryInsights` every Sunday at midnight, regenerating and updating insights for stored industries through `app/api/inngest/route.js`.

## 2. Important files and functions

| File | Important code | Talking point |
|---|---|---|
| `middleware.js` | `isProtectedRoute`, Clerk middleware | Route-level auth and redirects. |
| `lib/checkUser.js` | `checkUser()` | Clerk-to-local-user synchronization. |
| `lib/prisma.js` | Prisma singleton | Avoids duplicate clients during development hot reloads. |
| `prisma/schema.prisma` | `User`, `IndustryInsight`, `Resume`, `Coverletter`, `Assessment` | Relations, uniqueness, indexes, JSON, arrays, enums. |
| `actions/user.js` | `updateUser()`, `getUserOnboardingStatus()` | Onboarding and transactional profile/insight update. |
| `actions/dashboard.js` | `generateAIInsights()`, `getIndustryInsights()` | Structured AI output and caching. |
| `actions/interview.js` | `generateQuiz()`, `saveQuizResult()`, `getAssessments()` | Quiz generation, scoring, feedback, history. |
| `actions/resume.js` | `saveResume()`, `getResume()`, `improveWithAI()` | One-resume-per-user upsert and AI improvement. |
| `actions/cover-letter.js` | `generateCoverLetter()` and CRUD | Profile-aware prompt and ownership filtering. |
| `lib/inngest/functions.js` | `generateIndustryInsights` | Scheduled background refresh. |
| `app/(main)/dashboard/page.jsx` | onboarding check | Server-rendered protected page. |
| `app/(main)/interview/page.jsx` | `getAssessments()` | Server-side data loading. |

**Verify your personal contribution separately; repository code cannot prove which parts you implemented.**

## 3. Technologies and design decisions

- **Next.js App Router:** Server-rendered pages and server actions keep database access and API keys on the server.
- **Clerk:** Handles authentication; local Prisma users store application-specific fields.
- **Prisma/PostgreSQL:** Relational persistence with foreign keys, unique constraints, indexes, and typed queries.
- **Server actions:** Direct server-side mutations/queries without separate REST endpoints for every feature.
- **Gemini:** Reused for industry JSON, quizzes, cover letters, resume improvements, and feedback.
- **Inngest:** Separates scheduled/expensive insight regeneration from user page requests.
- **React/Tailwind/Radix:** Componentized responsive UI.
- **Recharts:** Used by interview dashboard components; verify exact calculations before discussing metrics.

Key decisions:

1. `clerkUserId` identifies the external user while local `User.id` is used by domain relations.
2. `IndustryInsight.industry` is unique, allowing shared cached insights for users in the same industry.
3. Resume `userId` is unique, enabling `upsert`.
4. Prompts request JSON-only responses; code removes code fences and calls `JSON.parse()`.
5. Improvement feedback is generated only when wrong quiz answers exist, reducing unnecessary AI calls.

## 4. Database, APIs, algorithms, error handling, debugging

### Database

- `User`: Clerk identity, profile, industry, skills.
- `IndustryInsight`: unique industry, salary JSON, growth rate, demand enum, skills, trends, refresh dates.
- `Resume`: one-to-one with user; long text content and optional ATS fields.
- `Coverletter`: many per user with job metadata and generated content.
- `Assessment`: quiz score, JSON question results, category, improvement tip.

`Assessment.userId` and `Coverletter.userId` are indexed. `User.industry` relates to unique `IndustryInsight.industry`.

### Server action API

- User: `updateUser`, `getUserOnboardingStatus`.
- Dashboard: `generateAIInsights`, `getIndustryInsights`.
- Interview: `generateQuiz`, `saveQuizResult`, `getAssessments`.
- Resume: `saveResume`, `getResume`, `improveWithAI`.
- Cover letters: `generateCoverLetter`, `getCoverLetters`, `getCoverLetter`, `deleteCoverLetter`.
- Inngest: `app/api/inngest/route.js` exposes the scheduled function.

### Algorithms

- Quiz results are built with `questions.map`; correctness is `q.correctAnswer === answers[index]`.
- Wrong results are filtered and serialized into the improvement prompt.
- AI JSON is cleaned with `/```(?:json)?\n?/g` and parsed.
- Insights use a unique industry cache and a seven-day `nextUpdate` timestamp.
- `getAssessments()` orders history ascending by `createdAt`.

### Error handling

Actions check authentication, reject missing users, log failures, and throw generic errors. `updateUser()` uses a transaction with a ten-second timeout. Quiz feedback failure is non-fatal: the assessment can still be saved with `improvementTip = null`.

Weaknesses include direct `JSON.parse()` without runtime schema validation, generic errors, and some reads without custom error handling.

### Debugging checklist

1. Confirm Clerk `auth()` returns a user ID.
2. Confirm a local `User` exists for that Clerk ID.
3. Check `DATABASE_URL`, Prisma generation, migrations, and relation errors.
4. Log raw Gemini output before cleaning/parsing when structured generation fails.
5. Verify `User.industry`, onboarding redirect, and insight relation.
6. Inspect `lastUpdated`/`nextUpdate` and Inngest delivery for stale insights.
7. For quiz issues, compare question order with `answers[index]` and verify where `score` is computed.
8. Confirm every query filters data using the authenticated local `user.id`.

## 5. Fifteen likely Infosys SP/DSE questions

1. **Explain CarvAi.**
   - **Answer:** It is a Next.js career assistant using Clerk, Prisma/PostgreSQL, Gemini, and Inngest. It stores profiles, resumes, cover letters, assessments, and cached industry insights. Server actions perform authenticated reads/mutations, while Inngest refreshes industry data weekly.
   - **Follow-up:** Which operations are synchronous versus background?

2. **Why store users locally if Clerk already authenticates them?**
   - **Answer:** Clerk provides identity, but the application needs industry, experience, skills, resumes, assessments, and cover letters. `checkUser()` maps Clerk’s ID to a local `User` row.
   - **Follow-up:** What if the local row is missing?

3. **Explain onboarding.**
   - **Answer:** `getUserOnboardingStatus()` checks `User.industry`; the dashboard redirects to `/onboarding` if absent. `updateUser()` saves profile fields and creates/reuses industry insight data.
   - **Follow-up:** Why is AI generation outside the transaction?

4. **How is industry data cached?**
   - **Answer:** `IndustryInsight.industry` is unique. The first request generates and stores the insight; later requests reuse the relation. Inngest refreshes all stored industries weekly.
   - **Follow-up:** How would you handle two first requests concurrently?

5. **How do you get structured Gemini output?**
   - **Answer:** The prompt specifies a JSON structure. Code removes Markdown fences and calls `JSON.parse()`. I would add Zod validation for required fields, enums, and numeric ranges.
   - **Follow-up:** What if the model returns valid JSON with missing fields?

6. **Explain quiz scoring.**
   - **Answer:** `saveQuizResult()` maps each question to the corresponding submitted answer, compares it to `correctAnswer`, filters wrong answers, optionally generates an improvement tip, and stores the result as JSON.
   - **Follow-up:** Where is the supplied score calculated?

7. **Why store quiz questions as JSON?**
   - **Answer:** Each result has nested, variable fields such as options, explanations, user answers, and correctness. JSON preserves a historical snapshot simply, though normalized tables would be better for complex analytics.
   - **Follow-up:** When would you normalize it?

8. **How does resume saving work?**
   - **Answer:** `Resume.userId` is unique and `saveResume()` uses `upsert`, updating the existing resume or creating one. This avoids a race-prone find-then-create sequence.
   - **Follow-up:** How would you add version history?

9. **How is a cover letter personalized?**
   - **Answer:** `generateCoverLetter()` includes job title/company/description and the user’s industry, experience, skills, and bio in the Gemini prompt, then saves the generated Markdown with user ownership.
   - **Follow-up:** What privacy and prompt-injection risks exist?

10. **Why use server actions?**
    - **Answer:** Database access, Clerk secrets, and Gemini keys remain server-side. Server actions also provide a feature-oriented API without many manual REST routes.
    - **Follow-up:** When would REST or tRPC be preferable?

11. **What does the Inngest job do?**
    - **Answer:** `generateIndustryInsights` runs on cron, fetches all industries, generates fresh Gemini results, parses them, and updates each row’s data and timestamps.
    - **Follow-up:** How should one failed industry affect the others?

12. **How is authorization enforced?**
    - **Answer:** Every action calls Clerk authentication, resolves the local user, and filters child data by `user.id`. This protects data at the server/database query boundary, not just in the UI.
    - **Follow-up:** Is middleware alone enough?

13. **What is a concrete limitation?**
    - **Answer:** AI JSON is parsed without schema validation. A malformed response or invalid enum may fail or save bad data. I would add Zod validation, bounded retries, and a fallback error path.
    - **Follow-up:** What would you fix first?

14. **How would you debug a Gemini failure?**
    - **Answer:** Verify API key/model, log a redacted raw response, check code-fence cleaning, validate parsed fields, and distinguish provider failure from database persistence failure.
    - **Follow-up:** What should never be logged?

15. **How would you improve production reliability?**
    - **Answer:** Add Zod validation, rate limits and AI quotas, structured logging/correlation IDs, idempotent insight refresh, per-industry failure isolation, pagination, stronger error types, and tests for auth, ownership, scoring, transactions, malformed AI output, and cron jobs.
    - **Follow-up:** Which has the highest immediate safety impact?

## 6. Bugs, limitations, improvements

### Visible risks

- README lists many testing commands, but `package.json` only defines `dev`, `build`, `start`, `lint`, and `postinstall`; verify tests before claiming them.
- Zod is a dependency, but inspected actions do not visibly validate input or Gemini output with schemas.
- `JSON.parse()` trusts model output; missing fields, wrong enums, or wrong array lengths are possible.
- AI receives user profile, job descriptions, and answer data; privacy, retention, and prompt-injection controls should be reviewed.
- Concurrent first requests for a new industry can both attempt creation; the unique constraint may produce a conflict that is not explicitly handled.
- `getIndustryInsights()` checks for an existing relation but does not visibly compare `nextUpdate` to current time; freshness depends on the Inngest cron.
- The weekly Inngest loop processes industries sequentially; one failure may interrupt later updates unless retries/isolation are confirmed.
- There is no visible AI rate limiting or cost control.
- `checkUser()` logs an error and returns `undefined` instead of throwing a typed failure.
- `updateUser()` imports `success` from Zod but does not use it.
- Landing-page values such as `50+`, `1000+`, and `95%` in `app/page.jsx` appear to be marketing copy; do not present them as measured metrics without verification.

### Recommended improvements

1. Add Zod schemas for every action input and Gemini response.
2. Add retries, fallback handling, quotas, and rate limiting for AI calls.
3. Make insight creation/refresh idempotent and isolate failures per industry.
4. Add structured logging, correlation IDs, and safe redaction of prompts/responses.
5. Add pagination for assessments and cover letters.
6. Review the industry relation and freshness logic for nullable/missing industries.
7. Add tests for authorization, ownership, onboarding, quiz scoring, malformed JSON, transactions, and Inngest jobs.
8. Align README claims/scripts with the actual implementation.

## Verify before the interview

- Your exact personal contribution.
- Whether PDF export, ATS scoring, tests, OAuth providers, loading/error UI, and full onboarding validation are implemented in uninspected components.
- Whether Neon, Vercel, Inngest cron, and production environment variables are currently configured.
- Whether README metrics represent real measurements or static marketing content.
