---
title: "FreeMarker"
author: ["4shen0ne"]
draft: false
---

## 一些类 {#一些类}

-   freemarker.template.ObjectWrapper

    将 Java 对象映射到 FTL 的 TemplateModel 中，这决定了哪些 Java 对象可以被 FTL
    命令访问，实现了 FTL 的安全沙箱机制。

    实现类和子接口

    {{< figure src="/ox-hugo/2021-08-06_10-44-31_screenshot.png" >}}

-   freemarker.ext.servlet.FreemarkerServlet#process

    处理 http 请求的入口

-   freemarker.template.TemplateModel

    FTL 数据类型的通用接口，所有 Java 对象都会映射到这个接口的实现类中，FTL 只会处理
    实现该接口的 FTL 数据类型

-   freemarker.template.utility.Execute#exec

<!--listend-->

```java
public Object exec (List arguments) throws TemplateModelException {
    String aExecute;
    StringBuffer    aOutputBuffer = new StringBuffer();

    if( arguments.size() < 1 ) {
        throw new TemplateModelException( "Need an argument to execute" );
    }

    aExecute = (String)(arguments.get(0));

    try {
        Process exec = Runtime.getRuntime().exec( aExecute );
        ...
```


## 使用 new 创建对象 {#使用-new-创建对象}

目标对象需要实现 TemplateModel 接口，不能是 BeanModel 的子类，不能是 JythonModel
子类

```java
public ConstructorFunction(String classname, Environment env, Template template) throws TemplateException {
    this.env = env;
    cl = env.getNewBuiltinClassResolver().resolve(classname, env, template);
    if (!TemplateModel.class.isAssignableFrom(cl)) {
        throw new _MiscTemplateException(NewBI.this, env, new Object[] {
                "Class ", cl.getName(), " does not implement freemarker.template.TemplateModel" });
    }
    if (BEAN_MODEL_CLASS.isAssignableFrom(cl)) {
        throw new _MiscTemplateException(NewBI.this, env, new Object[] {
                "Bean Models cannot be instantiated using the ?", key, " built-in" });
    }
    if (JYTHON_MODEL_CLASS != null && JYTHON_MODEL_CLASS.isAssignableFrom(cl)) {
        throw new _MiscTemplateException(NewBI.this, env, new Object[] {
                "Jython Models cannot be instantiated using the ?", key, " built-in" });
    }
}
```


## 对象包装 {#对象包装}

对象包装器是实现了 freemarker.template.ObjectWrapper 接口的类。它的目标是实现
Java 对象和 FTL 类型系统之间的映射。换句话说，它指定了模板如何在数据模型(包含从模板
中调用的 Java 方法的返回值)中发现 Java 对象。对象包装器作为插件放入 Configuration 中，
可以使用 object_wrapper 属性设置 (或者使用 Configuration.setObjectWrapper)。

调用对象包装器的 wrap 方法将一个 Java 类映射成 FTL 类型，最常用的是
DefaultObjectWrapper：

```java
public TemplateModel wrap(Object obj) throws TemplateModelException {
    if (obj == null) {
        return super.wrap(null);
    }
    if (obj instanceof TemplateModel) {
        return (TemplateModel) obj;
    }
    if (obj instanceof String) {
        return new SimpleScalar((String) obj);
    }
    if (obj instanceof Number) {
        return new SimpleNumber((Number) obj);
    }
    if (obj instanceof java.util.Date) {
        if(obj instanceof java.sql.Date) {
            return new SimpleDate((java.sql.Date) obj);
        }
        if(obj instanceof java.sql.Time) {
            return new SimpleDate((java.sql.Time) obj);
        }
        if(obj instanceof java.sql.Timestamp) {
            return new SimpleDate((java.sql.Timestamp) obj);
        }
        return new SimpleDate((java.util.Date) obj, getDefaultDateType());
    }
    final Class objClass = obj.getClass();
    if (objClass.isArray()) {
        if (useAdaptersForContainers) {
            return DefaultArrayAdapter.adapt(obj, this);
        } else {
            obj = convertArray(obj);
            // Falls through (a strange legacy...)
        }
    }
    if (obj instanceof Collection) {
        if (useAdaptersForContainers) {
            if (obj instanceof List) {
                return DefaultListAdapter.adapt((List) obj, this);
            } else {
                return forceLegacyNonListCollections
                        ? (TemplateModel) new SimpleSequence((Collection) obj, this)
                        : (TemplateModel) DefaultNonListCollectionAdapter.adapt((Collection) obj, this);
            }
        } else {
            return new SimpleSequence((Collection) obj, this);
        }
    }
    if (obj instanceof Map) {
        return useAdaptersForContainers
                ? (TemplateModel) DefaultMapAdapter.adapt((Map) obj, this)
                : (TemplateModel) new SimpleHash((Map) obj, this);
    }
    if (obj instanceof Boolean) {
        return obj.equals(Boolean.TRUE) ? TemplateBooleanModel.TRUE : TemplateBooleanModel.FALSE;
    }
    if (obj instanceof Iterator) {
        return useAdaptersForContainers
                ? (TemplateModel) DefaultIteratorAdapter.adapt((Iterator) obj, this)
                : (TemplateModel) new SimpleCollection((Iterator) obj, this);
    }
    return handleUnknownType(obj);
}
```
