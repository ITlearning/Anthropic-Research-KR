# Translation Batch Launchd Setup

Anthropic Research 번역 배치를 이 Mac에서 백그라운드로 돌릴 때 쓰는 명령 모음.

## 재설치 / 다시 올리기

```bash
cp /Users/tabber/Anthropic-Research-KR/ops/launchd/io.tabber.anthropic-research-kr.translation-batch.plist ~/Library/LaunchAgents/
launchctl bootout "gui/$(id -u)" ~/Library/LaunchAgents/io.tabber.anthropic-research-kr.translation-batch.plist 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/io.tabber.anthropic-research-kr.translation-batch.plist
launchctl enable "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch"
launchctl kickstart -k "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch"
```

## 지금 바로 한 번 실행

```bash
launchctl kickstart -k "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch"
```

## 상태 확인

```bash
launchctl print "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch" | rg "state =|runs =|last exit code =|program ="
```

## 로그 보기

```bash
tail -f /Users/tabber/Anthropic-Research-KR/logs/codex/translation-batch.stdout.log
tail -f /Users/tabber/Anthropic-Research-KR/logs/codex/translation-batch.stderr.log
```

## 자동 게시 설정

`/Users/tabber/Anthropic-Research-KR/ops/codex/translation-batch.env` 에서 아래 값이 켜져 있으면
번역 성공 후 자동으로 커밋하고 `origin/main` 으로 푸시한다.

```bash
BATCH_GIT_PUSH_AFTER_RUN="1"
BATCH_GIT_REMOTE="origin"
BATCH_GIT_BRANCH="main"
BATCH_GIT_AUTHOR_NAME="IT learning"
BATCH_GIT_AUTHOR_EMAIL="yo7504@naver.com"
```

## 일시 정지

```bash
touch /Users/tabber/Anthropic-Research-KR/ops/codex/STOP
```

## 재개

```bash
rm -f /Users/tabber/Anthropic-Research-KR/ops/codex/STOP
launchctl kickstart -k "gui/$(id -u)/io.tabber.anthropic-research-kr.translation-batch"
```
