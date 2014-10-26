//【登録場所】 全体、レス表示
//【ラベル】 テキストファイルにURLを記憶する or テキストファイルのURLを開く
//【内容】 他のコピー操作で、URLを失いたく無い人向け。提示板URLをテキストに保存しておき、必要なときに開く。
//※ 記憶するレス番号の優先順位は、チェックボックス有りのレス番 ＞ 抽出有りのレス番 ＞ 「レス表示」「全体」で実行したレス番
//【コマンド1】 ${SCRIPT:Fw} ThreadURLMemo.js //レス番号を含むスレURLをテキストファイルに記憶
//【コマンド2】 ${SCRIPT:Fr} ThreadURLMemo.js jump //記憶したスレを表示、レス番号にジャンプ
//【コマンド3】 ${SCRIPT:Fr} ThreadURLMemo.js popup //コマンド2か、スレが表示されていれば、レス番号をポップアップ
//【コマンド4】 ${SCRIPT:Fr} ThreadURLMemo.js filter //コマンド2か、スレが表示されていれば、レス番号を抽出
//【更新日】 2010/11/17
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/132,602
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
function writeThreadURL( txt ) {
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
	v2c.writeLinesToFile( txt, url, 'utf-8' );
}
function readThreadURL( txt ) {
	var url = v2c.readLinesFromFile( txt, 'utf-8' );
	if (!url) return;
	var act = vcx.args[0] + '';
	if( !th || ( th.url + '' ) != url[0] || url[1] == '' || act == 'jump') {
		v2c.openURL( url[0] + url[1], false );
		return;
	}
	if ( act == 'popup' ) {
		vcx.setPopupResIndex( arrayResNums( url[1] ) );
	} else if ( act == 'filter' ) {
		vcx.setFilteredResIndex( arrayResNums( url[1] ) );
	}
}
function threadURLMemo() {
	var txt = v2c.getScriptDataFile( 'ThreadURLMemo.txt' );
	var opt = vcx.args;
	if( opt.length == 0 && th ) {
		writeThreadURL( txt );
	}
	if( ( opt[0] + '' ).search( /(jump|popup|filter)/ ) > -1 ){
		readThreadURL( txt );
	}
}
threadURLMemo();
// ----- 前の行まで -----