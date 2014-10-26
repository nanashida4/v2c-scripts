//【登録場所】 選択テキスト
//【ラベル】 部分引用レス
//【内容】 選択範囲の文字列を、アンカーなしの『> 』付き引用で書き込み欄に挿入
//【コマンド】 $SCRIPT QuoteNoAnchor.js
//※スクリプトの3行の内、いずれかの行で、行頭『//』のないものが使用されます。
//【更新日】 2009/10/25
//【元URL】 http://pc12.2ch.net/test/read.cgi/software/1255525714/257
// 　 　 　 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/240,247
//【スクリプト】
// ----- 次の行から -----
//v2c.context.insertToPostMessage('>'+v2c.context.selText.replaceAll('\n(?!$)','\n>')); //最後に改行無し
//v2c.context.insertToPostMessage('>'+v2c.context.selText.replaceAll('\n(?!$)','\n>')+'\n'); //最後に改行
v2c.context.insertToPostMessage('>'+v2c.context.selText.replaceAll('\n(?!$)','\n>')+'\n'+'\n'); //最後に改行＋改行
// ----- 前の行まで -----