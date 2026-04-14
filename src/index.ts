#!/usr/bin/env node
/* ──────────────────────────────────────────────
   Monolith MCP 服务器 — 入口
   
   为 Monolith 博客提供 30 个 MCP 工具，涵盖：
   文章 · 评论 · 媒体 · 统计 · 设置 · 页面 · 分类 · 备份
   
   通过 stdio 传输运行，由宿主 AI 编辑器调用。
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerPostTools } from "./tools/posts.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerMediaTools } from "./tools/media.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerSettingsTools } from "./tools/settings.js";
import { registerPageTools } from "./tools/pages.js";
import { registerTaxonomyTools } from "./tools/taxonomy.js";
import { registerBackupTools } from "./tools/backup.js";

async function main() {
  // 创建 MCP 服务器实例
  const server = new McpServer(
    {
      name: "monolith-blog",
      version: "1.0.0",
    },
    {
      capabilities: { logging: {} },
      instructions: [
        "这是 Monolith 博客的专属管理 MCP 服务器。",
        "你可以通过以下工具全权管理博客的内容与配置：",
        "",
        "📝 文章：list_posts, get_post, create_post, update_post, delete_post, batch_posts, search_posts, list_post_versions",
        "💬 评论：list_comments, approve_comment, delete_comment",
        "🖼️ 媒体：list_media, upload_media, delete_media",
        "📊 统计：get_dashboard_stats, get_analytics, get_traffic",
        "⚙️ 设置：get_settings, update_settings",
        "📄 页面：list_pages, get_page, upsert_page, delete_page",
        "🏷️ 分类：list_tags, list_categories, get_series",
        "💾 备份：export_backup, backup_to_r2, list_r2_backups, restore_backup",
        "",
        "⚠️ 安全规则：",
        "- 标记为【高危操作】的工具（delete_*, batch_posts, restore_backup）执行前必须向用户确认",
        "- restore_backup 会自动在恢复前创建安全快照",
        "- create_post 默认创建草稿状态，需显式设置 status='published' 才会立即发布",
      ].join("\n"),
    }
  );

  // 注册所有工具模块
  registerPostTools(server);
  registerCommentTools(server);
  registerMediaTools(server);
  registerAnalyticsTools(server);
  registerSettingsTools(server);
  registerPageTools(server);
  registerTaxonomyTools(server);
  registerBackupTools(server);

  // 启动 stdio 传输
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("🏠 Monolith MCP 服务器已启动 (stdio)，共注册 30 个工具。");
}

main().catch((error) => {
  console.error("❌ Monolith MCP 服务器启动失败:", error);
  process.exit(1);
});
