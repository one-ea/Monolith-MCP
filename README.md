<div align="center">

# Monolith MCP

**[Monolith](https://github.com/one-ea/Monolith) 博客专属 MCP 服务器**

*42 个工具 · 全权管理文章 / 评论 / 媒体 / 设置 / 备份 / 导入 / 分析*

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
| 📝 **文章** | `list_posts` · `get_post` · `create_post` · `update_post` · `delete_post` · `batch_posts` · `search_posts` · `list_post_versions` · `restore_post_version` | 9 |
| 💬 **评论** | `list_comments` · `approve_comment` · `delete_comment` | 3 |
| 🖼️ **媒体** | `list_media` · `upload_media` · `delete_media` · `localize_post_images` · `localize_all_images` | 5 |
| 📊 **统计** | `get_dashboard_stats` · `get_analytics` · `get_ae_analytics` · `get_traffic` | 4 |
| ⚙️ **设置** | `get_settings` · `update_settings` | 2 |
| 📄 **页面** | `list_pages` · `get_page` · `upsert_page` · `delete_page` | 4 |
| 🏷️ **分类** | `list_tags` · `list_categories` · `get_series` | 3 |
| 💾 **备份** | `export_backup` · `backup_to_r2` · `backup_to_webdav` · `test_webdav_backup` · `list_r2_backups` · `preview_backup` · `preview_r2_backup` · `delete_r2_backup` · `restore_backup` · `restore_r2_backup` | 10 |
| 📦 **导入** | `preview_halo_import` · `import_halo_data` | 2 |

> ⚠️ 标记为【高危操作】的工具（`delete_*`、`batch_posts` 删除、`restore_*`、`import_halo_data` 的 `overwrite` 模式）执行前会要求 `confirm: "yes"`。

## 与当前 Monolith 后台能力对应

- 文章字段使用当前 API 契约：`published` / `listed` / `coverColor` / `coverImage` / `publishAt` / `seriesSlug` / `seriesOrder` / `category`。
- `create_post` 默认创建草稿；如需立即发布，请显式传入 `published: true`。
- `batch_posts` 支持 `publish`、`draft`、`delete`；其中 `draft` 会转换为后端实际动作 `unpublish`。
- 统计支持普通 D1/Turso/PG 访问分析，也支持 Cloudflare Analytics Engine 增强分析：`get_ae_analytics`。
- 备份支持 JSON 导出、R2 快照、R2 预览/恢复/删除、WebDAV 备份与连通性测试。
- 媒体支持 R2/S3 列表、上传、删除，并可将文章中的 HTTPS 外链图片本地化。
- 导入支持 Halo 1.x / 2.x JSON 预览与导入。

---

## 本地开发

```bash
git clone https://github.com/one-ea/Monolith-MCP.git
cd Monolith-MCP
npm install
npm run build
npm run smoke
node dist/index.js
```

---

## License

[MIT](LICENSE)
