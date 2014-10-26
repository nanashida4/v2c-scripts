//【登録場所】全体、レス表示
//【ラベル】ソートしてまとめ
//【内容】スレを時間でソートしてまとめたスレッドを新タブで作る。
//※レス数とマシンスペック応じて表示に時間がかかります。
//※ローカルスレで実行するとそのスレをソート、それ以外はレス表示欄にあるローカルとツイッター以外のスレッドをすべてまとめてソート
//【コマンド】${SCRIPT:Fw} sortResThread.js ローカル板のフォルダ
//【更新日】2010/12/25
//【元レス】http://yy61.60.kg/test/read.cgi/v2cj/1252074124/670
//【スクリプト】
function createSortResThread() {
	var args=v2c.context.args;
	if (args.length==0) {
		return "板のフォルダが指定されていません。";
	}
	var bd=v2c.getLocalBoard(args[0]);
	if (!bd) {
		return "ローカル板を取得できませんでした。";
	}
	var th=v2c.context.thread, all=false;
	if (th.local) {
		var tha=[th];
	} else {
		var tha=v2c.resPane.threads;
		all=true;
	}
	if (tha.length==0) {
		return "レス表示タブが存在しません。";
	}
	var ra=[];
	for (var it=0; it<tha.length; it++) {
		th=tha[it];
		if (all&&(th.local||th.bbs.twitter)) {
			continue;
		}
		var nrl=th.localResCount, rt=[], nr=0;
		for (var i=0; i<nrl; i++) {
			var res=th.getRes(i);
			if(!res || !res.time) continue;
			rt.push(res);
			nr++;
		}
		if (nr>0) ra=ra.concat(rt);
	}
	ra.sort(function(a,b){return a.time-b.time;});
	if (all) {
		var title="全スレッドまとめ";
	} else {
		var title=tha[0].title+"[ソート]";
	}
	var th=bd.createLocalThread(title,ra);
	if (!th) {
		return "ローカルスレッドを作成できませんでした。";
	}
	th.open(false);
	return null;
}
var se=createSortResThread();
if (se) {
	v2c.alert(se);
}