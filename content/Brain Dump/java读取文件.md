---
title: "Java读取文件"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:18+08:00
tags: ["java"]
draft: false
---

## BufferedReader {#bufferedreader}

```java
public static void readByBufferedReader() throws IOException {
    FileReader fileReader = new FileReader("/tmp/flag");
    BufferedReader bufferedReader = new BufferedReader(fileReader);
    String st;
    while ((st = bufferedReader.readLine()) != null) {
        System.out.println(st);
    }
}
```


## FileReader {#filereader}

```java
public static void readbyFileReader() throws IOException {
    FileReader fileReader = new FileReader("/tmp/flag");

    int temp;
    while ((temp = fileReader.read()) != -1) {
        System.out.print((char) temp);
    }

}
```


## Scanner {#scanner}

```java
public static void readByScanner() throws FileNotFoundException {
    Scanner scanner = new Scanner(new File("/tmp/flag"));
    while (scanner.hasNext()) {
        System.out.println("test");
        System.out.println(scanner.nextLine());
    }
}
```


## File.readAllLines {#file-dot-readalllines}

```java
public static void readByFiles() throws IOException {
    ArrayList list = (ArrayList) Files.readAllLines(Paths.get("/tmp/flag"));
    list.forEach((a) -> System.out.println(a));
}
```
