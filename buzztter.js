//【登録場所】全体、レス表示
//【ラベル】Buzztter
//【内容】Twitterの人気ワードをポップアップ
//【コマンド】$SCRIPT buzztter.js
//【スクリプト】
// ----- 次の行から -----
popupBuzztter();
function popupBuzztter() {
	try { var s = v2c.readURL( 'http://buzztter.com/ja' ); }
	catch (e) { return v2c.alert( '通信エラー\n' + e ); }
	if( s.match( /buzzphrases'>([\s\S]+?)<\/div/i ) ) var h = RegExp.$1;
	else return v2c.alert( '解析エラー' );
	var css = '<!--body{background-color:#ffcce6;margin:5px;}a{color:black;}-->';
	h = h.replace( /href="\//ig , 'href="http://buzztter.com/' );
	h = '<html><head><style type="text/css">' + css + '</style></head><body>'
	 + h + '</body></html>';
	v2c.context.setMaxPopupWidth(400)
	v2c.context.setPopupHTML(h);
}
// ----- 前の行まで -----