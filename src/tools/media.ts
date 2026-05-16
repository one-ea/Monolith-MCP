/* ──────────────────────────────────────────────
   媒体管理工具 (Media)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiFormRequest, apiRequest } from "../client.js";

export function registerMediaTools(server: McpServer) {
  // ── 列出媒体库 ──
  server.tool(
    "list_media",
    "列出对象存储（R2/S3）中的所有媒体文件，包含文件名、大小、上传时间和 URL",
    {
      page: z.number().default(1).describe("页码"),
      limit: z.number().default(50).describe("每页数量"),
    },
    async ({ page, limit }) => {
      const media = await apiRequest("/api/admin/media", {
        query: { page, limit },
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(media, null, 2),
        }],
      };
    }
  );

  // ── 上传媒体（base64） ──
  server.tool(
    "upload_media",
    "上传文件到对象存储。由于 MCP 限制，需将文件内容以 base64 编码传入。适合上传小型图片或文本文件。",
    {
      filename: z.string().describe("文件名，如 photo.jpg"),
      base64Content: z.string().describe("文件内容的 base64 编码"),
      contentType: z.string().default("application/octet-stream").describe("MIME 类型"),
    },
    async ({ filename, base64Content, contentType }) => {
      const buffer = Buffer.from(base64Content, "base64");
      const blob = new Blob([buffer], { type: contentType });

      const formData = new FormData();
      formData.append("file", blob, filename);

      try {
        const result = await apiFormRequest("/api/admin/upload", formData);
        return {
          content: [{
            type: "text" as const,
            text: `✅ 文件 "${filename}" 上传成功：${JSON.stringify(result, null, 2)}`,
          }],
        };
      } catch (err) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ 上传失败：${err instanceof Error ? err.message : "未知错误"}`,
          }],
          isError: true,
        };
      }
    }
  );

  // ── 单篇外链图片本地化 ──
  server.tool(
    "localize_post_images",
    "将指定文章正文中的 HTTPS 外链图片抓取到当前对象存储，并把正文引用替换为 /cdn/ 本地地址",
    {
      slug: z.string().describe("要处理的文章 slug"),
    },
    async ({ slug }) => {
      const result = await apiRequest(`/api/admin/posts/${encodeURIComponent(slug)}/localize-images`, {
        method: "POST",
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ── 全站外链图片本地化 ──
  server.tool(
    "localize_all_images",
    "批量扫描所有文章，将 HTTPS 外链图片抓取到当前对象存储，并更新文章正文引用",
    {},
    async () => {
      const result = await apiRequest("/api/admin/localize-all-images", {
        method: "POST",
        timeoutMs: 120000,
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ── 删除媒体 ──
  server.tool(
    "delete_media",
    "⚠️ 【高危操作】删除对象存储中的指定文件，此操作不可逆！",
    { 
      key: z.string().describe("文件的存储 Key（路径）"),
      confirm: z.enum(["yes"]).describe("必须输入 'yes' 确认高危操作")
    },
    async ({ key, confirm }) => {
      if (confirm !== "yes") {
        return { content: [{ type: "text" as const, text: "❌ 操作已取消：未确认高危操作。" }], isError: true };
      }
      const result = await apiRequest(`/api/admin/media/${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      return {
        content: [{
          type: "text" as const,
          text: `🗑️ 媒体文件 "${key}" 已删除。${JSON.stringify(result)}`,
        }],
      };
    }
  );
}
