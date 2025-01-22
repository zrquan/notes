---
title: "利用 URN 绕过 URL 检查"
author: ["4shen0ne"]
draft: false
---

示例代码：

```js
const getParam = (key) => {
    return new URL(location).searchParams.get(key)
}

const nextURL = getParam('next')

if (nextURL) {
    const u = new URL(nextURL)
    location.href = "" + u.pathname
}
```

代码从 next 参数中获取路径地址来进行跳转，那么想到如果参数值为 javsscript:alert(1)
可以进行 XSS. 然而，通常情况下 pathname 属性会在值的前面加上斜杠，所以跳转地址为
/javascript:alert(1), 无法执行

根据 [whatwg 的规范](https://url.spec.whatwg.org/#url-cannot-be-a-base-url-flag), URL 可以有一个相关联的 blob URL 条目，而这个条目在解析为
pathname 时 cannot-be-a-base-URL 为 true, 因此等价于 `path[0]`

比如下面代码都可以得到 javascript:alert(1)：

```js
new URL("urn:javascript:alert(1)").pathname
new URL('a:javascript:alert(1)').pathname
```
