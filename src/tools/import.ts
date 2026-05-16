/* ──────────────────────────────────────────────
   数据导入工具 (Import)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

function parseJsonInput(json: string) {
  try {
    return { ok: true as const, data: JSON.parse(json) as unknown };
  } catch {
    return { ok: false as const };
  }
}

export function registerImportTools(server: McpServer) {
  // ── Halo 导入预览 ──
  server.tool(
    "preview_halo_import",
    "预览 Halo 1.x / 2.x 导出 JSON 可导入的文章、标签和分类数量，不写入数据。",
    {
      haloJson: z.string().describe("Halo 导出的完整 JSON 字符串"),
    },
    async ({ haloJson }) => {
      const parsed = parseJsonInput(haloJson);
      if (!parsed.ok) {
        return {
          content: [{ type: "text" as const, text: "❌ Halo JSON 格式无效，请检查后重试。" }],
          isError: true,
        };
      }

      const result = await apiRequest("/api/admin/import/halo/preview", {
        method: "POST",
        body: parsed.data,
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ── Halo 正式导入 ──
  server.tool(
    "import_halo_data",
    "⚠️ 导入 Halo 1.x / 2.x 导出数据。overwrite 会覆盖现有数据，必须显式确认。",
    {
      haloJson: z.string().describe("Halo 导出的完整 JSON 字符串"),
      mode: z.enum(["merge", "overwrite"]).default("merge").describe("导入模式"),
      confirm: z.enum(["yes"]).optional().describe("mode 为 overwrite 时必须输入 'yes' 确认高危操作"),
    },
    async ({ haloJson, mode, confirm }) => {
      if (mode === "overwrite" && confirm !== "yes") {
        return {
          content: [{ type: "text" as const, text: "❌ 操作已取消：overwrite 导入必须确认高危操作。" }],
          isError: true,
        };
      }

      const parsed = parseJsonInput(haloJson);
      if (!parsed.ok) {
        return {
          content: [{ type: "text" as const, text: "❌ Halo JSON 格式无效，请检查后重试。" }],
          isError: true,
        };
      }

      const result = await apiRequest("/api/admin/import/halo", {
        method: "POST",
        body: { data: parsed.data, mode },
        timeoutMs: 60000,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ Halo 数据导入完成：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );
}
