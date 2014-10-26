//【登録場所】リンク、選択テキスト
//【ラベル】ソースを見る
//【内容】ソースをテキスト形式でポップアップ、h抜き対応
//【コマンド】$SCRIPT PopupSource.js
//【スクリプト】
PopupSource();

function PopupSource(){
var ss=" ";
if (v2c.context.selText){
ss = v2c.context.selText;
}
if (v2c.context.link){
ss = v2c.context.link;
ss=ss.toString();
}

if (ss) {
ss = ss.trim();
}
if (!ss) {
v2c.alert('選択テキスト取得失敗');
return;
}

if(ss.match(/(ttp:\/\/.+)/)){
ss = 'h'+RegExp.$1
}

if(ss.match(/(http:\/\/.+)/)){
var source = v2c.readURL(ss);
}
else{
v2c.alert('選択されたテキストにURLが見つかりません');
return;
}

if (!source) {
v2c.alert('ページ取得失敗');
return;
}

v2c.context.setPopupText(source);
return;
}
