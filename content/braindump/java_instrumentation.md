---
title: "Java Instrumentation"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

[JVMTI]({{< relref "jvmti.md" >}}) 虽然提供了操作 JVM 的接口，但是需要通过 agent 对它们进行访问，而 agent 是
要用 C/C++ 写的。所以 Java SE5 中新增了 Instrumention 特性，让开发者可以基于
Java 来开发 agent 程序，用来监测和协助运行在 JVM 上的程序，甚至可以替换和修改某些
类的定义。但是需要程序启动时通过 --javaagent 参数指定代理类

Java SE 6 增强了 instrument 的功能，通过 Java Tool API 中的 attach 方式，我们可
以很方便地在程序运行过程中动态地设置加载代理类，并且可以对 native method 进行
instrumentation


## Instrumentation 接口 {#instrumentation-接口}

```java
public interface Instrumentation {

    //增加一个Class 文件的转换器，转换器用于改变 Class 二进制流的数据，参数 canRetransform 设置是否允许重新转换。
    void addTransformer(ClassFileTransformer transformer, boolean canRetransform);

    //在类加载之前，重新定义 Class 文件，ClassDefinition 表示对一个类新的定义，如果在类加载之后，需要使用 retransformClasses 方法重新定义。addTransformer方法配置之后，后续的类加载都会被Transformer拦截。对于已经加载过的类，可以执行retransformClasses来重新触发这个Transformer的拦截。类加载的字节码被修改后，除非再次被retransform，否则不会恢复。
    void addTransformer(ClassFileTransformer transformer);

    //删除一个类转换器
    boolean removeTransformer(ClassFileTransformer transformer);

    boolean isRetransformClassesSupported();

    //在类加载之后，重新定义 Class。这个很重要，该方法是1.6 之后加入的，事实上，该方法是 update 了一个类。
    void retransformClasses(Class<?>... classes) throws UnmodifiableClassException;

    boolean isRedefineClassesSupported();


    void redefineClasses(ClassDefinition... definitions)
        throws  ClassNotFoundException, UnmodifiableClassException;

    boolean isModifiableClass(Class<?> theClass);

    @SuppressWarnings("rawtypes")
    Class[] getAllLoadedClasses();


    @SuppressWarnings("rawtypes")
    Class[] getInitiatedClasses(ClassLoader loader);

    //获取一个对象的大小
    long getObjectSize(Object objectToSize);



    void appendToBootstrapClassLoaderSearch(JarFile jarfile);


    void appendToSystemClassLoaderSearch(JarFile jarfile);


    boolean isNativeMethodPrefixSupported();


    void setNativeMethodPrefix(ClassFileTransformer transformer, String prefix);
}
```
