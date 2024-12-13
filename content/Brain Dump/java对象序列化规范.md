---
title: "Java对象序列化规范"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:18+08:00
tags: ["java"]
draft: false
---

## 体系架构 {#体系架构}


### 写出到对象流 {#写出到对象流}

writeObject 方法对特定 Java 对象进行序列化，并且递归序列化它引用的其他对象，构成
完整的序列化数据流。在流中，对其他对象的第一次引用会使其序列化或外部化
（externalized），并分配一个句柄（handle），后续对该对象的引用都会编码成该句柄，
以此压缩流的大小

对于 arrays, enum constants, objects of type Class, ObjectStreamClass, String 这
些类型的对象需要进行特殊处理，其他对象则需要实现 Serializable 或 Externalizable
接口

原始数据类型通过 DataOutput 接口的方法写出到流中，单字节和字节数组则通过
OutputStream 的方法写出。除非作为对象的可序列化属性，否则将原始数据写到流的
block-data 记录中，每个记录前面会表明该记录的字节长度


### 从对象流写入 {#从对象流写入}

使用 readObject 方法写入数据流，还原成完整的 Java 对象（包括引用对象）。

原始数据类型通过 DataInput 接口的方法读取，单字节和字节数组则通过 InputStream 的
方法读取。block-data 记录中的原始数据也需要读取


## 序列化相关类和方法 {#序列化相关类和方法}


## 反序列化相关类和方法 {#反序列化相关类和方法}


## 类描述符 {#类描述符}


### ObjectStreamClass {#objectstreamclass}

ObjectStreamClass 用于存储序列化数据流中的类的信息，包括全限定类名和 UID

```java
package java.io;

public class ObjectStreamClass
{
    public static ObjectStreamClass lookup(Class cl);

    public static ObjectStreamClass lookupAny(Class cl);

    public String getName();

    public Class forClass();

    public ObjectStreamField[] getFields();

    public long getSerialVersionUID();

    public String toString();
}
```


## 序列化对象版本 {#序列化对象版本}


## 对象序列化流协议 {#对象序列化流协议}

以下数据在流中有特殊的表示方式：null objects, new objects, 类，数组，字符串，以
及对已存在的对象的引用

每个写入到流中的对象都会分配一个 handle 用来引用该对象，handel 从 `0x7E0000` 开始
递增

> An ObjectStreamClass object for a Class that is <span class="underline">not a dynamic proxy class</span> is represented by the following:
>
> -   The Stream Unique Identifier (SUID) of compatible classes.
> -   A set of flags indicating various properties of the class, such as whether the
>     class defines a writeObject method, and whether the class is serializable,
>     externalizable, or an enum type
> -   The number of serializable fields
> -   The array of fields of the class that are serialized by the default
>     mechanismFor arrays and object fields, the type of the field is included as a
>     string which must be in "field descriptor" format (e.g., "Ljava/lang/Object;")
>     as specified in The Java Virtual Machine Specification.
> -   Optional block-data records or objects written by the annotateClass method
> -   The ObjectStreamClass of its supertype (null if the superclass is not serializable)
>
> An ObjectStreamClass object for <span class="underline">a dynamic proxy class</span> is represented by the following:
>
> -   The number of interfaces that the dynamic proxy class implements
> -   The names of all of the interfaces implemented by the dynamic proxy class,
>     listed in the order that they are returned by invoking the getInterfaces
>     method on the Class object.
> -   Optional block-data records or objects written by the annotateProxyClass method.
> -   The ObjectStreamClass of its supertype, java.lang.reflect.Proxy.

java8: <https://docs.oracle.com/javase/8/docs/platform/serialization/spec/protocol.html>
java17: <https://docs.oracle.com/en/java/javase/17/docs/specs/serialization/protocol.html>
