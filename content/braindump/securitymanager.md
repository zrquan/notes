---
title: "SecurityManager"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

## 简介 {#简介}

安全管理器是 Java 沙箱的基本组件之一，管理核心 API 调用系统接口时的安全策略

Java 应用程序请求 Java API 完成某个操作时，API 会向安全管理器询问是否可以执行，安全
管理器若不希望执行该操作，会抛一个异常给 API


## 例子 {#例子}

如下示例代码中，Java 尝试读取系统中的文件：

```java
public static void main(String[] args) {
    String s;
    try {
        FileReader fr = new FileReader(new File("E:\\test.txt"));
        BufferedReader br = new BufferedReader(fr);
        while ((s = br.readLine()) != null)
            System.out.println(s);
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

在创建 FileReader 对象的时候会先根据 File 对象创建 FileInputStream 实例，源码如下：

```java
public FileInputStream(File file) throws FileNotFoundException {
    String name = (file != null ? file.getPath() : null);
    SecurityManager security = System.getSecurityManager();
    if (security != null) {
        security.checkRead(name);
    }
    if (name == null) {
        throw new NullPointerException();
    }
    if (file.isInvalid()) {
        throw new FileNotFoundException("Invalid file path");
    }
    fd = new FileDescriptor();
    fd.attach(this);
    path = name;
    open(name);
}
```

在读取文件字节流之前，首先通过 `System.getSecurityManager()` 获取当前系统的安全管
理器，然后调用其 checkRead 方法检查是否具有读权限，如果有权限就继续读取，否则抛
出异常

checkRead 方法的相关代码如下：

```java
public void checkRead(String file) {
    checkPermission(new FilePermission(file,SecurityConstants.FILE_READ_ACTION));
}

public void checkPermission(Permission perm) {
    java.security.AccessController.checkPermission(perm);
}
```

可以看到，SecurityManager 对访问文件的校验，最终是交由访问控制器
([AccessController]({{< relref "accesscontroller.md" >}}))实现的，若校验失败则抛出 AccessControlException 异常

一般情况下，安全管理器默认是没有被安装的，getSecurityManager 方法将返回 null，可
以通过 setSecurityManager 方法显式启用，或者启动 JVM 时使用
`-Djava.security.manager` 选项
