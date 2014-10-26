//【登録場所】 全体、レス表示
//【ラベル】 クリップボードにURLをコピーする or クリップボードのURLを開く
//【内容】 外部URLからの表示向け、または「（この）レスのURLをコピー」のショートカット向け、クリップボードで提示板URLをコピーまたは開く
//※ コピーするレス番号の優先順位は、チェックボックス有りのレス番 ＞ 抽出有りのレス番 ＞ 「レス表示」「全体」で実行したレス番
//【コマンド1】 ${SCRIPT:Tc} ClipboardThreadURL.js //レス番号を含むスレURLをクリップボードにコピー
//【コマンド2】 ${SCRIPT:Tc} ClipboardThreadURL.js jump //コピーしたスレを表示、レス番号にジャンプ
//【コマンド3】 ${SCRIPT:Tc} ClipboardThreadURL.js popup //コマンド2か、スレが表示されていれば、レス番号をポップアップ
//【コマンド4】 ${SCRIPT:Tc} ClipboardThreadURL.js filter //コマンド2か、スレが表示されていれば、レス番号を抽出
//【更新日】 2010/11/17
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/530,602
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var res = vcx.res;
var th = vcx.thread;
//レス番号(インデックス)ArrayからV2Cリンク用にまとめた文字列を返す。
function collateNums( ns, i ){ //Array, インデックスArray？
	var t = -1;
	return ns.sort( function( a, b ) {
		return a - b; } ).join( ',' ).replace( /(?:\d+|,)/g, function( n, p ) {
			var m = parseInt( n ) + i;
			if ( n == ',' || t == m ) return '';
			var s = ( t == m - 1 ) ? ( '-' + m ) : ( p ? ',' + m : m );
			if ( n != ',' ) t = m;
			return s;
		}).replace( /(\d+)-[-\d]+-(\d+)/g, '$1-$2' );
}
//V2Cリンク用レス番号文字列からレス番号インデックスArrayを返す。
function arrayResNums( s ){
	var a = ( s + '' ).split( /[,+]/ ), p = [];
	for( var i = 0; i < a.length; i++ ){
		var n = a[i].match( /(\d+)-?(\d*)/ );
		if( !n ) continue;
		var start = parseInt( n[1] - 1 );
		var end = parseInt( n[2] - 1 );
		if( start < 1001 && end < 1001 ) {
			a[i] = start;
		} else {
			a[i] = "";
			continue;
		}
		var diff = end-start;
		if( n[2] != "" && diff != 0 ) {
			if( diff < 0 ) {
				start = end;
				end = a[i];
				a[i] = start;
			}
			for( var j = start+1; j <= end; j++ ) {
				p.push( j );
			}
		} else {
			continue;
		}
	}
	return a.concat(p).sort( function( a, b ) { return a - b; } );
}
function writeClipboardURL(){
	var url = new Array(2);
	url[0] = th.url;
	var lrc = th.localResCount;
	var fri = vcx.filteredResIndex;
	var cri = vcx.checkedResIndex;
	if ( cri.length > 0 ) {
		url[1] = collateNums( cri, true );
	} else if ( fri.length != lrc ) {
		url[1] = collateNums( fri, true );
	} else {
		url[1] = res.number;
	}
	vcx.setClipboardText( url.join('') );
}
function readClipboardURL(){
	var txt = v2c.clipboardText;
	var m = txt.match( /^(h?ttp:\/\/.+?\/)([+\d,-]*?)$/ );
	if(!m) {
		v2c.alert( 'URLを取得できませんでした。' );
		return;
	}
	var gt = v2c.getThread(m[1]);
	if(!gt) {
		v2c.alert( 'スレッドURLを取得できませんでした。' );
		return;
	}
	var act = vcx.args[0] + '';
	if( !th || ( th.url + '' ) != m[1] || m[2] == '' || act == 'jump' ) {
		v2c.openURL( m[1] + m[2], false );
		return;
	}
	if ( act == 'popup' ) {
		vcx.setPopupResIndex( arrayResNums( m[2] ) );
	} else if ( act == 'filter' ) {
		vcx.setFilteredResIndex( arrayResNums( m[2] ) );
	}
}
function clipboardThreadURL() {
	var opt = vcx.args;
	if( opt.length == 0 && th ) {
		writeClipboardURL();
	}
	if( ( opt[0] + '' ).search( /(jump|popup|filter)/ ) > -1 ){
		readClipboardURL();
	}
}
clipboardThreadURL();
// ----- 前の行まで -----