<div align="center">

# Monolith MCP

**[Monolith](https://github.com/one-ea/Monolith) 博客专属 MCP 服务器**

*30 个工具 · 全权管理文章 / 评论 / 媒体 / 设置 / 备份*

[![npm](https://img.shields.io/npm/v/monolith-mcp?style=flat-square&color=22c55e)](https://www.npmjs.com/package/monolith-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

</div>

---

## 快速开始

### 1. 配置 MCP 客户端

在你的 AI 编辑器（如 Cursor、Windsurf、Antigravity 等）的 MCP 配置中添加：

```json
{
  "mcpServers": {
    "monolith": {
      "command": "npx",
      "args": ["-y", "monolith-mcp"],
      "env": {
        "MONOLITH_API_URL": "https://your-blog-api.workers.dev",
        "MONOLITH_PASSWORD": "your_admin_password"
      }
    }
  }
}
```

### 2. 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `MONOLITH_API_URL` | ✅ | Monolith 后端 API 地址 |
| `MONOLITH_PASSWORD` | ✅ | 管理员密码 |

---

## 工具清单

| 模块 | 工具 | 数量 |
|------|------|:----:|
| 📝 **文章** | `list_posts` · `get_post` · `create_post` · `update_post` · `delete_post` · `batch_posts` · `search_posts` · `list_post_versions` | 8 |
| 💬 **评论** | `list_comments` · `approve_comment` · `delete_comment` | 3 |
| 🖼️ **媒体** | `list_media` · `upload_media` · `delete_media` | 3 |
| 📊 **统计** | `get_dashboard_stats` · `get_analytics` · `get_traffic` | 3 |
| ⚙️ **设置** | `get_settings` · `update_settings` | 2 |
| 📄 **页面** | `list_pages` · `get_page` · `upsert_page` · `delete_page` | 4 |
| 🏷️ **分类** | `list_tags` · `list_categories` · `get_series` | 3 |
| 💾 **备份** | `export_backup` · `backup_to_r2` · `list_r2_backups` · `restore_backup` | 4 |

> ⚠️ 标记为【高危操作】的工具（`delete_*`、`batch_posts`、`restore_backup`）执行前会要求确认。

---

## 本地开发

```bash
git clone https://github.com/one-ea/Monolith-MCP.git
cd Monolith-MCP
npm install
npm run build
node dist/index.js
```

---

## License

[MIT](LICENSE)
