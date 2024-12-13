---
title: "ACDI"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:01+08:00
draft: false
---

ACDI 中的 C 指数据状态的一致性（Consistency），即保证系统中所有的数据都是符合期
望的，且相互关联的数据之间不会产生矛盾。

为了实现一致性，需要三个方面的共同努力来保障：

1.  原子性（Atomic）：在同一项业务处理过程中，事务保证了对多个数据的修改，要么同
    时成功，要么同时被撤销。
2.  隔离性（Isolation）：在不同的业务处理过程中，事务保证了各自业务正在读、写的数
    据互相独立，不会彼此影响。
3.  持久性（Durability）：事务应当保证所有成功被提交的数据修改都能够正确地被持久
    化，不丢失数据。

可见 ACDI 中的四个特性并不是平级的关系（不正交），A、I、D 是手段，C 是目的，前者
是因，后者是果，弄到一块去完全是为了拼凑个单词缩写。[^fn:1]

[^fn:1]: <https://icyfenix.cn/architect-perspective/general-architecture/transaction/>
