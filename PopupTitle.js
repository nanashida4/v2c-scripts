//【登録場所】リンク
//【ラベル】タイトルを表示
//【内容】リンク先タイトルをポップアップ表示
//【コマンド1】${SCRIPT:S} PopupTitle.js
//【コマンド2】h?t?tps?://.+	$&	${V2CSCRIPT:S} PopupTitle.js //URLExec2.dat用
//  ※すでにURLExec2.datに他の記述がある場合は一番下の行に追加したほうがいいと思います
//【スクリプト】
v2c.context.setDefaultCloseOnMouseExit(true);
var url = v2c.context.link;
var hr = v2c.createHttpRequest(url);
var data = hr.getContentsAsString();
if ((hr.responseCode == 200) && (hr.contentType.toString().match(/text\/html/i))) {
    if (data.match(/<TITLE>(.+?)<\/TITLE>/i)) {
        var title = RegExp.$1;
        v2c.context.setPopupText(title);
    } else {
        v2c.context.setPopupText('タイトルが見つかりません');
    }
} else {
    var response = hr.responseCode + ' ' + hr.responseMessage + '\nContent-Type: ' + hr.contentType;
    v2c.context.setPopupText(response);
}
