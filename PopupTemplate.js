//【登録場所】 全体、レス表示
//【ラベル】 テンプレポップアップ
//【内容】 行数とリンクとIDから適当に判定して、テンプレをポップアップします。
//【コマンド】 $SCRIPT popupTemplate.js
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, th = vcx.thread;
var lc = th.localResCount;
function checkSearchID( id, list ) {
	for ( var i = list.length-1; i >= 0; i-- ) {
		if( list[i] == id ){
			return true;
		}
	}
	return false;
}
function addTempID( index_array, list ) {
	if( !index_array ) return list;
	for ( var i = 0, il = index_array.length; i < il && i < 10; i++ ) {
		if ( index_array[i] >= 10 ) break;
		var gr = th.getRes( index_array[i] );
		var nc = (gr.message + '').split(/\n+?/).length;
		var ll = gr.links.length;
		if( ll >= 1 || nc >= 15 ) list.push( gr.id + '' );
	}
	return list;
}
function createPopupString( ) {
	var gr = th.getRes(0);
	var tid = [ gr.id + '' ];
	tid = addTempID( gr.refResIndex, tid );
	var a = [0], m = [], rc = [];
	for ( var i = 1; i < 10 && i < lc; i++ ) {
		gr = th.getRes( i );
		if( gr.ng ) continue;
		tid = addTempID( gr.refResIndex, tid );
		var nc = (gr.message + '').split(/\n+?/).length;
		var ll = gr.links.length;
		if ( !checkSearchID( gr.id + '', tid ) && ( ll < 1 && nc < 15 )) {
			continue;
		} else {
			if ( ll <= 0 && nc <= 3 ) continue;
		}
		a.push( gr.index );
	}
	vcx.setPopupResIndex( a );
	//vcx.setFilteredResIndex( a ); //抽出
}
createPopupString();
// ----- 前の行まで -----
