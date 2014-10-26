//【登録場所】全体、レス表示
//【ラベル】画像レスまとめ
//【内容】レス表示欄に開いている全てのスレッドから、画像が含まれるレスをまとめ、ローカルスレッドを作成する。
//　　　　スレを横断して画像表示ウィンドウやサムネイルモードで一括表示させたい時にどうぞ
//【コマンド】${SCRIPT:Fw} ImageResThread.js ローカル板のフォルダ
//【更新日】 2010/12/17
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/647,650
//【スクリプト】
// ----- 次の行から -----
function createImageResThread() {
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
	v2c.setStatus("画像レス抽出中...");
	var ra=[];
	for (var it=0; it<tha.length; it++) {
		var th=tha[it];
		if (th.local||th.bbs.twitter) {
			continue;
		}
		var resCnt =th.localResCount, imgRes=[];
		for (var i=0; i<resCnt; i++) {
			var res=th.getRes(i);
			if (res) {
				for (var j=0; j<res.links.length; j++) {
					if (res.links[j].type_IMAGE) {
						imgRes.push(res);
						break;
					}
				}
			}
		}
		if (imgRes.length>0) {
			ra.push(v2c.createResSeparator("画像レス "+imgRes.length+"： "+th.title));
			ra = ra.concat(imgRes);
		}
	}
	if (ra.length==0) {
		return "画像レスが存在しません。";
	}
	var th=bd.createLocalThread("画像レス抽出",ra);
	if (!th) {
		return "ローカルスレッドを作成できませんでした。";
	}
	th.open(false);
	return null;
}
var se=createImageResThread();
if (se) {
	v2c.alert(se);
}
// ----- 前の行まで -----