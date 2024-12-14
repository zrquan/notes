---
title: "Java临时目录安全风险"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

该漏洞影响类 Unix 系统以及低版本 mac 和 windows 系统，前提是临时目录在所有用户间
共享


## 临时目录劫持 {#临时目录劫持}

```java
tmpDir = File.createTempFile(temp, ".dir", parent); // Attacker knows the full path of the file that will be generated
// delete the file that was created
tmpDir.delete(); // Attacker sees file is deleted and begins a race to create their own directory before Jetty.
// and make a directory of the same name
// SECURITY VULNERABILITY: Race Condition! - Attacker beats java code and now owns this directory
tmpDir.mkdirs(); // This method returns 'false' because it was unable to create the directory. No exception is thrown.
// Attacker can write any new files to this directory that they wish.
// Attacker can read any files created by this process.
```


## 临时文件劫持 {#临时文件劫持}

```java
File tempDirChildVuln = new File(System.getProperty("java.io.tmpdir"), "/child.txt");
Files.write(tempDirChildVuln.toPath(), Arrays.asList("secret"), StandardCharsets.UTF_8, StandardOpenOption.CREATE); // File has permissions `-rw-r--r--`. Doesn't check if the file already exists.
// tempDirChildVuln contents are viewable by all other users
```

```java
Path tempDirChild = new File(System.getProperty("java.io.tmpdir"), "/child-output-stream.txt").toPath();
var fileOutputStream = Files.newOutputStream(tempDirChild); // File has permissions `-rw-r--r--`. Doesn't check if the file already exists.
// Anything written to fileOutputStream is viewable by all other users
```


## 临时文件信息泄露 {#临时文件信息泄露}

```java
File tempVuln = File.createTempFile("random", "file"); // File has permissions `-rw-r--r--`
// temVuln contents are viewable by all other users
```

```java
File tempVuln = File.createTempFile("random", "file", null); // File has permissions `-rw-r--r--`
// temVuln contents are viewable by all other users
```

```java
File tempDir = new File(System.getProperty("java.io.tmpdir"));
File tempVuln = File.createTempFile("random", "file", tempDir); // File has permissions `-rw-r--r--`
// temVuln contents are viewable by all other users
```

```java
File tempDirChildVuln = new File(System.getProperty("java.io.tmpdir"), "/child.txt");
Files.write(tempDirChildVuln.toPath(), Arrays.asList("secret"), StandardCharsets.UTF_8, StandardOpenOption.CREATE_NEW); // File has permissions `-rw-r--r--`. Throws `FileAlreadyExistsException` if it already exists.
// tempDirChildVuln contents are viewable by all other users
```

```java
File tempDirChildVuln = new File(System.getProperty("java.io.tmpdir"), "/child-create-file.txt");
Files.createFile(tempDirChildVuln.toPath()); // File has permissions `-rw-r--r--`. Throws `FileAlreadyExistsException` if it already exists.
// tempDirChildVuln contents are viewable by all other users
```


## 临时目录信息泄露 {#临时目录信息泄露}

```java
File tempDirVuln = com.google.common.io.Files.createTempDir(); // Directory has permissions `drwxr-xr-x`
// tempDirVuln any contents of this directory written is visible to all other users
```

```java
File tempDirChildVuln = new File(System.getProperty("java.io.tmpdir"), "/child");
if (!tempDirChildVuln.mkdir()) { // Directory has permissions `drwxr-xr-x`
    throw new FileAlreadyExistsException(tempDirChildVuln);
}
// tempDirChildVuln any contents of this directory written is visible to all other users
```

```java
File tempDirChildVuln = new File(System.getProperty("java.io.tmpdir"), "/child");
if (!tempDirChildVuln.mkdirs()) { // Directory `child` has permissions `drwxr-xr-x`
    throw new FileAlreadyExistsException(tempDirChildVuln);
}
// tempDirChildVuln any contents of this directory written is visible to all other users
```

```java
// TODO: CHECK THIS ONE
File tempDirChild = new File(System.getProperty("java.io.tmpdir"), "/child-create-directory");
Files.createDirectory(tempDirChild.toPath()); // Directory has permissions `drwxr-xr-x`. Throws `FileAlreadyExistsException` if it already exists.
```
