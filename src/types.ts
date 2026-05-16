/* ──────────────────────────────────────────────
   Monolith MCP 服务器 — 共享类型定义
   ────────────────────────────────────────────── */

/** 文章数据结构 */
export interface Post {
  id?: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  coverColor?: string;
  coverImage?: string;
  published: boolean;
  listed?: boolean;
  tags: string[];
  category?: string;
  seriesSlug?: string | null;
  seriesOrder?: number;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
  publishAt?: string | null;
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
  site_title?: string;
  site_name?: string;
  site_description?: string;
  site_tagline?: string;
  site_og_image?: string;
  hero_kicker?: string;
  hero_subtitle?: string;
  hero_description?: string;
  hero_actions?: string;
  hero_topics?: string;
  posts_per_page?: number;
  comments_require_approval?: boolean;
  custom_header?: string;
  custom_footer?: string;
  webdav_url?: string;
  webdav_username?: string;
  webdav_password?: string;
  webdav_path?: string;
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
  id?: number;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  showInNav?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}
