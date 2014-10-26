//【登録場所】全体・レス表示・リンク・選択テキスト
//【ラベル】新規タブではてなブックマーク表示
//【内容】指定したURLがはてなブックマークに登録されていれば「ブックマークしている合計ユーザ数」「ブックマークしたユーザ名」「ブックマークコメント」を表示。指定ユーザーを非表示にする事も可能。
//【コマンド】${SCRIPT:FrSTc} b_hatena_tab.js
//【備考1】json_parse_state.js必須。json_parse_state.jsをV2C保存用フォルダ以下の"script"フォルダに置く。https://github.com/douglascrockford/JSON-js
//【備考2】複数リンクが対象の場合は不可。
//【備考3】指定ユーザーを非表示する機能の説明はreadme.txtを参照。
//【スクリプト】
// ----- 次の行から -----

SETTING_FILENAME="HatenaViewSetting";

function toJavascriptArray(javaObj){
  //JAVAのArrayを受け取ってJavaScriptの配列にして返す
  var tempArray=new Array();
    for(var i in javaObj){
      tempArray.push(javaObj[i]);
    }
  return tempArray;
}

function isNotNGUser(bmData){
  //NGuserではなかったらtrueを返す
  var ngflg=true;

  var f=v2c.getScriptDataFile(SETTING_FILENAME);
  //JAVAの文字列型の配列(Array)が返ってくる。長さを動的に変更できない
  var t=v2c.readLinesFromFile(f);
  //ngUserList.push(s);で追加が可能。NGユーザーを追加する機能を付ける時に使う
  ngUserList=toJavascriptArray(t);
  
  for (var nguI=0;nguI<ngUserList.length;nguI++){
    if (bmData["user"]==ngUserList[nguI]){
      ngflg=false;
      break;
    }//if
  }//  for (var nguI=0;nguI<ngUserList.length;nguI++){
  return ngflg;
}//function isNotNGUser(bmData){

function getAndMakeURI(){
  //V2CやユーザーからURIを取得してJSONファイルのURIを返す
  var ss=" ";
  if (v2c.context.selText){ss=v2c.context.selText;}
  if (v2c.context.link){
    ss=v2c.context.link;
    ss=ss.toString();
  }
  if (ss==" ") {
    ss=v2c.prompt("はてなブックマークのコメントを閲覧したいURLを入力して下さい","");
    }
  if (ss) {ss=ss.trim();}
  if (!ss) {
    //v2c.alert("選択テキストを取得できませんでした。");
    v2c.context.setPopupText("選択テキストを取得できませんでした。");
    return;
  }

  //ss=ss.replace("&", "%26");//URIに含まれる&を%26に変換しないと&以前をURIとして処理されてしまう
  //ss=ss.replace("#", "%23");
  //URIに含まれる#を%23にエスケープする必要がある
  //http://developer.hatena.ne.jp/ja/documents/bookmark/apis/getinfo
  ss=encodeURIComponent(ss);
  var uri="http://b.hatena.ne.jp/entry/jsonlite/?url="+ss;
  
  return uri;
}//function getAndMakeURI(){


function getAndParseJSONData(uri){
  //JSONファイルのURIを受け取り、パースされたJSONオブジェクトを返す
  var hr=v2c.createHttpRequest(uri);
  var jst=hr.getContentsAsString();
  
  //登録されていないURLのはてブを要求した場合、nullが返ってくる。httpレスポンスコードはほかの場合と同じ200を返すのでnullか否かで判断
    if (jst=="null") {
      v2c.context.setPopupText("ページを取得できませんでした。");
      return;
    }
  
  eval(String(v2c.readFile(fl)));
  
  //json_parse_state.js使用
  var jsonObj=json_parse(jst);
  
  return jsonObj;
}//function getAndParseJSONData(uri){


function makeHtmlAndTitle(jsonObj){
  //JSONオブジェクトを受け取り、表示したいHTML文字列とタブタイトルが入ったオブジェクトを返す
  //obj.html:HTML文字列
  //obj.title:タブタイトル文字列
  var bm=jsonObj["bookmarks"];
  var usernum=jsonObj["count"];
  var entry_url=jsonObj["entry_url"];
  var url=jsonObj["url"];
  var title=jsonObj["title"];
  var usertxt=usernum+"人";
  var txt="";
  
  var fBM=bm.filter(isNotNGUser);
  
  var rtnObj={};
  var htmlStrArray=[];
  var cssStr='h1{border-left:3px solid; border-bottom:1px solid; font-size:120%; margin:0px;} a{color:"#365468";} ul{margin-left:5px;} div{margin-left:5px;}';
  htmlStrArray[0]='<html><head><meta http-equiv="Content-Style-Type" content="text/css"><style type="text/css"><!--';
  htmlStrArray[1]=cssStr;
  htmlStrArray[2]='--></style>';
  htmlStrArray[3]='<body><h1><a href="'+url+'">'+title+'</a></h1><div><p>'+usertxt+'</p>';
  htmlStrArray[5]='<p><a href="'+entry_url+'">'+'エントリーページを開く'+'</a></p>';
  htmlStrArray[6]='</div></body></html>';
  
  //コメント表示部分の処理
  commentStr="<ul>";
  for (var i in fBM){
    commentStr=commentStr+"<li>"+fBM[i]["timestamp"]+"   "+fBM[i]["comment"]+"   "+fBM[i]["user"]+"   "+fBM[i]["tags"]+"</li>";
  }
  commentStr=commentStr+"</ul>";
  htmlStrArray[4]=commentStr;
  
  rtnObj.html=htmlStrArray.join("");
  rtnObj.title=title;
  
  return rtnObj;
}//function makeHtmlAndTitle(jsonObj){


function wrapper(){

//取得に失敗した場合はundefinedが返ってくる
var bmURI=getAndMakeURI();
if (!bmURI){return;}

//JSONファイルをパースするための準備
fl = new java.io.File(new java.io.File(v2c.saveDir,'script'),'json_parse_state.js');

//取得に失敗した場合はundefinedが返ってくる
var jobj=getAndParseJSONData(bmURI);
if (!jobj){return;}

var outObj=makeHtmlAndTitle(jobj);

v2c.context.setResPaneHTML(outObj.html,outObj.title);
}//function wrapper{

wrapper();

