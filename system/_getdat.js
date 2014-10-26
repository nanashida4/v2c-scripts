//【登録場所】 "V2C\script\system\getdat.js"
//【内容】 スレッドのログが取得出来ない場合、指定するURLから過去ログを取得する。
//     １． http://mukiyu.g.ribbon.to/ のhtmltodat 0.9.0(917k byte)をダウンロードする
//     ２． ダウンロードした圧縮ファイルを解凍して、出てきたフォルダ名が「htmltodat0.9.0」じゃなかったらフォルダ名を変更する
//     ３． フォルダごとV2Cのログ・設定保存用フォルダにコピーする。保存用フォルダの場所がわからなければV2C起動して 設定→ランチャー(L)… を見ればわかる
//【コマンド】外部コマンドの設定→スクリプト→getdat.jsのパーミッションを初期値の「S」から「SF」に変更する
//【スクリプト】
(function() { this.HTMLtoDAT = _HTMLtoDAT; this.LOGSOKUtoDAT = _LOGSOKUtoDAT;

// -----------------------------設定項目-----------------------------------
// htmltodatのフォルダパスを指定 (フォルダの区切りは「 \\ 」ではなく「 / 」で、末尾のも「 / 」を記入すること)
var htmltodatDir = v2c.saveDir + '/htmltodat0.9.0/';
// DAT変換定義 (name = 表示名, src = 2chスレURLへの正規表現, dst = srcの正規表現の置換パターン, obj: DAT変換用のクラス(HTMLtoDAT or HTMLtoDAT互換モード or LOGSOKUtoDAT))
// 全部使うと遅いので必要な項目だけコメント(行頭の//のこと)を外すこと
this.services = [
  { name: 'mimizun', src: new RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(\\d+).*"), dst: "http://mimizun.com/log/2ch/$2/$3.dat" },
  { name: 'unkar'  , src: new RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(\\d+).*"), dst: "http://unkar.org/convert.php/$2/$3/" },
//  {name: 'ヴァルタ', src: new RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(((\\d+)\\d)\\d{5}).*"), dst: "http://varda2.com/log/2ch/$2/$1/$2/kako/$5/$4/$3.dat" },
//  { name: 'logsoku (LOGSOKUtoDAT)', obj: new LOGSOKUtoDAT() },
//  { name: 'logsoku (htmltodat)', obj: new HTMLtoDAT(htmltodatDir + 'ログ速.prm') },
//  { name: 'logsoku (htmltodat CompatibleMode)', obj: new HTMLtoDAT(htmltodatDir + 'ログ速.prm', true) },
//  { name: '暇つぶし2ch', obj: new HTMLtoDAT(htmltodatDir + '暇つぶし2ch.prm', true) },
];
// -----------------------------設定項目ここまで---------------------------

// getdat.jsの設定用サブフォルダ(V2C/script/system/getdat/)取得用
//フォルダパス取得の為のダミーなのでdummy.txtは実際に存在しなくても問題ない
	var SubFile = v2c.getScriptSubFile('dummy.txt');
	if (!SubFile.exists()) {
		v2c.writeStringToFile(SubFile, 'dummy');
	}
	var scriptSubDir = SubFile.getParent();
	
	function _HTMLtoDAT(prm /* CompatibleMode = false */)
	{
		var prmFile = new java.io.File(prm);
		if (!prmFile.exists()) {
			printlnLog('ファイルが見つかりません。 ({0})', prmFile.getPath());
			return false;
		}
		var CompatibleMode = (arguments.length > 1) ? arguments[1] : false;
		var prmPath = prm;
		var prmBuffer = v2c.readLinesFromFile(prmFile);
		var URLRegex = PropertyGenerate('URLの変換', '');	// prmファイルフォーマットは複数行だけど１行しか使わないっぽいのでこれで
		var BeforeRegexArr = ConvertRegex(PropertyGenerate('前処理', '', true));
		var AfterRegexArr = ConvertRegex(PropertyGenerate('後処理', '', true));
		var MatchString = PropertyGenerate('変換結果式', '');
		var ResRegex = ConvertRegex(PropertyGenerate('正規表現', ''));
		
		/* CompatibleMode用 以下のプロパティはとりあえず非対応。必要に応じて対応 */
		/*
		var isProxy = PropertyGenerate('Proxyを使う', false);
		var ProxyAddress = PropertyGenerate('Proxyアドレス', '');
		var AdditionalHTTPHeaderArr = PropertyGenerate('HTTPヘッダの追加', '', true);
		var Server = PropertyGenerate('$server', '');
		var Board = PropertyGenerate('$board', '');
		var isConvertDisabled = PropertyGenerate('dat変換をしない', '');
		var isAnchorRemoved = PropertyGenerate('アンカー削除', '');
		var isBECodeRemoved = PropertyGenerate('beコード削除', '');
		var isAboneReplaced = PropertyGenerate('透明あぼーんを補う', '');
		*/
		this.getURL = function(thread)
		{
			var arr = URLRegex.split('#');
			return thread.url.toString().replaceAll(arr[1], arr[2]);
		};
		this.CompatibleExec = function(thread)
		{
			var logsoku_url = this.getURL(thread);
			if (logsoku_url === String(thread.url.toString())) return '';
			var html = '';
			var local = (arguments.length > 1) ? arguments[1] : false;
			if (local) {
				html = local;
			} else {
				html = getThreadLog(logsoku_url);
			}
			if (!html) return '';
			html = String(html).split('\r\n').join('').split('\n').join('');
			//前変換
			for (var i = 0; i < BeforeRegexArr.length; i++) {
				html = html.replace(BeforeRegexArr[i].regex, BeforeRegexArr[i].match);
			}
			var title = /<title>(.*?)<\/title>/i.exec(html)[1];
			//DAT変換
			var dat = [];
			var resre = new RegExp(ResRegex[0].regex.source, "ig");
			var item;
			while ((item = resre.exec(html)) !== null) {
				var tmp = MatchString;
				for (var i = 1; i < item.length; i++) {
					tmp = tmp.replace('$'+ i.toString(), (item[i])? item[i] : '');
				}
				if (title) {
					tmp += title;
					title = '';
				}
				dat.push(tmp);
			}
			dat = dat.join('\n');
			dat += '\n';
			//後変換
			for (var i = 0; i < AfterRegexArr.length; i++) {
				dat = dat.replace(AfterRegexArr[i].regex, AfterRegexArr[i].match);
			}
			return new java.lang.String(dat);
		};
		this.exec = function(thread)
		{
			var OS = java.lang.System.getProperty("os.name").toLowerCase();
			if (OS.indexOf('win') < 0) {
				printlnLog('HTMLtoDATはWindows以外では動きません。HTMLtoDATCompatibleを使用します。');
				return this.CompatibleExec(thread);
			}
			
			// V2Cログ・設定保存用フォルダにhtmltodat0.9.0フォルダを入れる。フォルダ名等が違う場合は便宜変更。
			var exe = htmltodatDir + 'htmltodat.exe';
			
			if (!(new java.io.File(exe)).exists()) {
				printlnLog('htmltodat.exeがなかったので実行できませんでした。({0})',exe);
				return '';
			}
			
			var tmpPath = scriptSubDir + '/tmp_' + Math.floor(Math.random() * 1000).toString() + (new Date()).getTime().toString() + '.dat';
			
			if (!URLRegex) {
				var endl = java.lang.System.getProperty("line.separator");
				printlnLog('prmファイルにURLの変換を記述して下さい。以下はログ速の場合の記述例です。');
				v2c.println('URLの変換：' + endl + 's#http://(.+?)/test/read\\.cgi/(.+?)/(\\d+)/?.*#http://logsoku.com/thread/$1/$2/$3/#' + endl + '[ここに空行を１行必ず入れること]');
				return '';
			}
			v2c.exec([exe, thread.url.toString(), prmPath, tmpPath]);
			java.lang.Thread.sleep(300);
			while (isProcessRunning('htmltodat.exe')) {
				java.lang.Thread.sleep(1000);
			}
			var f = new java.io.File(tmpPath);
			var dat = v2c.readStringFromFile(f);
			f["delete"]();
			return dat;
		};

		if (CompatibleMode) {
			this.exec = this.CompatibleExec;
		}
		
		function ConvertRegex(regexes)
		{
			var ret = [];
			var regs = regexes;
			if (!(regexes instanceof Array)) {
				regs = (String(regexes)).replace(/\r\n?/g, '\n').split('\n');
			}
			
			for (var i = 0; i < regs.length; i++) {
				var arr = (String(regs[i])).split('#');
				var opt = '';
				var num = (arr[0] === 'm')? 2 : 3;
				if (arr[num]) {
					if (arr[num].indexOf('g') >= 0) opt += 'g';
					if (arr[num].indexOf('i') >= 0) opt += 'i';
					if (arr[num].indexOf('m') >= 0) opt += 'm';
				}
				var re = new RegExp(arr[1], opt);
				ret.push({regex: re, match: arr[2]});
			}
			return ret;
		}
		
		function PropertyGenerate(propName, initValue /* isMultiLine = false */)
		{
			var isMultiLine = (arguments.length > 2) ? arguments[2] : false;
			var fileext = (arguments.length > 3) ? arguments[3] : false;
			
			var ret = [];
			var idx = -1;
			var p = java.util.regex.Pattern.compile('^'+propName+'.*?');
			for (var i = 0; i < prmBuffer.length; i++) {
				if (prmBuffer[i].length() > 0) {
					if (p.matcher(prmBuffer[i]).matches()) {
						idx = i;
						break;
					}
				}
			}
			//v2c.println(propName + ' === ' + idx);
			if (idx < 0) { return initValue; }

			var idx2 = 0;
			if (-1 != (idx2 = prmBuffer[idx].indexOf('='))) {
				// 外部ファイル指定された場合 ログ・設定保存用フォルダ/htmltodat0.9.0/フォルダ内のファイルを読み込む
				ret = prmBuffer[idx].substring(idx2 + 1);
				switch (propName) {
					case '変換結果式' : ret += '.cvr'; break;
					case '後処理' : ret += '.acv'; break;
					case '前処理' : ret += '.bcv'; break;
					case 'URLの変換' : ret += '.ucv'; break;
					case 'HTTPヘッダの追加' : ret += '.hdr'; break;
					case 'Proxyアドレス' : ret += '.txt'; break;
					default: break;
				}
				var f = new java.io.File(htmltodatDir + ret);
				if (!f.exists()) {
					printlnLog('ファイルが見つかりません。 ({0})', f.getPath());
				}
				ret =  v2c.readLinesFromFile(f);
				if ((ret instanceof Array) && ret.length == 1) {
					ret = ret[0];
				}
			}
			else {
				// prmファイルに記述されてる場合
				idx++;
				while (prmBuffer[idx].length() <= 0) { idx++; }
				while ((idx < prmBuffer.length) && (prmBuffer[idx].length() > 0)) {
					if (isMultiLine) {
						ret.push(prmBuffer[idx++]);
					} else {
						ret = prmBuffer[idx];
						break;
					}
				}
			}

			if (ret instanceof Array) {
				for (var i = 0; i < ret.length; i++) {
					if (ret[i].charAt(0) === '#'.charCodeAt(0)) {
						ret.splice(i--, 1);
					}
				}
			}
			if (ret.length == 0) {
				ret = initValue;
			}
			
		//			if (ret instanceof Array) {
		//				v2c.println(propName + ' = ');
		//				for (var i = 0; i < ret.length; i++) {
		//					v2c.println('    ' + ret[i]);
		//				}
		//			} else {
		//				v2c.println(propName + ' = ' + ret);
		//			}
			return ret;
		}
	}

	function HTMLParser(html)
	{
		var doc  = html;
		this.index = 0;
		this.endIndex = doc.length;

		this.getHtml = function() { return doc; };
		this.Parse = function(startkey, endkey /* isStartKey = false, isEndKey = false */)
		{
			var ret = '';
			var ix1,ix2;
			var isStartKey = (arguments.length > 2) ? arguments[2] : false;
			var isEndKey   = (arguments.length > 3) ? arguments[3] : false;
			
			if (-1 == (ix1 = doc.indexOf(startkey, this.index)))
				return ret;
			if (!isStartKey)
				ix1 += startkey.length;
			
			if (-1 == (ix2 = doc.indexOf(endkey, ix1)))
				return ret;
				
			if (isEndKey)
				ix2 += endKey.length;
				
			if (ix2 > this.endIndex)
				return ret;
			
			ret = doc.substring(ix1, ix2);
			this.index = ix2;
			return ret;
		};
		this.ParseLine = function()
		{
			var ret = '';
			var end = doc.indexOf('\n', this.index);
			if ((end > 0) && (end <= this.endIndex)) {
				ret = doc.substring(this.index, end);
				this.index = end;
			}
			return ret;
		};
		this.ParseShift = function(startkey, endkey)
		{
			var ret = this.Parse(startkey, endkey);
			this.Shift();
			return ret;
		};
		this.Shift = function()
		{
			doc = doc.substr(this.index);
			this.endIndex -= this.index;
			this.index = 0;
		};
		this.MoveNext = function(key, endIdxKey)
		{
			var ix1, ix2;
			if ((ix1 = doc.indexOf(key, this.index)) == -1)
				return false;
			ix1 += key.length;
			if ((ix2 = doc.indexOf(endIdxKey, ix1)) == -1)
				return false;
			if (ix1 == ix2)
				return false;
			
			this.index = ix1;
			this.endIndex = ix2;
			return this.index;
		};
		this.Cut = function(startkey, endkey)
		{
			this.index = doc.indexOf(startkey, this.index) + startkey.length;
			doc = doc.substring(this.index, doc.lastIndexOf(endkey));
			this.index = 0;
			this.endIndex = doc.length;
			return doc;
		};
	}

	// 仕様:
	// 以下のログ速の仕様のためバイナリ一致は不可能
	// 投稿時間のコンマ表記がない
	// >1などアンカミスを>>1にしてしまう
	function _LOGSOKUtoDAT()
	{
		this.getURL = function(thread)
		{
			return thread.url.toString().replaceAll('^http:\\/\\/(.+\\.2ch\\.net)\\/test\\/read[^/]+\\/(.+?)\\/(\\d+).*', 'http://logsoku.com/thread/$1/$2/$3/');
		};
		
		this.exec = function(thread)
		{
			var logsoku_url = this.getURL(thread);
			if (logsoku_url === String(thread.url.toString())) return '';
			var html = '';
			var local = (arguments.length > 1) ? arguments[1] : false;
			if (local) {
				html = local;
			} else {
				html = getThreadLog(logsoku_url);
			}
			if (!html) return '';
			var dat = new java.lang.StringBuilder();
			var title = '';
			var parser = new HTMLParser(String(html));
			
			// タイトルの取得
			var keyword = {start :'og:title" content="', end :'">'};
			if (!(title = parser.Parse(keyword.start, keyword.end)))
				return '';
			
			// レス部分だけ抜き出し
			keyword.start = '<section id="comments">';
			keyword.end = '\n</section>';
			parser.Cut(keyword.start, keyword.end);
			
			var weekArr = getYMDWeeks(thread).split('/');
			var nkey = {start :'email"><b>', end :'</b></span>'};				// 名前欄
			var mkey = {start :'[', end :'] ：'};								// メール欄
			var tkey = {start :'+09:00">', end :'</time>'};						// 日時
			var meskey = {start :'<div class="comment">\n', end :'<br /><br />\n'};		// 本文欄
			var artkey = {start :'<article id="', end :'</article>'};			// 単レスのタグ範囲指定
			var bdkey = thread.board.key;
			var thkey = thread.key;
			
			var thumbRegex = /<br\/><(iframe|img class).+<br\/>/g;				// ニコニコとYoutubeのサムネ用のタグ削除
			var tagRegex   = /(<|( \[))("[^"]*"|'[^']*'|[^'">])*[>\])]/g;		// ID,BE,株主らへんのタグ削除＋発言回数削除
			var kabRegex   = /^ (.+?) /;										// 株の１文字表記のみリンク化
			var ssspRegex  = /<img src="http:\/\/cdn\.logsoku\.com\/(.+)">/g;	// BEアイコンのURL修正及びタグ削除
			var linkRegex  = /<a href[^>]+target="_blank">(.+?)<\/a>/g;			// その他リンクタグ削除
			var anchorRegex= /<a href="#(.+?)">/g;								// アンカーのURL修正
			
			while (parser.MoveNext(artkey.start, artkey.end)) {
				var name = parser.Parse(nkey.start, nkey.end);
				var mail = parser.Parse(mkey.start, mkey.end);
				var date = parser.Parse(tkey.start, tkey.end);
				parser.index += tkey.end.length;		// idset用の位置調整その１
				var mes = '';
				
				if (date) {
					date = convertDateString(date, weekArr);
					var idset = parser.ParseLine();
					if (idset) {
						idset = idset.substr(2);	// idset用の位置調整その２
						idset = idset.replace(tagRegex, '');
						idset = idset.replace(kabRegex, ' <a href="http://2ch.se/">$1</a> ');
						date += ' ' + idset;
					}
					
					mes = parser.Parse(meskey.start, meskey.end);
					mes = mes.replace(thumbRegex, '');
					if (mes.indexOf('<') >= 0) {
						mes = mes.replace(ssspRegex, 'sssp://$1');
						mes = mes.replace(linkRegex, '$1');
						mes = mes.replace(anchorRegex, '<a href="../test/read.cgi/'+ bdkey + '/' + thkey + '/$1" target="_blank">');
					}
					mes = mes.split("<br/>").join('<br>');				
				} else {
					date = 'Over 1000 Thread';

					var mArr = parser.Parse(meskey.start, meskey.end).split("<br/>");		// <br/> → <br>にするついでに<br>以外のタグを削除
					for (var i = 0; i < mArr.length; i++) {
							mArr[i] = mArr[i].replace(/<.+?>/g, '');
					}
					mes = mArr.join('<br>');
					mes = mes.split('&gt;').join('>').split('&lt;').join('<').split('&quot;').join('"');	// 1001ではHTMLエンコードされないようだ
				}
				
				if (dat.length() == 0) {
					dat.append(name + '<>' + mail + '<>' + date + '<> ' + mes + '<>'+title+'\n');
				} else {
					dat.append(name + '<>' + mail + '<>' + date + '<> ' + mes + '<>\n');
				}
			}
			return dat.toString();
		};
	}
	
	this.isProcessRunning = function(processName)
	{
		var cnt = 0;
		try {
			var runtime = java.lang.Runtime.getRuntime();
			var p;
			var OS = java.lang.System.getProperty("os.name").toLowerCase();
			if (OS.indexOf('win') >= 0) {
				p = runtime.exec(['cmd.exe', '/c', 'tasklist | findstr "' +processName + '"']);
			} else {
				p = runtime.exec(['/bin/sh', '-c', 'ps ux | pgrep -lf "' + processName + '"']);
			}
			var is = p.getInputStream();
			var isr = new java.io.InputStreamReader(is);
			var br = new java.io.BufferedReader(isr);
			while (br.readLine()) { cnt++; }
			
			br.close();
			isr.close();
			is.close();
		} catch (e) {
			if (e.javaException) {
				printlnLog('プロセス名の取得に失敗しました。 ({0})', e.javaException);
			} else {
				printlnLog('プロセス名の取得に失敗しました。 (e={0})', e);
			}
		}
		return (cnt)? true : false;
	};
	
	function convertDateString(dateStr, weekArr)
	{
		var dt = dateStr.split(' ');
		var d  = new Date(dt[0]);
		return dt[0] + '(' + weekArr[d.getDay()] + ') ' + dt[1];
	}
	
	function getYMDWeeks(th)
	{
		var ymdWeeks = '日/月/火/水/木/金/土';
		var content = '';
		var f = new java.io.File(th.localFile.getParent() + java.io.File.separator + 'SETTING.TXT');
		if (f.exists()) {
			content = v2c.readFile(f);
		} else {
			var url = 'http://' + th.url.getHost() + '/' + th.board.key + '/SETTING.TXT';
			var req = v2c.createHttpRequest(url);
			req.setRequestProperty('Accept-Encoding', 'gzip');
			content = req.getContentsAsString();
			if (req.responseCode==200 || req.responseCode==302) {
				if (req.responseCode == 302) {
					var newUrl = req.getResponseHeader('Location');
					content = v2c.readURL(newUrl);
				}
			} else {
				return ymdWeeks;
			}
		}
		if(!content)
			return ymdWeeks;

		var ix1,ix2;
		if (-1 == (ix1 = content.indexOf('BBS_YMD_WEEKS='))) {
			return ymdWeeks;
		}
		ix1 += 'BBS_YMD_WEEKS='.length;
		if (-1 == (ix2 = content.indexOf('\n', ix1))) {
			return ymdWeeks;
		}
		if (ix1 == ix2)
			return ymdWeeks;
		ymdWeeks = content.substring(ix1, ix2);
		return ymdWeeks;
	}
	
	this.getThreadLog = function(url)
	{
		var req = v2c.createHttpRequest(url);
		req.setRequestProperty('Accept-Encoding', 'gzip');
		var content = req.getContentsAsString();
		if (req.responseCode==200 || req.responseCode==302) {
			if (req.responseCode == 302) {
				var newUrl = req.getResponseHeader('Location');
				content = v2c.readURL(newUrl);
			}
		} else {
			return null;
		}

		if(!content) {
			return null;
		}

		return content;
	};
	
	this.printlnLog = function(format /*, ...*/)
	{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1]; });

		v2c.println("[getdat.js] " + message);
	};
})();



function getDat(thread)
{
	if(!thread.bbs.is2ch)
		return null;

	var retrievedResCount = thread.localResCount;
	var dat = null;
	for(var i = 0; retrievedResCount < 1001 && i < services.length; i++)
	{
		v2c.setStatus("過去ログを取得中........( ´∀｀)つ旦 " + services[i].name);
		var content = '';
		var url = '';
		if (services[i].obj) {
			url = services[i].obj.getURL(thread);
			content = services[i].obj.exec(thread);
		} else if (services[i].src && services[i].dst) {
			url = (String(thread.url.toString())).replace(services[i].src, services[i].dst);
			content = getThreadLog(url);
		}
		if (v2c.interupted) { return null; }
		if(!content)
			continue;

		var resCount = content.split("\n").length;
		if ((resCount == 1) && (content.split("\n")[0].match(/^unkar\.org.*ステータスコード0/))) continue;
		
		printlnLog("{0} ({1}): {2}", services[i].name, resCount, url);

		if(retrievedResCount < resCount)
		{
			dat = { service: services[i], content: content };
			retrievedResCount = resCount;
		}
	}

	var found = dat ? "retrieved from " + dat.service.name : "not found";
	printlnLog("{0}: {1} (+{2})", found, thread.title, retrievedResCount - thread.localResCount);

	return dat ? dat.content : null;
}
 


// デバック用
// 適当な2chスレリンクを右クリックで実行
// [登録場所] リンク
// [コマンド] ${SCRIPT:SF} system\\getdat.js local
//    └ローカルのv2c/script/system/scdataに保存したHTMLファイル(testlogsoku.txt)を読み込んでv2c/script/system/scdataフォルダにtest.datを作成する
// [コマンド] ${SCRIPT:SF} system\\getdat.js
//     └2chスレURLからログ速HTMLを取得してscdataフォルダにtest.datを作成する
//Test();		/*  ※デバックするときはこの行のコメントを外す  */
function Test()
{
	var vcx = v2c.context;
	if (!vcx || !vcx.link) return;
	var thread = vcx.thread;
	var html = '';
	
	var datfunc = new HTMLtoDAT(htmltodatDir + 'ログ速.prm');
	//var datfunc = new HTMLtoDAT(htmltodatDir + 'ログ速.prm', true);
	//var datfunc = new LOGSOKUtoDAT();
	
	if (v2c.context.args[0] != null && (v2c.context.args[0].indexOf('local') >= 0) ) {
		html = v2c.readFile(v2c.getScriptDataFile('testlogsoku.txt'), 'MS932');
	}

	var stime = new Date();
	var dat = datfunc.exec(thread, html);
	if (!dat) {
		v2c.println('このスレッドは存在しませんでした : ' + datfunc.getURL(thread) + '\r\n一定時間経つと過去のものでも取得されている可能性があります。');
	}
	var fname = v2c.getScriptDataFile('test.dat');
	v2c.writeStringToFile(fname, dat);
	var etime = new Date();
	v2c.println('exec time = ' + (etime - stime) + 'ミリ秒かかりました');
}
