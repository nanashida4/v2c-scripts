//【登録場所】 選択テキスト
//【ラベル】 yahoo〇〇辞書
//【内容】 yahoo国語、英和、和英、類語辞書のポップアップ
//【コマンド】 $SCRIPT ydic.js 0
//※引数（コマンドの末尾の数字）によってどの辞書を使うかが決まる
//※引数(国語：0、英和和英：1、類語：5)
//【更新日】 2014/03/08 詳細説明ページの仕様変更に対応
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/15,466
//【スクリプト】 
var vcx = v2c.context;
createPopupString();
function createPopupString() {
	var ss = vcx.selText;
	if (ss) {
		ss = ss.trim();
	}
	if (!ss||(ss.length()==0)) {
		v2c.alert('検索語を取得できませんでした。');
		return;
	}
	var args = vcx.args;
	var id = (args.length>0)?args[0]:'0';
	var dicId = '';
	switch (parseInt(id)) {
		case 0: dicId = 'jj'; break;
		case 1: dicId = 'ejje'; break;
		default: dicId = 'etc'; break;
	}
	var sh = v2c.readURL('http://dic.search.yahoo.co.jp/dsearch?p='
							+encodeURIComponent(ss)+'&stype=prefix&dic_id='+dicId);
	var mr = /<div id="[^"]+" class="result-r">([\s\S]+)<!-- \/#[^ ]+ .result-r -->/i.exec(sh);
	if (!mr) {
		v2c.alert('説明を抽出できませんでした。');
		return;
	}
	vcx.setPopupHTML('<html><body>'+mr[0]+'</body></html>');
	vcx.setRedirectURL(true);
}
function redirectURL(u)
{
	var sh = v2c.readURL(u);
	if (!sh) {
		v2c.alert('ページを取得できませんでした。');
		return;
	}
	var mr = /<li class="word">([\s\S]*?)<\/li>/.exec(sh);
	if (!mr) {
		mr = /<div class="EJdoc">([\s\S]*?)<\/div>/.exec(sh);
	}
	if (!mr) {
		mr =/<div class="word_dic">([\s\S]*?)<\/div>/.exec(sh);
	}
	if (!mr) {
		mr =/<div class="full">([\s\S]*?)<script type="text\/javascript">/.exec(sh);
	}
	if (!mr) {
		v2c.alert('説明を抽出できませんでした。');
		return;
	}
	
	var repHtml = mr[0];
	var host = /meta property="og:url" content="(http:\/\/[^\/]+)/.exec(sh);
	if (host) { host = host[1]; }
	repHtml = repHtml.replace(/href="/g, 'href="' + host).replace(/<img [^>]+?>/g, '');
	vcx.setRedirectURL(true);
	vcx.setPopupHTML('<html><body>'+repHtml+'</body></html>');
}
