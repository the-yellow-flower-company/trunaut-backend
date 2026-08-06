# trunaut-backend

Hosted-tier backend for **TruReader**. It holds Trunaut's model key and serves AI
requests for the two metered tiers, so the key never ships in an app binary.

| Tier | Served here? | Proof of entitlement |
|---|---|---|
| **Subscriber** ($8/mo) | Yes | Signed StoreKit transaction (JWS), verified against Apple's roots |
| **Trial** (5 conversations, free) | Yes | App Attest (iOS) / Play Integrity (Android), plus a DeviceCheck bit so a reinstall can't reset it |
| **BYOK** ($49 one-time) | **No** | The reader's own key, calling their provider directly |
| **Expired** | No | — |

**No reader accounts.** A signed receipt proves someone paid and App Attest proves the
request came from the real app; a login would add nothing to either. Accounts arrive with
the later cross-platform sync project, which is why `subscriptions.account_id` exists as a
nullable seam.

**Zero content retention.** The database holds usage counters only — no message bodies, no
passages, no reader identity.

## Status

Build 1 of 11: scaffold and CI/CD. Health check only; no auth, no model calls yet.
See the plan at `~/.claude/plans/kind-questing-finch.md` for the full build order.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
curl localhost:8080/health
```

## Deployment

Push to `main` → GitHub Actions typechecks, then `flyctl deploy`. No manual deploys needed.

One-time setup:

```bash
brew install flyctl
fly auth login
fly launch --no-deploy      # claims the app name in fly.toml
fly tokens create deploy    # paste into GitHub → Settings → Secrets → FLY_API_TOKEN
```

Secrets go to Fly directly, never into `fly.toml` or the repo:

```bash
fly secrets set DATABASE_URL='...'
```

## Layout

```
src/
  index.ts        app wiring, graceful shutdown
  config.ts       env validation — fails at boot, not mid-request
  routes/
    health.ts     liveness + config state (never secret values)
```
