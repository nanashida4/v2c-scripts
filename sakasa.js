//【登録場所】 選択テキスト
//【ラベル】 選択テキストを逆順にしてクリップボードにコピー
//【内容】 選択テキストを逆順にしてクリップボードにコピー
//【コマンド】 ${SCRIPT:Tc} sakasa.js
//【スクリプト】
// ----- 次の行から -----
// 選択テキストを取得
var str = new String(v2c.context.selText);
// 逆順テキスト用変数
var ret = "";
//
var len=str.length;
// 選択テキストの内容を逆順にretへセット
for (i = 0; i < len ; i++) {
    ret=ret+str.charAt(len-i-1);
}
// 逆順テキストをポップアップ表示（デバッグ用）
// v2c.context.setPopupText(ret);
// 逆順テキストをクリップボードにコピー
v2c.context.setClipboardText(ret);