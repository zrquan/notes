---
title: "美亚柏科杯-misc1"
author: ["4shen0ne"]
tags: ["ctf", "writeup"]
draft: false
---

附件：[attach.zip](/home/zrquan/Documents/org-attach/e9/d924c8-b823-4712-930e-41df9ef329d1/attach.zip)

一道流量分析题，一共三个问：

1.  找到 flag
2.  找到 admin 的密码
3.  找到 iv 值

前面的大部分流量是无意义的目录/文件扫描，关键是后面的 WinRM 加密流量

GitHub 上有现成的 winrm 流量[解密脚本](https://github.com/h4sh5/decrypt-winrm)，需要 admin 的密码或者

设置过滤器：

```text
data-text-lines and http.response.code == 200
```

找到访问 /mz.log 的响应内容（像是 mimikatz 抓密码的日志？），里面有 admin 的 NTLM Hash，可以用工具解出来第二问答案是 admin

{{< figure src="/ox-hugo/_20241229_150228screenshot.png" >}}

用这个 hash 解密 winrm 流量得到一组密文明文和一段 AES 加密脚本，注意如果直接解密整个流量包可能出错，可以先过滤 winrm 的流量然后导出特定分组

```python
import base64
from Crypto.Cipher import AES

def pkcs7padding(text):
    bs = AES.block_size  # 16
    length = len(text)
    bytes_length = len(bytes(text, encoding='utf-8'))
    padding_size = length if(bytes_length == length) else bytes_length
    padding = bs - padding_size % bs
    padding_text = chr(padding) * padding
    return text + padding_text

def pkcs7unpadding(text):
    try:
        length = len(text)
        unpadding = ord(text[length-1])
        return text[0:length-unpadding]
    except Exception as e:
        pass

def aes_encode(key, content):
    import iv
    key_bytes = bytes(key, encoding='utf-8')
    iv = iv.iv
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
    content_padding = pkcs7padding(content)
    aes_encode_bytes = cipher.encrypt(bytes(content_padding, encoding='utf-8'))
    result = str(base64.b64encode(aes_encode_bytes), encoding='utf-8')
    return result

key = '99754106633f94d3'
data = ''
mi = aes_encode(key, data)
print(mi)
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  encrypt.py
</div>

```text
c1:cExAFo22QSzk/IGDRZ06zEB3QInt/1vCOB+Hv/iwpa4=
m1:HelloworldTestRemoteLoginwin

c2:Yq8RtQ7mGXDTMWCxCKwJUlAmvLQFIxBh0RiOprrIa0/Wo8/4uOtjOwVrwCSyFUBb
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  encrypt.txt
</div>

现在我们有一组对应的明文密文，AES 使用的是 CBC 加密模式，而且拿到了 key，足以反推 iv 的值

1.  随便构造一个 iv，解密密文 c1 得到 fake_text
2.  将 fake_text、iv 以及已知的明文 m1（先 padding）逐个字节异或，得到的就是真正的 iv

修改一下 encrypt.py 解出 iv，回答第三问

```python
...
key = "99754106633f94d3"
data = "HelloworldTestRemoteLoginwin"

fake_iv = "a" * 16
m = aes_decode(key, "cExAFo22QSzk/IGDRZ06zEB3QInt/1vCOB+Hv/iwpa4=", fake_iv)

iv = ""
for i in range(16):
    iv += chr(m[i] ^ ord(fake_iv[i]) ^ ord(pkcs7padding(data)[i]))
print(iv)
# 3be1a0e448f0c838
```

然后用真正的 iv 解密密文 c2 即可得到 flag
