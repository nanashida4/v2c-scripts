//【登録場所】 全体
//【ラベル】 TwitterログをTXTで保存
//【内容】 Twitterの仮想スレッドの取得済みログをdates.txt(V2C/script/scdata)に保存する。
//【コマンド】 ${SCRIPT:Fw} SaveDailyTwitterLog.js
//【更新日】 2010/08/03
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/273-274,310
//【スクリプト】
// ----- 次の行から -----
var ar=[];
var th=v2c.context.thread;
if (th) {
	var nr=th.localResCount;
	for (var i=0; i<nr; i++) {
		var res=th.getRes(i);
		if (res) {
			ar.push(res.name);
			ar.push(res.mail);
			ar.push(res.date);
			ar.push(res.id);
			ar.push(res.message);
		}
	}
}
v2c.writeLinesToFile(v2c.getScriptDataFile('dates.txt'),ar);
// ----- 前の行まで -----
