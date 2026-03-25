#!/bin/zsh

set -uo pipefail

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

SCRIPT_DIR="${0:A:h}"
REPO_ROOT="${SCRIPT_DIR:h}"
DEFAULT_ENV_FILE="${REPO_ROOT}/ops/codex/translation-batch.env"
ENV_FILE="${TRANSLATION_BATCH_ENV_FILE:-${DEFAULT_ENV_FILE}}"

OVERRIDE_BATCH_WORKDIR="${BATCH_WORKDIR-__UNSET__}"
OVERRIDE_BATCH_LOG_DIR="${BATCH_LOG_DIR-__UNSET__}"
OVERRIDE_BATCH_STATE_DIR="${BATCH_STATE_DIR-__UNSET__}"
OVERRIDE_BATCH_STOP_FILE="${BATCH_STOP_FILE-__UNSET__}"
OVERRIDE_BATCH_LIMIT="${BATCH_LIMIT-__UNSET__}"
OVERRIDE_BATCH_NODE_BIN="${BATCH_NODE_BIN-__UNSET__}"
OVERRIDE_BATCH_RUNNER_SCRIPT="${BATCH_RUNNER_SCRIPT-__UNSET__}"
OVERRIDE_BATCH_SANDBOX="${BATCH_SANDBOX-__UNSET__}"
OVERRIDE_BATCH_MODEL="${BATCH_MODEL-__UNSET__}"
OVERRIDE_BATCH_PROMPT_FILE="${BATCH_PROMPT_FILE-__UNSET__}"
OVERRIDE_BATCH_EXTRA_ARGS="${BATCH_EXTRA_ARGS-__UNSET__}"
OVERRIDE_BATCH_GIT_PUSH_AFTER_RUN="${BATCH_GIT_PUSH_AFTER_RUN-__UNSET__}"
OVERRIDE_BATCH_GIT_REMOTE="${BATCH_GIT_REMOTE-__UNSET__}"
OVERRIDE_BATCH_GIT_BRANCH="${BATCH_GIT_BRANCH-__UNSET__}"
OVERRIDE_BATCH_GIT_AUTHOR_NAME="${BATCH_GIT_AUTHOR_NAME-__UNSET__}"
OVERRIDE_BATCH_GIT_AUTHOR_EMAIL="${BATCH_GIT_AUTHOR_EMAIL-__UNSET__}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  source "${ENV_FILE}"
  set +a
fi

[[ "${OVERRIDE_BATCH_WORKDIR}" != "__UNSET__" ]] && BATCH_WORKDIR="${OVERRIDE_BATCH_WORKDIR}"
[[ "${OVERRIDE_BATCH_LOG_DIR}" != "__UNSET__" ]] && BATCH_LOG_DIR="${OVERRIDE_BATCH_LOG_DIR}"
[[ "${OVERRIDE_BATCH_STATE_DIR}" != "__UNSET__" ]] && BATCH_STATE_DIR="${OVERRIDE_BATCH_STATE_DIR}"
[[ "${OVERRIDE_BATCH_STOP_FILE}" != "__UNSET__" ]] && BATCH_STOP_FILE="${OVERRIDE_BATCH_STOP_FILE}"
[[ "${OVERRIDE_BATCH_LIMIT}" != "__UNSET__" ]] && BATCH_LIMIT="${OVERRIDE_BATCH_LIMIT}"
[[ "${OVERRIDE_BATCH_NODE_BIN}" != "__UNSET__" ]] && BATCH_NODE_BIN="${OVERRIDE_BATCH_NODE_BIN}"
[[ "${OVERRIDE_BATCH_RUNNER_SCRIPT}" != "__UNSET__" ]] && BATCH_RUNNER_SCRIPT="${OVERRIDE_BATCH_RUNNER_SCRIPT}"
[[ "${OVERRIDE_BATCH_SANDBOX}" != "__UNSET__" ]] && BATCH_SANDBOX="${OVERRIDE_BATCH_SANDBOX}"
[[ "${OVERRIDE_BATCH_MODEL}" != "__UNSET__" ]] && BATCH_MODEL="${OVERRIDE_BATCH_MODEL}"
[[ "${OVERRIDE_BATCH_PROMPT_FILE}" != "__UNSET__" ]] && BATCH_PROMPT_FILE="${OVERRIDE_BATCH_PROMPT_FILE}"
[[ "${OVERRIDE_BATCH_EXTRA_ARGS}" != "__UNSET__" ]] && BATCH_EXTRA_ARGS="${OVERRIDE_BATCH_EXTRA_ARGS}"
[[ "${OVERRIDE_BATCH_GIT_PUSH_AFTER_RUN}" != "__UNSET__" ]] && BATCH_GIT_PUSH_AFTER_RUN="${OVERRIDE_BATCH_GIT_PUSH_AFTER_RUN}"
[[ "${OVERRIDE_BATCH_GIT_REMOTE}" != "__UNSET__" ]] && BATCH_GIT_REMOTE="${OVERRIDE_BATCH_GIT_REMOTE}"
[[ "${OVERRIDE_BATCH_GIT_BRANCH}" != "__UNSET__" ]] && BATCH_GIT_BRANCH="${OVERRIDE_BATCH_GIT_BRANCH}"
[[ "${OVERRIDE_BATCH_GIT_AUTHOR_NAME}" != "__UNSET__" ]] && BATCH_GIT_AUTHOR_NAME="${OVERRIDE_BATCH_GIT_AUTHOR_NAME}"
[[ "${OVERRIDE_BATCH_GIT_AUTHOR_EMAIL}" != "__UNSET__" ]] && BATCH_GIT_AUTHOR_EMAIL="${OVERRIDE_BATCH_GIT_AUTHOR_EMAIL}"

: "${BATCH_WORKDIR:=${REPO_ROOT}}"
: "${BATCH_LOG_DIR:=${REPO_ROOT}/logs/codex}"
: "${BATCH_STATE_DIR:=${REPO_ROOT}/tmp/codex}"
: "${BATCH_STOP_FILE:=${REPO_ROOT}/ops/codex/STOP}"
: "${BATCH_LIMIT:=1}"
: "${BATCH_NODE_BIN:=node}"
: "${BATCH_RUNNER_SCRIPT:=${REPO_ROOT}/scripts/run_translation_batch.mjs}"
: "${BATCH_SANDBOX:=workspace-write}"
: "${BATCH_MODEL:=}"
: "${BATCH_PROMPT_FILE:=${REPO_ROOT}/ops/codex/translation-batch-prompt.md}"
: "${BATCH_EXTRA_ARGS:=}"
: "${BATCH_GIT_PUSH_AFTER_RUN:=0}"
: "${BATCH_GIT_REMOTE:=origin}"
: "${BATCH_GIT_BRANCH:=main}"
: "${BATCH_GIT_AUTHOR_NAME:=IT learning}"
: "${BATCH_GIT_AUTHOR_EMAIL:=yo7504@naver.com}"

mkdir -p "${BATCH_LOG_DIR}" "${BATCH_STATE_DIR}"

if [[ -f "${BATCH_STOP_FILE}" ]]; then
  print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] stop file present at ${BATCH_STOP_FILE}; skipping batch run"
  exit 0
fi

if ! command -v "${BATCH_NODE_BIN}" >/dev/null 2>&1; then
  print -u2 -r -- "node runtime was not found on PATH: ${BATCH_NODE_BIN}"
  exit 127
fi

if ! command -v codex >/dev/null 2>&1; then
  print -u2 -r -- "codex CLI was not found on PATH"
  exit 127
fi

if [[ ! -f "${BATCH_RUNNER_SCRIPT}" ]]; then
  print -u2 -r -- "batch runner script not found: ${BATCH_RUNNER_SCRIPT}"
  exit 1
fi

LOCK_DIR="${BATCH_STATE_DIR}/translation-batch.lock"
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] another translation batch run is still active; skipping"
  exit 0
fi

cleanup() {
  rmdir "${LOCK_DIR}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cmd=(
  "${BATCH_NODE_BIN}"
  "${BATCH_RUNNER_SCRIPT}"
  --limit
  "${BATCH_LIMIT}"
  --sandbox
  "${BATCH_SANDBOX}"
  --prompt-file
  "${BATCH_PROMPT_FILE}"
)

if [[ -n "${BATCH_MODEL}" ]]; then
  cmd+=(
    --model
    "${BATCH_MODEL}"
  )
fi

if [[ -n "${BATCH_EXTRA_ARGS}" ]]; then
  extra_args=("${(@z)BATCH_EXTRA_ARGS}")
  cmd+=("${extra_args[@]}")
fi

if [[ "${BATCH_GIT_PUSH_AFTER_RUN}" == "1" ]]; then
  cmd+=(--git-push)
  cmd+=(
    --git-remote
    "${BATCH_GIT_REMOTE}"
    --git-branch
    "${BATCH_GIT_BRANCH}"
    --git-author-name
    "${BATCH_GIT_AUTHOR_NAME}"
    --git-author-email
    "${BATCH_GIT_AUTHOR_EMAIL}"
  )
fi

print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] starting translation batch run"
print -r -- "workdir=${BATCH_WORKDIR}"
print -r -- "limit=${BATCH_LIMIT}"
print -r -- "sandbox=${BATCH_SANDBOX}"
if [[ -n "${BATCH_MODEL}" ]]; then
  print -r -- "model=${BATCH_MODEL}"
fi
if [[ "${BATCH_GIT_PUSH_AFTER_RUN}" == "1" ]]; then
  print -r -- "publish=${BATCH_GIT_REMOTE}/${BATCH_GIT_BRANCH}"
fi

(cd "${BATCH_WORKDIR}" && "${cmd[@]}")
exit_status=$?

print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] translation batch run finished with status ${exit_status}"
exit "${exit_status}"
