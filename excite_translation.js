//【登録場所】 全体、レス表示、選択テキスト
//【ラベル】 Excite翻訳ポップアップ
//【コマンド1】 ${SCRIPT:S} excite_translation.js または ${SCRIPT:S} excite_translation.js enja //英語⇒日本語
//【コマンド2】 ${SCRIPT:S} excite_translation.js jaen //日本語⇒英語
//【コマンド3】 ${SCRIPT:S} excite_translation.js chja //中国語(簡体字)⇒日本語
//【コマンド4】 ${SCRIPT:S} excite_translation.js chjab //中国語(繁体字)⇒日本語
//【コマンド5】 ${SCRIPT:S} excite_translation.js koja //韓国語⇒日本語
//【コマンド6】 ${SCRIPT:S} excite_translation.js frja //フランス語⇒日本語
//【コマンド7】 ${SCRIPT:S} excite_translation.js deja //ドイツ語⇒日本語
//【コマンド8】 ${SCRIPT:S} excite_translation.js itja //イタリア語⇒日本語
//【コマンド9】 ${SCRIPT:S} excite_translation.js esja //スペイン語⇒日本語
//【コマンド10】 ${SCRIPT:S} excite_translation.js ptja //ポルトガル語⇒日本語
//【コマンド11】 ${SCRIPT:S} excite_translation.js menu //コマンド1～10のメニュー表示
//【更新日】 2011/02/11
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/128-130,138-139,329-331,717
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
		'enja' : ['english/','ENJA'],
		'jaen' : ['english/','JAEN'],
		'chja' : ['chinese/','CHJA'],
		'chjab' : ['chinese/','CHJA&big5=yes'],
		'koja' : ['korean/','KOJA'],
		'frja' : ['french/','FRJA'],
		'deja' : ['german/','DEJA'],
		'itja' : ['italian/','ITJA'],
		'esja' : ['spanish/','ESJA'],
		'ptja' : ['portuguese/','PTJA']
	};
	return function(arg) { return data[arg] || ['english/','ENJA'];};
})();
//翻訳の選択ポップアップでフォーム送信時の動作
function formSubmitted( u,sm,sd ){
	var m = ( u + '' ).match( /^(.+)\?(.+?)=/ );
	var d = arg2data( m[2] );
	createPopupString( m[1] + d[0], 'wb_lp=' + d[1] + '&before=' + encodeURIComponent( text ) );
	if( closePopupMenu ) vcx.closeOriginalPopup();//入力後閉じる。
}
//翻訳結果のポップアップ表示
function createPopupString( su , sd ){
	var hr = v2c.createHttpRequest( su, sd );
	var sr = hr.getContentsAsString();
	if ( !sr ) {
		v2c.alert( 'ページを取得できませんでした。: ' + hr.responseCode + ' '+ hr.responseMessage );
		return;
	}
	var mt = new Array(2);
	mt = sr.match( new RegExp( 'id="after"[^]*?>([^><]+?)</textarea>', 'i' ) );
	if( !mt ){
		v2c.alert( '検索結果を取得できませんでした。' ); return;
	}
	ph = '<html><body style="margin:0 5px;">' + mt[1] + '</body></html>';
	vcx.setPopupHTML( ph );
	if( copyText ) v2c.context.setClipboardText( mt[1] );//クリップボードにコピーする。
}
//翻訳する文字列の整形
function editText( text ){
	text = text.replaceAll( '>>([[\\d]+[,-]?]+)\\n', '$1さん。' );//アンカー+改行⇒番号さん。
	text = text.replaceAll( '>>([[\\d]+[,-]?]+)', '$1' );//アンカー⇒番号
	text = text.replaceAll( '[\\n　]', '' );//改行削除
	text = text.replaceAll( '([R|Q]T ?|)[@#][\\w]+[:]?', '' );//Twitter用、ハッシュタグ等削除
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
			+'<body><form action="h'+'ttp://www.excite.co.jp/world/"><table border="0" cellspacing="0" cellpadding="0">'
			+'<tr><th class = "header">Excite翻訳</th></tr>'
			+'<tr><input type="submit" value="  英⇒日  " name="enja"></tr><tr><input type="submit" value="  日⇒英  " name="jaen"></tr>'
			+'<tr><input type="submit" value="中(簡)⇒日" name="chja"></tr><tr><input type="submit" value="中(繁)⇒日" name="chjab"></tr>'
			+'<tr><input type="submit" value="  韓⇒日  " name="koja"></tr><tr><input type="submit" value="  仏⇒日  " name="frja"></tr>'
			+'<tr><input type="submit" value="  独⇒日  " name="deja"></tr><tr><input type="submit" value="  伊⇒日  " name="itja"></tr>'
			+'<tr><input type="submit" value="  西⇒日  " name="esja"></tr><tr><input type="submit" value="  葡⇒日  " name="ptja"></tr>'
			+'</table></form></body></html>' );
		vcx.setTrapFormSubmission( true );
		vcx.setMaxPopupWidth( 97 );
	} else if ( arg != 'menu' && text && ( text.length() > 0 ) ) {
		text = encodeURIComponent( text );
		var d = arg2data( arg );
		createPopupString( 'h'+'ttp://www.excite.co.jp/world/'+d[0], 'wb_lp='+d[1]+'&before='+text);
	}
})();
// ----- 前の行まで -----