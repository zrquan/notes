---
title: "Kerberos"
author: ["4shen0ne"]
tags: ["ad"]
draft: false
---

## 相关术语 {#相关术语}

委托人（principal）：是一个具有唯一标识的实体，可以是一台计算机或一项服务，通过
使用 KDC 颁发的票据来进行通信。委托人可以分为两类：用户和服务，分别具有不同种类
的标识符。用户通过如 `user@REALM` 格式的用户主体名称（User Principal Name，简称
UPN）来标识，记住 REALM 一定是大写的。例如用户 bob 在 bhusa.com 域中应该表示为
`bob@BHUSA.COM` 。

服务主体名称（[Service Principal Name，SPN]({{< relref "spn.md" >}})）：用于域中的服务和计算机账户。SPN 的
格式形如 `serviceclass/host_port/serviceName` 。例如， 主机 dc1.bhusa.com 上 LDAP
服务的 SPN 可能类似于 ldap/dc1.bhusa.com， ldap/dc1 和
ldap/dc1.bhusa.com/bhusa.com。参考全限定主机名和仅主机名，一个服务可能注册为多
个 SPN

DNS：活动目录极度依赖 DNS，因为 DNS 可以让 AD 表现出层次结构化的树状结构，同时
也可以和开放的目录标准接轨，因此在搭建域时时，DNSService（或另有架设 DNS Server）
一定要存在于网络或该网域控制站中，不单单是资源查找需要 DNS，客户端请求 DC 时同
样需要它，通过 SRV 记录识别。

NetBIOS：Network Basic Input/Output System，它提供了 OSI 模型中的会话层 Service，
让在不同计算机上运行的不同程序，可以在局域网中互相连线以及分享数据，相当于一个
API。

MS-RPC：远程调用，可以更加快速的构造出 client/server 端模型，像 Windows Server
的域协议完全是基于 MS-RPC，以及 DNS 管理工具和 Microsoft Exchange Server。


## 认证步骤 {#认证步骤}

1.  客户端对用户口令执行 hash 运算。此散列值（即用户密钥）成为客户端和 KDC 共享的
    长期密钥（long term key）。

2.  KRB_AS_REQ：客户端加密一个时间戳，然后发送给身份验证服务（AS）。

3.  KRB_AS_REP：身份验证服务会解密时间戳，若解密成功，表明了客户端获得某个特定用
    户的口令（即验证了用户的身份）。AS 向客户端回复两条消息：
    -   短期会话密钥（Session Key），用于客户端向 KDC 发起后续的请求，该消息经客
        户端的长期密钥加密。（此短期会话密钥仅适用于该客户端和 KDC 之间）

    -   票据授予票据（Ticket Granting Ticket，TGT），包含有关用户名、域名、时间和
        组成员资格等信息。该消息经 **仅 KDC 可知** 的密钥加密（krbtgt 账户的 NT-Hash）。

        **KDC 不记录状态：客户端每次请求访问一项服务时，TGT 都会被转发**

4.  KRB_TGS_REQ：客户端使用 AS 返回的 Session Key 构建访问特定服务的请求，客户端
    把 TGT 连同请求一起发送到票据授予服务（TGS）。

5.  KRB_TGS_REP：票据授予服务解密 TGT 和服务请求，然后如果请求被允许，票据授予服
    务向客户端发送一个服务票据（Service Ticket，ST）。ST 包括两部分：
    -   远程服务器的部分：包含请求用户的组成员资格、时间戳、用于客户端和远程服务
        器之间通信的会话密钥。使用 **远程服务器** 和 KDC 共享的长期密钥加密这部分消息。

    -   客户端的部分：包含用于客户端和远程服务器之间通信的会话密钥。使用步骤
        KRB_AS_REP 中得到的短期会话密钥加密这部分消息。

6.  KRB_AP_REQ：客户端把 ST 中的远程服务器部分和请求一起发送到远程服务器。远程服
    务器将直接接受该服务器票据，并不需要和 KDC 通信，因为该票据是用远程服务器和
    KDC 共享的长期密钥加密过的，解密成功即表明 KDC 已经允许了此次通信。

Kerberos 协议是无状态的，KDC 和 TGS 并没记录以前的交互信息，因此 TGS 所需使用的
全部信息都在 TGT 中。因为 TGT 使用 krbtgt 的密码加密过，理论上只有两方能够解密
TGT：颁发票据的 KDC 和接受票据并创建访问网络资源的服务票据的 TGS。这种情况让
krbtgt 成为域中最重要的密码，只要 TGT 被 krbtgt 账户密码正确地加密，TGT 中的所有
信息都是可信的。


## pass-the-ticket {#pass-the-ticket}

在微软活动目录中颁发的 TGT 是可移植的。由于 Kerberos 的无状态特性，TGT 中并没有
关于票据来源的标识信息。这意味着可以从某台计算机上导出一个有效的 TGT，然后导入到
该环境中其他的计算机上。新导入的票据可以用于域的身份认证，并拥有票据中指定用户的
权限来访问网络资源。


## AS_REQ {#as-req}

用户向 KDC 发送请求, 请求凭据是用户 hash 加密的时间戳

-   pvno
    kerberos 版本号

-   msg-type
    类型, AS_REQ 对应的就是 KRB_AS_REQ(0x0a)

-   `PA_DATA`
    一个列表, 保存了一些认证用的数据和值
    ```nil
      NONE = 0,
    ​  TGS_REQ = 1,
    ​  AP_REQ = 1,
    ​  ENC_TIMESTAMP = 2,
    ​  PW_SALT = 3,
    ​  ENC_UNIX_TIME = 5,
    ​  SANDIA_SECUREID = 6,
    ​  SESAME = 7,
    ​  OSF_DCE = 8,
    ​  CYBERSAFE_SECUREID = 9,
    ​  AFS3_SALT = 10,
    ​  ETYPE_INFO = 11,
    ​  SAM_CHALLENGE = 12,
    ​  SAM_RESPONSE = 13,
    ​  PK_AS_REQ_19 = 14,
    ​  PK_AS_REP_19 = 15,
    ​  PK_AS_REQ_WIN = 15,
    ​  PK_AS_REQ = 16,
    ​  PK_AS_REP = 17,
    ​  PA_PK_OCSP_RESPONSE = 18,
    ​  ETYPE_INFO2 = 19,
    ​  USE_SPECIFIED_KVNO = 20,
    ​  SVR_REFERRAL_INFO = 20,
    ​  SAM_REDIRECT = 21,
    ​  GET_FROM_TYPED_DATA = 22,
    ​  SAM_ETYPE_INFO = 23,
    ​  SERVER_REFERRAL = 25,
    ​  TD_KRB_PRINCIPAL = 102,
    ​  PK_TD_TRUSTED_CERTIFIERS = 104,
    ​  PK_TD_CERTIFICATE_INDEX = 105,
    ​  TD_APP_DEFINED_ERROR = 106,
    ​  TD_REQ_NONCE = 107,
    ​  TD_REQ_SEQ = 108,
    ​  PA_PAC_REQUEST = 128,
    ​  S4U2SELF = 129,
    ​  PA_PAC_OPTIONS = 167,
    ​  PK_AS_09_BINDING = 132,
    ​  CLIENT_CANONICALIZED = 133
    ```
    AS_REQ 用到的数据有两个:

    1.  ENC_TIMESTAMP
        这个是预认证，就是用用户 hash 加密时间戳，作为 value 发送给 AS 服务器。然后 AS 服
        务器那边有用户 hash，使用用户 hash 进行解密，获得时间戳，如果能解密，且时间戳
        在一定的范围内，则证明认证通过

    2.  PA_PAC_REQUEST
        这个是启用 PAC 支持的扩展。PAC(Privilege Attribute Certificate)并不在原生的
        kerberos 里面，是微软引进的扩展。PAC 包含在 AS_REQ 的响应 body(AS_REP)。这里的
        value 对应的是 include=true 或者 include=false(KDC 根据 include 的值来判断返回的票
        据中是否携带 PAC)。

        {{< figure src="/ox-hugo/2021-10-26_00-32-58_screenshot.png" >}}

<!--listend-->

-   REQ_BODY
    -   kdc-options, 一些 flag 字段
        ```nil
            VALIDATE = 0x00000001,
        ​    RENEW = 0x00000002,
        ​    UNUSED29 = 0x00000004,
        ​    ENCTKTINSKEY = 0x00000008,
        ​    RENEWABLEOK = 0x00000010,
        ​    DISABLETRANSITEDCHECK = 0x00000020,
        ​    UNUSED16 = 0x0000FFC0,
        ​    CANONICALIZE = 0x00010000,
        ​    CNAMEINADDLTKT = 0x00020000,
        ​    OK_AS_DELEGATE = 0x00040000,
        ​    UNUSED12 = 0x00080000,
        ​    OPTHARDWAREAUTH = 0x00100000,
        ​    PREAUTHENT = 0x00200000,
        ​    INITIAL = 0x00400000,
        ​    RENEWABLE = 0x00800000,
        ​    UNUSED7 = 0x01000000,
        ​    POSTDATED = 0x02000000,
        ​    ALLOWPOSTDATE = 0x04000000,
        ​    PROXY = 0x08000000,
        ​    PROXIABLE = 0x10000000,
        ​    FORWARDED = 0x20000000,
        ​    FORWARDABLE = 0x40000000,
        ​    RESERVED = 0x80000000
        ```

    -   `cname`, PrincipalName 类型
        在 AS_REQ 里面 cname 是请求的用户, 这个用户名存在和不存在, 返回的包有差异, 可以
        用于枚举域内用户名。

        用户名错误

        {{< figure src="/ox-hugo/2021-10-26_00-33-45_screenshot.png" >}}

        密码错误

        {{< figure src="/ox-hugo/2021-10-26_00-34-22_screenshot.png" >}}

    -   sname, PrincipalName 类型
        在 AS_REQ 里面 sname 是 krbtgt，类型是 KRB_NT_SRV_INST

    -   realm, 域名

    -   from, 发送时间

    -   till, 到期时间
        rubeus 和 kekeo 都是 `20370913024805Z`, 这个可以作为特征来检测

    -   nonce, 随机数
        kekeo/mimikatz nonce 是 12381973, rubeus nonce 是 1818848256, 这个也可以用来作为
        特征检测

    -   etypr, 加密类型


## AS_REP {#as-rep}

KDC 使用用户 hash 进行解密，如果结果正确返回用 krbtgt hash 加密的 TGT 票据，TGT 里面包
含 PAC, PAC 包含用户的 sid、用户所在的组

-   msg-type
    AS_REQ 的响应 body 对应的就是 KRB_AS_REP(0x0b)

-   crealm, 域名

-   cname, 用户名

-   `ticket`
    使用 krbtgt hash 加密的 ticket, 用于 TGS_REQ 的认证, 用户不能读取其内容
    如果拥有 krbtgt hash 就可以自行制作 ticket, 即黄金票据

-   `enc_part`
    这部分是可以解密的，key 是用户 hash，解密后得到 Encryptionkey，
    Encryptionkey 里面最重要的字段是 session key，作为下阶段的认证密钥


## TGS_REQ {#tgs-req}

TGS_REQ 这个阶段不需要账号密码，需要 AS_REP 获取到的 TGT 凭据(ticket)

-   msg-type
    类型，TGS_REQ 对应的就是 KRB_TGS_REQ(0x0c)

-   PA-DATA
    -   AP_REQ
        这个是 TGS_REQ 必须携带的部分，这部分会携带 AS_REP 里面获取到的 TGT 票据，就放在这
        个结构体里面。KDC 校验 TGT 票据，如果票据正确，就返回 TGS 票据(ST)。

    -   PA_FOR_USER
        类型是 S4U2SELF; 值是一个唯一的标识符, 该标识符指示用户的身份, 由
        用户名和域名组成。

    -   PA_PAC_OPTIONS
        类型是 PA_PAC_OPTIONS, 值是以下 flag 的组合
        ```nil
            -- Claims(0)
            -- Branch Aware(1)
            -- Forward to Full DC(2)
            -- Resource-based Constrained Delegation (3)
        ```

-   REQ_BODY
    -   sname
        要请求的服务, TGS_REP 获得的 ticket 是用该服务用户的 hash 进行加密的

    -   AddtionTicket
        附加票据，在 S4U2proxy 请求里面，既需要正常的 TGT，也需要 S4U2self
        阶段获取到的 TGT，那么这个 TGT 就添加到 AddtionTicket 里面。


## TGS_REP {#tgs-rep}

-   msg-type
    AS_REQ 的响应 body 对应的就是 KRB_TGS_REQ(0x0d)

-   ticket
    这个 ticket 用于 AP_REQ 的认证。其中里面的 enc_part 是加密的，用户不可读取里面的内容。
    在 AS_REQ 请求里面是，是使用 krbtgt 的 hash 进行加密的，而在 TGS_REQ 里面是使用要请求
    的服务的 hash 加密的。因此如果我们拥有服务的 hash 就可以自己制作一个 ticket，即白银
    票据。正因为是使用要请求的服务的 hash 加密的，所以我们可以通过爆破 enc_part 获得该
    服务的 hash, 详情见相关的安全问题&gt;[kerberoasting]({{< relref "kerberoasting.md" >}})

-   enc_part
    注意，这个 enc_part 不是 ticket 里面的 enc_part

    TGS_REP

    {{< figure src="/ox-hugo/2021-10-26_00-29-26_screenshot.png" >}}

    这部分是可以解密的, key 是上一轮 AS_REP 里面返回的 session_key, 也就是导入凭据里面
    的 session_key, 解密后得到 encryptionkey, encryptionkey 这个结构里面最重要的字段
    也是 session_key(但是这个 session_key 不同于上一轮里面的 session_key), 用来作为作
    为下阶段的认证密钥。


## S4U2SELF {#s4u2self}

S4U2self 使得服务可以代表用户获得针对服务自身的 kerberos 服务票据。这使得服务可以
获得用户的授权(可转发的用户 TGT)，然后将其用于后期的认证(主要是后期的 s4u2proxy)，
这是为了在用户以不使用 Kerberos 的方式对服务进行身份验证的情况下使用。

**服务代表用户获得针对服务自身的 kerberos 票据这个过程, 是不需要用户的凭据的, 但需要
服务已经有通过 KDC 验证的 TGT**


## PAC {#pac}

PAC 用于校验用户的权限, 即解决"What can I do"问题, 引入 PAC 后, kerberos 认证流
程如下:

1.  用户向 KDC 发起 AS_REQ, 请求凭据是用户 hash 加密的时间戳, KDC 使用用户 hash
    进行解密, 如果结果正确返回用 krbtgt hash 加密的 TGT 票据, **TGT 里面包含 PAC,
    PAC 包含用户的 sid 和用户所在的组**

2.  用户凭 TGT 票据向 KDC 发起针对特定服务的 TGS_REQ 请求, KDC 使用 krbtgt hash
    进行解密, 如果结果正确, 就返回用服务 hash 加密的 ST 票据(这一步不管用户有没有
    访问服务的权限, 只要 TGT 正确, 就返回 ST, 这也是 kerberoating 能利用的原因--
    任何一个用户, 只要 hash 正确, 可以请求域内任何一个服务的 ST)

3.  用户拿着 ST 去请求服务, 服务使用自己的 hash 解密 ST。如果解密正确, 就拿着 PAC
    去 KDC 那边询问用户有没有访问权限, 域控解密 PAC。获取用户的 sid 以及所在的组,
    再判断用户是否有访问服务的权限

    有些服务并没有验证 PAC 这一步, 这也是白银票据能成功的前提, 因为就算拥有服务
    hash, 可以制作 ST, 也不能制作 PAC

`注: PAC 对于用户和服务全程都是不可见的, 只有 KDC 能制作和查看 PAC`
