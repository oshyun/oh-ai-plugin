---
name: ohai-workflow-style
description: >-
  git 작업(브랜치·커밋·머지·push)·자율 작업·첫 코드 편집 전 반드시 로드한다. worktree, rebase, 머지 순서, push 타이밍 규칙 포함.
---

# Workflow Style

> **CRITICAL — 이 규칙들은 프로젝트 환경과 작업 규모에 맞게 유연하게 적용한다.**
>
> | MUST | NEVER |
> |------|-------|
> | 첫 편집 전 `git rev-parse`로 git 여부 **직접** 검증 | 환경 헤더 `Is a git repository` 값 신뢰 금지 |
> | 유의미한 작업은 **반드시** worktree 생성 후 편집 | (사소한 수정 제외) main tree에서 직접 편집 금지 |
> | 변경 후 빌드·테스트 전 diff 검토 | 확인 없이 변경사항을 머지하거나 푸시 금지 |
> | 환경에 맞는 머지/PR 전략 선택 | 프로젝트 룰을 무시한 강제 머지 금지 |

**이런 생각이 들면 멈춰라 — 합리화다:**

| 이 생각 | 사실 |
|--------|------|
| "한 줄 수정이라 worktree 없이 해도 되겠다" | 단순 오타, README 수정, 1회성 스크립트 등 사소한(Trivial) 수정은 main tree에서 직접 작업할 수 있다. 그 외 유의미한 기능 변경은 worktree를 쓴다. |
| "환경 헤더가 git 아니라고 하니까 그냥 편집해도 되겠다" | 헤더는 실제로 틀린 사례가 있다. 반드시 직접 검증한다. |
| "이건 간단한 수정이라 diff 검토 생략해도 되겠다" | 오타·1-2줄 이하 수정만 생략 가능하다. 확신이 없으면 실행한다. |
| "diff 검토는 나중에 해도 되겠다" | 변경 완료 직후, 머지/PR 직전에는 반드시 검토한다. |
| "사용자가 빨리 하라고 했으니 승인 생략해도 되겠다" | 직접 머지 환경인 경우, 빠른 실행과 승인 생략은 별개다. |

---

## A. git 작업: worktree 기반 (핵심)

git이 있는 모든 환경에서 유의미한 편집은 **worktree에서** 한다. main tree는 읽기·조사·머지 전용.
(단, 오타 수정, 문서 단순 업데이트 등 충돌 위험이 없고 범위가 좁은 '사소한 수정'은 예외로 main tree에서 직접 편집할 수 있다.)
이유: 편집 중 dirty 상태가 다른 작업/머지를 막고, 작업이 격리돼야 깨끗한 브랜치 경계가 남는다.

절차:

0. **첫 편집 전, git 여부를 직접 검증한다 — 환경 헤더를 신뢰하지 않는다.**
   - 세션 환경 메타데이터의 `Is a git repository` 값은 **틀릴 수 있다**(실제 오보 사례 있음).
     이 검증이 그 헤더 값을 **오버라이드**한다.
   - 작업 디렉토리에서 `git rev-parse --is-inside-work-tree 2>/dev/null`을 실행한다.
   - `true`가 출력되면 — 헤더가 `false`라고 했더라도 — 무조건 아래 worktree 절차를 탄다.
   - 그 외(오류 포함)이면 git 레포가 아님으로 판단하고 worktree 절차는 생략한다.

1. **첫 편집 전에 worktree부터.** 반드시 `git fetch origin`으로 base를 최신화한 뒤 만든다.
   - `git fetch origin && git worktree add --no-track -b work/<주제> ../<레포명>-wt-<주제> origin/<기본브랜치>`
   - 경로는 **레포 한 단계 위**에 `../<레포명>-wt-<주제>` 형식으로 만든다. (예: `../fdc-bot-wt-auth-fix`)
   - **기본 브랜치명은 레포마다 다르다.** `master` 또는 `main` 중 하나이므로 작업 전 `git remote show origin | grep 'HEAD branch'`로 확인한다.
2. **`--no-track` 필수.** upstream이 `origin/master`로 잡히면 GUI의 pull/sync가 작업 커밋을 기본 브랜치로 직행 push할 수 있다(실제 사고 사례).
3. **모든 Read/Edit는 worktree 경로에서.** 커밋은 `git add <개별 파일>`로 **내 파일만** — `git add -A`·`git add src/` 금지(다른 미커밋 작업이 휩쓸려 들어감).
4. **rebase까지만 worktree에서.** 머지 단계(`checkout <기본브랜치>`·`merge`·`push`·`worktree remove`)는 **main tree에서** 실행한다.
   - worktree 안에서 기본 브랜치를 checkout하면 `'master(main)' is already used by worktree`로 실패하고, 체인이 끊기면 작업 브랜치가 원격에 잘못 push된다.
5. **작업 디렉토리가 shallow면** 머지가 unrelated histories로 막힐 수 있다. `git fetch --unshallow origin`으로 복구.
6. **원격(`origin`)이 없는 로컬 단독 레포**는 fetch/push/`origin/<base>` 단계를 전부 생략한다.
   - `git remote`가 비어 있으면 이 케이스에 해당한다.
   - worktree base를 원격 대신 **로컬 기본 브랜치**로 잡는다:
     `git worktree add --no-track -b work/<주제> ../<레포명>-wt-<주제> <기본브랜치>`
   - 머지는 로컬에서 `--no-ff`만 하고 push는 없다.
   - "편집은 worktree, main은 머지 전용" 원칙은 원격 유무와 무관하게 동일하게 지킨다.
7. **서브 worktree(중첩) 패턴.** 작업용 상위 worktree가 이미 특정 브랜치(예: `stage`)를 checkout 중일 때,
   그 위에 하위 worktree로 작업 브랜치를 얹는 구조.
   - 구조 예:
     ```
     my-repo            (master 브랜치)
     my-repo-wt-stage   (stage 브랜치 checkout — 상시 작업 상위 worktree)
     my-repo-wt-stage-task1 (stage 기반 작업 브랜치 — 실제 편집 장소)
     ```
   - 하위 worktree 생성: base는 상위 브랜치(`stage`)다.
     `git worktree add --no-track -b work/<주제> ../<레포명>-wt-<상위>-<주제> <상위브랜치>`
     (예: `git worktree add --no-track -b work/task1 ../my-repo-wt-stage-task1 stage`)
   - Read/Edit·rebase·커밋은 하위 worktree에서 기존 규칙(개별 파일 add, `--no-track`)을 그대로 따른다.
   - 머지 대상이 **상위 브랜치(`stage`)** 일 때: git은 한 브랜치를 한 worktree에서만 checkout하므로,
     main tree에서 `stage`를 checkout하려다 `'stage' is already used by worktree`로 막힌다.
     따라서 **`stage`를 checkout 중인 상위 worktree(`my-repo-wt-stage`)에서 `--no-ff` 머지**한다.
   - 상위 worktree의 브랜치로 머지 후, 그 결과를 기본 브랜치(main/master)로 올리는 것은 별도 관리한다.

## B. 커밋 · PR · 머지 · push

- **작업 완료 후 자동 커밋.** 논리적 단위가 끝나면 묻지 않고 커밋한다.
- **연속 리팩토링은 push를 마지막에 한 번.** 여러 독립 커밋이 쌓이는 작업은 중간 push 생략, 마지막에 한 번. (CI 중복 빌드 방지)
  - 독립 단일 작업은 완료 즉시 push.
- **커밋 메시지에 작성자 정보(`Co-Authored-By`) 미포함.** 기본값을 두지 말고 작업 내용을 한 줄로 적는다.
- **기본 브랜치에 직접 커밋하지 않는다.** 작업은 작업 브랜치(`work/<주제>`)에서.
- **작업 중 중간 rebase.** 작업이 길어지면 주기적으로 `git fetch origin`으로 기본 브랜치 업데이트를 확인한다.
  - 새 커밋이 쌓였으면 `git rebase origin/<기본브랜치>`로 미리 올려 충돌을 조기에 해소한다.
- **머지/PR 전 필수 점검 순서:** 
  1. rebase 또는 base 업데이트
  2. **자체 diff 리뷰 (Simplify):** 변경사항을 재사용성(Reuse), 단순성(Simplification), 효율성(Efficiency), 아키텍처 부합성(Altitude) 관점에서 자체 검토하고 필요시 수정한다. (사소한 수정은 생략 가능)
  3. **코드 품질 및 엣지 케이스 검토 (Code Review):** `ohai-coding-style`(명명 규칙, SSOT 등) 준수 여부와 잠재적 버그, 엣지 케이스를 확인하고 수정한다.
  4. 커밋 및 빌드·테스트 통과 확인
- **프로젝트 환경에 따른 머지/PR 전략 분기:**
  - **오픈소스 / 팀 프로젝트 / PR 필수 환경 (권장):**
    1. 작업 브랜치(`work/<주제>`)를 원격에 `push`한다.
    2. GitHub CLI(`gh`), GitLab CLI(`glab`) 등을 활용해 PR(또는 MR)을 생성하거나, 사용자가 직접 PR을 열 수 있도록 가이드 및 URL을 제공한다.
    3. 절대 `main`에 임의로 직접 머지/푸시하지 않는다.
  - **직접 푸시가 허용된 환경 (개인 레포 등):**
    1. 변경 요약(무엇을 바꿨는지)을 사용자에게 보여주고 머지 승인을 명시적으로 받는다.
    2. 승인 후 main tree에서 `--no-ff` merge → push 진행.
    3. push 거부(race) 시 `git fetch && git rebase` 후 재시도한다.
- **작업 브랜치 정리:** PR 머지 또는 로컬 머지가 완전히 완료된 것을 확인한 후 worktree와 로컬 브랜치를 정리(cleanup)한다.
- **커밋 전 사용자 가이드 영향 확인.** 기능·동작·구조가 바뀌면 README 등 사용자 가이드도 **같은 커밋**에 갱신한다.
  - API 변경 시 API 문서도 함께 업데이트.
- **prod 서비스 교체는 에이전트가 직접 실행하지 않는다.** 코드 변경·커밋·push까지 담당하고, 실제 서비스 교체(배포)는 사용자에게 제안에 그친다.

## C. 에이전트 응답 스타일

- **자율(오토) 모드 전 예상 소요 시간 제시.** 자율 실행 직전 ETA를 먼저 보여준다.
- **git 단계 완료 시 ASCII 박스 시그니처.** worktree 생성·rebase·diff 검토(또는 simplify)·commit·빌드 통과·머지·dev 배포 완료 시 아래 형식의 박스를 출력한다.
  - **반드시 마크다운 코드 블록(\`\`\`text ... \`\`\`)으로 감싸서 출력한다.** (그렇지 않으면 마크다운 렌더러가 공백과 줄바꿈을 무시하여 UI가 깨집니다.)
  - 내용은 **ASCII만** — 한글·이모지·`→`(더블폭) 금지. 화살표는 `->`. 모든 줄을 같은 폭으로 패딩.
  - **prod 배포는 사용자가 직접** 실행하므로 박스 대상이 아니다. git 단계(worktree·머지·dev 배포)만.
  - 라벨은 **대문자**로 시작하고 콜론(`:`)으로 정렬한다.
  - **세로선 없이 위아래 가로선만** 사용한다. 가로선은 `═` 60자로 고정.

  머지 완료:
  ```
  ════════════════════════════════════════════════════════════
    Merged to <base-branch> · Pushed
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Merged  : work/<topic> -> <base-branch>
    Commit  : <sha7>  "<commit message>"
    Changed : <N> files  +<ins> -<del>
  ════════════════════════════════════════════════════════════
  ```

  cleanup 완료 (머지 박스 직후 출력):
  ```
  ════════════════════════════════════════════════════════════
    Cleanup done
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Worktree: ../<repo>-wt-<topic> removed
    Branch  : work/<topic> deleted (local + remote)
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

  rebase 완료:
  ```
  ════════════════════════════════════════════════════════════
    Rebased
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Branch  : work/<topic>
    Base    : origin/<base-branch> @ <sha7>
  ════════════════════════════════════════════════════════════
  ```

  diff 검토(또는 simplify) 완료:
  ```
  ════════════════════════════════════════════════════════════
    Diff review (or Simplify) done
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Branch  : work/<topic>
    Changed : <N> files  +<ins> -<del>
  ════════════════════════════════════════════════════════════
  ```

  commit 완료:
  ```
  ════════════════════════════════════════════════════════════
    Committed
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Branch  : work/<topic>
    Commit  : <sha7>  "<commit message>"
    Changed : <N> files  +<ins> -<del>
  ════════════════════════════════════════════════════════════
  ```

  빌드·테스트 통과:
  ```
  ════════════════════════════════════════════════════════════
    Build passed
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Branch  : work/<topic>
  ════════════════════════════════════════════════════════════
  ```

  push race 재시도 후 완료:
  ```
  ════════════════════════════════════════════════════════════
    Push retried · Pushed
  ────────────────────────────────────────────────────────────
    Repo    : <owner>/<repo>
    Merged  : work/<topic> -> <base-branch>
    Commit  : <sha7>  "<commit message>"
    Retries : <N>
  ════════════════════════════════════════════════════════════
  ```

- **한국어로 응답한다.** 기술 용어·코드 식별자는 원형 유지.
- **불확실한 사실은 메모리/추측이 아니라 코드·문서로 검증**한 뒤 말한다.
- **설계 결정의 이유를 먼저 설명한다.** 파일명·디렉토리명·구조 등 의도가 있는 선택은 "왜 그렇게 했는지"를 사용자가 묻기 전에 명확히 밝힌다. "이유 없다"고 단정하기 전에 다시 생각한다.
- **글·문서는 줄을 짧게.** 한 불릿·문장에 몰아넣지 말고 짧게 끊어 별도 줄로 분리한다.
  - 성격이 다른 내용(동기 vs 동작)은 줄을 나눈다.
