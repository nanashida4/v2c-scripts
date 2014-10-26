//【登録場所】 全体、レス表示
//【ラベル】 単発ID「以外」を抽出
//【コマンド】 $SCRIPT e1id.js
//【更新日】 2009/09/14
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/28
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var th = vcx.thread;
if ( th ) {
	var nr = th.localResCount;
	var bo = false;
	var ar = new Array();
	for ( var i = 0; i < nr; i++ ) {
		var rs = th.getRes( i );
		if ( rs ) {
			if ( rs.idCount != 1 ) {
				ar.push( i );
			} else if ( !bo ) {
				bo = true;
			}
		}
	}
	if ( bo ) {
		vcx.setFilteredResIndex( ar );
	}
}
// ----- 前の行まで -----