//【登録場所】 全体、レス表示、選択テキスト
//【ラベル】 google検索件数表示
//【内容】 検索結果の件数、類似キーワードをポップアップ表示
//※検索結果の件数が自動的にクリップボードにコピーされます。
//【コマンド】 $SCRIPT gglkey.js
//【更新日】 2009/10/21
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/77,79
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, key = vcx.selText, phr = '', k = 0;
var su0 = 'http://www.google.co.jp/search?q=';
var ml = [], sl = [], dr = [], pml = [];

function redirectURL( u ) {
	var sr = u.toString(), sw;
	if ( sr == su0 ) {
		key = v2c.prompt( '抽出キーワード', dr[0] );
		if( key == null ) {
			vcx.setPopupHTML( phr );
			v2c.context.setRedirectURL( true );
			return;
		}
		sw = encodeURIComponent( key );
	} else {
		var se = sr.match( new RegExp( 'q=([^]+?$)', 'i' ) );
		sw = se[1];
		var drs = encodeURIComponent( ',' + dr.join() + ',' );
		if ( drs.indexOf( '%2c' + sw + '%2c' ) >= 0 ) {
			vcx.setPopupHTML( phr );
			v2c.context.setRedirectURL( true );
			return u;
		}
		else {
			key = decodeURIComponent( sw );
		}
	}
	dr[k] = key;
	ml = [];
	createPopupString( sw );
}
function reduceOtherKey( kl, kln ) {
	var h = 0;
	kln = kln.sort();
	for ( var i = 0, a = kln.length; i < a; i++ ) {
		if ( kln[i] != kln[i+1] ) {
			for ( var j = 0, b = dr.length; j < b; j++ ) {
				if( kln[i] == dr[j] ) break;
			}
			if ( j == b ) {
				pml = pml.concat( kln[i] );
				kl[h+5] = '　<b><a href="'+su0+encodeURIComponent( kln[i] )+'">' + kln[i] + '</a></b> ';
				h++;
			}
		}
	}
	if ( h == 0 ) {
		kl[4] = null;
	}
	return kl;
}
function createPopupString( ss ) {
	var su = su0 + ss;
	var sh = v2c.readURL( su );
	if ( !sh ) {
		v2c.alert( 'ページを取得できませんでした。' );
		return;
	}
	var tt = sh.match( new RegExp( 'の検索結果 約 <b>[0-9,]+?</b> 件', 'i' ) );
	var mt = sh.match( new RegExp( '<p>[^]+?<br clear="all">','i' ) );
	if ( !mt || !tt ) {
		v2c.alert( '検索結果を取得できませんでした。' );
		return;
	}
	var ml1 = mt[0].match( new RegExp( 'spell[^]+?<b>(?:|<i>)([^><]+?)(?:|</i>)</b>', 'i' ) );
	if ( !ml1 ) {
		var ml2 = mt[0].match( new RegExp('([^><]+?)(?=</a></font></td><td>)', 'ig' ) );
	}
	if ( !ml2 ) {
		var ml3 = mt[0].match( new RegExp('([^><\.0-9,ﾟ]+?)(?=</b>[^]+?</font></font>)', 'ig' ) );
	}
	if ( !ss.match( '%22', 'i' ) ) {
		key = key + '';
		var dkey = '"' + key.replace( new RegExp( '[ 　]', 'ig' ), '" "' ) + '"';
		ml[0] = '引用符付:';
		ml[1] = '　<b><a href="' + su0 + encodeURIComponent( dkey ) + '">' + dkey + '</a></b><br>';
	}
	ml[2] = 'キーワード入力';
	ml[3] = '　<b><i><a href="' + su0 + '">click</a></i></b><br>';
	if (ml1) {
		ml[4] = 'もしかして:';
		ml[5] = '　<b><a href="' + su0 + encodeURIComponent( ml1[1] ) + '">' + ml1[1] + '</a></b>';
		pml = pml.concat( ml1[1] );
	} else if( ml2 ) {
		ml[4] = '他のキーワード:';
		ml = reduceOtherKey( ml, ml2 );
	} else if( ml3 ) {
		ml[4] = 'このキーワードで検索:';
		ml = reduceOtherKey( ml, ml3 );
	} else {
	}
	var mr = ml.join( '' );
	sl[k] = '<dt>【<a href="'+su+'">'+key+'</a>】' + tt + '</dt>';
	k++;
	var wr = sl.join( '' );
	phr = '<html><body style="margin:0 5px;"><dl>' + wr + '<dd>' + mr + '</dd></dl></body></html>';
	vcx.setPopupHTML( phr );
	v2c.context.setRedirectURL( true );
	var wrc = wr.replace( new RegExp( '</dt>', 'ig' ), '\n' );
	wrc = wrc.replace( new RegExp( '<[^]+?>', 'ig' ), '' );
	vcx.setClipboardText( wrc );
}
if ( !key || ( key.length() == 0 ) ) {
	key = v2c.prompt( "抽出キーワード", '' );
}
if ( key && ( key.length() > 0 ) ) {
	key = key.trim();
	dr[0] = key;
	pml[0] = key;
	createPopupString( encodeURIComponent( key ) );
}