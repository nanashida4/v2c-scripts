//【登録場所】 全体、レス表示
//【ラベル】 選択番号のレスタブを(開く|開いて更新|更新)
//【コマンド1】 ${SCRIPT:S} selectTab.js　選択タブを開く。
//【コマンド2】 ${SCRIPT:S} selectTab.js update1　選択タブを開いて、未取得レス有タブで更新する。
//【コマンド3】 ${SCRIPT:S} selectTab.js update2　選択タブを開いて、更新する。
//【コマンド4】 ${SCRIPT:S} selectTab.js update2 back　コマンド2,3の引数2にbackがあると選択タブを裏で更新する。
//＊今後${SCRIPT:S}になる可能性あり
//＊内部ブラウザタブなどは無視
//【更新日】 2010/03/29
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/168
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, option = vcx.args;
var tabnum = parseInt( v2c.prompt( "対象タブを選択(番号を入力)してください。", "" ) );
if ( tabnum > 0 ) {
	var gt = v2c.resPane.getThread( tabnum - 1 );
	if ( gt ) {
		var url= gt.url; //スレッドURL
		if ( url ) {
			var back = update = always = false, gn = 0;
			back = option[1] == "back"; //裏で開く
			m = ( option[0] + "" ).match( /^(update)(1|2)$/ );
			if ( m ) {
				update = m[1] == "update"; //更新
				always = m[2] == 2; //常に更新
			}
			if ( update && !always ) gn = gt.resCount - gt.localResCount; //未取得レス数
			update && ( gn > 0 || always ) ? v2c.openURL( url, true, true, back ) : v2c.openURL( url, false, true, back );
		}
	}
}
// ----- 前の行まで -----