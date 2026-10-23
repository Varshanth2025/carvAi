# CarvAi — Infosys SP/DSE Project Interview Guide

> **Repository:** `Varshanth2025/carvAi`  
> **Inspected code:** Next.js App Router, Clerk, Prisma/PostgreSQL, Google Gemini, Inngest, and server actions.  
> This guide is based on repository code. README-only claims are marked for verification.

## 1. Project purpose and architecture

### Purpose
CarvAi is an AI-assisted career platform. The implemented code supports user onboarding, industry insights, AI-generated cover letters, resume storage/improvement, and AI-generated technical interview quizzes with saved assessment history.

### Architecture

- **Frontend/routing:** Next.js App Router under `app/`; server-rendered pages call server actions.
- **Server-side application logic:** Functions in `actions/` use the `"use server"` directive.
- **Authentication:** Clerk, accessed through `auth()` and `currentUser()`.
- **Database:** PostgreSQL accessed through Prisma (`lib/prisma.js`, `prisma/schema.prisma`).
- **AI:** Google Gemini `gemini-2.5-flash` for insights, cover letters, resume improvements, quizzes, and improvement tips.
- **Background jobs:** Inngest refreshes stored industry insights on a weekly cron schedule.
- **UI:** React, Tailwind CSS, Radix/shadcn-style components, React Hook Form, Recharts, Markdown editor, and `html2pdf.js` dependencies.

### End-to-end execution flow

1. A request enters the Next.js application. `middleware.js` uses Clerk and protects `/dashboard`, `/resume`, `/interview`, `/ai-cover-letter`, and `/onboarding` routes.
2. `checkUser()` in `lib/checkUser.js` reads the Clerk user and creates a local Prisma `User` record if one does not exist, using `clerkUserId` as the external identity.
3. The dashboard page (`app/(main)/dashboard/page.jsx`) calls `getUserOnboardingStatus()`. If no industry is stored, it redirects to `/onboarding`.
4. `updateUser()` in `actions/user.js` validates authentication, loads the local user, optionally generates industry insights with `generateAIInsights()`, and updates the user plus cached industry data in a Prisma transaction.
5. `getIndustryInsights()` loads the user’s related `IndustryInsight`; if missing, it calls Gemini, parses the JSON response, stores it, and sets `nextUpdate` seven days ahead.
6. On the resume page, `getResume()` loads the user’s single resume. `saveResume()` uses Prisma `upsert`, so one user has one resume record. `improveWithAI()` sends a section to Gemini and returns improved text.
7. On the cover-letter feature, `generateCoverLetter()` combines job information with the user profile, asks Gemini for Markdown, saves the result in `Coverletter`, and returns it.
8. On the interview feature, `generateQuiz()` loads the user’s industry and skills, asks Gemini for ten multiple-choice questions, strips optional Markdown code fences, parses JSON, and returns the questions.
9. `saveQuizResult()` compares each submitted answer with `correctAnswer`, builds per-question results, optionally asks Gemini for an improvement tip based on wrong answers, and persists an `Assessment`.
10. `getAssessments()` loads the authenticated user’s historical assessments. `app/(main)/interview/page.jsx` passes them to `StatsCards`, `PerformanceChart`, and `QuizList`.
11. `lib/inngest/functions.js` runs `generateIndustryInsights` every Sunday at midnight. It fetches industries, generates fresh Gemini JSON for each, and updates `lastUpdated` and `nextUpdate`.

## 2. Important files, functions, and talking points

| File | Important code | Interview talking point |
|---|---|---|
| `middleware.js` | `isProtectedRoute`, Clerk middleware | Route-level authentication and redirect behavior. |
| `lib/checkUser.js` | `checkUser()` | Synchronizes Clerk identity with the local Prisma user table. |
| `lib/prisma.js` | Singleton `PrismaClient` pattern | Avoids creating too many clients during development hot reloads. |
| `prisma/schema.prisma` | `User`, `Assessment`, `Resume`, `Coverletter`, `IndustryInsight` | Relational design, unique constraints, foreign keys, JSON fields, arrays, and indexes. |
| `actions/user.js` | `updateUser()`, `getUserOnboardingStatus()` | Onboarding, industry-cache creation, authentication, and transaction usage. |
| `actions/dashboard.js` | `generateAIInsights()`, `getIndustryInsights()` | Prompt-constrained JSON generation and seven-day insight caching. |
| `actions/interview.js` | `generateQuiz()`, `saveQuizResult()`, `getAssessments()` | AI quiz generation, scoring algorithm, persistence, and personalized feedback. |
| `actions/resume.js` | `saveResume()`, `getResume()`, `improveWithAI()` | Single-row upsert and AI-assisted content improvement. |
| `actions/cover-letter.js` | `generateCoverLetter()`, CRUD functions | Profile-aware prompt construction and ownership filtering. |
| `lib/inngest/functions.js` | `generateIndustryInsights` | Scheduled background refresh rather than doing all work during a page request. |
| `app/(main)/dashboard/page.jsx` | onboarding check and `getIndustryInsights()` | Server-rendered protected page and redirect flow. |
| `app/(main)/interview/page.jsx` | `getAssessments()` | Server-side data loading for performance and simpler client components. |
| `app/page.jsx` | `Home()` | Static landing-page composition from data arrays and reusable UI components. |

**Personal contribution warning:** The repository code cannot prove which features you personally implemented. Verify your exact contribution and be ready to explain the files you changed.

## 3. Technologies and key design decisions

- **Next.js App Router:** Server-rendered pages and server actions keep database and AI calls on the server. This avoids exposing API keys to the browser.
- **Clerk:** Delegates authentication and OAuth/session management. The code maps the Clerk ID to a local `User` record for application data.
- **Prisma + PostgreSQL:** Provides typed database access and relational integrity. The schema uses unique fields for `clerkUserId`, email, and one resume per user.
- **Server actions:** `"use server"` functions provide a direct server-side boundary for mutations and reads without building separate REST endpoints for each feature.
- **Gemini:** A single model is reused for structured industry JSON, quizzes, cover letters, resume improvements, and feedback.
- **Inngest:** Moves periodic industry refresh work into a scheduled background function. `step.run` and `step.ai.wrap` make job stages explicit.
- **Zod dependency:** Listed in `package.json`; verify actual runtime usage in the current branch before claiming comprehensive input validation. The inspected action files do not show Zod schemas at their boundaries.
- **Recharts:** Used by the interview dashboard components for performance visualization; the exact chart calculations should be verified in those components before discussing metrics.
- **Markdown and PDF dependencies:** README and dependencies indicate Markdown editing/rendering and PDF generation support. Verify the exact implementation in resume components before claiming a specific export flow.

### Important design choices

1. **External-to-local user mapping:** Clerk remains the identity provider, while Prisma stores domain data keyed by the local `User.id`.
2. **Cached industry insights:** Insights are stored by unique `industry`, allowing multiple users in the same industry to reuse one generated record.
3. **Seven-day refresh period:** `nextUpdate` is set using `Date.now() + 7 * 24 * 60 * 60 * 1000`; the scheduled Inngest job updates existing insight rows weekly.
4. **Resume upsert:** `Resume.userId` is unique, so `saveResume()` can update or create without requiring separate existence logic.
5. **AI structured output:** Prompts request JSON-only output, then the code removes code fences and calls `JSON.parse()`.
6. **Optional feedback generation:** `saveQuizResult()` only calls Gemini for improvement feedback when there are wrong answers, reducing unnecessary AI calls.

## 4. Database, APIs, algorithms, error handling, and debugging

### Database model

- `User`: Clerk identity, profile, industry, skills, and relations.
- `IndustryInsight`: One cached record per unique industry, with JSON salary ranges, growth rate, demand level, skill arrays, trends, and refresh timestamps.
- `Resume`: One-to-one with `User`, storing long-form content, optional ATS score, and feedback.
- `Coverletter`: Many cover letters per user, including company, job title, job description, and generated content.
- `Assessment`: Quiz score, JSON question results, category, and optional improvement tip.

Foreign keys connect child records to `User`; `Assessment.userId` and `Coverletter.userId` are indexed. `User.industry` references the unique `IndustryInsight.industry` field.

### Server actions / API surface

The inspected code primarily uses server actions rather than conventional REST handlers:

- User: `updateUser`, `getUserOnboardingStatus`
- Dashboard: `generateAIInsights`, `getIndustryInsights`
- Interview: `generateQuiz`, `saveQuizResult`, `getAssessments`
- Resume: `saveResume`, `getResume`, `improveWithAI`
- Cover letters: `generateCoverLetter`, `getCoverLetters`, `getCoverLetter`, `deleteCoverLetter`
- Background route: `app/api/inngest/route.js` exposes the Inngest functions through GET/POST/PUT handlers.

### Algorithms

- **Quiz scoring:** `questions.map((q, index) => ...)` compares `q.correctAnswer` with `answers[index]`; wrong answers are filtered and used to build an improvement prompt. The score itself is accepted as an argument, so verify where it is calculated in the client.
- **Industry cache lookup:** `getIndustryInsights()` first checks the user’s relation; if absent, it generates and inserts one industry record.
- **Pagination/order:** The inspected action files do not show pagination for assessments or cover letters; `getAssessments()` orders by `createdAt: "asc"`.
- **Structured AI parsing:** Responses are cleaned with `/```(?:json)?\n?/g`, then parsed with `JSON.parse()`.
- **Prompt personalization:** User industry, experience, skills, bio, job details, and wrong quiz questions are interpolated into prompts.

### Error handling

The actions consistently:

- Reject unauthenticated calls with `Error("Unauthorized")` or `Error("unauthorized")`.
- Reject missing local users with `Error("User not found")`.
- Log server-side failures using `console.error` and throw a user-facing generic error.
- Continue quiz-result persistence if improvement-tip generation fails; the tip remains `null`.
- Use a Prisma transaction in `updateUser()` with a ten-second timeout.

Limitations in current error handling:

- Gemini JSON parsing failures are not fully normalized into domain-specific errors.
- Some read operations such as `getResume()` and `getCoverLetters()` do not wrap database failures in custom errors.
- The UI error/loading behavior should be verified in the relevant components.

### Debugging checklist

1. Check Clerk authentication first: `auth()`/`currentUser()` must return a user ID.
2. Confirm a matching local `User` exists by `clerkUserId`.
3. Check `DATABASE_URL`, Prisma generation, migrations, and relation errors.
4. For Gemini failures, log the raw response before cleaning/parsing and verify the model/key.
5. For JSON parse errors, inspect whether Gemini returned Markdown, extra text, missing fields, or invalid enum values.
6. For onboarding problems, inspect `User.industry`, `getUserOnboardingStatus()`, and the redirect in the dashboard page.
7. For stale insights, inspect `IndustryInsight.lastUpdated` and `nextUpdate`, then verify Inngest delivery and the Sunday cron.
8. For quiz problems, compare question ordering with `answers[index]` and verify the client’s score calculation.
9. For authorization problems, confirm every query uses the authenticated user’s local `user.id`.

## 5. Fifteen likely Infosys SP/DSE interview questions

1. **Explain CarvAi in one minute.**
   - **Sample answer:** CarvAi is a Next.js career assistant that stores user profiles, resumes, cover letters, interview assessments, and cached industry insights in PostgreSQL through Prisma. Clerk handles identity, Gemini generates career content, and Inngest periodically refreshes industry data. Server actions keep database and AI operations on the server.
   - **Follow-up:** Which part is synchronous and which part is asynchronous?

2. **Why use Clerk and still store users in Prisma?**
   - **Sample answer:** Clerk handles authentication and identity, but application features need domain data such as industry, experience, bio, skills, resumes, and assessments. `checkUser()` maps the Clerk ID to a local `User` row, so domain tables can use normal relational foreign keys.
   - **Follow-up:** What happens if a Clerk user exists but the local user does not?

3. **How does the onboarding flow work?**
   - **Sample answer:** `getUserOnboardingStatus()` checks whether the authenticated local user has an industry. The dashboard page redirects to `/onboarding` when it is missing. `updateUser()` saves profile fields and creates or reuses the industry insight inside a Prisma transaction.
   - **Follow-up:** Why generate AI insights outside the transaction?

4. **Why is AI generation outside the transaction in `updateUser()`?**
   - **Sample answer:** Gemini is an external, potentially slow operation. Holding a database transaction open while waiting for an external API increases lock duration and timeout risk. The code generates insights first, then performs the database writes in a transaction.
   - **Follow-up:** What consistency issue can this create?

5. **How are industry insights cached?**
   - **Sample answer:** `IndustryInsight.industry` is unique. `getIndustryInsights()` returns the existing related record; if absent, it calls `generateAIInsights()` and creates one with `nextUpdate` seven days later. The Inngest cron refreshes existing industries weekly.
   - **Follow-up:** How would you avoid two users generating the same new industry simultaneously?

6. **How do you make Gemini return structured data?**
   - **Sample answer:** The prompt explicitly specifies a JSON schema and requests JSON only. The response is cleaned with a regular expression to remove optional Markdown code fences, then parsed with `JSON.parse()`. In production I would additionally validate the parsed object with Zod before persistence.
   - **Follow-up:** What if the model returns valid JSON with missing fields?

7. **Explain quiz generation and scoring.**
   - **Sample answer:** `generateQuiz()` loads the user’s industry and skills, asks Gemini for ten four-option questions, parses the JSON, and returns the questions. `saveQuizResult()` maps questions to submitted answers, compares each answer with `correctAnswer`, filters wrong answers, optionally generates a short improvement tip, and stores the assessment as JSON.
   - **Follow-up:** Where is the score calculated?

8. **Why store assessment questions as JSON?**
   - **Sample answer:** Quiz questions have a nested and variable structure: question text, options, correct answer, user answer, correctness, and explanation. A JSON column keeps the complete historical snapshot with the assessment. The trade-off is weaker relational querying and validation compared with normalized question tables.
   - **Follow-up:** When would you normalize this model?

9. **How does resume persistence work?**
   - **Sample answer:** `Resume.userId` is unique, so `saveResume()` uses Prisma `upsert`: update the existing row or create it if absent. `getResume()` retrieves the row and passes its content to `ResumeBuilder` as `initialContent`.
   - **Follow-up:** Why is upsert safer than separate find-then-create logic?

10. **How is the cover letter personalized?**
    - **Sample answer:** `generateCoverLetter()` combines job title, company, job description, and the user’s industry, experience, skills, and bio into a prompt. Gemini returns Markdown, which is stored in `Coverletter` along with the job metadata and local user ID.
    - **Follow-up:** What prompt-injection or privacy risks exist?

11. **Why use server actions instead of client-side API calls?**
    - **Sample answer:** These operations require database access, Clerk secrets, and the Gemini API key. Server actions keep those credentials and operations on the server while allowing page components to call domain-specific functions directly. They also reduce repetitive REST endpoint code.
    - **Follow-up:** When would you prefer REST or tRPC?

12. **What is the purpose of the Inngest function?**
    - **Sample answer:** `generateIndustryInsights` is a scheduled function exposed by `app/api/inngest/route.js`. It fetches all stored industries, generates fresh Gemini data for each, and updates refresh timestamps. This prevents every dashboard request from generating expensive market data.
    - **Follow-up:** How would you handle one industry failing while others should continue?

13. **How is authorization enforced in the actions?**
    - **Sample answer:** Each action calls Clerk `auth()` and resolves the local user by `clerkUserId`. Reads and mutations then use the local `user.id`; for example, cover letters and assessments filter by that ID, and resume access is restricted by unique `userId` lookup.
    - **Follow-up:** Is middleware alone sufficient for authorization?

14. **Identify a concrete limitation in the current code.**
    - **Sample answer:** Gemini output is parsed with `JSON.parse()` but is not visibly validated against a runtime schema before being saved. A malformed response or wrong enum such as an unexpected demand level could fail or corrupt data. I would add Zod validation and retry/fallback handling.
    - **Follow-up:** What other issue would you prioritize?

15. **How would you improve production reliability?**
    - **Sample answer:** Add Zod validation for all action inputs and Gemini outputs, centralize error types, add rate limits and usage controls for AI calls, make insight refresh idempotent, add indexes and pagination, redact sensitive prompt data from logs, test ownership checks, and add observability for Clerk, Prisma, Gemini, and Inngest failures.
    - **Follow-up:** Which improvement gives the highest immediate safety benefit?

## 6. Bugs, limitations, and improvements

### Directly visible risks

- **README/code mismatch:** The README lists extensive testing tools and scripts, but the inspected `package.json` contains only `dev`, `build`, `start`, `lint`, and `postinstall`; verify tests before claiming they exist.
- **No visible runtime schema validation in actions:** Although Zod is a dependency, inspected actions accept plain objects and parse Gemini JSON directly.
- **AI output trust:** `generateAIInsights()` and `generateQuiz()` call `JSON.parse()` after removing code fences, but do not validate required fields, array lengths, numeric ranges, or enum values.
- **Prompt/data leakage risk:** User bio, skills, job descriptions, and wrong answers are sent to Gemini. The application should document data handling and avoid logging sensitive prompts or responses.
- **Potential duplicate insight generation:** Two simultaneous onboarding requests for a new industry can both observe no row and attempt to create one. The unique constraint protects the database but the action does not visibly handle the resulting conflict.
- **Stale-cache semantics:** `getIndustryInsights()` checks whether the relation exists but does not visibly compare `nextUpdate` with the current time. Refresh responsibility is delegated to the Inngest cron.
- **Inngest loop failure behavior:** `generateIndustryInsights` processes industries sequentially. One Gemini/JSON/database failure may interrupt later industries unless Inngest retries the function; verify runtime behavior and add per-industry error isolation if required.
- **No visible AI rate limiting:** Repeated requests can trigger repeated Gemini calls and cost. Add quotas, throttling, or caching for generated content.
- **Error messages are generic:** Generic errors are useful for users but make diagnosis harder without correlation IDs and structured logging.
- **`checkUser()` error behavior:** It logs an error and returns `undefined` rather than throwing a typed failure, which can make downstream authentication/profile bugs harder to diagnose.
- **Potential assumptions in onboarding:** `updateUser()` expects `data.industry`, and `getIndustryInsights()` passes `user.industry` to Gemini. Verify UI validation prevents null or invalid industries.
- **README metrics are not code evidence:** Landing-page text in `app/page.jsx` displays values such as `50+`, `1000+`, and `95%`; verify whether these are measured metrics or marketing copy before mentioning them.

### Recommended improvements

1. Add Zod schemas for action inputs and Gemini response objects.
2. Add retries with bounded backoff and fallback behavior for Gemini failures.
3. Add rate limiting, quotas, and caching for expensive AI operations.
4. Add `nextUpdate` freshness checks and a safe single-flight/upsert strategy for new industries.
5. Process each industry refresh independently and record failures without stopping all updates.
6. Add structured logging, request IDs, AI latency/cost tracking, and safe error boundaries.
7. Add pagination for cover letters and assessments and indexes for common filters.
8. Review prompt privacy, sanitize user-provided text, and avoid logging sensitive content.
9. Add automated tests for auth ownership, onboarding redirects, Prisma transactions, malformed Gemini JSON, quiz scoring, and scheduled jobs.
10. Verify and align README scripts/features with the actual `package.json` and current implementation.

## Interview cautions / verify before the interview

- Verify your exact personal contribution; repository code cannot establish it.
- Verify whether Gemini output validation, test suites, PDF export, ATS scoring, Clerk OAuth, and UI loading/error states are implemented in files not inspected here.
- Do not claim real-time industry data accuracy; the code generates and caches AI output, and the README’s “real-time” wording should be treated as a product claim.
- Confirm the current deployed environment variables, Neon database, Inngest cron configuration, and Gemini model version.
- Distinguish code-backed facts from README marketing text, especially user counts, success rate, coverage goals, and supported feature breadth.
