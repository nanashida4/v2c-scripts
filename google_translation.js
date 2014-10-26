//【登録場所】 全体、レス表示、選択テキスト
//【ラベル】 Google翻訳ポップアップ
//【コマンド1】 ${SCRIPT:S} google_translation.js //自動判定⇒日本語
//【コマンド2】 ${SCRIPT:S} google_translation.js enja //英語⇒日本語
//【コマンド3】 ${SCRIPT:S} google_translation.js jaen //日本語⇒英語
//【コマンド4】 ${SCRIPT:S} google_translation.js chja //中国語(簡体字)⇒日本語
//【コマンド5】 ${SCRIPT:S} google_translation.js chjab //中国語(繁体字)⇒日本語
//【コマンド6】 ${SCRIPT:S} google_translation.js koja //韓国語⇒日本語
//【コマンド7】 ${SCRIPT:S} google_translation.js frja //フランス語⇒日本語
//【コマンド8】 ${SCRIPT:S} google_translation.js deja //ドイツ語⇒日本語
//【コマンド9】 ${SCRIPT:S} google_translation.js itja //イタリア語⇒日本語
//【コマンド10】 ${SCRIPT:S} google_translation.js esja //スペイン語⇒日本語
//【コマンド11】 ${SCRIPT:S} google_translation.js ptja //ポルトガル語⇒日本語
//【コマンド12】 ${SCRIPT:S} google_translation.js ruja //ロシア語⇒日本語
//【コマンド13】 ${SCRIPT:S} google_translation.js arja //アラビア語⇒日本語
//【コマンド14】 ${SCRIPT:S} google_translation.js menu //コマンド1～13のメニュー表示
//【スクリプト】
// ----- 次の行から -----
//設定
var copyText = false;//クリップボードにコピーする。
var closePopupMenu = false;//引数'menu'の場合、選択ポップアップを入力後閉じる。
var closeOnMouseExit = true;//カーソルのポップアップ外でポップアップを閉じます。

var vcx = v2c.context,
    text = vcx.selText || vcx.res.message;
vcx.setDefaultCloseOnMouseExit( closeOnMouseExit );

//引数からURLに使う文字列を取得
var arg2data = ( function(){
	var data = {
		'enja' : ['en%7Cja'],
		'jaen' : ['ja%7Cen'],
		'chja' : ['zh-CN%7Cja'],
		'chjab' : ['zh-TW%7Cja'],
		'koja' : ['ko%7Cja'],
		'frja' : ['fr%7Cja'],
		'deja' : ['de%7Cja'],
		'itja' : ['ita%7Cja'],
		'esja' : ['es%7Cja'],
		'ptja' : ['pt%7Cja'],
		'ruja' : ['ru%7Cja'],
		'arja' : ['ar%7Cja']
	};
	return function(arg) { return data[arg] || ['auto%7Cja'];};
})();
//翻訳の選択ポップアップでフォーム送信時の動作
function formSubmitted( u,sm,sd ){
	var m = ( u + '' ).match( /^(.+)\?(.+?)=/ );
	var d = arg2data( m[2] );
	createPopupString( 'https://www.google.com/translate_t?langpair=' + d[0] + '&text=' + encodeURIComponent( text ) );
	if( closePopupMenu ) vcx.closeOriginalPopup();//入力後閉じる。
}
//翻訳結果のポップアップ表示
function createPopupString( su ){
	var hr = v2c.createHttpRequest( su );
	var sr = hr.getContentsAsString();
	if ( !sr ) {
		v2c.alert( 'ページを取得できませんでした。: ' + hr.responseCode + ' '+ hr.responseMessage );
		return;
	}
	var mt = new Array(2);
	mt = sr.match( new RegExp( 'id=result_box[^>]+?>([^]+?)</div>', 'i' ) );
	if( !mt ){
		v2c.alert( '検索結果を取得できませんでした。' ); return;
	}
	ph = '<html><body style="margin:0 5px;">' + mt[1] + '</body></html>';
	vcx.setPopupHTML( ph );
	v2c.context.setPopupFocusable(true);
	if( copyText ) v2c.context.setClipboardText( mt[1] );//クリップボードにコピーする。
}
//翻訳する文字列の整形
function editText( text ){
	text = text.replaceAll( '>>([[\\d]+[,-]?]+)\\n', '$1さん。' );//アンカー+改行⇒番号さん。
	text = text.replaceAll( '>>([[\\d]+[,-]?]+)', '$1' );//アンカー⇒番号
	text = text.replaceAll( '[\\s　]', ' ' );//改行削除
	text = text.replaceAll( '(?:[R|Q]T ?|)[@#]([\\w]+)[:]?', '$1' );//Twitter用、ハッシュタグ等削除
	var links = vcx.res.links, link;
	for ( var i=0, l = links.length; i < l; i++ ){//リンクの削除
		link = ( links[i] + '' ).substring(1);
		if( ( text + '' ).charAt( ( text + '' ).lastIndexOf( link ) - 1 ) == 'h' ) {
			link = 'h' + link;
		}
		text = text.replace( link+'','' );
	}
	text = text.trim();
	return text;
}
//実行形式の呼び出し
(function(){
	var arg = vcx.args[0];
	text = editText( text );
	if ( arg == 'menu' ) {
		vcx.setPopupHTML( '<html lang="ja"><style type = "text/css">'
			+'<!--body{background-color:#cccccc; color:black; text-align:center;}.header{font-size:small;}--></style>'
			+'<body><form action="http://www.google.com/translate_t"><table border="0" cellspacing="0" cellpadding="0">'
			+'<tr><input type="submit" value="  英⇒日  " name="enja"></tr><tr><input type="submit" value="  日⇒英  " name="jaen"></tr>'
			+'<tr><input type="submit" value="中(簡)⇒日" name="chja"></tr><tr><input type="submit" value="中(繁)⇒日" name="chjab"></tr>'
			+'<tr><input type="submit" value="  韓⇒日  " name="koja"></tr><tr><input type="submit" value="  仏⇒日  " name="frja"></tr>'
			+'<tr><input type="submit" value="  独⇒日  " name="deja"></tr><tr><input type="submit" value="  伊⇒日  " name="itja"></tr>'
			+'<tr><input type="submit" value="  西⇒日  " name="esja"></tr><tr><input type="submit" value="  葡⇒日  " name="ptja"></tr>'
			+'<tr><input type="submit" value="  露⇒日  " name="ruja"></tr><tr><input type="submit" value="  亜⇒日  " name="arja"></tr>'
			+'</table></form></body></html>' );
		vcx.setTrapFormSubmission( true );
		vcx.setMaxPopupWidth( 97 );
	} else if ( arg != 'menu' && text && ( text.length() > 0 ) ) {
		text = encodeURIComponent( text );
		var d = arg2data( arg );
		createPopupString( 'https://www.google.com/translate_t?langpair='+d[0]+'&text='+text);
	}
})();
// ----- 前の行まで -----