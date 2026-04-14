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
