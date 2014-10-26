//【登録場所】 全体、レス表示、選択テキスト
//【ラベル】タブを置換して貼りつけ
//【内容】選択文字列がある場合、【TAB】等を水平タブ\tに置換してコピー、
// そうでない場合、クリップボード内の水平タブ\tを、指定文字列（デフォルトは【TAB】）に置換してから書き込み欄に貼りつけ
// 前者は選択テキストに設定する。後者は全体もしくはレス表示に設定する。
// 両方登録して、マウスジェスチャを同じものにしておくとよいかも。
//【コマンド】 ${SCRIPT:Tc} replaceTab.js
//【スクリプト】
// ----- 次の行から -----
//設定
var strTab = '【TAB】'; //置換用の指定文字列
//
var vcx = v2c.context;
var st = vcx.selText;
var ct = v2c.clipboardText;
if ((!st || st.length() == 0) && ct) {
	vcx.insertToPostMessage(ct.replaceAll('\t',strTab));
} else if (st) {
	vcx.setClipboardText(st.replaceAll('[\\[【](?i)TAB(?-i)[\\]】]','\t'));//大文字・小文字の混在を考慮
}
// ----- 前の行まで -----