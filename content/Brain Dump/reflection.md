---
title: "反射机制"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:47+08:00
tags: ["java"]
draft: false
---

## 介绍 {#介绍}

反射指的是可以于运行时[加载]({{< relref "jvm类加载过程.md" >}})、探知和使用编译期间完全未知的类

程序在运行状态中, 可以动态加载一个只有名称的类, 对于任意一个已经加载的类, 都能够
知道这个类的所有属性和方法; 对于任意一个对象, 都能调用他的任意一个方法和属性;

加载完类之后, 在堆内存中会产生一个 Class 类型的对象(一个类只有一个 Class 对象), 这个
对象包含了完整的类的结构信息, 而且这个 Class 对象就像一面镜子, 透过这个镜子看到类
的结构, 所以被称之为反射

每个类被加载进入内存之后, 系统就会为该类生成一个对应的 java.lang.Class 对象, 通过
该 Class 对象就可以访问到 JVM 中这个类的数据


## Class 对象获取 {#class-对象获取}

1.  实例对象的 getClass 方法
2.  类的 class 属性(最安全/性能最好)
3.  运用 `Class.forName(String className)` 动态加载类, className 需要是类的全限定名
    (最常用)

使用功能 `.class` 来创建 Class 对象的引用时, 不会自动初始化该 Class 对象, 使
用 `forName()` 会自动初始化该 Class 对象


## 示例代码 {#示例代码}

```java
package Step2;

import java.lang.reflect.Method;

public class reflectionTest {
    public static void main(String[] args){
        try {
            //Class 获取类的方法一:实例对象的 getClass()方法;
            User testObject = new User("zhangshan",19);
            Class Method1Class = testObject.getClass();

            //Class 获取类的方法二:类的.class(最安全/性能最好)属性;有点类似 python 的 getattr()。java 中每个类型都有 class 属性.
            Class Method2Class = User.class;

            //Class 对象的获取方法三:运用 Class.forName(String className)动态加载类,className 需要是类的全限定名(最常用).
            //这种方法也最容易理解，通过类名(jar 包中的完整 namespace)就可以调用其中的方法，也最符合我们需要的使用场景.
            //j2eeScan burp 插件就使用了这种反射机制。
            String path = "Step2.User";
            Class Method3Class = Class.forName(path);

            Method[] methods = Method3Class.getMethods();
            //Method[] methods = Method2Class.getMethods();
            //Method[] methods = Method3Class.getMethods();

            //通过类的 class 属性获取对应的 Class 类的对象，通过这个 Class 类的对象获取 test 类中的方法集合

            /* String name = Method3Class.getName();
             * int modifiers = Method3Class.getModifiers();
             * .....还有很多方法
             * 也就是说，对于一个任意的可以访问到的类，我们都能够通过以上这些方法来知道它的所有的方法和属性；
             * 知道了它的方法和属性，就可以调用这些方法和属性。
             */

            //调用 User 类中的方法

            for(Method method : methods){
                if(method.getName().equals("getName")) {
                    System.out.println("method = " + method.getName());

                    Class[] parameterTypes = method.getParameterTypes();//获取方法的参数
                    Class returnType = method.getReturnType();//获取方法的返回类型
                    try {
                        User user = (User)Method3Class.newInstance();
                        Object x = method.invoke(user);//user.getName();
                        //Object x = method.invoke(new test(1), 666);
                        //new 关键字能调用任何构造方法,newInstance()只能调用无参构造方法。但反射的场景中是不应该有机会使用 new 关键词的。
                        System.out.println(x);

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            Method method = Method3Class.getMethod("setName",String.class);
            User user1 = (User)Method3Class.getConstructor(String.class,Integer.class).newInstance("lisi",19);
            //调用自定义构造器的方法
            Object x = method.invoke(user1,"李四");//第一个参数是类的对象。第二参数是函数的参数
            System.out.println(user1.getName());
        } catch (Exception e1) {
            e1.printStackTrace();
        }
    }
}

class User{
    private Integer age;
    private String name;

    public User() {}

    public User(String name,Integer age){ //构造函数，初始化时执行
        this.age = age;
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```
