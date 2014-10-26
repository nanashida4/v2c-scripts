//【登録場所】 全体、レス表示
//【ラベル】　　(この|次の|前の)日で最初のレスにジャンプ(、抽出)
//【コマンド１】 $SCRIPT dailyres.js　選択日の最初のレスにジャンプ
//【コマンド２】 $SCRIPT dailyres.js next　(選択日から最近の)次の日で、最初のレスにジャンプ
//【コマンド３】 $SCRIPT dailyres.js prev　(選択日から最近の)前の日で、最初のレスにジャンプ
//【コマンド４】 $SCRIPT dailyres.js filter　選択日で抽出
//【コマンド５】 $SCRIPT dailyres.js next filter　選択日の次の日で抽出
//【コマンド６】 $SCRIPT dailyres.js prev filter　選択日の前の日で抽出
//【更新日】 2009/03/20
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/99-100,115-116,140
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, th = vcx.thread, rs = vcx.res, args = vcx.args, dt = rs.date, da, tt, db, dbt;
var pd = new Date( java.text.SimpleDateFormat( 'yyyy/MM/dd' ).format( new Date() ) ).getTime();
if ( dt ) {
	var pt1 = new RegExp( '^.+?\\(.\\)' );
	da = dt.match(pt1) + '';
}
if ( da ) {
	var ix = rs.index, tl = th.localResCount, tgd = '', idx;
	var pt2 = new RegExp( '\\d{4}(?:\\/\\d{2}){2}' ), fr = new Array();
	//レス番抽出、あぼーんは無視
	if( args[0] == 'next' ){
		for ( var i = ix; i < tl; i++ ) {
			tgd = th.getRes( i ).date;
			if( !tgd || tgd.search( pt2 ) == -1 ) continue;
			if( tgd.indexOf( da ) == -1) break;
		}
		da = tgd.match(pt1) + '';
		for ( var j = i; j < tl; j++) {
			tgd = th.getRes(j).date;
			if ( !tgd || tgd.search( pt2 ) == -1 ) continue;
			fr.push( j );
			if( tgd.indexOf( da ) == -1 ) break;
		}
		if ( j < tl ) fr.pop();
	} else {
		for ( var i = ix; i > -1; i-- ) {
			tgd = th.getRes( i ).date;
			if ( !tgd || tgd.search( pt2 ) == -1 ) continue;
			if ( args[0] != 'prev' ) fr.push( i );
			if ( tgd.indexOf( da ) == -1 ) break;
		}
		if ( args[0] == 'prev' ) {
			da = tgd.match( pt1 ) + '';
			for ( var j = i; j > -1; j-- ) {
				tgd = th.getRes( j ).date;
				if ( !tgd || tgd.search( pt2 ) == -1 ) continue;
				fr.push( j );
				if ( tgd.indexOf( da ) == -1 ) break;
			}
			if ( j > -1 ) fr.pop();
		} else {
			if ( i > -1 ) fr.pop();
			for ( var j = ix + 1; j < tl; j++ ) {
				tgd = th.getRes(j).date;
				if ( !tgd || tgd.search( pt2 ) == -1 ) continue;
				fr.push( j );
				if ( tgd.indexOf( da ) == -1 ) break;
			}
			if ( j < tl ) fr.pop();
		}
	}
	fr = fr.sort( function( a, b ) { return parseInt( a - b ); } );
	if ( fr.length > 0 ) {
		if ( args[0] == 'filter' || args[1] == 'filter' ) vcx.setFilteredResIndex( fr );
		fd = new Date( da.match( pt2 ) ).getTime();
		db = ( pd - fd ) / 86400000;
		if ( db == 0 ) {
			dbt = '【今日】：';
		} else if ( db == 1 ) {
			dbt = '【昨日】：';
		} else {
			dbt = '【' + db + '日前】：';
		}
		vcx.setStatusBarText( da + dbt + fr.length + 'レス' );
		vcx.setResIndexToJump( fr[0] );
	} else {
		if ( args[0] == 'next' ) {
			vcx.setResIndexToJump( tl - 1 );
			vcx.setStatusBarText( '次の日はありません。' );
		}
		if ( args[0] == 'prev' ) {
			vcx.setResIndexToJump( 0 );
			vcx.setStatusBarText( '前の日はありません。' );
		}
	}
}
// ----- 前の行まで -----