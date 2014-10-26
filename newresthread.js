//【登録場所】全体、レス表示
//【ラベル】新着レスまとめ
//【内容】レス表示欄に開いている全ての未読有スレッドから、新着レスをまとめ、ローカルスレッドを作成する。
//　　　　「全スレッドタブの更新」の後に実行してください。
//　　　　（注意：未読フラグが全てリセットされます。）
//【コマンド】${SCRIPT:Fw} newresthread.js ローカル板のフォルダ
//【更新日】 2010/12/17
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/646,649
//【スクリプト】
// ----- 次の行から -----
function createNewResThread() {
	var args=v2c.context.args;
	if (args.length==0) {
		return "板のフォルダが指定されていません。";
	}
	var bd=v2c.getLocalBoard(args[0]);
	if (!bd) {
		return "ローカル板を取得できませんでした。";
	}
	var tha=v2c.resPane.threads;
	if (tha.length==0) {
		return "レス表示タブが存在しません。";
	}
	var ra=[];
	for (var it=0; it<tha.length; it++) {
		var th=tha[it];
		if (th.local||th.bbs.twitter||!th.unread) {
			continue;
		}
		var nn=th.newResCount;
		if (nn==0) {
			continue;
		}
		var nrl=th.localResCount, rt=[], nr=0;
		for (var i=0; i<nn; i++) {
			var res=th.getRes(nrl-i-1);
			if (res&&!res.ng) {
				nr++;
				rt.push(res);
			}
		}
		if (nr>0) {
			rt.push(v2c.createResSeparator("新着 "+nr+"： "+th.title));
			ra = ra.concat(rt.reverse());
		}
		th.resetUnread();
	}
	if (ra.length==0) {
		return "新着レスが存在しません。";
	}
	var th=bd.createLocalThread("新着レス",ra);
	if (!th) {
		return "ローカルスレッドを作成できませんでした。";
	}
	th.open(false);
	return null;
}
var se=createNewResThread();
if (se) {
	v2c.alert(se);
}
// ----- 前の行まで -----