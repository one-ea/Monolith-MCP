/* ──────────────────────────────────────────────
   分类与标签工具 (Taxonomy)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerTaxonomyTools(server: McpServer) {
  // ── 列出所有标签 ──
  server.tool(
    "list_tags",
    "获取博客中所有已使用的标签及其文章数量",
    {},
    async () => {
      const tags = await apiRequest("/api/tags", { auth: false });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(tags, null, 2),
        }],
      };
    }
  );

  // ── 列出所有分类 ──
  server.tool(
    "list_categories",
    "获取博客中所有分类及其文章数量",
    {},
    async () => {
      const categories = await apiRequest("/api/categories", { auth: false });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(categories, null, 2),
        }],
      };
    }
  );

  // ── 获取系列合集详情 ──
  server.tool(
    "get_series",
    "获取指定系列合集的详细信息和包含的文章列表",
    { slug: z.string().describe("系列 slug") },
    async ({ slug }) => {
      const series = await apiRequest(`/api/series/${slug}`, { auth: false });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(series, null, 2),
        }],
      };
    }
  );
}
