This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Batch Translation

This repo can now discover untranslated Anthropic research posts and hand them to local Codex one by one.

```bash
npm run translate:batch:check
npm run translate:batch -- --dry-run
npm run translate:batch -- --limit 1
```

- `translate:batch:check`: fetches Anthropic's latest research URLs and prints the posts that are still missing locally
- `translate:batch`: runs Codex sequentially for each missing post, using `ops/codex/translation-batch-prompt.md`
- add `--limit N` to cap each batch size
- add `--model ...` or `--sandbox ...` if you need to override the default Codex invocation
- when `BATCH_GIT_PUSH_AFTER_RUN="1"` is enabled, each successful translation is committed with the required author metadata and pushed to `origin/main`

### Always-on Local Runner

For a machine that stays on, use the repo-local `launchd` wrapper:

```bash
cp ops/codex/translation-batch.env.example ops/codex/translation-batch.env
chmod +x scripts/run_translation_batch_loop.sh
mkdir -p logs/codex tmp/codex
zsh -n scripts/run_translation_batch_loop.sh
plutil -lint ops/launchd/io.tabber.anthropic-research-kr.translation-batch.plist
```

Manual smoke run:

```bash
scripts/run_translation_batch_loop.sh
```

Install the LaunchAgent:

```bash
cp ops/launchd/io.tabber.anthropic-research-kr.translation-batch.plist ~/Library/LaunchAgents/
launchctl bootout "gui/$(id -u)" ~/Library/LaunchAgents/io.tabber.anthropic-research-kr.translation-batch.plist 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/io.tabber.anthropic-research-kr.translation-batch.plist
launchctl enable "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch"
launchctl kickstart -k "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch"
```

- default cadence is every `21600` seconds, meaning every 6 hours
- create `ops/codex/STOP` to pause future runs without unloading launchd
- logs go to `logs/codex/translation-batch.stdout.log` and `logs/codex/translation-batch.stderr.log`
- by default each run translates at most one missing article
- the local `ops/codex/translation-batch.env` in this repo is configured to auto-publish after a successful run

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
