---
title: "VueJS Security"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:09+08:00
draft: false
---

vue.js 通常使用 {{}} 或者 v-text 指令进行数据绑定，vue.js 会自动将模板编译成对应
的 js 代码

模板代码：

```html
<p v-text="message"></p>
```

实际 js 代码：

```javascript
function anonymous() {
  with(this) {
    return _c('p', {
      domProps: {
        "textContent": _s(message)
      }
    }, [])
  }
}
```

可以看到数据绑定实际是通过 textContent 来实现 DOM 值的插入，在这种情况下浏览器不
会对内容进行解析，也就不存在 xss 问题。不过为了应对富文本输入的需求，vue.js 还有
一个 v-html 指令，会使数据被当作 html 代码解析

模板代码：

```html
<p v-html="message"></p>
```

实际 js 代码：

```js
function anonymous() {
  with(this) {
    return _c('p', {
      domProps: {
        "innerHTML": _s(message)
      }
    }, [])
  }
}
```

vue.js 服务端模板注入：服务端渲染模版本身是为了提前生成 html，利于某些站点的 seo
和加快页面加载，如果对模版中用户数据处理不当，就会导致模版注入的问题。

尝试输入 `{{ 2+2 }}`, 如果输入点存在服务端模板注入，会返回 4
