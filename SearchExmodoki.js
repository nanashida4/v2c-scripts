//【登録場所】リンク
//【ラベル】
// SearchExmodoki.js $LINK 1のときは「二次元画像検索」
// SearchExmodoki.js $LINK 2のときは「画像情報検索サイト」
// SearchExmodoki.js $LINK 3のときは「booru系類似画像検索」
// SearchExmodoki.js $LINK 4のときは「Google画像検索」
// SearchExmodoki.js $LINK 5 // kemuri-net.com (ポップアップ)
// SearchExmodoki.js $LINK 6 // kemuri-net-.com (ブラウザ)
//
//【内容】linkをPOSTして、httprequestで返されたlocationをブラウザで開いたり、ブラウザに成形済みのURIを送ったり
// 1 = 二次元画像検索(http://www.ascii2d.net/imagesearch)
// 2 = 画像情報検索サイト(http://iisearch.ddo.jp)
// 3 = booru系類似画像検索(http://iqdb.org)
// << メモ >>
// 2と3は、[HTTP/1.1 200 OK]の場合の対象方法が不明なためPOST用のURLを直接ブラウザで開く処理になってます
// 
//【コマンド1】${SCRIPT:SF} SearchExmodoki.js $LINK 1 // 二次元画像検索
//【コマンド2】${SCRIPT:SF} SearchExmodoki.js $LINK 2 // 画像情報検索サイト
//【コマンド3】${SCRIPT:SF} SearchExmodoki.js $LINK 3 // booru系類似画像検索
//【コマンド4】${SCRIPT:SF} SearchExmodoki.js $LINK 4 // Google画像検索 (SearchByImage)
//【コマンド4】${SCRIPT:SF} SearchExmodoki.js $LINK 5 // kemuri-net.com (ポップアップ)
//【コマンド4】${SCRIPT:SF} SearchExmodoki.js $LINK 6 // kemuri-net-.com (ブラウザ)
//
//【更新日】2011/04/28 (改変 4～6追加 2013/01/13)
//【スクリプト】SearchExmodoki.js
//
var tmpdir = v2c.getScriptSubFile('dummy.txt');
if (!tmpdir.exists()) { v2c.writeStringToFile(tmpdir, 'dummy'); }
tmpdir = tmpdir.getParent();

var vcx  = v2c.context;
var link = vcx.link; // arg[0]でもOK?
var args = v2c.context.args[1];
var url  = beforeRedirect(encodeURIComponent(link), args);
if (!(url == "")) { v2c.browseURLExt(url); }

function beforeRedirect(data, si) {
    var hr;
	if (si == 2) {
		// 画像情報検索サイト
		return "http://iisearch.ddo.jp/front.php?mode=1&url="+data+"?Shift_JIS?POST";
	} else if (si == 3) {
		// booru系類似画像検索
		return "http://iqdb.org/?url="+data+"?UTF-8?POST";
	} else if (si == 4) {
	    return "http://www.google.co.jp/searchbyimage?image_url="+data;
	} else if (si == 5) {
		var url = new java.net.URL("http://details.kemuri-net.com/hashsearch.php");
		hr = v2c.createHttpRequest(url);
		hr.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
		hr.setRequestProperty("Accept-Language", "ja,en-us;q=0.7,en;q=0.3");
		hr.setRequestProperty("Host", "details.kemuri-net.com");
		hr.setRequestProperty("Accept-Encoding", "gzip, deflate");
		hr.setRequestProperty("Connection", "keep-alive");
		hr.setRequestProperty("User-Agent", "Mozilla/5.0");
		var str = hr.getContentsAsString();
		var cookie = hr.getResponseHeader('Set-Cookie');
		var auth = '';
		with (JavaImporter(Packages.java.util.regex.Pattern)) {
			var ptn2 = Pattern.compile('<input[^>]*name="authentication" value[ ]?=[\'"](.+)[\'"]', Pattern.CASE_INSENSITIVE);
			var m = ptn2.matcher(str);
			if (Boolean(m.find())) {
				auth = m.group(1);
			}
		}
		var encode_prm = java.net.URLDecoder.decode("q=" + data + "&mode=0&authentication=" + auth + "&search=1","utf-8");
		hr = v2c.createHttpRequest(url, encode_prm);
		hr.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
		hr.setRequestProperty("Accept-Language", "ja,en-us;q=0.7,en;q=0.3");
		hr.setRequestProperty("Host", "details.kemuri-net.com");
		hr.setRequestProperty("Referer", url.toString());
		hr.setRequestProperty("Accept-Encoding", "gzip, deflate");
		hr.setRequestProperty("Connection", "close");
		hr.setRequestProperty("User-Agent", "Mozilla/5.0");
		hr.setRequestProperty("Cookie", cookie);
		str = String(hr.getContentsAsString());
		str = str.substring(str.indexOf('<table border="1" width="800" cellspacing="0">'), str.indexOf('<br><HR><P align="right">'));

		var b64 = new base64();
		var i = 0;
		var matches = [];
		while (/(<img src="data:image\/(jpg|png|bmp|gif);base64,([A-Za-z0-9+\/=]+)")/g.exec(str) != null) {
			var src = RegExp.$1;
			var img = b64.decode(RegExp.$3);
			
			var f = v2c.getScriptSubFile(i + '.tmp');
			v2c.writeBytesToFile(f, img);
			var imgstr = '<img src="' + (new java.net.URL('file:///' + tmpdir + '/' + i + '.tmp')).toString() + '"';
			matches.push([src, imgstr]);
			i++;
		}
		for (i = 0; i < matches.length; i++) {
			str = str.replace(matches[i][0], matches[i][1]);
		}
		str = str.split('<A href="./').join('<A href="http://details.kemuri-net.com/');
		vcx.setPopupHTML('<html><body style="margin:10px;">' + str + '</body></html>');
		return "";
	} else if (si == 6) {
		return "http://details.kemuri-net.com/shashsearch.php" + "?a=&c=UTF-8&o=JANEVIEW&q=" + data;
	} else {
		// 二次元画像検索
		hr = v2c.createHttpRequest("http://www.ascii2d.net/imagesearch/search?uri="+data+"?UTF-8?POST", "");
		hr.setRequestProperty("Referer", "http://www.ascii2d.net/imagesearch");
		hr.getContentsAsString();
		if (hr.responseCode >= 301 && 303 >= hr.responseCode) {
			return hr.getResponseHeader("Location");
		} else {
			return "";
		}
	}
}

/* Powered by kerry ( http://202.248.69.143/~goma/ ) */
function base64()
{
	var b64char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var b64encTable = b64char.split("");
	var b64decTable = [];
	for (var i = 0; i < b64char.length; i++) b64decTable[b64char.charAt(i)] = i;
	
	this.encode = function(_ary) {
		var md = _ary.length % 3;
		var b64 = "";
		var i, tmp = 0;
		if (md) for (i = 3 - md; i > 0; i--) _ary[_ary.length] = 0;
		for (i = 0; i < _ary.length; i += 3) {
			tmp = (_ary[i] << 16) | (_ary[i + i] << 8) | _ary[ i + 2];
			b64 += b64encTable[ (tmp >>> 18) & 0x3f]
				+  b64encTable[ (tmp >>> 12) & 0x3f]
				+  b64encTable[ (tmp >>>  6) & 0x3f]
				+  b64encTable[ tmp & 0x3f];
		}
		if (md) { // 3の倍数にパディングした 0x0 分 = に置き換え
			md = 3 - md;
			b64 = b64.substr(0, b64.length - md);
			while (md--) b64 += "=";
		}
		return b64;
	};
	
	this.decode = function(_b64) {
		_b64 = _b64.replace(/[^A-Za-z0-9\+\/]/g, "");
		var md  = _b64.length % 4;
		var j, i, tmp;
		var dat = [];

		// replace 時 = も削っている。その = の代わりに 0x0 を補間
		if (md) for (i=0; i<4-md; i++) _b64 += "A";

		for (j=i=0; i<_b64.length; i+=4, j+=3)
		{
			tmp = (b64decTable[_b64.charAt( i )] <<18)
				| (b64decTable[_b64.charAt(i+1)] <<12)
				| (b64decTable[_b64.charAt(i+2)] << 6)
				|  b64decTable[_b64.charAt(i+3)];
			dat[ j ]    = tmp >>> 16;
			dat[j+1]    = (tmp >>> 8) & 0xff;
			dat[j+2]    = tmp & 0xff;
		}
		// 補完された 0x0 分削る
		if (md) dat.length -= [0,0,2,1][md];
		var jdat = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, dat.length);
		for (i = 0; i < dat.length; i++) {
			jdat[i] = convSigned(dat[i]);
		}
		return jdat;
	}
	function convSigned(n) {
		return (n & (1 << 7))? -((~n & 0xFF) + 1) : n;
	}
}

function getMD5(stringORbytesArray)
{
	if (typeof stringORbytesArray == 'string' || stringORbytesArray instanceof String) {
		stringORbytesArray = (new java.lang.String(stringORbytesArray)).getBytes();
	}
	var m = new java.security.MessageDigest.getInstance("MD5");
	m.reset();
	var hash = m.digest(stringORbytesArray);
	var sb = new java.lang.StringBuffer(hash.length * 2);
	for ( var i = 0; i < hash.length; i++) {
		var b = java.lang.Integer.toHexString(hash[i] & 0xff);
		if (b.length() == 1) {
			sb.append(b);
		}
	}
	return sb.toString();
}
