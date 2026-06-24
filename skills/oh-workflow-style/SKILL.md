---
name: oh-workflow-style
description: >-
  git 작업(브랜치 생성·커밋·머지·push·배포)이나 에이전트가 자율적으로 작업을 수행할 때 반드시 적용한다.
  worktree 생성, 커밋 메시지 작성, rebase·머지 순서 결정, push 타이밍 판단, 작업 완료 후 응답 형식 결정 등 모든 git·배포 흐름에서 로드한다.
---

# Workflow Style

## A. git 작업: worktree 기반 (핵심)

git이 있는 모든 환경에서 **편집은 worktree에서** 한다. main tree는 읽기·조사·머지 전용.
이유: 편집 중 dirty 상태가 다른 작업/머지를 막고, 작업이 격리돼야 깨끗한 브랜치 경계가 남는다.

절차:

1. **첫 편집 전에 worktree부터.** 반드시 `git fetch origin`으로 base를 최신화한 뒤 만든다.
   - `git fetch origin && git worktree add --no-track -b work/<주제> ../<레포명>-wt-<주제> origin/<기본브랜치>`
   - 경로는 **레포 한 단계 위**에 `../<레포명>-wt-<주제>` 형식으로 만든다. (예: `../fdc-bot-wt-auth-fix`)
   - **기본 브랜치명은 레포마다 다르다.** `master` 또는 `main` 중 하나이므로 작업 전 `git remote show origin | grep 'HEAD branch'`로 확인한다.
2. **`--no-track` 필수.** upstream이 `origin/master`로 잡히면 GUI의 pull/sync가 작업 커밋을 기본 브랜치로 직행 push할 수 있다(실제 사고 사례).
3. **모든 Read/Edit는 worktree 경로에서.** 커밋은 `git add <개별 파일>`로 **내 파일만** — `git add -A`·`git add src/` 금지(다른 미커밋 작업이 휩쓸려 들어감).
4. **rebase까지만 worktree에서.** 머지 단계(`checkout <기본브랜치>`·`merge`·`push`·`worktree remove`)는 **main tree에서** 실행한다.
   - worktree 안에서 기본 브랜치를 checkout하면 `'master(main)' is already used by worktree`로 실패하고, 체인이 끊기면 작업 브랜치가 원격에 잘못 push된다.
5. **작업 디렉토리가 shallow면** 머지가 unrelated histories로 막힐 수 있다. `git fetch --unshallow origin`으로 복구.

## B. 커밋 · 머지 · push

- **작업 완료 후 자동 커밋 + push.** 논리적 단위가 끝나면 묻지 않고 커밋하고 push까지 한다.
- **연속 리팩토링은 push를 마지막에 한 번.** 여러 독립 커밋이 쌓이는 작업은 중간 push 생략, 마지막에 한 번. (CI 중복 빌드 방지)
  - 독립 단일 작업은 완료 즉시 push.
- **커밋 메시지에 작성자 정보(`Co-Authored-By`) 미포함.** 기본값을 두지 말고 작업 내용을 한 줄로 적는다.
- **기본 브랜치에 직접 커밋하지 않는다.** 작업은 작업 브랜치(`work/<주제>`)에서.
- **작업 중 중간 rebase.** 작업이 길어지면 주기적으로 `git fetch origin`으로 기본 브랜치 업데이트를 확인한다.
  - 새 커밋이 쌓였으면 `git rebase origin/<기본브랜치>`로 미리 올려 충돌을 조기에 해소한다.
  - 충돌이 크면 사용자에게 알리고 함께 해결한다.
- **머지 전 순서: rebase → simplify → 사용자 승인 → merge.** worktree 커밋 완료 후 아래 순서를 반드시 지킨다.
  1. worktree에서 `git fetch origin && git rebase origin/<기본브랜치>` — 최신 기본 브랜치 위로 올린다. (충돌 시에만 멈추고 알린다.)
  2. worktree에서 simplify/cleanup 패스를 실행한다.
  3. 변경 요약(무엇을 바꿨는지)을 사용자에게 보여주고 머지 승인을 명시적으로 받는다.
  4. 승인 후 main tree에서 `--no-ff` merge → push → worktree remove 진행.
- **준선형(semi-linear) 머지.** `fetch → rebase origin/<기본브랜치>`로 ff 가능 상태를 만든 뒤, 일부러 `--no-ff` 머지로 작업 경계를 남긴다.
  - 머지 직전 `git fetch`로 base 이후 다른 push(다른 세션 머지·CI bump 등)가 끼었는지 확인하고, 가라앉으면 그 위로 rebase 후 진행.
  - push가 거부되면(race) fetch→rebase→merge를 멈추지 말고 재시도해 원자적으로 반영한다. 충돌 때만 멈추고 알린다.
- **커밋 전 사용자 가이드 영향 확인.** 기능·동작·구조가 바뀌면 README 등 사용자 가이드도 **같은 커밋**에 갱신한다.
  - API 변경 시 API 문서도 함께 업데이트.
- **prod 서비스 교체는 에이전트가 직접 실행하지 않는다.** 코드 변경·커밋·push까지 담당하고, 실제 서비스 교체(배포)는 사용자에게 제안에 그친다.

## C. 에이전트 응답 스타일

- **자율(오토) 모드 전 예상 소요 시간 제시.** 자율 실행 직전 ETA를 먼저 보여준다.
- **git 단계 완료 시 ASCII 박스 시그니처.** worktree 생성·머지 완료·dev 배포 완료 시 아래 형식의 박스를 출력한다.
  - 내용은 **ASCII만** — 한글·이모지·`→`(더블폭) 금지. 화살표는 `->`. 모든 줄을 같은 폭으로 패딩.
  - **prod 배포는 사용자가 직접** 실행하므로 박스 대상이 아니다. git 단계(worktree·머지·dev 배포)만.
  - 라벨은 **대문자**로 시작하고 콜론(`:`)으로 정렬한다.
  - **세로선 없이 위아래 가로선만** 사용한다. 가로선은 `═` 60자로 고정.

  머지 완료:
  ```
  ════════════════════════════════════════════════════════════
    Merged to <base-branch>
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Merged  : work/<topic> -> <base-branch>
    Commit  : <sha7>  "<commit message>"
    Changed : <N> files  +<ins> -<del>
    Cleanup : ../<repo>-wt-<topic> removed · branch deleted
  ════════════════════════════════════════════════════════════
  ```

  worktree 생성:
  ```
  ════════════════════════════════════════════════════════════
    Worktree created
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Worktree: ../<repo>-wt-<topic>
    Branch  : work/<topic>
    Base    : origin/<base-branch> @ <sha7>
  ════════════════════════════════════════════════════════════
  ```

- **스킬 로드 시 스킬 전문을 응답에 출력하지 않는다.**
- **한국어로 응답한다.** 기술 용어·코드 식별자는 원형 유지.
- **불확실한 사실은 메모리/추측이 아니라 코드·문서로 검증**한 뒤 말한다.
- **설계 결정의 이유를 먼저 설명한다.** 파일명·디렉토리명·구조 등 의도가 있는 선택은 "왜 그렇게 했는지"를 사용자가 묻기 전에 명확히 밝힌다. "이유 없다"고 단정하기 전에 다시 생각한다.
