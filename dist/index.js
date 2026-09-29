// src/index.ts
import { readFileSync as readFileSync2 } from "fs";
import { fileURLToPath } from "url";

// src/state.ts
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
var DEFAULT_STATE = { enabled: true };
function configRoot() {
  return process.env.XDG_CONFIG_HOME ? join(process.env.XDG_CONFIG_HOME, "opencode") : join(homedir(), ".config", "opencode");
}
var STATE_FILE = join(configRoot(), "oh-ai-plugin.json");
function readState() {
  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && typeof parsed.enabled === "boolean") {
      return { enabled: parsed.enabled };
    }
  } catch {
  }
  return { ...DEFAULT_STATE };
}

// src/index.ts
var RULES_FILE = fileURLToPath(new URL("./AGENTS.md", import.meta.url));
var RULES_HEADER = "Coding & Workflow Style";
var server = async () => {
  const rules = readFileSync2(RULES_FILE, "utf8");
  return {
    "experimental.chat.system.transform": async (_input, output) => {
      if (!readState().enabled) {
        return;
      }
      if (output.system.some((entry) => entry.includes(RULES_HEADER))) {
        return;
      }
      output.system.push(rules);
    }
  };
};
var plugin = { id: "oh-ai-plugin", server };
var index_default = plugin;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map