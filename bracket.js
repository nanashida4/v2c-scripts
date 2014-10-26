//【登録場所】 全体
//【ラベル】 括弧(「」)で囲む
//【内容】 書き込み欄で、選択範囲を括弧などで囲む変換を行う
//【コマンド1】 $SCRIPT bracket.js //デフォルトは「」
//【コマンド2】 $SCRIPT bracket.js "『" "』" //二重鉤括弧で囲む
//【更新日】 2010/05/05
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/88,93,929
//【スクリプト】
// ----- 次の行から -----
//デフォルト
var bfo = "「"; //選択範囲の『前』に挿入
var aft = "」"; //選択範囲の『後』に挿入

var args = v2c.context.args;
var st = v2c.getSelectedText();
if( args.length >= 1 ){
	bfo = args[0];
	if( args.length >= 2 ){
		aft = args[1];
	}
}
if ( st ) {
	v2c.replaceSelectedText( bfo + st + aft );
}
// ----- 前の行まで -----