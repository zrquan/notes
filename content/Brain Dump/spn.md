---
title: "Service Principal Names"
author: ["4shen0ne"]
tags: ["ad"]
draft: false
---

## 简介 {#简介}

Service Principal Names，服务主体名称，是服务实例（比如 HTTP、MSSQL）的唯一标识符。
Kerberos 身份验证使用 SPN 将服务实例与服务登录帐户相关联，如果想使用 Kerberos 协
议来认证服务，那么必须正确配置 SPN。

SPN 有两种类型：

1.  注册在域的机器帐户下（Computers），此时服务的权限为 Local System 或 Network
    Service
2.  注册在域用户帐户下（Users），此时服务的权限即为域用户权限

{{< figure src="/ox-hugo/2021-10-20_17-07-01_screenshot.png" >}}


## SPN 格式 {#spn-格式}

```text
<service class>/<host>:<port> <service name>
```

-   service class：标识服务类的字符串
-   host：服务所在主机的名称
-   port：服务端口
-   service name：服务名称

可以通过 setspn 命令注册 SPN 实例，以下分别以 web 用户和机器用户构建 http 服务：

```nil
setspn -s http/WebDemo_PC.rcoil.me rcoil\web
setspn -s http/WebDemo_PC.rcoil.me WebDemo_PC$
```

setspn 命令也可以用户 SPN 查询，用于发现域内开放的服务：

```text
setspn -T rcoil.me -Q */* | findstr "MSSQLSvc"
```
