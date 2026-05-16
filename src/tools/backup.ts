/* ──────────────────────────────────────────────
   备份恢复工具 (Backup)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerBackupTools(server: McpServer) {
  // ── 导出 JSON 备份 ──
  server.tool(
    "export_backup",
    "导出博客全部数据为 JSON 格式（文章、评论、设置、页面等）",
    {},
    async () => {
      const backup = await apiRequest("/api/admin/backup/export");
      const text = typeof backup === 'string' ? backup : JSON.stringify(backup, null, 2);
      // 截断过长输出避免 MCP 消息超限
      const truncated = text.length > 50000
        ? text.slice(0, 50000) + "\n\n... [数据已截断，完整备份请通过 backup_to_r2 工具推送到云端]"
        : text;
      return {
        content: [{
          type: "text" as const,
          text: truncated,
        }],
      };
    }
  );

  // ── 备份到 R2 ──
  server.tool(
    "backup_to_r2",
    "将当前博客数据备份到 R2 对象存储（云端安全快照）",
    {},
    async () => {
      const result = await apiRequest("/api/admin/backup/r2", {
        method: "POST",
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 数据已备份到 R2 云端：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 备份到 WebDAV ──
  server.tool(
    "backup_to_webdav",
    "将当前博客数据备份到 WebDAV 远端目录。会把 WebDAV 凭据发送到 Monolith 后端用于本次上传。",
    {
      url: z.string().url().describe("WebDAV 服务地址，必须是 https://"),
      username: z.string().describe("WebDAV 用户名"),
      password: z.string().describe("WebDAV 密码或应用专用密码"),
      path: z.string().default("/monolith-backups").describe("远端备份目录"),
    },
    async (params) => {
      const result = await apiRequest("/api/admin/backup/webdav", {
        method: "POST",
        body: params,
        timeoutMs: 60000,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 数据已备份到 WebDAV：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 测试 WebDAV ──
  server.tool(
    "test_webdav_backup",
    "测试 WebDAV 备份目录是否可写。会创建并删除一个临时测试文件。",
    {
      url: z.string().url().describe("WebDAV 服务地址，必须是 https://"),
      username: z.string().describe("WebDAV 用户名"),
      password: z.string().describe("WebDAV 密码或应用专用密码"),
      path: z.string().default("/monolith-backups").describe("远端备份目录"),
    },
    async (params) => {
      const result = await apiRequest("/api/admin/backup/webdav-test", {
        method: "POST",
        body: params,
        timeoutMs: 60000,
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ── 列出 R2 备份 ──
  server.tool(
    "list_r2_backups",
    "列出 R2 存储中所有备份快照（含时间戳和大小）",
    {},
    async () => {
      const backups = await apiRequest("/api/admin/backup/r2-list");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(backups, null, 2),
        }],
      };
    }
  );

  // ── 预览 R2 备份 ──
  server.tool(
    "preview_r2_backup",
    "预览 R2 备份恢复影响，不写入数据。",
    {
      name: z.string().describe("R2 备份文件名，不含 backups/ 前缀"),
      mode: z.enum(["merge", "overwrite"]).default("merge").describe("恢复模式"),
      includeSettings: z.boolean().default(false).describe("是否包含站点设置"),
    },
    async ({ name, mode, includeSettings }) => {
      const result = await apiRequest("/api/admin/backup/r2-preview", {
        method: "POST",
        body: { name, mode, includeSettings },
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ── 预览 JSON 备份 ──
  server.tool(
    "preview_backup",
    "预览本地 JSON 备份或迁移数据恢复影响，不写入数据。",
    {
      backupJson: z.string().describe("完整的备份 JSON 字符串"),
      mode: z.enum(["merge", "overwrite"]).default("merge").describe("恢复模式"),
      includeSettings: z.boolean().default(false).describe("是否包含站点设置"),
      source: z.string().optional().describe("备份来源说明"),
    },
    async ({ backupJson, mode, includeSettings, source }) => {
      let data: unknown;
      try {
        data = JSON.parse(backupJson);
      } catch {
        return {
          content: [{ type: "text" as const, text: "❌ 备份 JSON 格式无效，请检查后重试。" }],
          isError: true,
        };
      }

      const result = await apiRequest("/api/admin/backup/preview", {
        method: "POST",
        body: { ...(data as Record<string, unknown>), mode, includeSettings, source },
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ── 删除 R2 备份 ──
  server.tool(
    "delete_r2_backup",
    "⚠️ 【高危操作】删除 R2 对象存储中的指定备份文件，此操作不可逆！",
    {
      name: z.string().describe("R2 备份文件名，不含 backups/ 前缀"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认高危操作"),
    },
    async ({ name, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认高危操作。" }], isError: true };
      }
      const result = await apiRequest("/api/admin/backup/r2-delete", {
        method: "POST",
        body: { name },
      });
      return {
        content: [{
          type: "text" as const,
          text: `🗑️ R2 备份 "${name}" 已删除。${JSON.stringify(result)}`,
        }],
      };
    }
  );

  // ── 从备份恢复 ──
  server.tool(
    "restore_backup",
    "⚠️ 【超高危操作】从 JSON 数据恢复整个博客！会覆盖现有数据！执行前会自动创建 R2 安全快照。调用前请务必向主人二次确认！",
    {
      backupJson: z.string().describe("完整的备份 JSON 字符串"),
      mode: z.enum(["merge", "overwrite"]).default("merge").describe("恢复模式"),
      includeSettings: z.boolean().default(false).describe("是否恢复站点设置"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认超高危恢复操作"),
    },
    async ({ backupJson, mode, includeSettings, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认超高危恢复操作。" }], isError: true };
      }

      // 安全防线：恢复前自动备份
      console.error("[Monolith MCP] 恢复操作前自动创建安全快照...");
      try {
        await apiRequest("/api/admin/backup/r2", { method: "POST" });
        console.error("[Monolith MCP] 安全快照已创建。");
      } catch (e) {
        console.error("[Monolith MCP] 安全快照创建失败", e);
        return {
          content: [{
            type: "text" as const,
            text: "❌ 安全快照创建失败，为防止数据丢失，已终止恢复操作。",
          }],
          isError: true,
        };
      }

      // 执行恢复
      let data: unknown;
      try {
        data = JSON.parse(backupJson);
      } catch {
        return {
          content: [{
            type: "text" as const,
            text: "❌ 备份 JSON 格式无效，请检查后重试。",
          }],
          isError: true,
        };
      }

      const result = await apiRequest("/api/admin/backup/restore", {
        method: "POST",
        body: { ...(data as Record<string, unknown>), mode, includeSettings },
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 数据恢复完成：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );

  // ── 从 R2 备份恢复 ──
  server.tool(
    "restore_r2_backup",
    "⚠️ 【超高危操作】从 R2 备份文件恢复博客数据！建议先调用 preview_r2_backup。",
    {
      name: z.string().describe("R2 备份文件名，不含 backups/ 前缀"),
      mode: z.enum(["merge", "overwrite"]).default("merge").describe("恢复模式"),
      includeSettings: z.boolean().default(false).describe("是否恢复站点设置"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认超高危恢复操作"),
    },
    async ({ name, mode, includeSettings, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认超高危恢复操作。" }], isError: true };
      }
      const result = await apiRequest("/api/admin/backup/r2-restore", {
        method: "POST",
        body: { name, mode, includeSettings },
        timeoutMs: 60000,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 已从 R2 备份 "${name}" 恢复：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );
}
