//【登録場所】全体、レス表示、選択テキスト
//【ラベル】選択単語でレス抽出、指定単語でレス抽出
//【内容】アクティブなスレッドから、選択単語or指定単語が含まれるレスを抽出し、ローカルスレッドを作成する。
//　　　　レス表示から実行する場合検索ボックスを表示します、正規表現は不可
//　　　　抽出の検索対象は本文のみ
//【コマンド】${SCRIPT:Fw} resExtract.js ローカル板のフォルダ
//【更新日】 2010/12/17
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/647,651
//【スクリプト】
// ----- 次の行から -----
function createExtractResThread() {
	var args=v2c.context.args;
	if (args.length==0) {
		return "板のフォルダが指定されていません。";
	}
	var bd=v2c.getLocalBoard(args[0]);
	if (!bd) {
		return "ローカル板を取得できませんでした。";
	}
	var th=v2c.context.thread;
	if (th.bbs.twitter) {
		return "Twitterには対応していません。"
	}
	var kw = v2c.getSelectedText();
	if (!kw) {
		kw = v2c.prompt("抽出単語を入力してください","");
		if (!kw) {
			return "抽出単語がありません。";
		}
	}
	var ra=[];
	for (var i=0; i<th.resCount; i++) {
		var res=v2c.context.thread.getRes(i);
		if (res&&!res.ng) {
			if (res.message.indexOf(kw)!=-1) {
				ra.push(res);
			}
		}
	}
	if (ra.length==0) {
		return "検索ワードが含まれるレスはありません。";
	}
	ra.unshift(v2c.createResSeparator("[抽出レス数："+ra.length+"] "+th.title));
	var newth=bd.createLocalThread("[抽出："+kw+"] "+th.title,ra);
	if (!newth) {
		return "ローカルスレッドを作成できませんでした。";
	}
	newth.open(false);
	return null;
}
var se=createExtractResThread();
if (se) {
	v2c.alert(se);
}
// ----- 前の行まで -----