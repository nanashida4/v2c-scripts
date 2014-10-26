//【登録場所】リンク　URLExec
//【ラベル】転送先URLポップアップ
//【内容】転送URLの転送先を調べる。転送URLでない場合は元URLがそのまま表示される
//【コマンド】${SCRIPT:S} PopupTransferURL.js
//【スクリプト】
var vcx = v2c.context;
var url = vcx.link;
var turl= expandURL(url);
var sr = '';
if (!vcx.getPopupOfID(url)) {
	var aguse = '<a href="http://www.aguse.jp/?m=w&url=' + turl + '">転送先をaguseでチェック</a>';
	var tlink = '→　<a href = "' + turl + '">' + turl + '</a>';
	sr = '<html><body style="margin:5px;"><div align="left"><form action="">'
	+ '<input type="submit" value="転送先URLコピー" name="copy"></form></div>' + aguse + '<br>' + tlink + '</body></html>';
	
	vcx.setPopupHTML(sr);
	vcx.setPopupID(url);
	vcx.setTrapFormSubmission( true );
}

function expandURL(surl) {
	var hr = v2c.createHttpRequest(surl,"");
	hr.getContentsAsString();
	//v2c.alert(hr.responseCode + "\n" + hr.getResponseHeader("Location"));
	if (hr.responseCode >= 301 && 303 >= hr.responseCode) {
		return expandURL(hr.getResponseHeader("Location"));
	} else {
		return surl;
	}
}

function formSubmitted( u, sm, sd ) {
vcx.setClipboardText(turl);
}
