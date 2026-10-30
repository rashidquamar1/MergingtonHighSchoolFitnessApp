# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep React components responsible for rendering and user interaction, with API requests centralized in the shared frontend API client. Use relative `/api` URLs so the Vite proxy remains the default; represent loading, empty, and API-error states accessibly in each capability's view.
- Logic tier decision: Keep HTTP parsing, validation, status codes, and response shapes in Express routes/services. Validate request fields and referenced IDs before database operations, return deliberate 4xx responses for invalid or missing resources, and avoid exposing Mongoose cast errors as 500 responses. Do not add authentication in this exercise.
- Data tier decision: Keep persistence rules in Mongoose models, require the fields in the API contract, and use references for user, team, and activity relationships. Keep seed data representative and idempotent.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; validate both IDs and confirm the referenced records exist before creating an activity. Persist user/team references and the submitted activity values, and compute `points` and `occurredAt` on the server using one consistent, tested rule.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot in create/list responses, and resolve supplied members to valid user references. Return a deliberate client error for invalid member IDs rather than a server error.
- Leaderboard approach: Include teams in the result, aggregate their activity points, sort descending by total, and assign ranks starting at 1. Return the documented `teamName`, `totalPoints`, and `rank` fields.
- Workout suggestions approach: Find the user by email, derive a deterministic suggestion from the user's fitness goal and recent activity, and include a human-readable reason tied to that signal. Return a deliberate 4xx response when no user matches.

## Test plan

- `npm run test:data --prefix octofit-tracker/backend` — checks model validation, relationships, and seed behavior. A failure indicates the data contract or persistence setup is not met.
- `npm run test:api --prefix octofit-tracker/backend` — checks route inputs, status codes, response shapes, and activity/team/leaderboard/workout behavior. A failure indicates an API contract or business-logic issue.
- `npm test --prefix octofit-tracker/frontend` — checks rendered API data, requests, and accessible loading, empty, and error states. A failure indicates a presentation or frontend/API integration issue.
- `npm run build --prefix octofit-tracker/backend` — verifies the backend TypeScript application compiles.
- `npm run build --prefix octofit-tracker/frontend` — verifies the frontend production bundle builds.

Latest recorded full-suite results: `npm test --prefix octofit-tracker/backend` failed with 8 failures and 1 pass (model required-field validation and API validation, leaderboard, and workout-reason contract failures); `npm test --prefix octofit-tracker/frontend` failed with 15 failures (expected content, request behavior, and accessible loading, empty, and error states). The targeted `test:data` and `test:api` commands and both build commands have not yet been run; run them after implementation to isolate failures and verify compilation.
