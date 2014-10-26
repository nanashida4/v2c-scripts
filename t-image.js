//【登録場所】 選択テキスト
//【ラベル】タレントイメージ検索
//【内　容】Yahoo!人物名鑑 (ttp://talent.yahoo.co.jp/)を使って
//　　　　　タレント名を検索し検索結果の一番目の人の顔写真他を簡易ポップアップ表示。
//【コマンド】 $SCRIPT t-image.js
//【スクリプト】
// ----- 次の行から -----
function createPopupString() {
	var vcx = v2c.context;
	var ss = vcx.selText;
	if (ss) {
		ss = ss.trim();
	}
	if (!ss||(ss.length()==0)) {
		v2c.alert('検索語を取得できませんでした。');
		return;
	}
	var sh = v2c.readURL('http://talent.search.yahoo.co.jp/search?p='+encodeURIComponent(ss)+'&type=normal');
	if (!sh) {
		v2c.alert('ページを取得できませんでした。');
		return;
	}
	var mr = sh.match(new RegExp('<div class="tb">([^]*?)</p></li>','i'));
	if (!mr) {
		v2c.alert('説明を抽出できませんでした。');
		return;
	}
	var sr = mr[1];
	vcx.setPopupHTML('<html><body style="margin:5px;">'+sr+'</body></html>');
	}
createPopupString();
// ----- 前の行まで -----

//スポーツ選手、アナウンサー、文化人(?)などは画像無しになるみたい。
