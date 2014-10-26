//【登録場所】 レス表示
//【ラベル】 何日前のレスか表示
//【内容】 実行したレスが何日前に書き込まれたかポップアップ
//【コマンド1】 $SCRIPT ago.js
//※ 実行したレス以降にチェックしたレスがあると、そこまでの時間を計算します。
//【更新日】 2010/05/05
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/13,929
//【スクリプト】
// ----- 次の行から -----
//実行したレス以降にチェックをしたレスがあるか検索
function searchCheckedRes(vcx){
	var a = vcx.checkedResIndex;
	var n = vcx.res.index;
	var l = a.length;
	if(!a) return;
	for(var i = 0; i < l; i++){
		if( a[i] > n ) return vcx.thread.getRes(a[i]);
	}
}
function createPopupString() {
	var vcx = v2c.context;
	var cr = searchCheckedRes(vcx);
	
	//現在の日時
	var pd = cr ? new Date(cr.time) : new Date();
	var str = cr ? "チェックした" : "現在の";
	var jpd = java.text.SimpleDateFormat( str + "日付[yyyy/MM/dd] 時刻[HH:mm:ss]" ).format( pd );

	//ミリ秒単位で計算
	var nd = pd.getTime();
	var rd = vcx.res.time;
	var rr = nd - rd
	var rema = rr % 86400000;
	var day = ( rr - rema ) / 86400000;
	var remh = rema % 3600000;
	var hour = ( rema - remh ) / 3600000;
	var remo = remh % 60000;
	var mint = ( remh - remo ) / 60000;
	var msec = remo % 1000;
	var sec = ( remo - msec ) / 1000;

	var rda = "これは" + day + "日と" + hour + "時間" + mint + "分" + sec + "秒前のレスです。";
	vcx.setPopupHTML( '<HTML><BODY style="color:green"><center>' + jpd + '<BR>' + rda + '</center></BODY></HTML>' );
}
createPopupString();
// ----- 前の行まで -----