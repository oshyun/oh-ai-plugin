# sh-plugins

sh.o 개인 Claude Code 플러그인 카탈로그(마켓플레이스).

이 레포 하나가 **마켓플레이스 + 플러그인**을 함께 담는다.
원격(GitHub/사내 GHE)에 push해 두면 어느 머신에서든 끌어다 쓴다.

## 구성

```
.claude-plugin/marketplace.json     ← 카탈로그 (name: sh-plugins)
plugins/
  sh-dev-kit/                        ← 확장형 개인 플러그인
    .claude-plugin/plugin.json
    skills/
      dev-style/SKILL.md             ← 개발 습관·코딩 패턴·git 워크플로우
```

플러그인 이름이 스킬 네임스페이스가 된다 → 스킬 호출: `/sh-dev-kit:dev-style`.

## 설치 (각 머신에서 한 번)

원격에 push한 뒤:

```
/plugin marketplace add <owner>/claude-plugins      # GitHub 단축형
# 또는
/plugin marketplace add https://<host>/<owner>/claude-plugins.git
/plugin install sh-dev-kit@sh-plugins
```

업데이트(새 커밋 push 후):

```
/plugin marketplace update sh-plugins
/plugin reload-plugins
```

> `plugin.json`에 `version`을 두지 않아 **커밋 SHA가 버전**이다.
> 즉 push할 때마다 새 버전이 되고, 위 두 명령이면 최신본이 반영된다.

## 로컬에서 테스트 (push 전)

```
/plugin marketplace add /home1/irteam/users/sh/repos/claude-plugins
/plugin install sh-dev-kit@sh-plugins
/plugin reload-plugins
```

## 검증

```
claude plugin validate ./plugins/sh-dev-kit
```

## 확장 — 스킬/커맨드/에이전트 추가

`sh-dev-kit` 플러그인은 확장형이다. 새 컴포넌트는 플러그인 루트에 추가한다.

- 스킬: `plugins/sh-dev-kit/skills/<이름>/SKILL.md`
- 커맨드: `plugins/sh-dev-kit/commands/<이름>.md`
- 에이전트: `plugins/sh-dev-kit/agents/<이름>.md`
- 훅: `plugins/sh-dev-kit/hooks/hooks.json`

별도 성격의 묶음이면 `plugins/`에 새 플러그인 디렉토리를 만들고 `marketplace.json`의 `plugins` 배열에 한 줄 추가한다.
