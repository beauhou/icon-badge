# Icon Badge

一个基于 Nginx njs 的动态 SVG badge 服务，同时保留可视化生成页面。

目标用法类似：

```html
<img src="https://svg.example.com?key=Lang&value=Java17&bg=green"/>
<img src="https://svg.example.com?key=Base&value=SpringBoot3"/>
<img src="https://svg.example.com?key=ORM&value=JPA"/>
<img src="https://svg.example.com?key=DB&value=MySQL"/>
```

也可以在 README 中使用：

```markdown
![Lang](https://svg.example.com?key=Lang&value=Java17&bg=green)
```

## 参数

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| `key` | 左侧文本 | `Lang` |
| `value` | 右侧文本 | `Java17` |
| `bg` | 右侧背景色 | `green`、`#2f80ed`、`2f80ed` |
| `keyBg` | 左侧背景色 | `#555555` |
| `logo` | 简短字符图标 | `*`、`OK` |
| `style` | badge 风格 | `flat`、`flat-square`、`plastic`、`for-the-badge`、`outline`、`social` |

兼容旧参数：`label` 等同于 `key`，`message` 等同于 `value`，`color` 等同于 `bg`，`labelColor` 等同于 `keyBg`。

## 颜色别名

支持：

```text
blue, cyan, gray, green, orange, pink, purple, red,
success, warning, critical, inactive
```

也支持十六进制颜色：

```text
#2f80ed
2f80ed
```

## Nginx njs 部署

这种模式不需要单独启动 Node/Java 服务，但要求 Nginx 安装 `ngx_http_js_module`。

把项目放到服务器：

```bash
/opt/www/icon-badge
```

Nginx 配置示例见：

```text
nginx/icon-badge.conf
```

核心配置：

```nginx
load_module modules/ngx_http_js_module.so;

http {
    js_import badge from /opt/www/icon-badge/nginx/badge.js;

    server {
        listen 80;
        server_name svg.example.com;

        root /opt/www/icon-badge;
        index index.html;

        location = / {
            js_content badge.badge;
        }

        location /ui/ {
            alias /opt/www/icon-badge/;
            try_files $uri $uri/ /ui/index.html;
        }

        location = /icon-badge.svg {
            js_content badge.badge;
        }
    }
}
```

访问：

```text
https://svg.example.com?key=Lang&value=Java17&bg=green
https://svg.example.com?key=Base&value=SpringBoot3
https://svg.example.com/ui/
```

## 本地测试

```bash
npm test
```
