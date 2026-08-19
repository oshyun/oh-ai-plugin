/** @jsxImportSource @opentui/solid */
import { TextAttributes } from "@opentui/core";
import type { TuiPluginModule } from "@opencode-ai/plugin/tui";
import { readState, writeState } from "./state";

const tui: TuiPluginModule["tui"] = async (api) => {
  // on/off 토글 명령. 상태 파일에 enabled를 반전 저장하고 토스트로 피드백.
  // server는 매 시스템 프롬프트 구성 시점에 상태를 읽어 즉시 반영한다.
  api.command?.register(() => [
    {
      title: "oh-plugin: 규칙 주입 켜기/끄기 토글",
      value: "oh-plugin.toggle",
      suggested: true,
      onSelect: () => {
        const enabled = !readState().enabled;
        writeState({ enabled });
        api.ui.toast({
          variant: enabled ? "success" : "warning",
          message: enabled
            ? "oh-plugin 규칙 주입 켬 — 다음 시스템 프롬프트 구성부터 적용됩니다"
            : "oh-plugin 규칙 주입 끔 — 다음 시스템 프롬프트 구성부터 미적용됩니다",
        });
      },
    },
  ]);

  // sidebar_footer 슬롯에 현재 on/off 상태 배지를 렌더링한다.
  // 슬롯 렌더러는 raw string이 아닌 JSX(<text>)를 반환해야 한다.
  // raw string을 반환하면 OpenTUI가 "Orphan text error"로 크래시한다.
  api.slots.register({
    slots: {
      sidebar_footer: () => {
        const { enabled } = readState();
        return enabled ? (
          <text attributes={TextAttributes.BOLD}>[oh-plugin ON]</text>
        ) : (
          <text attributes={TextAttributes.DIM}>[oh-plugin OFF]</text>
        );
      },
    },
  });
};

export default { id: "oh-plugin", tui } satisfies TuiPluginModule;
