/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui";
import { readState, writeState } from "./state.js";

const tui: TuiPluginModule["tui"] = async (api) => {
  // on/off 토글 명령. 상태 파일에 enabled를 반전 저장하고 토스트로 피드백.
  // 다음 세션부터 server가 상태 파일을 읽어 규칙 주입 여부를 결정한다.
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
            ? "oh-plugin 규칙 주입 켬 — 다음 세션부터 시스템 프롬프트에 적용됩니다"
            : "oh-plugin 규칙 주입 끔 — 다음 세션부터 시스템 프롬프트에 미적용됩니다",
        });
      },
    },
  ]);

  // sidebar_footer 슬롯에 현재 on/off 상태 배지를 렌더링한다.
  api.slots.register({
    slots: {
      sidebar_footer: () => {
        const { enabled } = readState();
        return enabled ? "[oh-plugin ON]" : "[oh-plugin OFF]";
      },
    },
  });
};

export default { id: "oh-plugin", tui } satisfies TuiPluginModule;
