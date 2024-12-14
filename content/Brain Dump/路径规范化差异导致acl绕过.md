---
title: "路径规范化差异导致ACL绕过"
author: ["4shen0ne"]
lastmod: 2024-12-14T22:39:30+08:00
draft: false
---

很多 Web 中间件可以通过 [ACL]({{< relref "acl.md" >}}) 来对 HTTP 路径或资源进行安全管控，比如我们想要配置
Nginx 使其禁止访问 /admin 路径，可以这样配置：

```text
location = /admin {
    deny all;
}

location = /admin/ {
    deny all;
}
```

当请求经过 Nginx 处理，被其放行后，才会到达后端服务。试想一下，如果一个请求在
Nginx 看来并不是访问 /admin 路径，从而放行请求，而在后端服务处理时又把它路由到
/admin 上去，岂不是一次绕过 ACL 的越权访问

而无论是 Nginx 等中间件还是后端的 Web 服务，在处理请求路径时，通常都会对路径进行
规范化处理，清除路径中的特殊字符、空白字符等，如果前后处理存在差异，就可能导致安
全问题（本质上和 [HTTP request smuggling]({{< relref "http_request_smuggling.md" >}}) 很相似）

那么从最常用的 trim/strip 函数入手，不同语言的实现存在一些区别。比如 python 的
`strip()` 会清除 `\x85` ，而 JavaScript 的 `trim()` 不会；Nginx 使用的 C 语言会清除
`\x09 \xa0 \x0c` 等字符，JavaScript 也不会。这种实现上的差异会导致 [HTTP Desync 漏洞]({{< relref "http_desync_attack.md" >}})

如图所示，由于 Nginx 不会清除路径中的特殊字符，会将请求放行；而后端的 NodeJS 清
除了特殊字符后会将请求路由到 /admin 页面，导致越权访问

{{< figure src="/ox-hugo/_20241214_223415screenshot.png" >}}

针对 NodeJS 实现的后端服务，可以参照以下表格绕过 Nginx ACL

| Nginx Version | Node.js Bypass Characters |
|---------------|---------------------------|
| 1.22.0        | \xA0                      |
| 1.21.6        | \xA0                      |
| 1.20.2        | \xA0, \x09, \x0C          |
| 1.18.0        | \xA0, \x09, \x0C          |
| 1.16.1        | \xA0, \x09, \x0C          |

针对 Flask 实现的后端服务（或者其他 python 实现应该也适用？）

| Nginx Version | Flask Bypass Characters                        |
|---------------|------------------------------------------------|
| 1.22.0        | \x85, \xA0                                     |
| 1.21.6        | \x85, \xA0                                     |
| 1.20.2        | \x85, \xA0, \x1F, \x1E, \x1D, \x1C, \x0C, \x0B |
| 1.18.0        | \x85, \xA0, \x1F, \x1E, \x1D, \x1C, \x0C, \x0B |
| 1.16.1        | \x85, \xA0, \x1F, \x1E, \x1D, \x1C, \x0C, \x0B |

针对 SpringBoot

| Nginx Version | Spring Boot Bypass Characters |
|---------------|-------------------------------|
| 1.22.0        | ;                             |
| 1.21.6        | ;                             |
| 1.20.2        | \x09, ;                       |
| 1.18.0        | \x09, ;                       |
| 1.16.1        | \x09, ;                       |
