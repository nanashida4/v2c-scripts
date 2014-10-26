//【登録場所】 リンク
//【ラベル】 上位のディレクトリを開く
//【内容】 リンクの上位のディレクトリのリンクをポップアップ表示する。
//　　　　　FirefoxのLocationbar2が元ネタ。ポップアップですが…
//【コマンド】 $SCRIPT splitURLStr.js
var vcx = v2c.context, arg = vcx.args[0];
var URL = vcx.link+'', s = '';
var SegArr = [], HtmlArr = [];

//URLを配列に分割
SegArr = URL.split('/');
var sl = SegArr.length, urlend = '';
if(SegArr[sl-1] == ''){urlend = '/'; SegArr.pop(); sl -=1;}

//ポップアップ表示形式
var head = SegArr[0]+'//';//行頭、SegArr[0]はhttp:,https:などのスキーム
var space = '/';//区切り
var end = '';//行末
var slashend = '/';//行末、URLがスラッシュで終わる場合
//var head = '【　';//行頭
//var space = '　＞　';//区切り
//var end = '　】';//行末
//var slashend = '　】';//行末、URLがスラッシュで終わる場合

//HTML作成
if((sl == 4 && SegArr[3].length > 0) || sl >= 5){
　HtmlArr[0] = '<html lang="ja"><body style = "margin: 4px 0 4px 15px; background-color:#fcfcfc; color:black;"><div>'+head;
　sl >= 4 ? s = space : s = '';
　HtmlArr[sl-1] = '</div></body></html>';
　if(urlend == '/'){
　　HtmlArr[sl-2] = s+'<a href="'+SegArr.join('/')+urlend+'">'+SegArr[sl-1]+'</a>'+slashend;
　} else {
　　HtmlArr[sl-2] = s+'<a href="'+SegArr.join('/')+'">'+SegArr[sl-1]+'</a>'+end;
　}
　for(i = SegArr.length; i >= 4; i--){
　　SegArr = SegArr.slice(0,i-1);
　　SegArr[i-1] = '';
　　i >= 5 ? s = space : s = '';
　　HtmlArr[i-3] = s + '<a href="'+SegArr.join('/')+'">'+SegArr[i-2]+'</a>';
　}
}
vcx.setPopupHTML(HtmlArr.join(''));

