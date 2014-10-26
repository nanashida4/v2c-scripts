//【登録場所】 選択テキスト
//【ラベル】(簡易)正規表現でコピー
//【内容】 改行を含めたNGワード登録など、簡易正規表現に変換コピーする補助スクリプト。
//※NGワード登録は、非表示・キーワード設定→本文で、NGワードにペースト、『RE』にチェックを入れてください。
//【コマンド】 $SCRIPT txt2reg.js
//【更新日】 2009/12/26
//【元URL】 http://pc12.2ch.net/test/read.cgi/software/1260185912/229
// 　 　 　 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/242
//【スクリプト】
// ----- 次の行から -----
var str = v2c.getSelectedText() + "";
str=str.replace( /\n/g, "\\n" );
str=str.replace( /([.^$[\]{}*+?|()])/g, "\\$1" );
str=str.replace( /([^\\])\1+/g, "$1+" );
str=str.replace( /(.{2,}?)\1+(?!\+)/g, "($1)+" );
v2c.context.setClipboardText( str );
// ----- 前の行まで -----