---
title: "Nginx Off-By-Slash"
author: ["4shen0ne"]
draft: false
---

这个配置错误指的是由于缺少一个斜杠，可能导致路径穿越问题。OrangeTsai 在 blackhat
演讲《Breaking Parser Logic》中让这项技术广为人知。

在这个演讲中，他展示了如何结合一条缺少尾斜杠的 location 指令与一条 alias 指令，来读
取 Web 应用程序的源代码。鲜为人知的是，它还可以与其他指令（例如 proxy_pass）一起
使用。我们来分解一下究竟发生了什么事情，以及为什么它能起作用。

```nil
location /api {
    proxy_pass http://apiserver/v1/;
}
```

如果一个 Nginx 服务器运行上述配置，则可以假定访问者只能访问 `http://apiserver/v1/`
下的路径

<http://server/api/user> --&gt; <http://apiserver/v1//user>

当请求 `http://server/api/user` 时，Nginx 将首先规范化 URL，然后它会查看前缀
`/api` 是否与 URL 匹配，在本例中是匹配的

然后，服务器从 URL 中删除该前缀，保留 `/user` 路径，再将此路径添加到 proxy_pass URL
中，得到最终 URL `http://apiserver/v1//user`

请注意，这个 URL 中存在双斜杠，因为 location 指令不以单斜杠结尾，并且 proxy_pass
URL 路径以单斜杠结尾。大多数 Web 服务器会将 `http://apiserver/v1//user` 标准化为
`http://apiserver/v1/user` ，这意味着即使配置错误所有内容仍将按预期运行，并且可能
不会引起注意。想要利用这种错误配置，可以请求 `http://server/api../` ，这将导致
Nginx 请求 URL `http://apiserver/v1/../` ，其标准化为 `http://apiserver/` 。这可能产
生的影响取决于利用这种错误配置可以达到的效果，例如，这可能导致 Apache 服务器状态
通过 URL `http://server/api../server-status` 公开，或者让不希望公开访问的路径被访
问

Nginx 服务器配置错误的一个迹象是：当 URL 中的一个斜杠被删除时，服务器仍会返回相同
的响应。例如，如果 `http://server/api/user` 和 `http://server/apiuser` 返回相同的响
应，则服务器可能容易受到攻击：

```nil
http://server/api/user -> http://apiserver/v1//user
http://server/apiuser -> http://apiserver/v1/user
```
