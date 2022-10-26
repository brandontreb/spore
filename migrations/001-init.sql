-- Up
CREATE TABLE `oAuth2Requests` (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  
  userId INTEGER NOT NULL,
  blogId INTEGER NOT NULL,
  state TEXT NOT NULL,
  clientId TEXT NOT NULL,
  responseType TEXT,
  redirectUri TEXT NOT NULL,
  scope TEXT NOT NULL,
  code TEXT NOT NULL,  
  codeChallenge TEXT,
  codeChallengeMethod TEXT,
  grantType TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `media` (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blogId INTEGER NOT NULL,  
  postId INTEGER,
  type TEXT NOT NULL,
  mimeType,
  path TEXT,  
  url TEXTL,
  size INTEGER,
  originalFileName TEXT,
  filename TEXT,
  altText TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `posts` (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blogId INTEGER NOT NULL,    
  name TEXT,  
  content_md TEXT,
  content_text TEXT,  
  content_html TEXT,  
  summary TEXT,  
  status TEXT NOT NULL DEFAULT 'published',
  type TEXT NOT NULL DEFAULT 'note',
  slug TEXT,  
  permalink TEXT,
  published DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _raw TEXT
);

CREATE TABLE `categories` (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blogId INTEGER NOT NULL,  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,  
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug)
);

CREATE TABLE `post_categories` (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blogId INTEGER NOT NULL,  
  postId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(postId, categoryId)
);

-- category TEXT,
--   location TEXT,
--   inReplyTo TEXT,
--   repostOf TEXT,
--   likeOf TEXT,
--   syndication TEXT,

-- Down
DROP TABLE IF EXISTS `oAuth2Requests`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `post_categories`;