//【登録場所】リンク、URLExec、選択テキスト(ユーザーポップアップのみ対応)
//【ラベル】ツイートのポップアップ
//【内容】ツイート、ツイッターユーザーのポップアップ
//     ツイートかユーザーかはURLから自動的に判別
//     選択テキストから起動された場合は、それをユーザーIDとして処理する
//【コマンド1】${SCRIPT:FrwS} popupTwitterInfo.js
//【コマンド2】${SCRIPT:FrwS} popupTwitterInfo.js テンプレートのファイル名       (popupTweetフォルダ内の任意のテンプレートファイルを指定)
//【URLExec】https?://(?:mobile\.|m\.)?twitter\.com/(?:#!/)?\w+[#/]?$	$&	${V2CSCRIPT:FrwS} popupTwitterInfo.js　                （ユーザー）
//           https?://(?:mobile\.|m\.)?twitter\.com/(?:#!/)?[^/]+/status(?:es)?/\d+	$&	${V2CSCRIPT:FrwS} popupTwitterInfo.js　（ツイート）

//設定(onがtrue、offがfalse)-----------------------
//ポップアップの最大幅
var maxPopupWidth = 400;

//マウス移動でポップアップを閉じる
v2c.context.setDefaultCloseOnMouseExit(true);

//終了後に残りアクセス回数をステータスバーに表示
var showRemainingHits = false;

//一度読み込んだテンプレートとtwitterデータはキャッシュし、同じデータを読み込む場合はこれを表示する。
//キャッシュはV2C再起動でクリアされる。使用にはT20110522以降が必要。
var cacheMode = true;

//ポップアップ上の@userクリックをスクリプトによるポップアップするかどうか
var userPopup = false;
//-----------------------------------------------

//デフォルトテンプレートファイル名
var TEMPLATE_TWEET = "TemplateStatus.txt";
var TEMPLATE_USER = "TemplateUser.txt";

//キャッシュ管理
var cacheData = {
  data: null,
  load: function() {
    if (cacheMode) {
      this.data = v2c.getScriptObject();
    }
    if (!this.data) {
      this.data = {};
    }
  },
  set: function(key, value) {
    this.load();
    this.data[key] = value;
    if (cacheMode) {
      v2c.setScriptObject(this.data);
    }
  }, 
  get: function(key) {
    this.load();
    return this.data[key];
  }
}

var userRx =/https?:\/\/(?:mobile\.|m\.)?twitter\.com\/(?:#!\/)?(\w+)/i;
var statusRx =/https?:\/\/(?:mobile\.|m\.)?twitter\.com\/(?:#!\/)?[^\/]+\/status(?:es)?\/(\d+)/i;


var Twitter = function(settings) {
  this.requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  this.authorizeUrl = 'https://api.twitter.com/oauth/authorize';
  this.accessTokenUrl = 'https://api.twitter.com/oauth/access_token';

  this.consumerKey = '3tLPbTiq8xvHXN4ZtJYsA';
  this.consumerSecret = 'mozHVgfsRZzFujV1vKYPMPHGmgJsvPYdzaNvwTf7So';

  this.requestToken;
  this.requestTokenSecret;

  if(!settings)
    return;

  let [accessToken, accessTokenSecret, userId] = settings.load();
  this.accessToken = accessToken;
  this.accessTokenSecret = accessTokenSecret;
  this.userId = userId;
}
Twitter.prototype.getUnixTime = function()
{
  var time = java.lang.System.currentTimeMillis() / 1000;
  return Math.floor(time);
}
Twitter.prototype.createNonce = function()
{
  return Math.random();
}
Twitter.prototype.urlEncode = function(str)
{
  return java.net.URLEncoder.encode(str, 'UTF-8');
}

Twitter.prototype.createAuthorizationHeader = function(params)
{
  var self = this;
  // oauth_* という名前のパラメータだけを連結
  var header = [key for (key in params) if (key.indexOf('oauth_') == 0)].sort()
    .map(function(key) {
      return stringFormat('{0}="{1}"', self.urlEncode(key), self.urlEncode(params[key]));
    }).join(", ");

  return 'OAuth ' + header;
}

Twitter.prototype.createSignature = function(message, tokenSecret)
{
  // byte-array -> base64-string
  // ref: http://shorindo.com/research/1308640339
  function toBase64String(arr)
  {
    var seed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    if (arr == null)
        return "====";
    var result = "";
    var c = 0;
    for (var i = 0; i < arr.length; i++) {
        switch(i % 3) {
        case 0:
            result += seed.charAt((arr[i]>>2)&0x3f);
            c = (arr[i]&0x03)<<4;
            break;
        case 1:
            result += seed.charAt(c | ((arr[i]>>4)&0x0f));
            c = (arr[i]&0x0f)<<2;
            break;
        case 2:
            result += seed.charAt(c | ((arr[i]>>6)&0x0f));
            result += seed.charAt(arr[i]&0x3f);
            c = 0;
            break;
        }
    }
    if (arr.length % 3 == 1) {
        result += seed.charAt(c);
        result += "==";
    } else if (arr.length % 3 == 2) {
        result += seed.charAt(c);
        result += "=";
    }
    return result;
  }

  printlnLog('-- createSignature --');
  dumpObject(message.parameters);

  // oauth_signature を除く全てのパラメータを、sortして順番に連結
  var params = [key for (key in message.parameters)].sort()
    .map(function(key) {
      return stringFormat('{0}={1}', key, message.parameters[key]);
    }).join("&");

  var getBytes = function(s) { return new java.lang.String(s).getBytes(); }

  // method&url&params
  var text = stringFormat('{0}&{1}&{2}',
    message.method, this.urlEncode(message.action), this.urlEncode(params));

  var rawKey = this.urlEncode(this.consumerSecret) + '&';
  // リクエストorアクセストークン秘密鍵があれば、コンシューマ秘密鍵と共にキーとして扱う。
  // ない場合でも、'&'は残しておくこと。
  if(tokenSecret)
    rawKey += this.urlEncode(tokenSecret);

  printlnLog('text: {0}, key: {1}', text, rawKey);

  var signingKey = new javax.crypto.spec.SecretKeySpec(getBytes(rawKey), "HmacSHA1");
  var mac = javax.crypto.Mac.getInstance(signingKey.getAlgorithm());
  mac.init(signingKey);
  var rawHmac = mac.doFinal(getBytes(text))
    // Java の byte は signed なので、unsigned にしてやる。
    .map(function(x) { return x & 0xFF; });

  return toBase64String(rawHmac);
}

// function(url : string [, addParam : Array -> void, tokenSecret : string])
// 
// 認証トークン取得に使う、基本的なパラメータを指定したリクエストを生成。
// addParam引数を使ってパラメータを追加できる。
Twitter.prototype.getOAuthToken = function(url, addParam, tokenSecret)
{
  if(!addParam)
    addParam = function(params) { };
  if(typeof addParam != 'function')
    throw 'addParamを指定する場合、function型のみが有効です。'

  var message = {
    method: "POST", 
    action: url, 
    parameters: { 
      oauth_signature_method: "HMAC-SHA1", 
      oauth_consumer_key: this.consumerKey,
      oauth_version: '1.0',
      oauth_timestamp: this.getUnixTime(),
      oauth_nonce: this.createNonce()
    }
  };

  addParam(message.parameters);

  // signature 以外のパラメータはここまでに message.parameters に入れておく。
  message.parameters['oauth_signature'] = this.createSignature(message, tokenSecret);

  // POST
  var req = v2c.createHttpRequest(message.action, '');
  var header = this.createAuthorizationHeader(message.parameters);
  
  req.setRequestProperty('Content-Type', 'application/x-www-form-urlencoded');
  //req.setRequestProperty('Content-Length', 0);
  req.setRequestProperty('Authorization', header);

  var res = req.getContentsAsString();
  if(req.responseCode != 200)
  {
    printlnLog('--- dump ---')
    dumpObject(req, function(name, value) { return typeof value != typeof function() { }; });
    throw '認証エラー';
  }

  var parseToken = function(data) {
    return data.split('&').reduce(function(a, token) {
      let [key, value] = token.split('=');
      a[key] = value;
      return a;
    }, { });
  };
  
  return parseToken(res);
}

Twitter.prototype.getRequestToken = function()
{
  var results = this.getOAuthToken(this.requestTokenUrl);

  // リクエストトークンを保存する
  this.requestToken = results['oauth_token'];
  this.requestTokenSecret = results['oauth_token_secret'];

  printlnLog('requestToken: {0}, requestTokenSecret: {1}', this.requestToken, this.requestTokenSecret);
}


// アクセストークンを取得し、メンバに保存する。
// 
// oauth_tokenとしてリクエストトークンを、oauth_verifierとしてPINを送信
// アクセストークンは永続化して使い回し可能。
Twitter.prototype.getAccessToken = function(pin)
{
  assert(this.requestToken && this.requestTokenSecret);
  assert(pin);

  var self = this;
  var results = this.getOAuthToken(this.accessTokenUrl, function(params)
  {
    params['oauth_token'] = self.requestToken;
    params['oauth_verifier'] = pin;
  }, this.requestTokenSecret);

  // アクセストークンを保存する
  this.accessToken = results['oauth_token'];
  this.accessTokenSecret = results['oauth_token_secret'];
  this.userId = results['user_id'];

  printlnLog('accessToken: {0}, accessTokenSecret: {1}, userId: {2}',
    this.accessToken, this.accessTokenSecret, this.userId);
}

// public
Twitter.prototype.authenticate = function(getPin) {
  this.getRequestToken();

  var target = stringFormat("{0}?oauth_token={1}", this.authorizeUrl, this.requestToken);
  var pin = getPin(target);

  this.getAccessToken(pin);
}

Twitter.prototype.isAuthorized = function()
{
  return this.accessToken != null
    && this.accessTokenSecret != null
    && this.userId != null;
}
Twitter.prototype.serialize = function(settings)
{
  settings.save([ this.accessToken, this.accessTokenSecret, this.userId ])
}

// TODO: 今のところ GET しかサポートしてない
Twitter.prototype.createRequest = function(method, api)
{
  if(method != "GET"/* && method != "POST"*/)
  {
    throw 'サポートしていないメソッドです。'
  }

  var message = {
    method: method, 
    action: api, 
    parameters: { 
      oauth_signature_method: "HMAC-SHA1", 
      oauth_consumer_key: this.consumerKey, 
      oauth_token: this.accessToken,
      oauth_version: '1.0',
      oauth_timestamp: this.getUnixTime(),
      oauth_nonce: this.createNonce()
    }
  };

  // TODO: postするパラメータを parameters にpush
  
  message.parameters['oauth_signature'] = this.createSignature(message, this.accessTokenSecret);

  var target = message.action;
  var header = this.createAuthorizationHeader(message.parameters);
  printlnLog('header: {0}', header);


  var req = method == "GET"
    ? v2c.createHttpRequest(target)
    : v2c.createHttpRequest(target, requestBody);

  req.setRequestProperty('Authorization', header);

  return req;
}

function initializeTwitter() {
  var settings = {
    file: v2c.getScriptDataFile('popupTwitterInfo_oauth.bin'),
    save: function(array) {
      v2c.writeLinesToFile(this.file, array);
    },
    load: function() {
      var array = v2c.readLinesFromFile(this.file);
      return array ? Array.prototype.slice.call(array) : [];
    }
  };

  var client = new Twitter(settings);
  if(client.isAuthorized())
    return client;

  // データがない場合、または認証されていない(ファイル書き換えたとか)場合は再度認証する。
  client = new Twitter();
  client.authenticate(function(url) {
    // ユーザーにこのクライアントを承認してもらい、表示されたPINを入力してもらう
    v2c.alert('[popupTwitterInfo.js] ブラウザで開かれるページで認証を行なってください。');
    v2c.browseURLDefExt(url);
    var pin = v2c.prompt('PIN を入力してください', '');
    if(pin)
      return pin;
    throw 'キャンセルされました。';
  });

  if(!client.isAuthorized()) {
    throw 'error: 認証に失敗しました。';
  }

  client.serialize(settings);
  return client;
}

var twitter = initializeTwitter();

var u = v2c.context.link;
if (!u) {//選択テキストから起動された場合は、ユーザーIDとして処理する
  var selectedText = v2c.getSelectedText();
  if (selectedText && selectedText.match(/@?([0-9A-Za-z_]{1,15})/)) {
    u = "https://twitter.com/" + RegExp.$1;
  }
}
if (u) {
  popupTwitterInfo(u.toString(), false);
}
else {
  v2c.alert('URL取得失敗');
}

function popupTwitterInfo(url,isRefresh) {

  var html,key,getHtml;
  var tm = v2c.context.args[0];

  //URLが正しいかどうかの確認
  if (url.match(statusRx)) {
    templateFilename = tm ? tm : TEMPLATE_TWEET;
    getHtml = getTwitterStatusHTML;
  }
  else if (url.match(userRx)) {
    templateFilename = tm ? tm : TEMPLATE_USER;
    getHtml = getTwitterUserHTML;
  }
  else {
    v2c.alert("非対応のURLです\n" + url);
    return;
  }
  
  if (getHtml) {
    key = RegExp.$1 + '/' + templateFilename;
    if (!isRefresh) {
      //同じURLのポップアップを開いていたら終了
      if (v2c.context.getPopupOfID(key)) {
        return;
      }
      html = cacheData.get(key);
    }
    if (!html){
      html = getHtml(RegExp.$1, templateFilename);
    }
  }
  if (html) {
    //ポップアップの設定
    html = html.replace('%url%',url);//更新ボタン用
    v2c.context.setPopupHTML(html);
    v2c.context.setMaxPopupWidth(maxPopupWidth);
    v2c.context.setPopupID(key);
    v2c.context.setRedirectURL(true);
    v2c.context.setCloseOnLinkClick(!userPopup);
    v2c.context.setTrapFormSubmission(true);
    cacheData.set(key,html);
  }
  
  if (showRemainingHits) {
    var limit = getJson("https://api.twitter.com/1.1/account/rate_limit_status.json");
    if (limit) {
      v2c.context.setStatusBarText("残り回数：" + limit.remaining_hits +
                                    " 次のリセット時間：" +
                                    getDateText(limit.reset_time));
    }
  }
  return;
}

function formSubmitted(url, sm, sd) {
  v2c.context.closeOriginalPanel();
  popupTwitterInfo(url.toString(),true);
}

function redirectURL(url) {
  if (userPopup) {
    url = url + '';
    if (!url.match(statusRx) && url.match(userRx) && url.indexOf('#!') == -1) {
      popupTwitterInfo(url, false);
      return null;
    }
  }
  return url;
}
function getTwitterStatusHTML(sid,template) {

  var url = "https://api.twitter.com/1.1/statuses/show/" + sid + ".json";
  var json = getJson(url);
  if (!json) {
    return null;
  }
  
  //テンプレートを読み込み
  var templateText = readTemplate(template);
  if (!templateText) {
    v2c.alert("ファイルがない？ " + template);
    return null;
  }
  
  var html = getTwitterUserFromJson(json.user, templateText);
  html = getTwitterStatusFromJson(json, html);
  
  return html;
}

function getTwitterUserHTML(user,template) {
  var url = "https://api.twitter.com/1.1/users/show/" + user + ".json";
  var json = getJson(url);
  if (!json) {
    return null;
  }
  
  //テンプレートを読み込み
  var templateText = readTemplate(template);
  if (!templateText) {
    v2c.alert("ファイルがない？ " + template);
    return null;
  }
  
  var html = getTwitterUserFromJson(json, templateText);
  //最新ツイート取得
  //if (json.statuses_count > 0) {
  html = getTwitterStatusFromJson(json.status, html);
  //}
  
  return html;
}


function getTwitterStatusFromJson(statusJson, templateText) {
  var text = '';
  var date = '';
  var client = '';
  var retweetCount = '0';
  var statusID = '0';
  
  if (statusJson) {
    //本文の取得
    if (statusJson.text) {
      text = addLinkTag(statusJson.text + '');
    }
    
    //投稿日時の取得
    if (statusJson.created_at) {
      date = getDateText(statusJson.created_at);
    }
    
    //リツイート数の取得
    if (statusJson.retweet_count) {
      retweetCount = statusJson.retweet_count + '';
    }
    
    //クライアント
    if (statusJson.source) {
      client = statusJson.source;
    }
    
    //statusID取得
    if (statusJson.id) {
      statusID = statusJson.id + '';
    }
  }
  else {
    text = "取得できず"
  }
  
  templateText = templateText.replace('%date%', date);
  templateText = templateText.replace('%sid%', statusID);
  templateText = templateText.replace('%via%', client);
  templateText = templateText.replace('%retweet%', retweetCount);
  templateText = templateText.replace('%text%', text);
  
  return templateText;
}

function getTwitterUserFromJson(userJson, templateText) {
  var followersCount = '0';
  var friendsCount = '0';
  var statusesCount = '0';
  var verified = '';
  var createdAt = '';
  var icon = '';
  var icolink = '';
  var name = '';
  var screenName = '';
  var homeurl = '';
  var description = '';
  
  if (userJson) {
    //フォロワー数取得
    if (userJson.followers_count) {
      followersCount = userJson.followers_count + '';
    }
    
    //フォロー数取得
    if (userJson.friends_count) {
      friendsCount = userJson.friends_count + '';
    }
    
    //ツイート数
    if (userJson.statuses_count) {
      statusesCount = userJson.statuses_count + '';
    }
    
    //urlの取得
    if (userJson.url) {
      homeurl = userJson.url;
    }
    
    //認証済み
    if (userJson.verified) {
      verified = '認証済み';
    }
    
    //アカウント名の取得
    if (userJson.screen_name) {
      screenName = userJson.screen_name;
    }
    
    //アイコンURL取得
    if (userJson.profile_image_url) {
      icon = userJson.profile_image_url;
      icolink = "https://twitter.com/#!/" + screenName;
    }
    
    //表示名取得
    if (userJson.name) {
      name = userJson.name;
    }
    
    //紹介文の取得
    if (userJson.description) {
      description = addLinkTag(userJson.description + '');
    }
    
    //作成日の取得
    if (userJson.created_at) {
      createdAt = getDateText(userJson.created_at,"yyyy/MM/dd");
    }
  }
  //パラメータの置換
  templateText = templateText.replace('%aname%', screenName);
  templateText = templateText.replace('%uname%', name);
  templateText = templateText.replace('%icon%', icon);
  templateText = templateText.replace('%icolink%', icolink);
  templateText = templateText.replace('%verified%', verified);
  templateText = templateText.replace('%followers_count%', followersCount);
  templateText = templateText.replace('%statuses_count%', statusesCount);
  templateText = templateText.replace('%friends_count%', friendsCount);
  templateText = templateText.replace('%created_at%', createdAt);
  templateText = templateText.replace('%homeurl%', homeurl);
  templateText = templateText.replace('%description%', description);
  return templateText;
}

function addLinkTag(htmlText) {
  var http = "(?:(?:ftp|https?)://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)";
  var user = '(?:[@][0-9A-Za-z_]{1,15})';
  var hashtag = '(?:(^|[^a-zA-Z0-9&?]+)#(\\w*[a-zA-Z_]\\w*))';
  
  var r = new RegExp([http, user, hashtag].join('|'), 'g');
  return htmlText.replace(r, function(m0) {
    if (m0.match(/^(?:ftp|http)/)) {
      return '<a href="' + m0 + '">' + m0 + '</a>';
    }
    else if (m0.match(/^@/)) {
      return '@<a href="https://twitter.com/' +
                m0.substr(1) + '">' + m0.substr(1) + '</a>';
    }
    else if (m0.match('^' + hashtag)) {
      return RegExp.$1 + '<a href="https://twitter.com/search?q=' +
               encodeURIComponent('#' + RegExp.$2) + '">#' + RegExp.$2 + '</a>';
    }
    else {
      return m0;
    }
  })
}

function getDateText(d, pattern) {
  var dd = new Date(d);
  if (!pattern) {
    pattern = "yyyy/MM/dd HH:mm:ss (E)";
  }
  var sdf = new java.text.SimpleDateFormat(pattern);
  return sdf.format(dd);
}

function getJson(url) {
  v2c.setStatus('popupTwitterInfo通信中...');
  
  var hr = twitter.createRequest('GET', url);
  var sr = hr.getContentsAsString();
  if (!sr) {
    v2c.context.setStatusBarText('PopupTwitterInfo ページの取得に失敗しました。: ' + hr.responseCode + ' ' + hr.responseMessage + ' ' + url);
    return null;
  }
  
  //データ取得
  return JSON.parse(sr);
}

function readTemplate(fileName) {
  var template = cacheData.get(fileName);
  if (!template) {
    template = v2c.readFile(combinePath(v2c.saveDir, 'script', 'popupTweet', fileName));
    cacheData.set(fileName, template);
  }
  return template;
}

function combinePath(first/*, ...*/) {
  var args = 1 < arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
  return first ? java.nio.file.Paths.get(first, args).toAbsolutePath() : "";
}

// predicate(name, value)
function dumpObject(obj, predicate) {
  predicate = predicate || function() { return true; };

  if(obj == null) {
    v2c.println("> " + obj === null ? "<null>" : "<undefined>");
    return;
  } else {
    v2c.println("> " + obj);
  }
  for(var name in obj) {
    var value = null;
    try { value = obj[name]; } catch(e) { value = e; };
    if(predicate(name, value))
      v2c.println(name + ": " + value)
  }
};

function stringFormat(format /*, ...*/) {
  var args = arguments;
  return args.length <= 1
      ? format
      : format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
}
function printlnLog(format /*, ...*/) {
  var message = stringFormat.apply(null, arguments);
  v2c.println("[popupTwitterInfo.js] " + (message ? message : 'null'));
}
function assert(condition) {
  if(!condition) {
    throw 'assertion failed!';
  }
}