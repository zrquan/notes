---
title: "AWDP修改jar包"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:05+08:00
draft: false
---

1.  用 IDEA 自带的反编译工具反编译，然后解压拿到源码
2.  用 IDEA 打开项目，配置项目的 SDK，将 BOOT-INF/classes 设置为源码目录，
    BOOT-INF/lib 设置为依赖目录
3.  添加 Artifacts，类型为 JAR，主类随便选一个，能编译成功就行
4.  从编译好的 jar 包中提取我们修改了源码的 class 文件

    ```text
    unzip -j oilsystem.jar com/example/demo/service/impl/UserServiceImpl.class
    ```
5.  解压原始的 jar 包

    ```text
    jar -xvf web.jar
    ```
6.  替换 class 文件
7.  重新压缩成 jar 包，需要指定 MANIFEST.MF 文件

    ```text
    jar -cvfm0 web-new.jar META-INF/MANIFEST.MF ./
    ```

注意：因为是直接替换的 class 文件，需要保证 JDK 版本正确，如果替换后运行失败就参
考错误信息更换其他版本试试。
