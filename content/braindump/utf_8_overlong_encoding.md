---
title: "UTF-8 Overlong Encoding"
author: ["4shen0ne"]
draft: false
---

这是一种利用 UTF-8 编码规则的缺陷，构造特殊编码绕过 waf 的攻击技巧


## UTF-8 {#utf-8}

> UTF-8（8-bit Unicode Transformation Format）是一種針對 Unicode 的可變長度字元編
> 碼，也是一种前缀码。它可以用一至四个字节对 Unicode 字符集中的所有有效编码点进行
> 编码，属于 Unicode 标准的一部分

根据字节长度，UTF-8 使用不同的分组转换规则，并适当补完前缀。参考表格：

| First code point | Last code point | Byte 1   | Byte 2   | Byte 3   | Byte 4   |
|------------------|-----------------|----------|----------|----------|----------|
| U+0000           | U+007F          | 0xxxxxxx |          |          |          |
| U+0080           | U+07FF          | 110xxxxx | 10xxxxxx |          |          |
| U+0800           | U+FFFF          | 1110xxxx | 10xxxxxx | 10xxxxxx |          |
| U+10000          | U+10FFFF        | 11110xxx | 10xxxxxx | 10xxxxxx | 10xxxxxx |

举个例子，欧元符号€的 unicode 编码是 U+20AC ，按照如下方法将其转换成 UTF-8 编码：

1.  U+20AC 位于 U+0800 和 U+FFFF 之间，参考上表需要编码成三个字节
2.  0x20AC 的二进制是 `10 0000 1010 1100`, 按照表格中「x」从右往左分成 4/6/6 三组，
    剩下 Byte1 如果不足 4 位就补 0。得到 0010/000010/101100
3.  再按照表格补完前缀：11100010/10000010/10101100
4.  对应到 hex 编码就是 \xE2\x82\xAC，即欧元符号€的 UTF-8 编码


## Overlong Encoding 问题 {#overlong-encoding-问题}

通过在前面补零的方式，我们可以将原本编码成一个字节的字符，强行转换成两个字节甚至
更多

比如 ascii 字符点「.」的 UTF-8 编码应该和 ascii 编码一致，都是 0x2E

-   0x2E 的二进制是 101110, 在前面填充 5 个零变成 00000101110
-   然后按照表格第二行转换成 11000000/10101110, 即 \xC0AE

0xC0AE 并不是一个合法的 UTF-8 字符（在 python 中 decode 会报错），但我们确实是按照 UTF-8
编码方式将其转换出来的，这就是 UTF-8 设计中的一个缺陷

在 Java 生态中存在一些解码实现，没有处理 Overlong Endocing 的问题，导致可以使用
变长的编码绕过 waf 判断

-   [GlassFish 任意文件读取漏洞](https://github.com/vulhub/vulhub/tree/master/glassfish/4.1.0)
-   Java 在反序列化时使用 ObjectInputStream 类，这个类实现了 DataInput 接口，这个接口定
    义了读取字符串的方法 readUTF。在解码中，Java 实际实现的是一个魔改过的 UTF-8 编码，
    名为「Modified UTF-8」

    Modified UTF-8 类似于 MySQL 中的 UTF-8，只用三个字节来编码，但编码规则和普通
    UTF-8 一样，所以在三个字节内仍让存在 Overlong Encoding 问题

    因此，在 Java 反序列化利用时，可以尝试使用这个技巧绕过类名黑名单之类的过滤


## 转换脚本 {#转换脚本}

用于将一个 ASCII 字符串转换成 Overlong Encoding 的 UTF-8 编码

```python
def convert_int(i: int) -> bytes:
    b1 = ((i >> 6) & 0b11111) | 0b11000000
    b2 = (i & 0b1111111) | 0b10000000
    return bytes([b1, b2])


def convert_str(s: str) -> bytes:
    bs = b''
    for ch in s.encode():
        bs += convert_int(ch)

    return bs


if __name__ == '__main__':
    print(convert_str('.')) # b'\xc0\xae'
    print(convert_str('org.example.Evil')) # b'\xc1\xef\xc1\xf2\xc1\xe7\xc0\xae\xc1\xe5\xc1\xf8\xc1\xe1\xc1\xed\xc1\xf0\xc1\xec\xc1\xe5\xc0\xae\xc1\xc5\xc1\xf6\xc1\xe9\xc1\xec'
```
