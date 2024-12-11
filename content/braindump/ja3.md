---
title: "JA3"
author: ["4shen0ne"]
draft: false
---

JA3 是一种利用 [TLS]({{< relref "tls.md" >}}) 协商阶段中的 `Client Hello` 包来提取客户端指纹的方法，JA3S 则是
通过 `Server Hello` 包来提取服务端指纹的方法。

JA3 方法按照顺序提取 `Client Hello` 包中的以下字段：Version, Accepted Ciphers,
List of Extensions, Elliptic Curves, 和 Elliptic Curve Formats。然后使用逗号 `,`
分割不同的字段，使用横杠 `-` 分割字段的不同值。

{{< figure src="/ox-hugo/_20240713_211742screenshot.png" >}}

最后经过 MD5 计算得到 32 个字符的 JA3 指纹：

```text
769,47–53–5–10–49161–49162–49171–49172–50–56–19–4,0–10–11,23–24–25,0 → ada70206e40642a3e4461f35503241d5
```

JA3S 方法同理，提取的是 `Server Hello` 包中的以下字段：Version, Accepted Cipher,
and List of Extensions。

源码：<https://github.com/salesforce/ja3>
