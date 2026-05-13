# Icon Badge


核心用法是直接在 HTML 或 README 中引用一个 URL，而不是打开页面复制粘贴：

```html
<img src="https://badge.beauhou.cn?key=Lang&value=Java17&bg=green"/>
<img src="https://badge.beauhou.cn?key=Base&value=SpringBoot3"/>
<img src="https://badge.beauhou.cn?key=ORM&value=JPA"/>
<img src="https://badge.beauhou.cn?key=DB&value=MySQL"/>
```

README 用法：

```markdown
![Lang](https://badge.beauhou.cn?key=Lang&value=Java17&bg=green)
```

## 接口

推荐：

```text
https://badge.beauhou.cn?key=Lang&value=Java17&bg=green
```

兼容：

```text
https://badge.beauhou.cn/badge.svg?key=Lang&value=Java17&bg=green
https://badge.beauhou.cn/icon-badge.svg?key=Lang&value=Java17&bg=green
```

## 参数

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| `key` | 左侧文本 | `Lang` |
| `value` | 右侧文本 | `Java17` |
| `bg` | 右侧背景色 | `green`、`ff4500`、`#2da44e` |
| `keyBg` | 左侧背景色 | `333333`、`#333333` |
| `radius` | 圆角，0 到 10 | `3` |

兼容旧参数：

```text
label -> key
message -> value
color -> bg
labelColor -> keyBg
```

## 输出效果

输出为经典 20px 高度 SVG badge：

- 左侧默认背景：`#333333`
- 右侧默认背景：`#ff4500`
- 支持渐变高光、文字阴影和圆角
- 支持 XML 转义，避免特殊字符破坏 SVG

## Nginx njs 部署

此项目不需要单独启动 Node/Java 服务，但要求 Nginx 安装 `ngx_http_js_module`。

部署目录示例：

```bash
/opt/www/icon-badge
```

配置示例：

```nginx
load_module modules/ngx_http_js_module.so;

http {
    js_import badge from /opt/www/icon-badge/nginx/badge.js;

    server {
        listen 80;
        server_name badge.beauhou.cn;

        root /opt/www/icon-badge;
        index index.html;

        location = / {
            js_content badge.indexOrBadge;
        }

        location = /badge.svg {
            js_content badge.badge;
        }

        location = /icon-badge.svg {
            js_content badge.badge;
        }

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

部署后必须确认动态接口返回 `image/svg+xml`，不能返回首页 HTML：

```bash
curl -I "https://badge.beauhou.cn/badge.svg?key=Lang&value=Java17&bg=green"
```

## 本地验证

```bash
npm test
```
