# OmniRoute AI developer — evaluation (not deployed)

Target: USETOOLBENCH.IN (RAKESH104317/usetoolbench)
Production branch: fresh-rebuild
Evaluation branch: chore/omniroute-agent-evaluation

## Verified baseline
- Production Render service: usetoolbench-deals (Node.js; npm install && npm run build; npm start)
- Auto-deploy is enabled on fresh-rebuild. Do not commit agent experiments there.
- OmniRoute is an AI model gateway, not an autonomous coding agent.
- Claude Code can use OmniRoute, but Anthropic Claude is not guaranteed free. Choose a provider with a verified free allowance.
- No provider credentials, OmniRoute gateway key, or AI coding agent have been provisioned by this branch.

## Safe evaluation sequence
1. Verify OmniRoute's official Docker/headless deployment instructions and Render free-service compatibility; do not assume CLI flags or free instance availability.
2. Create a **separate** Render service only after verifying authentication, port binding, health checks, and persistence. Never reuse the production service.
3. Require authenticated access to gateway and dashboard. Do not expose unauthenticated model endpoints publicly.
4. Store provider and gateway keys only as Render secret environment variables; never commit secrets.
5. Configure a coding client (e.g. Claude Code) against the secured gateway with an eligible free model. No guarantee of free Anthropic Claude access.
6. Grant GitHub least-privilege access, no production write credentials. Agent works only in a dedicated branch and proposes draft PRs.
7. Verify a real model response, repository read, test run, and draft PR before describing the agent as connected.
8. Require explicit human approval before merging or deploying. Keep stopped private AI Chat unchanged.

## Guardrails
- Zero new paid subscriptions or paid Render instances without explicit approval.
- Do not modify production service, secrets, database, or DNS during evaluation.
- No direct commits to fresh-rebuild, no auto-merge, no deploy on agent branches.
- If a free Render instance sleeps or lacks persistence, report limitations rather than claiming 24/7 availability.

## Next action
Provisioning a separate Render service and a free model-provider connection remains pending. This branch is documentation only.
