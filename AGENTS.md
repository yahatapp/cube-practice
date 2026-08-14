# Cube Practice workspace

- `web/` is the Next.js application. Follow `web/AGENTS.md` for all work in that package.
- `packages/` contains platform-independent TypeScript shared by the web application and future native clients. Shared packages must not depend on React, Next.js, DOM APIs, Node.js-only APIs, or storage implementations.
- Run workspace commands from the repository root with pnpm. Use `pnpm check` for the complete static verification suite.
- After every edit to the Next.js application, verify the page at runtime using the next-dev-loop Skill.
