# oh-plugin

oshyun 개인 AI 에이전트 플러그인.
Claude Code, Cursor 등 superpowers 플러그인 시스템을 지원하는 에이전트 도구에 공통 적용된다.

이 레포 하나가 **마켓플레이스 + 플러그인**을 함께 담는다.
원격(GitHub)에 push해 두면 어느 머신에서든 끌어다 쓴다.

## 구성

```
.claude-plugin/marketplace.json     ← 카탈로그 (name: oshyun)
plugins/
  oh-plugin/                        ← 개인 플러그인
    .claude-plugin/plugin.json      ← version: YYYY.MM.DD.HH.mm.ss
    skills/
      oh-coding-style/SKILL.md      ← 코드 작성 패턴·리뷰 기준
      oh-workflow-style/SKILL.md    ← git 워크플로우·에이전트 응답 스타일
      oh-reload/SKILL.md            ← 세션 내 스킬 즉시 재로드
scripts/
  bump-version.sh                   ← 버전 현재 시각으로 업데이트
```

플러그인 이름이 스킬 네임스페이스가 된다 → 스킬 호출 예: `/oh-coding-style`

## 설치 (각 머신에서 한 번)

```
/plugin marketplace add oshyun/oh-plugin
/plugin install oh-plugin@oshyun
/reload-plugins
```

## 업데이트 (새 커밋 push 후)

```bash
bash scripts/bump-version.sh   # push 전 버전 bump
# push 후:
/plugin marketplace update oshyun
/reload-plugins
```

> `plugin.json`의 `version` 필드가 캐시 디렉토리 이름이 된다.
> 버전이 바뀌지 않으면 `marketplace update`가 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

## 이미 열린 세션에서 즉시 반영

```
/plugin marketplace update oshyun
/reload-plugins
/oh-reload
```

## 로컬 테스트 (push 전)

```
/plugin marketplace add /path/to/oh-plugin
/plugin install oh-plugin@oshyun
/reload-plugins
```

## 확장 — 스킬/에이전트/훅 추가

새 컴포넌트는 `plugins/oh-plugin/` 하위에 추가한다.

- 스킬: `plugins/oh-plugin/skills/<이름>/SKILL.md`
- 에이전트: `plugins/oh-plugin/agents/<이름>.md`
- 훅: `plugins/oh-plugin/hooks/hooks.json`
