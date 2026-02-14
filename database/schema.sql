-- =============================================
-- omerfaruk.vision — Blog Veritabanı Şeması
-- MySQL 9 — UTF8MB4
-- =============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =============================================
-- 1. ROLLER & YETKİLER
-- =============================================

CREATE TABLE IF NOT EXISTS roles (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    is_default  TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    `group`     VARCHAR(50)  NULL COMMENT 'İzin grubu: posts, users, comments, vb.',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. KULLANICILAR
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    display_name  VARCHAR(100)  NOT NULL,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    avatar_url    VARCHAR(500)  NULL,
    bio           TEXT          NULL,
    website       VARCHAR(255)  NULL,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP     NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT UNSIGNED NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. KATEGORİLER & ETİKETLER
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT         NULL,
    color       VARCHAR(7)   NULL COMMENT 'HEX renk kodu, örn: #3B82F6',
    icon        VARCHAR(50)  NULL COMMENT 'İkon adı (Lucide/Heroicons)',
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. YAZILAR (POSTS)
-- =============================================

CREATE TABLE IF NOT EXISTS posts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(300)  NOT NULL,
    slug          VARCHAR(300)  NOT NULL UNIQUE,
    excerpt       VARCHAR(500)  NULL COMMENT 'Kısa özet',
    content       LONGTEXT      NOT NULL COMMENT 'HTML veya JSON (editor çıktısı)',
    cover_image   VARCHAR(500)  NULL COMMENT 'Kapak görseli URL (MinIO)',
    status        ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    is_featured   TINYINT(1)    NOT NULL DEFAULT 0,
    reading_time  INT UNSIGNED  NULL COMMENT 'Dakika cinsinden tahmini okuma süresi',
    view_count    INT UNSIGNED  NOT NULL DEFAULT 0,
    like_count    INT UNSIGNED  NOT NULL DEFAULT 0,
    author_id     INT UNSIGNED  NOT NULL,
    category_id   INT UNSIGNED  NULL,
    published_at  TIMESTAMP     NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id)   REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE SET NULL,
    INDEX idx_posts_slug (slug),
    INDEX idx_posts_status (status),
    INDEX idx_posts_author (author_id),
    INDEX idx_posts_published (published_at),
    INDEX idx_posts_featured (is_featured, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_tags (
    post_id INT UNSIGNED NOT NULL,
    tag_id  INT UNSIGNED NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)  REFERENCES tags(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. YORUMLAR
-- =============================================

CREATE TABLE IF NOT EXISTS comments (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    body       TEXT          NOT NULL,
    user_id    INT UNSIGNED  NOT NULL,
    post_id    INT UNSIGNED  NOT NULL,
    parent_id  INT UNSIGNED  NULL COMMENT 'Üst yorum (threaded)',
    is_approved TINYINT(1)   NOT NULL DEFAULT 1,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id)  ON DELETE CASCADE,
    INDEX idx_comments_post (post_id),
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. BEĞENİLER (CLAP / LIKE)
-- =============================================

CREATE TABLE IF NOT EXISTS post_likes (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    post_id    INT UNSIGNED NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_post_likes (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. OTURUM / REFRESH TOKEN (Opsiyonel)
-- =============================================

CREATE TABLE IF NOT EXISTS sessions (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED  NOT NULL,
    session_token VARCHAR(255)  NOT NULL UNIQUE,
    expires_at    TIMESTAMP     NOT NULL,
    ip_address    VARCHAR(45)   NULL,
    user_agent    VARCHAR(500)  NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. SEED DATA — ROLLER
-- =============================================

INSERT INTO roles (name, slug, description, is_default) VALUES
    ('Admin',  'admin',  'Tam yetkili yönetici', 0),
    ('Editor', 'editor', 'İçerik düzenleyebilir, yayınlayabilir', 0),
    ('Author', 'author', 'Kendi yazılarını oluşturabilir', 0),
    ('Reader', 'reader', 'Okuyucu — yorum yapabilir, beğenebilir', 1);

-- =============================================
-- 9. SEED DATA — İZİNLER
-- =============================================

INSERT INTO permissions (name, slug, `group`) VALUES
    -- Posts
    ('Yazı Oluştur',    'create_post',    'posts'),
    ('Yazı Düzenle',    'edit_post',      'posts'),
    ('Kendi Yazısını Düzenle', 'edit_own_post', 'posts'),
    ('Yazı Sil',        'delete_post',    'posts'),
    ('Kendi Yazısını Sil', 'delete_own_post', 'posts'),
    ('Yazı Yayınla',    'publish_post',   'posts'),
    ('Yazıları Görüntüle', 'view_posts',  'posts'),
    -- Categories & Tags
    ('Kategori Yönet',  'manage_categories', 'categories'),
    ('Etiket Yönet',    'manage_tags',       'tags'),
    -- Comments
    ('Yorum Yap',       'create_comment', 'comments'),
    ('Yorum Sil',       'delete_comment', 'comments'),
    ('Yorum Onayla',    'approve_comment','comments'),
    -- Users
    ('Kullanıcı Yönet', 'manage_users',   'users'),
    ('Rol Ata',         'assign_roles',   'users'),
    -- General
    ('Admin Panel Erişimi', 'access_admin', 'general'),
    ('Dosya Yükle',     'upload_files',   'general');

-- =============================================
-- 10. SEED DATA — ROL–İZİN EŞLEMELERİ
-- =============================================

-- Admin → tüm izinler
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.slug = 'admin';

-- Editor → yazı/kategori/etiket/yorum yönetimi + admin panel + dosya yükleme
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
    ON p.slug IN ('create_post','edit_post','delete_post','publish_post','view_posts',
                  'manage_categories','manage_tags','create_comment','delete_comment',
                  'approve_comment','access_admin','upload_files')
WHERE r.slug = 'editor';

-- Author → kendi yazılarını yönetme + yorum + dosya yükleme
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
    ON p.slug IN ('create_post','edit_own_post','delete_own_post','view_posts',
                  'create_comment','upload_files')
WHERE r.slug = 'author';

-- Reader → yazıları görme + yorum yapma
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
    ON p.slug IN ('view_posts','create_comment')
WHERE r.slug = 'reader';

-- =============================================
-- 11. SEED DATA — ADMIN KULLANICISI
-- =============================================

-- Şifre: bcrypt('admin123') — Production'da değiştirin!
INSERT INTO users (email, password_hash, display_name, username, is_active, email_verified_at) VALUES
    ('admin@omerfaruk.vision', '$2b$12$LJ3m8CpQFv6r5D0JHs5Lc.sXIXx6hR5oK4g7rKd3kQc5BhEw5Bnby', 'Ömer Faruk', 'omerfaruk', 1, NOW());

-- Admin rolünü ata
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.slug = 'admin' WHERE u.username = 'omerfaruk';

-- =============================================
-- 12. SEED DATA — ÖRNEK KATEGORİLER
-- =============================================

INSERT INTO categories (name, slug, description, color, sort_order) VALUES
    ('Teknoloji',   'teknoloji',   'Yazılım, AI, ve teknoloji dünyası', '#3B82F6', 1),
    ('Kişisel',     'kisisel',     'Kişisel düşünceler ve deneyimler',  '#8B5CF6', 2),
    ('Tutorial',    'tutorial',    'Adım adım rehberler',               '#10B981', 3),
    ('Günlük',      'gunluk',      'Günlük notlar ve gözlemler',        '#F59E0B', 4);

-- =============================================
-- 13. SEED DATA — ÖRNEK ETİKETLER
-- =============================================

INSERT INTO tags (name, slug) VALUES
    ('JavaScript', 'javascript'),
    ('Python',     'python'),
    ('Next.js',    'nextjs'),
    ('React',      'react'),
    ('MySQL',      'mysql'),
    ('Docker',     'docker'),
    ('AI',         'ai'),
    ('DevOps',     'devops'),
    ('CSS',        'css'),
    ('TypeScript', 'typescript');
