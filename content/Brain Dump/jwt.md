---
title: "JSON Web Token"
author: ["4shen0ne"]
lastmod: 2024-12-14T17:27:18+08:00
draft: false
---

## 简介 {#简介}

JWT（JSON Web Token）是一种身份认证机制，工作原理是：服务器在验证了用户身份后，
返回给用户一个不可篡改的 JSON 对象，以识别用户的身份。然后用户每次请求都带上这个
JSON 对象用来表明身份，服务端就不需要为每个用户保存 session 数据了

JWT 最重要的特性是不可篡改，这点通过[数字签名](https://www.ruanyifeng.com/blog/2011/08/what_is_a_digital_signature.html)来实现，因此服务端可以信任客户端发来
的数据，并以此判断用户身份

JWT 的数据结构如下图所示：

{{< figure src="/ox-hugo/2021-01-02_23-54-35_2020-11-08_21-50-11_2020-10-14_20-59-32_jwt.jpeg" >}}

JWT 的加密字串（图左）分为三个部分，以 . 分割，分别是 Header、Payload 和
Signature，每个部分使用 BASE64URL 算法编码。

-   Header
    描述 JWT 的元数据，alg 属性表示签名的算法，默认是 HMAC SHA256（HS256），typ 属
    性表示这个令牌的类型。

-   Payload
    要传递的数据主体，一般用来存放可以识别用户身份的字段。除了自定义字段，官方还规定了以下 7 个字段：
    1.  iss (issuer)：签发人
    2.  exp (expiration time)：过期时间
    3.  sub (subject)：主题
    4.  aud (audience)：受众
    5.  nbf (Not Before)：生效时间
    6.  iat (Issued At)：签发时间
    7.  jti (JWT ID)：编号

-   Signature
    Signature 部分是对前两部分的签名，防止数据篡改。首先，需要指定一个密钥
    （secret），这个密钥只有服务器知道，不能泄露给用户。然后，使用 Header 里面指定
    的签名算法（默认是 HMAC SHA256），按照下面的公式产生签名。

    ```text
    HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), your-256-bit-secret)
    ```


## 特点 {#特点}

1.  默认是不加密的，只是进行的编码。

2.  JWT 不仅可以用来认证，也可以交换信息，减少服务端存储和查询数据的开销。

3.  由于 JWT 是保存在客户端的，服务端没有保存相关的状态信息，所以在某个 token 过
    期前不能更改其权限。

4.  因为服务器是靠 JWT 识别用户身份的，一旦泄露，用户的身份和权限就会被盗用。因此，
    JWT 的有效期应该较短，而且使用 HTTPS 协议传输。


## 攻击方式 {#攻击方式}

1.  修改签名算法

    JWT 的签名不是强制性的，用户可以将 Header 的 alg 属性修改成 none，系统就会从
    JWT 中删除相应的签名数据。没有签名，服务器就无法判断数据是否被篡改过。

    例子：<https://www.cvedetails.com/cve/CVE-2018-1000531/>

2.  删除签名

    直接删除 Signature 部分，服务器依然会完成认证，也就是没有对签名进行确认。

    例子：<https://github.com/FusionAuth/fusionauth-jwt/issues/2>

3.  插入错误信息

    当服务器验证签名失败时，可能会在错误信息中返回正确的签名，导致签名没有效果。

    例子：<https://auth0.com/docs/security/bulletins/cve-2019-7644>

4.  破解 HS256 密钥

    当密钥的强度较低时，可以尝试使用以下工具进行暴力破解：

    -   c-jwt-cracker：<https://github.com/brendan-rius/c-jwt-cracker>
    -   hashcat：<https://github.com/hashcat/hashcat/issues/1057>
    -   PyJWT library：<https://github.com/jpadilla/pyjwt>

5.  将 RS256 算法改为 HS256

    当使用非对称加密算法 [RSA]({{< relref "rsa加密算法.md" >}}) 时，会生成一对密钥，私钥用来签名，对应的公钥用来验证
    签名；而 HS256 算法只有一对密钥用于签名和认证。由于攻击者有时可以获取公钥，因
    此，攻击者可以将头部中的算法修改为 HS256，然后使用 RSA 公钥进行签名验证。这时，
    后端可能会使用“RSA 公钥 + HS256 算法”进行签名验证。

    例子：<https://www.cvedetails.com/cve/CVE-2016-10555/>
