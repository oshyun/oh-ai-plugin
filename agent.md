# oh-plugin 개발 가이드

## 버전 관리

플러그인 수정 후 반드시 버전을 bump한다.

```bash
bash scripts/bump-version.sh
```

- `.claude-plugin/plugin.json`의 `version` 필드를 현재 시각(`YYYY.MM.DD.HH.mm.ss`)으로 갱신한다.
- **수동으로 version 필드를 편집하지 않는다.** 항상 스크립트를 사용한다.
- bump 후 `plugin.json`을 같은 커밋에 포함한다.

> 버전이 바뀌지 않으면 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.
