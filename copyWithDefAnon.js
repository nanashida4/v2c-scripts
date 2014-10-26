//【登録場所】 レス表示
//【ラベル】 このレスをデフォ名無しでコピー
//【内容】 名前をデフォルト名無しにして「このレスをコピー」
//【コマンド】 ${SCRIPT:Fr} copyWithDefAnon.js
//【スクリプト】
// ----- 次の行から -----
//設定
var QuoteMark = false;//行頭に 「> 」を付ける
//設定ここまで

var vcx = v2c.context;
vcx.setDefaultCloseOnMouseExit(true);

function addQuote(str,n){
	return n ? str.toString().replace(/(^|\n)(.)/g, '$1> $2') : str;
}
function getOriginalMessage(th,res){
	var i = res.index,
		f = th.localFile,
		a = v2c.readLinesFromFile(f),
		s = a[i].replaceAll(' <br> ','\n').replaceAll('<[^<]+?>','');
	return s.split('<>')[3].trim().replaceAll('&lt;','<').replaceAll('&gt;','>');
}
function getCustomRes(th,res){
	return [
			addQuote(res.number + '', QuoteMark),
			' ：' + th.board.anonymousName,
			' ：' + res.date,
			(res.id ? ' ID:' + res.id : ''),
			addQuote('\n' + getOriginalMessage(th,res), QuoteMark)//Datファイル上の本文
//			addQuote('\n' + res.message, QuoteMark)//レス表示上の本文
		];
}
(function(){
	var ri = vcx.checkedResIndex,
		l = ri.length,
		a = [],
		t = [],
		n = [],
		res = vcx.res,
		th = vcx.thread;
	if (l) {
		for (var i = 0; i < l; i++){
			res = th.getRes(ri[i]);
			t = t.concat(getCustomRes(th,res));
			if(i != l-1) t.push('\n\n');
			n.push(ri[i]+1);
		}
	} else {
		t = t.concat(getCustomRes(th,res));
	}
//	if(l) a.push('>>' + vcx.res.number + '\n'); //チェック有りのレスがあれば、実行したレス番へのアンカー
//	a.push(th.title + '\n');//タイトル
//	a.push(th.url + '\n');//スレッドURL
//	a.push(th.url + (l ? n.join(',') : res.number) + '\n');//スレッドURL＋レス番
	a = a.concat(t);
	vcx.setClipboardText(a.join(''));//コピー
//	vcx.setPopupText(a.join(''));//ポップアップ
//	vcx.setPopupFocusable(true);//ポップアップ時のテキスト選択可
//	vcx.insertToPostMessage(a.join(''));//書き込み欄に送る
}())
// ----- 前の行まで -----
