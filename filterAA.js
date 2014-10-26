//【登録場所】 全体、レス表示
//【ラベル】 AA抽出
//【内容】 AAを判定（半角スペースと全角スペースの連続）抽出
//【コマンド1】 $SCRIPT filterAA.js
//【コマンド2】 $SCRIPT filterAA.js n //AA以外を抽出
//【更新日】 2011/02/05
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/711
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, th = vcx.thread;
function filterAA() {
	var lrc = th.localResCount, msg = '', lis = [], res;
	var n = vcx.args[0] == 'n';
	for( var i = 0; i < lrc; i++ ) {
		res = th.getRes( i )
		if( !res ) continue;
		msg = res.message + '';
		if( ( msg.search(/( 　|　 )/) == -1 ) == n ) {
			lis.push( res.index );
		}
	}
	vcx.setFilteredResIndex( lis );
}
if( th ) filterAA();
// ----- 前の行まで -----