---
title: "T3 Protocol"
author: ["4shen0ne"]
draft: false
---

## 协商部分 {#协商部分}

WebLogic 中的 RMI 通信是使用 T3 协议来传输序列化数据的，可以看成是原生 RMI 使用
的 JRMP 协议的定制版。T3 协议的数据包分为请求头和请求体两部分，请求头形如：

```nil
t3 12.2.3
AS:255
HL:19
MS:10000000
```

HL 头标识后面发起的 T3 协议头长度；AS 头用来标识 T3 反序列化时用的 stack 的容量。

响应形如：

```nil
HELO:12.1.3.0 false
AS:2048
HL:19
MS:10000000
```

注意请求响应都以 `\n\n` 结尾，且响应包中包含 WebLogic 的版本号。


## 协议头部 {#协议头部}

请求主体分为 7 个部分，第 1 部分为协议头，它的前 19 字节(前面 HL 的值)包含一些重要字段。

{{< figure src="/ox-hugo/2021-08-24_14-17-55_v2-6091f1cfe24de05cdb9f1a83fb3e1cf6_1440w.jpg" >}}

| cmd          | 请求类型                               |
|--------------|------------------------------------|
| QOS          | ?                                      |
| flag         | 标识位                                 |
| responseId   | 标识 TCP 流不同请求的顺序，从 -1 开始，作用类似 TCP 的 SYN |
| invokeableId | 服务端将根据这个字段的值去查找响应的处理程序 |
| abbrevOffset | abbrev 这个数据结构在本次请求中相对于开始部分的偏移 |


## T3 Abbrev {#t3-abbrev}

MsgAbbrevs 结构体，这个数据结构我不能很好的描述它，因为 T3 协议并没有全部实现 java 反
序列化协议，而是自己由魔改了一部分。比如 readClassDescriptor 的 class 部分，T3 协议在
abbrevs 中读取。

这里将会跳转到 abbrevOffset 标识的部分并开始读取数据。代码如下：

```java
void read(MsgAbbrevInputStream in, BubblingAbbrever at) throws IOException, ClassNotFoundException {
    int numAbbrevs = in.readLength();

    for(int i = 0; i < numAbbrevs; ++i) {
        int abbrev = in.readLength();
        Object o;
        if (abbrev > at.getCapacity()) {
            o = this.readObject(in);
            at.getAbbrev(o);
            this.abbrevs.push(o);
        } else {
            o = at.getValue(abbrev);
            this.abbrevs.push(o);
        }
    }
}
```

首先读取 msgAbbrev 的数量。然后再读取 length，如果 length 大于本次 T3 请求中存放 abbrev
的容量，则读取对象，否则读取值。而本次 T3 请求的 abbrev 的容量，就是由前面协议协商的
AS 标识的值，默认为 255。


## <span class="org-todo todo TODO">TODO</span> T3 Context {#t3-context}

剩下的 6 个部分是 Java 的序列化数据，以 `ac ed 00 05` 开头。那么对 WebLogic 实施反序
列化攻击可以有两个思路：将某个序列化部分替换成 payload，或者在第 1 部分后面拼接
payload。

{{< figure src="/ox-hugo/2021-08-23_11-47-35_1993669-20201218164326263-1518550000.png" >}}

T3 协议结构：<https://www.exploit-db.com/exploits/46628>
