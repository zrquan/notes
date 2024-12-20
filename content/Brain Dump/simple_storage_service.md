---
title: "Simple Storage Service"
author: ["4shen0ne"]
draft: false
---

对象存储（Object-Based Storage），也可以叫做面向对象的存储，现在也有不少厂商直接
把它叫做云存储。

说到对象存储就不得不提 Amazon，Amazon S3 (Simple Storage Service) 简单存储服务，
是 Amazon 的公开云存储服务，与之对应的协议被称为 S3 协议，目前 S3 协议已经被视为
公认的行业标准协议，因此目前国内主流的对象存储厂商基本上都会支持 S3 协议。

在 Amazon S3 标准下中，对象存储中可以有多个桶（Bucket），然后把对象（Object）放
在桶里，对象又包含了三个部分：Key、Data 和 Metadata

{{< figure src="/ox-hugo/_20240408_093901screenshot.png" >}}

Key 是指存储桶中的唯一标识符，例如一个 URL 为：
`https://teamssix.s3.ap-northeast-2.amazonaws.com/flag` ，这里的 teamssix 是存储桶
Bucket 的名称，/flag 就是 Key

Data 就很容易理解，就是存储的数据本体

Metadata 即元数据，可以简单的理解成数据的标签、描述之类的信息，这点不同于传统的
文件存储，在传统的文件存储中这类信息是直接封装在文件里的，有了元数据的存在，可以
大大的加快对象的排序、分类和查找。

操作使用 Amazon S3 的方式也有很多，主要有以下几种：

-   AWS 控制台操作
-   AWS 命令行工具操作
-   AWS SDK 操作
-   REST API 操作，通过 REST API，可以使用 HTTP 请求创建、提取和删除存储桶和对象
