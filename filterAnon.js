//【登録場所】 全体、レス表示
//【ラベル】 名無し抽出
//【内容】 登録した名無しも含めて抽出
//【コマンド1】 $SCRIPT filterAnon.js
//【コマンド2】 $SCRIPT filterAnon.js n //名無し以外を抽出
//【更新日】 2011/02/05
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/712
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, th = vcx.thread;
function filterAA() {
	var lrc = th.localResCount, name = '', lis = [], res;
	var n = vcx.args[0] == 'n';
	var anon = th.board.allAnonymousName;
	var al = anon.length;
	for( var i = 0; i < lrc; i++ ) {
		res = th.getRes( i )
		if( !res ) continue;
		name = res.name + '';
		for( var j = 0; j < al; j++) {
			if( name == anon[ j ]　) {
				if( !n ) lis.push( res.index );
				break;
			}
		}
		if( ( j == al ) && n ) lis.push( res.index );
	}
	vcx.setFilteredResIndex( lis );
}
if( th ) filterAA();
// ----- 前の行まで -----