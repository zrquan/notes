---
title: "Nginx HTTPS"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:38+08:00
draft: false
---

## 一、安装 Nginx 的 ssl 模块 {#一-安装-nginx-的-ssl-模块}

检查当前 nginx 是否存在 ssl 模块

```text
./nginx -V
```

{{< figure src="/ox-hugo/_20231228_000053screenshot.png" >}}

如果出现 `configure arguments: --with-http_ssl_module` 则已经安装 ssl 模块，否则需
要先进入 nginx 的源码目录中，运行以下配置命令

```text
./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module
```

然后运行 `make` (不要使用 `make install` ，否则会重新安装 nginx)

上述操作执行完成以后，目录下会出现 `objs` 文件夹，文件夹内存在 nginx 可执行文件，用
它来替换当前环境变量中的 nginx

```bash
./nginx -s stop
cp /root/nginx/objs/nginx /usr/local/nginx/sbin
chmod 111 nginx
```


## 二、配置 ssl 证书 {#二-配置-ssl-证书}

解压缩下载好的证书，一般是 pem 文件和 key 文件，名字可以随便改

{{< figure src="/ox-hugo/_20231228_000622screenshot.png" >}}


## 三、修改 nginx.conf {#三-修改-nginx-dot-conf}

https 配置示例

```nil
http {
    include            mime.types;
    default_type       application/octet-stream;
    sendfile           on;
    keepalive_timeout  65;
    server {
        # 监听443端口
        listen 443;
        # 你的域名
        server_name huiblog.top;
        ssl on;
        # ssl证书的pem文件路径
        ssl_certificate /root/card/huiblog.top.pem;
        # ssl证书的key文件路径
        ssl_certificate_key /root/card/huiblog.top.key;
        location / {
            proxy_pass http://公网地址:项目端口号;
        }
    }
    server {
        listen 80;
        server_name huiblog.top;
        # 将请求转成https
        rewrite ^(.*)$ https://$host$1 permanent;
    }
}
```


## 四、重启 {#四-重启}

进行 nginx 执行目录，一般是 sbin 目录

```bash
./nginx -s reload
./nginx -s stop
./nginx
```
