---
title: "SpringBoot JPA"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:01+08:00
tags: ["java"]
draft: false
---

JPA(Java Persistence API) Java 持久层 API，是通过 JDK 5.0 注解或 XML 描述对象-关
系表的映射关系，并将运行期内的实体对象持久化到数据库中。

简单说就是使用 Java 代码就可以确定 Java 对象和数据库对象的对应关系，并通过 Java
方法描述对应的 SQL 查询语句

MAVEN 配置：

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

application.properties 文件：

```nil
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=12345678
spring.datasource.url=jdbc:mysql://localhost:3306/myuser?characterEncoding=utf-8&useSSL=false
spring.jpa.show-sql=true
```

编写一个类，通过注解描述它在数据库中的对应结构：

```java
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import javax.persistence.*;

@Entity // 实体类注解
@Data // lombok 插件，自动给属性生成 getter 和 setter 方法
//@Table(name = "users") 如果实体类名与表面不相同用 @Table 注解
public class User {

    @Id // 主键注解
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 主键自动递增注解
    private Integer userId;

    private String userName;

    @JsonIgnore // 若一个属性，不需要返回给前端，用 @JsonIgnore 注解
    private Integer userGender;

    private Integer userAge;

    private String email;

    @Transient // 若一个属性，不是数据库中的字段，用 @Transient 注解
    private String userInfo;
}
```

编写 JpaRepository 接口，描述数据查询方式：

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// 新建一个接口，继承于 JpaRepository<实体类, 主键类型>
public interface UserRepository extends JpaRepository<User, Integer> {

    // 根据 user_name 查询，
    User findByUserName(String userName);

    // 根据性别，分页查询
    Page<User> findByUserGender(Integer gender, Pageable pageable);

    // 根据用户名和性别查找
    List<User> findByUserNameAndUserGender(String userName, Integer gender);

    // 查找年龄小于 age 的 User
    List<User> findByUserAgeLessThan(Integer age);

    // 查找年龄大于 age 的 User
    List<User> findByUserAgeGreaterThan(Integer age);

    // 查找年龄介于 [minAge，maxAge] 的 User
    List<User> findByUserAgeBetween(Integer minAge, Integer maxAge);

    // 查找名字包含 userName 的 User
    List<User> findByUserNameContaining(String userName);

    // 查找以 userNamePrefix 开头的 User
    List<User> findByUserNameStartingWith(String userNamePrefix);

    // 查找以 userNameSuffix 结尾的 User
    List<User> findByUserNameEndingWith(String userNameSuffix);
}
```

实现了 JpaRepository 接口就会被 Spring IOC 容器识别为 Repository Bean，会被纳入
IOC 容器中。而且这个接口可以不用实现，只要方法名按照约定的格式进行命名，就能自动
实现对应的 CRUD 功能，当然你也可以通过 @Query 注解编写 SQL 语句


## SQL 注入风险 {#sql-注入风险}

1.  Order by 以非实体属性进行排序：关注 JpaSort.unsafe()
2.  EntityManager 动态拼接 sql 语句：EntityManager.createNativeQuery() 可执行原生 SQL
    语句
