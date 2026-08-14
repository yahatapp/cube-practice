# Security policy

## Reporting a vulnerability

Do not open a public issue for suspected vulnerabilities or exposed credentials.
Use GitHub's private vulnerability reporting for this repository. If that feature is
not available, contact the repository owner privately.

Include the affected component, reproduction steps, impact, and any suggested
mitigation. Never include a live secret; revoke or rotate exposed credentials first.

## Repository controls

Protect `main`, require changes to pass through a pull request and the `Verify` status
check, and prevent force pushes and branch deletion. An approving review is optional
while the repository has a sole maintainer. Enable secret scanning with push
protection where available.

Configure Vercel's Production Branch as `main`. Production deployments must originate
from protected `main`; preview deployments are used to verify pull requests before
merge.

GitHub Actions use read-only default permissions and immutable commit SHAs. Runtime
credentials must be stored in Vercel Environment Variables, never in source files,
local environment files, or workflow YAML.
