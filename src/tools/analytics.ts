/* ──────────────────────────────────────────────
   统计分析工具 (Analytics)
   ────────────────────────────────────────────── */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest } from "../client.js";

export function registerAnalyticsTools(server: McpServer) {
  // ── 仪表盘摘要 ──
  server.tool(
    "get_dashboard_stats",
    "获取博客仪表盘摘要：总文章数、总浏览量、总评论数、最近文章列表",
    {},
    async () => {
      const stats = await apiRequest("/api/admin/stats");
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(stats, null, 2),
        }],
      };
    }
  );

  // ── 访问分析 ──
  server.tool(
    "get_analytics",
    "获取详细的访问分析数据，可指定时间范围",
    {
      days: z.number().default(30).describe("查询最近多少天的数据"),
    },
    async ({ days }) => {
      const analytics = await apiRequest("/api/admin/analytics", {
        query: { days },
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(analytics, null, 2),
        }],
      };
    }
  );

  // ── Cloudflare Analytics Engine 增强分析 ──
  server.tool(
    "get_ae_analytics",
    "获取 Cloudflare Analytics Engine 增强分析。501 表示非 D1/Cloudflare 部署，503 表示缺 Cloudflare secrets，502 表示 AE 查询失败。",
    {
      days: z.number().int().min(1).max(31).default(7).describe("查询最近多少天的数据，AE 最多 31 天"),
    },
    async ({ days }) => {
      try {
        const analytics = await apiRequest("/api/admin/analytics/ae", {
          query: { days },
        });
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(analytics, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{
            type: "text" as const,
            text: [
              "❌ AE 增强分析获取失败。",
              "状态提示：501 = 非 D1/Cloudflare 部署；503 = 缺 CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN；502 = AE 查询失败。",
              err instanceof Error ? err.message : "未知错误",
            ].join("\n"),
          }],
          isError: true,
        };
      }
    }
  );

  // ── 公开流量统计 ──
  server.tool(
    "get_traffic",
    "获取公开的流量统计数据（无需认证）",
    {},
    async () => {
      const traffic = await apiRequest("/api/stats/traffic", { auth: false });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(traffic, null, 2),
        }],
      };
    }
  );
}
