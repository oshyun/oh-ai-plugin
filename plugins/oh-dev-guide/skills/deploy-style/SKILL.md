---
name: deploy-style
description: 개인 git 워크플로우·커밋·머지·배포 습관. git 작업·커밋·브랜치·push·머지를 할 때 적용한다. Personal git workflow, commit, merge, and deploy habits.
---

# Deploy Style

## E-0. git 환경이면 worktree 기반으로 작업한다 (핵심)

git이 있는 모든 환경에서 **편집은 worktree에서** 한다. main tree는 읽기·조사·머지 전용.
이유: 편집 중 dirty 상태가 다른 작업/머지를 막고, 작업이 격리돼야 깨끗한 브랜치 경계가 남는다.

절차:

1. **첫 편집 전에 worktree부터.** 반드시 `git fetch origin`으로 base를 최신화한 뒤 만든다.
   - `git fetch origin && git worktree add --no-track -b work/<주제> <경로> origin/master`
2. **`--no-track` 필수.** upstream이 `origin/master`로 잡히면 GUI의 pull/sync가 작업 커밋을 기본 브랜치로 직행 push할 수 있다(실제 사고 사례).
3. **모든 Read/Edit는 worktree 경로에서.** 커밋은 `git add <개별 파일>`로 **내 파일만** — `git add -A`·`git add src/` 금지(다른 미커밋 작업이 휩쓸려 들어감).
4. **rebase까지만 worktree에서.** 머지 단계(`checkout master`·`merge`·`push`·`worktree remove`)는 **main tree에서** 실행한다.
   - worktree 안에서 `git checkout master`를 하면 `'master' is already used by worktree`로 실패하고, 체인이 끊기면 작업 브랜치가 원격에 잘못 push된다.
5. **작업 디렉토리가 shallow면** 머지가 unrelated histories로 막힐 수 있다. `git fetch --unshallow origin`으로 복구.

## E-1. 커밋 · 머지 · push

- **작업 완료 후 자동 커밋 + push.** 논리적 단위가 끝나면 묻지 않고 커밋하고 push까지 한다.
- **연속 리팩토링은 push를 마지막에 한 번.** 여러 독립 커밋이 쌓이는 작업은 중간 push 생략, 마지막에 한 번. (CI 중복 빌드 방지)
  - 독립 단일 작업은 완료 즉시 push.
- **커밋 메시지에 작성자 정보(`Co-Authored-By`) 미포함.** 기본값을 두지 말고 작업 내용을 한 줄로 적는다.
- **기본 브랜치에 직접 커밋하지 않는다.** 작업은 작업 브랜치(`work/<주제>`)에서.
- **준선형(semi-linear) 머지.** `fetch → rebase origin/master`로 ff 가능 상태를 만든 뒤, 일부러 `--no-ff` 머지로 작업 경계를 남긴다.
  - 머지 직전 `git fetch`로 base 이후 다른 push(다른 세션 머지·CI bump 등)가 끼었는지 확인하고, 가라앉으면 그 위로 rebase 후 진행.
  - push가 거부되면(race) fetch→rebase→merge를 멈추지 말고 재시도해 원자적으로 반영한다. 충돌 때만 멈추고 알린다.
- **코드 변경 작업을 마치면 simplify/cleanup 패스를 자동 실행** (조사성·질의성 작업엔 미적용).
