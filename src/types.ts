/* ──────────────────────────────────────────────
   Monolith MCP 服务器 — 共享类型定义
   ────────────────────────────────────────────── */

/** 文章数据结构 */
export interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: "published" | "draft" | "scheduled";
  tags: string[];
  category?: string;
  series?: string;
  seriesOrder?: number;
  pinned?: boolean;
  allowComments?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  viewCount?: number;
}

/** 评论数据结构 */
export interface Comment {
  id: number;
  postSlug: string;
  author: string;
  email?: string;
  website?: string;
  content: string;
  approved: boolean;
  parentId?: number;
  createdAt: string;
}

/** 媒体文件数据结构 */
export interface MediaFile {
  key: string;
  size: number;
  uploaded: string;
  url: string;
}

/** 站点设置 */
export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  posts_per_page?: number;
  comments_require_approval?: boolean;
  custom_header?: string;
  custom_footer?: string;
  [key: string]: unknown;
}

/** 仪表盘统计 */
export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  recentPosts: Post[];
}

/** 独立页面 */
export interface Page {
  slug: string;
  title: string;
  content: string;
  status: "published" | "draft";
  showInNav?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}
