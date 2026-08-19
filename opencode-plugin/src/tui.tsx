/** @jsxImportSource @opentui/solid */
import { TextAttributes } from "@opentui/core";
import type { TuiPluginModule } from "@opencode-ai/plugin/tui";
import { createRoot, createSignal } from "solid-js";
import { readState, writeState } from "./state";

const tui: TuiPluginModule["tui"] = async (api) => {
  // on/off 상태를 Solid 신호로 관리한다. sidebar_footer 배지가 이 신호를 구독하므로
  // 토글 시 신호가 갱신되면 Solid가 배지를 즉시 재렌더한다. 파일만 갱신하고 신호를
  // 갱신하지 않으면 Solid가 변화를 감지하지 못해 배지가 이전 상태를 유지한다.
  const [enabled, setEnabled] = createRoot(() =>
    createSignal(readState().enabled),
  );

  // on/off 토글 명령. 상태 파일과 Solid 신호를 함께 갱신하고 토스트로 피드백.
  // server는 매 시스템 프롬프트 구성 시점에 상태를 읽어 즉시 반영한다.
  api.command?.register(() => [
    {
      title: "oh-plugin: 규칙 주입 켜기/끄기 토글",
      value: "oh-plugin.toggle",
      suggested: true,
      onSelect: () => {
        const next = !readState().enabled;
        writeState({ enabled: next });
        setEnabled(next);
        api.ui.toast({
          variant: next ? "success" : "warning",
          message: next
            ? "oh-plugin 규칙 주입 켬 — 다음 시스템 프롬프트 구성부터 적용됩니다"
            : "oh-plugin 규칙 주입 끔 — 다음 시스템 프롬프트 구성부터 미적용됩니다",
        });
      },
    },
  ]);

  // sidebar_footer 슬롯에 현재 on/off 상태 배지를 렌더링한다.
  // enabled 신호를 구독하므로 토글 즉시 반영된다. 슬롯 렌더러는 raw string이 아닌
  // JSX(<text>)를 반환해야 한다. raw string을 반환하면 OpenTUI가 크래시한다.
  api.slots.register({
    slots: {
      sidebar_footer: () =>
        enabled() ? (
          <text attributes={TextAttributes.BOLD}>[oh-plugin ON]</text>
        ) : (
          <text attributes={TextAttributes.DIM}>[oh-plugin OFF]</text>
        ),
    },
  });
};

export default { id: "oh-plugin", tui } satisfies TuiPluginModule;
