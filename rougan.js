//【登録場所】 選択テキスト
//【ラベル】 選択テキストを拡大表示
//【内容】 選択テキストを拡大ポップアップします
//【コマンド】 $SCRIPT rougan.js
//【スクリプト】
// ----- 次の行から -----

//文字サイズをptで指定
createPopupString(72);

function createPopupString(size) {
var vcx = v2c.context;
var ss = vcx.selText;
ss = ss.replace('<','<').replace('>','>').replace('\n','<br>');
vcx.setPopupHTML('<html><head></head><body><span style="font-size:'+size+'pt">'+ss+'</span></body></html>');
vcx.setCloseOnMouseExit(true);
}