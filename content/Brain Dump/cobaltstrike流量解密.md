---
title: "CobaltStrike流量解密"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:06+08:00
draft: false
---

## 加密算法 {#加密算法}

[CobaltStrike]({{< relref "cobaltstrike.md" >}}) 服务端和客户端是通过 [SSL]({{< relref "ssl_tsl_协议运行机制.md" >}}) 加密通讯的(默认证书对 cobaltstrike.store)

Beacon 的元数据传输过程虽然使用的是 [RSA]({{< relref "rsa加密算法.md" >}}) 算法，但是 Beacon 任务的传输使用的却是
[AES]({{< relref "aes.md" >}}) 算法加密的，而 AES 密钥则是 Beacon 随机生成的然后通过 RSA 交换 AES 密钥。加解
密算法为 AES ，密钥位长 128 ，CBC 模式，填充标准 PKCS7 ，其通信具体流程如下：

{{< figure src="/ox-hugo/_20231219_143942screenshot.png" >}}


## 流量传递 {#流量传递}

CobaltStrike 分为 客户端 与 服务端 ，服务端是一个，客户端可以有多个，可被团队进
行分布式协作操作。

CobaltStrike 的 Beacon 支持异步通信和交互式通信。Beacon 可以选择通过 DNS 还是 HTTP
协议出口网络，你甚至可以在使用 Beacon 通讯过程中切换 HTTP 和 DNS。其支持多主机连
接，部署好 Beacon 后提交一个要连回的域名或主机的列表，Beacon 将通过这些主机轮询。

http-beacon 通信中，默认使用 GET 方法向 /dpixel 、/\__utm.gif 、/pixel.gif 等地址
发起请求，同时 CobaltStrike 的 Beacon 会将元数据（例如 AES 密钥）使用 RSA 公钥加密
后发送给 C2 服务器。这些元数据通常被编码为 Base64 字符串并作为 Cookie 发送。

```text
http-get {

    set uri "/news/pictures/animals/cat.jpg /ca /dpixel /__utm.gif /pixel.gif /g.pixel /dot.gif /updates.rss /fwlink /cm /cx /pixel /match /visit.js /load /push /ptj /j.ad /ga.js /en_US/all.js /activity /IE9CompatViewList.xml"; # 设置get请求涉及到的uri，get请求一般是心跳包，beacon会随机从里面找一个请求

    client {
		...
    }

    server {
    	...
    }
}
```

{{< figure src="/ox-hugo/_20231219_151301screenshot.png" >}}

下发指令的时候会请求 `/submit.php?id=一串数字` ，同时 POST 传递了一串 `0000` 开头的
16 进制数据，这是 cs 流量的发送任务数据

{{< figure src="/ox-hugo/_20231219_151347screenshot.png" >}}


## 流量解密 {#流量解密}

因为这里是拿 CTF 题目来讲的，所以必定会提供 .cobaltstrike.beacon_keys 文件，同时
该文件本质上为 KeyPair 的 Java 对象，Python 的 javaobj-py3 库可以直接读取里面存
储的数据。

然后我们再通过私钥解密元数据、获取 AES KEY，其中 encode_data 为元数据，也就是前
面提到的 cookie 的值

CobaltStrike 的 Beacon 通信主要依赖于 AES key 和 HMAC key。这两个密钥都是由
Beacon 在每次执行时随机生成的 16 字节数据。

-   AES key：这个密钥用于加密和解密 Beacon 与 C2 服务器之间的通信内容。具体来说，
    它用于 AES 算法，该算法用于加密和解密 Beacon 任务的传输。
-   HMAC key：这个密钥用于验证数据的完整性和真实性。HMAC(Hash-based Message
    Authentication Code)是一种基于密钥的哈希算法，用于在不安全的通信环境中验证消息
    的完整性和真实性。

这两个密钥都是由同一组 16 字节数据生成的。具体来说，这组 16 字节数据的 SHA256 哈
希的前半部分作为 HMAC 密钥，后半部分作为 AES 密钥。
