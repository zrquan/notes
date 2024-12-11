---
title: "solidity checklist"
author: ["4shen0ne"]
draft: false
---

## 编码规范问题 {#编码规范问题}


### 编译器版本 {#编译器版本}

旧版编译器可能存在安全问题, 例如:

1.  solidity 0.4.12 之前, 编译器会跳过参数中的空字符串, 比如
    `send(from,to,"",amount)` 会被编译成 `send(from,to,amount)`

    参考: <https://paper.seebug.org/631/#44-dividenddistributor>

2.  V0.4.22 中, 如果合约使用了两种构造函数, 会忽略其中一个函数
    ```js
       contract a {
           function a() public{
               ...
           }
           constructor() public{
               ...
           }
       }
    ```

3.  V0.4.25 修复了未初始化存储指针问题: <https://etherscan.io/solcbuginfo>


### 构造函数书写问题 {#构造函数书写问题}

参考上述第 2 点


### 返回标准 {#返回标准}

遵循 ERC20 规范, 要求 transfer、approve 函数应返回 bool 值, 需要添加返回值代码

```text
function transfer(address _to, uint256 _value) public returns (bool success)
```

transferFrom 返回结果应该和 transfer 返回结果一致


### 事件标准 {#事件标准}

遵循 ERC20 规范, 要求 transfer、approve 函数触发相应的事件

```js
function approve(address _spender, uint256 _value) public returns (bool success){
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value)
    return true
```


### 假充值问题 {#假充值问题}

转账函数中，对余额以及转账金额的判断，需要使用 require 函数抛出错误，否则会错误
的判断为交易成功

```js
  function transfer(address _to, uint256 _amount)  public returns (bool success) {
      // 使用require判断输入
      require(_to != address(0));
      require(_amount <= balances[msg.sender]);

      balances[msg.sender] = balances[msg.sender].sub(_amount);
      balances[_to] = balances[_to].add(_amount);
      emit Transfer(msg.sender, _to, _amount);
      return true;
  }
```


## 设计缺陷问题 {#设计缺陷问题}


### approve 函数条件竞争 {#approve-函数条件竞争}

使用 approve 授权函数修改 allowance 前, 需要先将 value 置零, 否则可以通过更高的
gas price 抢先使用代币

```js
  //判断_value是否为0
  require((_value == 0) || (allowance[msg.sender][_spender] == 0));
```


### 循环 Dos 问题 {#循环-dos-问题}


#### 循环消耗问题 {#循环消耗问题}

循环次数越大, 交易消耗的 gas 越多, 当超过 gas 限制时会导致交易失败

案例:

1.  Simoleon(SIM): <https://paper.seebug.org/646/>
2.  Pandemica: <https://bcsec.org/index/detail/id/260/tag/2>


#### 循环安全问题 {#循环安全问题}

避免让用户控制循环次数, 否则容易受到 Dos 攻击, 比如以下代码的_addresses.length
由用户所控制:

```js
function Distribute(address[] _addresses, uint256[] _values) payable returns(bool){
    for (uint i = 0; i < _addresses.length; i++) {
        transfer(_addresses[i], _values[i]);
    }
    return true;
}
```


## 编码安全问题 {#编码安全问题}


### 溢出问题 {#溢出问题}

1.  算术溢出, 应该使用 SafeMath 库进行运算
    -   [代币变泡沫，以太坊Hexagon溢出漏洞比狗庄还过分](https://www.anquanke.com/post/id/145520)
    -   [Solidity合约中的整数安全问题——SMT/BEC合约整数溢出解析](https://www.anquanke.com/post/id/106382)

2.  铸币烧币溢出, 应该设置 totalSupply 的上限
    -   [ERC20 智能合约整数溢出系列漏洞披露](https://paper.seebug.org/626/)


### 重入漏洞 {#重入漏洞}

在智能合约中提供了 call、send、transfer 三种方式来交易以太坊，其中 call 最大的区
别就是 **没有限制 gas** ，而其他两种在 gas 不够的情况下都会报 `out of gas`

重入漏洞有以下特征:

1.  使用了 call 函数作为转账函数
2.  没有限制 call 函数的 gas
3.  扣余额在转账之后
4.  call 时加入了 `()` 来执行 fallback 函数

demo:

```js
    function withdraw(uint _amount) {
        require(balances[msg.sender] >= _amount);
        // 转账给msg.sender
        // 并会执行msg.sender的fallback函数(如果是合约账户)
        // 此时balances[msg.sender]还没减少
        // 如果fallback函数继续调用当前withdraw函数, 将成功重入
        msg.sender.call.value(_amount)();
        balances[msg.sender] -= _amount;
    }
```

通过互斥锁避免递归:

```js
contract EtherStore {

    // initialise the mutex
    bool reEntrancyMutex = false;
    uint256 public withdrawalLimit = 1 ether;
    mapping(address => uint256) public lastWithdrawTime;
    mapping(address => uint256) public balances;

    function depositFunds() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawFunds (uint256 _weiToWithdraw) public {
        require(!reEntrancyMutex);
        require(balances[msg.sender] >= _weiToWithdraw);
        // limit the withdrawal
        require(_weiToWithdraw <= withdrawalLimit);
        // limit the time allowed to withdraw
        require(now >= lastWithdrawTime[msg.sender] + 1 weeks);
        balances[msg.sender] -= _weiToWithdraw;
        lastWithdrawTime[msg.sender] = now;
        // set the reEntrancy mutex before the external call
        reEntrancyMutex = true;
        msg.sender.transfer(_weiToWithdraw);
        // release the mutex after the external call
        reEntrancyMutex = false;
    }
 }
```


### call 注入 {#call-注入}

call 函数调用时，应该做严格的权限控制，或直接写死 call 调用的函数

案例:

-   [以太坊智能合约call注入攻击](https://paper.seebug.org/624/)
-   [以太坊Solidity合约call函数簇滥用导致的安全风险](https://paper.seebug.org/633/)


### 权限控制 {#权限控制}

检查合约中各函数是否正确使用了 public、private 等关键词进行可见性修饰，检查合约是
否正确定义并使用了 modifier 对关键函数进行访问限制，避免越权导致的问题

以下函数不该为 public:

```js
function initContract() public {
    owner = msg.sender;
}
```

案例:

-   [Parity Multi-sig bug 1](http://paritytech.io/the-multi-sig-hack-a-postmortem/)
-   [Parity Multi-sig bug 2](http://paritytech.io/a-postmortem-on-the-parity-multi-sig-library-self-destruct/)
-   [Rubixi](https://blog.ethereum.org/2016/06/19/thinking-smart-contract-security/)


### 重放攻击 {#重放攻击}

合约中如果涉及委托管理的需求，应注意验证的不可复用性，避免重放攻击

这里举例子为 transferProxy 函数，该函数用于当 user1 转 token 给 user3，但没有 eth 来支付
gasprice，所以委托 user2 代理支付，(user2)通过调用 transferProxy 来完成

```js
function transferProxy(address _from, address _to, uint256 _value, uint256 _fee,
    uint8 _v, bytes32 _r, bytes32 _s) public returns (bool){

    if(balances[_from] < _fee + _value
        || _fee > _fee + _value) revert();

    uint256 nonce = nonces[_from];
    bytes32 h = keccak256(_from,_to,_value,_fee,nonce,address(this));
    if(_from != ecrecover(h,_v,_r,_s)) revert();

    if(balances[_to] + _value < balances[_to]
        || balances[msg.sender] + _fee < balances[msg.sender]) revert();
    balances[_to] += _value;
    emit Transfer(_from, _to, _value);

    balances[msg.sender] += _fee;
    emit Transfer(_from, msg.sender, _fee);

    balances[_from] -= _value + _fee;
    nonces[_from] = nonce + 1;
    return true;
}
```

这个函数的问题在于 nonce 值是可以预判的，其他变量不变的情况下，可以进行重放攻击，
多次转账


## 编码设计问题 {#编码设计问题}


### 地址初始化 {#地址初始化}

涉及到地址的函数中，建议加入 `require(_to!=address(0))` 验证，有效避免用户误操作或
未知错误导致的不必要的损失


### 判断函数 {#判断函数}

涉及到条件判断的地方，使用 require 函数而不是 assert 函数，因为 assert 会导致剩余的 gas
全部消耗掉，而他们在其他方面的表现都是一致的


### 余额判断 {#余额判断}

不要假设合约创建时余额为 0，可以强制转账

攻击者可以用 1wei 来创建合约，然后调用 `selfdestruct(victimAddress)` 来销毁，这样余
额就会强制转移给目标，而且目标合约没有代码执行，无法阻止


### 转账函数 {#转账函数}

在完成交易时，默认情况下推荐使用 transfer 而不是 send 完成交易

当 transfer 或者 send 函数的目标是合约时，会调用合约的 fallback 函数。但 fallback 函数执
行失败时， **transfer 会抛出错误并自动回滚，而 send 会返回 false** ，所以在使用 send 时需
要判断返回类型，否则可能会导致转账失败但余额减少的情况


### 代码外部调用设计 {#代码外部调用设计}

对于外部合约优先使用 pull 而不是 push

错误样例：

```js
contract auction {
    address highestBidder;
    uint highestBid;

    function bid() payable {
        if (msg.value < highestBid) throw;

        if (highestBidder != 0) {
            if (!highestBidder.send(highestBid)) { // 可能会发生错误
                throw;
            }
        }

       highestBidder = msg.sender;
       highestBid = msg.value;
    }
}
```

当需要向某一方转账时，将转账改为定义 withdraw 函数，让用户自己来执行合约将余额取出，
这样可以最大程度的避免未知的损失

范例代码：

```js
contract auction {
    address highestBidder;
    uint highestBid;
    mapping(address => uint) refunds;

    function bid() payable external {
        if (msg.value < highestBid) throw;

        if (highestBidder != 0) {
            refunds[highestBidder] += highestBid; // 记录在refunds中
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdrawRefund() external {
        uint refund = refunds[msg.sender];
        refunds[msg.sender] = 0;
        if (!msg.sender.send(refund)) {
            refunds[msg.sender] = refund; // 如果转账错误还可以挽回
        }
    }
}
```


### 错误处理 {#错误处理}

合约中涉及到 call 等在 address 底层操作的方法时，做好合理的错误处理

操作如果遇到错误并不会抛出异常，而是会返回 false 并继续执行:

```nil
address.call()
address.callcode()
address.delegatecall()
address.send()
```


### 弱随机数 {#弱随机数}

合约中要保证生成的随机数无法被猜测

案例：

-   [8万笔交易「封死」以太坊网络，只为抢夺Fomo3D大奖？](https://mp.weixin.qq.com/s/5nrgj8sIZ0SlXebG5sWVPw)
-   <https://paper.seebug.org/672/>
-   <https://www.reddit.com/r/ethereum/comments/916xni/how_to_pwn_fomo3d_a_beginners_guide/>


### 变量覆盖 {#变量覆盖}

在合约中避免 array 变量 key 可以被控制


## 编码问题隐患 {#编码问题隐患}


### 语法特性 {#语法特性}

在智能合约中，所有的整数除法都会向下取整到最接近的整数，当我们需要更高的精度时，
我们需要使用乘数来加大这个数字

错误样例:

```js
uint x = 5 / 2; // 2
```

正确代码:

```js
uint multiplier = 10;
uint x = (5 * multiplier) / 2;
```


### 数据隐私 {#数据隐私}

在合约中，所有的数据包括私有变量都是公开的，不可以将任何有私密性的数据储存在链上


### 数据可靠性 {#数据可靠性}

合约中不应该让时间戳参与到代码中，容易受到矿工的干扰，应使用 block.height 等不变的
数据


### gas 消耗优化 {#gas-消耗优化}

对于某些不涉及状态变化的函数和变量可以加 constant 来避免 gas 的消耗


### 合约用户 {#合约用户}

合约中，应尽量考虑交易目标为合约时的情况，避免因此产生的各种恶意利用


### 日志记录 {#日志记录}

关键事件应有 Event 记录，为了便于运维监控，除了转账，授权等函数以外，其他操作也需
要加入详细的事件记录，如转移管理员权限、其他特殊的主功能


### <span class="org-todo todo TODO">TODO</span> 回调函数 {#回调函数}
