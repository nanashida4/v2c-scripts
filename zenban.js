//【登録場所】 全体、レス表示
//【ラベル】全板縦断ランキングポップアップ
//【内容】２ちゃんねる全板・勢いランキング (http://2ch-ranking.net/)
//　　　　　の全板縦断ランキング上位10位を簡易ポップアップ表示。
//【コマンド1】 $SCRIPT zenban.js
//【コマンド2】 $SCRIPT zenban.js copy //ポップアップ時、クリップボードにコピー
//【コマンド3】 $SCRIPT zenban.js 3 //2:50位まで、3:75位まで、4:100位まで、それ以外は25位まで(ただし、3、4は全板のみ有効)
//【コマンド4】 $SCRIPT zenban.js tab //新規タブで表示
//※コマンド2,3,4の引数は組み合わせ可能です。
//※コピーボタンを削除したい場合は、90行目を削除、または行頭に『//』を追加してください。
//【更新日】 2013/06/27
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/280,427,507,551,570,581
//【元URL2】http://yy61.60.kg/test/read.cgi/v2cj/1304861674/853
//【元URL3】http://yy61.60.kg/test/read.cgi/v2cj/1365215326/121
//【スクリプト】 
// ----- 次の行から -----
var default_url = 'http://2ch-ranking.net/index.html?board=zenban';
var vcx = v2c.context;
var sr = '';
function copyTable( str ) {
	return vcx.setClipboardText( str.replace( /<[^<>]{0,}>/ig, function( a ) {
			if( a == '</tr>' )
				return '\n';
			else if ( a == '</th>' || a == '</td>' )
				return '　';
			else
				return '';
			} ).replace( /\n順位.+?\n/ig, '\n') );
}
function formSubmitted( u, sm, sd ) {
  if( sd.indexOf('copy=') == 0 ) {
  	  copyTable( sr );
  }
}
function redirectURL( u ) {
	var url = u + '';
	if ( url.search( /http:\/\/2ch-ranking\.net\/index\.html\?board=/i ) > -1) {
		createPopupString( url, true );
	} else {
		return u;
	}
}
function createPopupString( url, newtab ) {
	var sh = v2c.readURL( url );
	if ( !sh ) {
		v2c.alert( 'ページを取得できませんでした。' );
		return;
	}
	var opts = vcx.args, cp = false, tab = false, rk = 1;
	for ( var i = 0, il = opts.length; i < il; i++ ) {
		if ( opts[i] == 'copy' ) cp = true;
		if ( opts[i] == 'tab' ) tab = true;
		if ( opts[i] == 2 || opts[i] == 3 || opts[i] == 4 ) rk = opts[i];
	}
	mt = sh.match(/<title>([^]+?)：/i);
	if ( !mt ) {
		v2c.alert( 'タイトルを抽出できませんでした。' );
		return;
	}
	var board = mt[1].replace('縦断ランキング', '');
	var mr = [];
	var rgex = new RegExp( '<table(?: class="forces first_f"|) width="100%"(?: class="forces"|)>([^]+?)</table>', 'ig')
	while( rgex.exec( sh ) != null) {
		mr.push('<table border="0" cellpadding="2" cellspacing="0" width="100%">' + RegExp.$1 + '</table>');
	}
	if ( mr.lenght == 0 ) {
		v2c.alert( 'リストを抽出できませんでした。' );
		return;
	}
	sr = mr.slice(0, rk).join('<br>');
	sr = sr.replace( /\.(\/index\.html\?board=\w+?\">)/ig, 'http://2ch-ranking.net$1' );
	sr = sr.replace( /http:\/\/cache\.2ch-ranking\.net\/cache\.php\?thread=([^\/]+)\/(\w+)\/(\d+)\/&amp;res=100/ig, 'http://$1/test/read.cgi/$2/$3/');
	sr = sr.replace( /<a id=\"ikioi[^]+?>(\d+?)<\/a>/ig, '$1');
	css = '<style type = "text/css"><!--'
		+'body{}' //ポップアップ全体
		+'a{}' //リンク
		+'.header{background-color: #dddddd;}' //ヘッダ行
		+'.even{}' //偶数行
		+'.odd{background-color: #eeeeee;}' //奇数行
		+'.u{color: red;}' //『↑』(順位上昇)
		+'.d{color: blue;}' //『↓』(順位下降)
		+'.n{color: fuchsia;}' //『new』(新規)
		+'.e{color: green;}' //『=』(変動なし)
		+'.rank{text-align: right; width:5%}' //順位
		+'.kako{text-align: center; width:7%}' //1H前比
		+'.board{text-align: center; width:13%}' //板名
		+'.title{}' //スレッドタイトル
		+'.res{text-align: right; width:7%}' //レス数
		+'.ikioi{text-align: right; width:5%}' //勢い
		+'--></style>';
	sr = '<html><header>' + css + '</header><body style="margin:5px;">'
		+ '<form action="" align="right"><input type="submit" value="コピー" name="copy"></form>' //この行削除または行頭に『//』追加で、コピーボタン削除
		+ sr + '</body></html>';
	if ( tab ) {
		vcx.setResPaneHTML( sr, board + '・勢いランク', newtab );
	} else {
		vcx.setPopupHTML( sr );
	}
	vcx.setRedirectURL( true );
	vcx.setTrapFormSubmission( true );
	if ( cp ) {
		copyTable( sr );
	}
}
createPopupString( default_url, true );
// ----- 前の行まで -----