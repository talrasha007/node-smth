node-kbs
=========

  KBS BBS的node.js客户端，目前支持北邮人论坛以及水木社区。
  
## 安装
```
npm install node-kbs
```

## 注意
  由于使用了ECMA Script 6th Edition的功能，因此必须node版本大于v0.11，并在运行时使用--harmony参数。
  
## 使用方法
```javascript
var co = require('co'),
    api = require('node-kbs').getClient('smth');
    
co(function *() {
  yield api.login('guest', 'foobar');
  
  var auth = api.getAuthToken();
  ap.setAuthToken(auth);
  
  console.log(yield yield api.queryUser());
  console.log(yield yield api.queryUser('ttl'));
  
  console.log(yield api.getTop10());
  console.log(yield api.getBoard('Skate'));
  console.log(yield api.getFavorite(0));
  console.log(yield api.getThread('Skate', '715940');
})();
```
