/* ──────────────────────────────────────────────
   站点设置工具 (Settings)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerSettingsTools(server: McpServer) {
  // ── 获取设置 ──
  server.tool(
    "get_settings",
    "获取博客站点的完整配置（站名、描述、每页文章数、评论审核策略、自定义代码注入等）",
    {},
    async () => {
      const settings = await apiRequest("/api/admin/settings");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(settings, null, 2),
        }],
      };
    }
  );

  // ── 更新设置 ──
  server.tool(
    "update_settings",
    "更新博客站点配置。只需传入要修改的字段即可，未传入的字段保持不变。",
    {
      site_name: z.string().optional().describe("站点名称"),
      site_title: z.string().optional().describe("站点标题，用于首页 H1、SEO site_name 和 RSS 标题"),
      site_description: z.string().optional().describe("站点描述"),
      site_tagline: z.string().optional().describe("首页标语，作为首页副标题回退值"),
      site_og_image: z.string().optional().describe("社交分享图 URL"),
      hero_kicker: z.string().optional().describe("首页首屏眉标"),
      hero_subtitle: z.string().optional().describe("首页首屏副标题"),
      hero_description: z.string().optional().describe("首页首屏说明"),
      hero_actions: z.string().optional().describe("首页首屏入口 JSON 字符串"),
      hero_topics: z.string().optional().describe("首页主题卡片 JSON 字符串"),
      posts_per_page: z.number().int().min(1).max(100).optional().describe("每页文章数"),
      comments_require_approval: z.boolean().optional().describe("评论是否需要审核"),
      custom_header: z.string().optional().describe("注入到 <head> 中的自定义 HTML/JS"),
      custom_footer: z.string().optional().describe("注入到页面底部的自定义 HTML/JS"),
      webdav_url: z.string().optional().describe("WebDAV 备份地址"),
      webdav_username: z.string().optional().describe("WebDAV 用户名"),
      webdav_password: z.string().optional().describe("WebDAV 应用专用密码"),
      webdav_path: z.string().optional().describe("WebDAV 备份目录"),
    },
    async (params) => {
      const result = await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: params,
      });
      return {
        content: [{
          type: "text" as const,
          text: `✅ 站点设置已更新：${JSON.stringify(result, null, 2)}`,
        }],
      };
    }
  );
}
