---
title: "BSON"
author: ["4shen0ne"]
draft: false
---

BSON 是 Binary JSON 的缩写，顾名思义是一种二进制形式的 JSON 数据格式，主要用于
[MongoDB]({{< relref "mongodb.md" >}})。BSON 数据中包含了对象的数据类型和长度，使其遍历效率高于 JSON，同时也拥
有更高的存储效率，支持更多的数据类型（比如 Date 和 Bianry data）。

下面两个例子是 JSON 和其对应的 BSON 格式：

```json
{"hello": "world"} →
\x16\x00\x00\x00           // total document size
\x02                       // 0x02 = type String
hello\x00                  // field name
\x06\x00\x00\x00world\x00  // field value
\x00                       // 0x00 = type EOO ('end of object')

{"BSON": ["awesome", 5.05, 1986]} →
\x31\x00\x00\x00
 \x04BSON\x00
 \x26\x00\x00\x00
 \x02\x30\x00\x08\x00\x00\x00awesome\x00
 \x01\x31\x00\x33\x33\x33\x33\x33\x33\x14\x40
 \x10\x32\x00\xc2\x07\x00\x00
 \x00
 \x00
```
