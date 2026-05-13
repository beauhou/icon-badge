# Icon Badge

通过不同路径生成不同参数形式的 SVG badge。

## key / value

```html
<img src="https://badge.beauhou.cn/kv?key=Lang&value=Java17&bg=green"/>
<img src="https://badge.beauhou.cn/kv?key=DB&value=MySQL"/>
```

## label / message

```html
<img src="https://badge.beauhou.cn/label?label=Build&message=Passing&bg=green"/>
<img src="https://badge.beauhou.cn/label?label=License&message=MIT&bg=blue"/>
```

## name / status

```html
<img src="https://badge.beauhou.cn/status?name=API&status=Online&bg=green"/>
<img src="https://badge.beauhou.cn/status?name=Deploy&status=Ready&bg=purple"/>
```

## name / version

```html
<img src="https://badge.beauhou.cn/tech?name=SpringBoot&version=3"/>
<img src="https://badge.beauhou.cn/tech?name=Java&version=17&bg=green"/>
```

## 兼容路径

旧的根路径和 SVG 文件路径仍可用：

```text
https://badge.beauhou.cn?key=Lang&value=Java17&bg=green
https://badge.beauhou.cn/badge.svg?key=Lang&value=Java17&bg=green
https://badge.beauhou.cn/icon-badge.svg?key=Lang&value=Java17&bg=green
```

## 通用参数

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| `bg` | 右侧背景色 | `green`、`ff4500`、`#2da44e` |
| `keyBg` | 左侧背景色 | `333333`、`#333333` |
| `radius` | 圆角，0 到 10 | `3` |

## Nginx njs 部署

此项目不需要单独启动 Node/Java 服务，但要求 Nginx 安装 `ngx_http_js_module`。

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

        location = /kv {
            js_content badge.kv;
        }

        location = /label {
            js_content badge.label;
        }

        location = /status {
            js_content badge.status;
        }

        location = /tech {
            js_content badge.tech;
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

部署后确认动态接口返回 `image/svg+xml`：

```bash
curl -I "https://badge.beauhou.cn/badge.svg?key=Lang&value=Java17&bg=green"
curl -I "https://badge.beauhou.cn/kv?key=Lang&value=Java17&bg=green"
```

## 本地验证

```bash
npm test
```
