# Icon Badge

纯静态 SVG badge 生成器，可以直接部署在 Nginx 下。

## 使用方式

1. 将本目录作为 Nginx 静态站点根目录。
2. 访问站点根路径打开生成器。
3. 调整文本、颜色、图标和风格。
4. 复制 Markdown/HTML，或下载 SVG 后放入 README、文档站、门户页中。

根路径用于生成和说明；`/icon-badge.svg` 是默认静态 badge：

```markdown
![icon badge](./icon-badge.svg)
```

## 支持能力

- 文本：左侧 label、右侧 message。
- 图标：支持简短字符图标，如 `★`、`✓`、`⚡`。
- 颜色：支持 `success`、`warning`、`critical`、`blue`、`purple` 等别名，也支持 `#2f80ed` 或 `2f80ed`。
- 风格：`flat`、`flat-square`、`plastic`、`for-the-badge`、`outline`、`social`。
- 输出：SVG 源码、Data URI、Markdown、HTML、SVG 文件下载。

## Nginx 示例

```nginx
server {
    listen 80;
    server_name badge.example.com;
    root /path/to/icon-badge;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 关于参数化直出

纯静态 Nginx 只能返回已经存在的文件，不能根据 `?label=...&message=...` 动态生成不同 SVG。

如果必须支持 `/icon-badge.svg?label=build&message=passing` 这种 URL 直接返回动态 badge，需要增加一个极小后端、Nginx njs/Lua，或在发布前预生成多个具体 SVG 文件。
