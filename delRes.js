//【登録場所】レス表示
//【ラベル】レス削除
//【内容】非対応外部掲示板の選択した自分のレスを削除する
//【コマンド】${SCRIPT:SF} delRes.js
//【おまけコマンド】${SCRIT:SF} delRes.js $TOBROWSER
// └参照中のスレを外部ブラウザーから開くコマンド。レス表示等に登録する
//【更新日時】2014/05/27 バグ修正及びV2C_x64.exe実行時にも動くように設定項目を追加
//            2013/12/24 初版
// 
//【スクリプト】

// [設定] ---------------------------------------------
var reload = true; // レス削除後にスレをリロードする
var win64    = false; // windowsを使用していてV2C_x64.exeを使用している場合はtrueにする
// [設定ここまで] -------------------------------------

var v2cexe = (win64) ? 'V2C_x64.exe' : 'V2C.exe';
var vcx = v2c.context;
var th  = vcx.thread;
var url = th.url.toString();
var delUrl = 'http://' + th.board.url.host + '/' + th.board.key + '/futaba.php?guid=on';

(function() {
	var args = String(v2c.context.argLine);
	if (/\$TOBROWSER/i.test(args)) {
		v2c.browseURLExt(new java.net.URL('http://' + th.url.host + '/' + th.board.key + '/res/' + (th.key - 1000000000) + '.htm'));
		return;
	}

	if (url.indexOf('2chan') >= 0 && url.indexOf('ascii') < 0 && vcx.res.aux.length() > 0 && vcx.res.message.indexOf('削除されました') < 0 ) {
		//v2c.context.setCloseOnLinkClick(false);
		//v2c.context.setDefaultCloseOnMouseExit(false);
		vcx.setPopupHTML(
		'<html><body bgcolor="#FFFFEE" text="#800000" link="#0000EE" vlink="#0000EE" alink="#FF0000" style="margin: 5px 5px 5px 5px;">' +
		'<table border=0><tr><td bgcolor=\'#F0E0D6\'><font color=\'#cc1105\'><b>無題 </b></font>' +
		'Name <font color=\'#117743\'><b>' + vcx.res.name + ' </b></font> ' + vcx.res.date + ' ' + vcx.res.aux + ' <a href="http://' + th.url.host + '/del.php?b=' + th.board.key + '&d=' + String(v2c.context.res.aux).replace('No.', '') + '">del</a>' +
		'<blockquote>' + String(vcx.res.message).replace(/\n/g, '<br>') + '</blockquote></td></tr></table>' +
		'<hr size=2><div align="right"><form action="' + delUrl + '" method="POST"><input type="hidden" name="' + String(v2c.context.res.aux).replace('No.', '') + '" value="delete"><input type=hidden name=mode value=usrdel>【記事削除】 [<input type=checkbox name=onlyimgdel value=on>画像だけ消す]<br>' +
		'削除キー<input type=password name=pwd size=8 maxlength=8 value="' + v2c.getProperty('_FUTABA_WRITE_FORM_DELKEY_') + '">' +
		'<br><br><input type="submit" value="このレスを削除する"></form></div>' +
		'</body></html>');
		vcx.setTrapFormSubmission(true);
		vcx.setRedirectURL(true);
	}
})();

function redirectURL(u)
{
	vcx.closeOriginalPopup();
	var hr = v2c.createHttpRequest(u);
	var tmp = hr.getContentsAsString();
	tmp = String(tmp).replace(/action="del\.php\?guid=on"/, 'action="http://' + th.url.host + '/del.php?guid=on"');
	vcx.setPopupHTML(tmp);
	vcx.setTrapFormSubmission(true);
}
function formSubmitted(u,sm,sd)
{
	if (u.toString().indexOf('2chan') >= 0) {
		var pwd = String(sd).replace(/.*pwd=([^&]+).*/, '$1');
		var hr = v2c.createHttpRequest(u, sd);
		hr.setRequestProperty('Host',  th.url.host);
		hr.setRequestProperty('Cookie', 'posttime=' + (new Date()).getTime() + '; pwdc=' + pwd);
		hr.setRequestProperty('Referer', (u.toString().indexOf('del.php') >= 0) ? u.toString() + '&' + sd : u.toString() + '?' + sd);
		hr.setRequestProperty('User-Agent', 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:26.0) Gecko/20100101 Firefox/26.0');
		var tmp = hr.getContentsAsString();
		v2c.println(tmp);
		vcx.closeOriginalPopup();
		if (u.toString().indexOf('del.php') >= 0) {
			if (tmp.indexOf('記事がみつかりません') >= 0) {
				vcx.setStatusBarText('このスレッドは寿命により消滅しているため、削除依頼を実行出来ません。');
			} else {
				vcx.setStatusBarText('レス ' + vcx.res.aux + 'の削除依頼を受け付けました。');
			}
			return;
		}
		if (reload) {
			var getdatobj = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/system/getdat.js'))));
			var fd = new getdatobj.FUTABAtoDAT();
			var dat = fd.exec(th);
			if (dat.length <= 0) {
				vcx.setStatusBarText('このスレッドは寿命により消滅しているため、レス削除を実行出来ません。');
				return;
			}
			th.importDatBytes(dat.getBytes("MS932"));
			var OS = java.lang.System.getProperty("os.name").toLowerCase();
			var path = v2c.appDir;
			if (OS.indexOf('win') >= 0 && path) {
				path += '/' + v2cexe;
				v2c.exec([path, '-c',th.url + th.localResCount]);
			}
		}
		vcx.setStatusBarText('レス ' + vcx.res.aux + 'を削除しました。');
	}
}