You are running inside `/Users/tabber/Anthropic-Research-KR`.

Translate exactly one Anthropic research post into this repository.

Rules:
- Follow the repository workflow in `AGENTS.md` and `CLAUDE.md`.
- Use the provided `<article>` URL as the source of truth.
- If the article is already translated in `content/articles/*.mdx`, do not overwrite it; report a skip instead.
- Create or update only the files needed for that one article, including images under `public/images/[slug]/`.
- Keep the translation formal and research-oriented, preserving terminology and source structure.
- Run `npm run build` after the article is added or updated.
- Do not run `git commit` or `git push` yourself; the batch runner handles publication after a successful translation.

At the end, report:
- whether the article was translated or skipped
- changed files
- verification result
