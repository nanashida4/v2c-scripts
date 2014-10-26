//【登録場所】お気に入り、ツールバー
//【ラベル】検索キーワード名＠板名 など
//【コマンド】${SCRIPT:SFRx} get8chanCatalog.js $BKEY(板キー)
//【アクション】スレ一覧で開く ←※忘れやすいんで設定し忘れに注意
//【更新日】2014/10/16 初版
//例：${SCRIPT:SFRx} get8chanCatalog.js $BOARD(http://jp.8chan.co/vip/)
//例：${SCRIPT:SFRx} get8chanCalalog.js $SEARCH(ニュー速VIP)
//例：${SCRIPT:SFRx} get8chanCatalog.js $HOST(8chan.co) $BOARD(http://jp.8chan.co/vip/)
//　　↑英語版8chan Random板からカタログをスレ一覧に変換して取得する
//【内容】
// ０．※get8chanCatalog.jsとgetdat.jsが必要
// １. お気に入り一覧かツールバーのボタン登録領域に上記例のようなコマンドのボタンを作成する(登録領域の場所がわからない場合wikiのfindThreadsMod.jsの詳細を参照)
// ２. 作成したボタンを押すとカタログがスレ一覧に表示される
// ３．板が作成されてなければ再起動し、再度スレ一覧を開いてスレを選択しスレが表示されれば成功
//【コマンドの書式】
// ${SCRIPT:SFRx} get8chanCatalog.js 引数１ 引数２ 引数３ ... (以下の引数を半角スペースを空けて連続して書く。)
// $HOST(ホスト) = ホスト(8chan.co等) ※既定では8chan日本(jp.8chan.co)で省略可。英語(8chan.co)やその他vichan使用の画像掲示板の場合のみ入力・複数定義不可
// $BOARD(板URL) = 板URL(vip) ※BOARDかSEARCHいずれか必須、両方指定は不可・複数回定義不可
// $SEARCH(板名) = 板名(ニュー速VIP@8ch) ※BOARDかSEARCHいずれか必須、両方指定は不可、板名の一部でも可
// $SORT(0 or 1 or 2 or 3) = $BOARD使用時のカタログの並び替え順序を指定します 0=age,sage順(既定),1=作成日, 2=レス順, 3=ランダム
// $ALLBOARDS = 板一覧の更新(半手動) ※外部コマンド→全体などにコマンドを追加してください。
//【スクリプト】
if (v2c.context.args.length > 0) {
	var args = String(v2c.context.argLine);
	if (/\$ALLBOARDS/i.test(args)) {
		var bu = new BoardUtils();
		bu.insertFavCode();
	}
}

function getThreads(cx) {
	if (!v2c.online) { cx.skip = true; return null; }
	var catHtml = null;
	var bd = null;
	var thl = [];
	
	if (v2c.context.args.length > 0) {
		var bu = new BoardUtils();
		var args = String(v2c.context.argLine);
		var matches = [];
		if (matches = /\$SEARCH\(([^\)]+)(?:\) \$|\)$)?/i.exec(args)) {
			var q = matches[1];
			var bdinfo = bu.getBoard(q);
			if (!bdinfo) {
				statusLog(bu.host + '板情報の取得に失敗 ({0})', burl); throw 'カタログの取得に失敗しました。'; return null;
			}
			bd = v2c.getBoard(bdinfo.url);
			if (!bd) {
				bu.insertTreeCode(bdinfo.url, bdinfo.title);
			}
			thl = b8chanCat(bd, bu.getSort());
		} 
		else if (matches = /\$BOARD\(([^\)]+)(?:\) \$|\)$)?/i.exec(args)) {
			if (matches[1].length == 0) { statusLog('$BOARD(板URL)の「板URL」に何も入力されていません。'); throw '$BOARD(板URL)の「板URL」に何も入力されていません。'; return null; }
			var catUrl = matches[1];
			bd = v2c.getBoard(catUrl);
			if (!bd) {
				var title = bu.getTitle(catUrl);
				bd = v2c.getBoard(catUrl, title);
				if (!bd) {
					insertTreeCode(catUrl, title);
				}
			}
			thl = b8chanCat(bd, bu.getSort());
		}
	}
	return thl;
}

function BoardUtils()
{
	var self = this;
	this.host = '';
	this.sort_list = {};
	
	this.insertTreeCode = function(url, title)
	{
		var f = new java.io.File(v2c.saveDir + '/BBS/UserDefined/bbstree.txt');
		var tmp = String(v2c.readStringFromFile(f));
		var treecode = '2,' + url + ',' + title + '\r\n';
		var root = '1,C,' + self.host.replace(/,/g, '');
		if (tmp.indexOf(treecode) < 0) {
			if (tmp.indexOf('1,C,4chan') >= 0) {
				tmp = tmp.split(root + '\r\n').join(root + '\r\n' + treecode);
			} else {
				tmp += root + '\r\n' + treecode;
			}
			v2c.writeStringToFile(f, tmp, "UTF-8");
			v2c.alert('『' + title + '』板を作成しました。V2Cを再起動します。');
			v2c.restart();
		}

	};
	this.insertFavCode = function()
	{
		var boards = self.getBoards();
		if (!boards) {
			throw '[get8chanCatalog.js] favorite.txtを作成できませんでした。'; return null;
		}
		var sort = self.getSort();
		var root = '0,C,' + self.host.replace(/,/g, '');
		
		var f = new java.io.File(v2c.saveDir + '/favorite.txt');
		var tmp = String(v2c.readStringFromFile(f));
		var tmp2 = [];
		if (tmp.indexOf(root) >= 0) {
			tmp2 = tmp.split(root + '\r\n');

		} else {
			tmp2[0] = tmp;
			tmp2[1] = '';
		}
		for (var i = boards.length - 1; i >= 0; i--) {
			var treecode = '1,CMD:G:C${SCRIPT:SFRx} get8chanCatalog.js $BOARD(' + boards[i].url + ') $SORT(' + sort + ')\tL' + boards[i].title + '(' + boards[i].url.split('.')[0].split('//')[1] + ')\ta1\r\n';
			if (tmp2[1].indexOf(treecode) < 0) {
				tmp2[1] = treecode + tmp2[1];
			}
		}
		tmp = tmp2.join(root + '\r\n');
		var f2 = v2c.getScriptSubFile('favorite.txt');
		v2c.writeStringToFile(f2, tmp, "UTF-8");
		v2c.alert(f2.toString() + '\r\nに' + self.host + '板群を追加した新しいfavorite.txtを作成しました。\r\n手動でV2C保存用フォルダにあるfavorite.txtに上書きして、V2Cを再起動してください。');
	};

	this.getSort = function()
	{
		var sort = 0
		var args = String(v2c.context.argLine);
		if (matches = /\$SORT\(([^\)]+)(?:\) \$|\)$)?/i.exec(args)) {
			var tmp = matches[1];
			for (var it in self.sort_list) {
				if (it == tmp) {
					sort = tmp;
					break;
				}
			}
		}
		return sort;
	};
	this.getTitle = function(url)
	{
		var matches = [];
		var title = '';
		if (matches = /http:\/\/[^\/]+\/(.*?)\/?/i.exec(String(url))) {
			var bdinfo = self.getBoards('', matches[1]);
			if (bdinfo) {
				title = bdinfo.title;
			}
		}
		return title;
	};
	this.getBoard = function(keyword)
	{
		return self.getBoards(keyword);
	};
	
	this.getBoards = function(/* keyword, bkey */)
	{
		var keyword = arguments[1] || '';
		var bkey = arguments[2] || '';
		var burl = 'http://' + self.host + '/boards.json';
		var hr = v2c.createHttpRequest(burl);
		var boards = hr.getContentsAsString();
		if (!boards) { statusLog('板一覧が取得出来ませんでした。 ({0})', burl); return null; }
		boards = eval('(function() { return ' + boards + '})();');
		if (!boards) { statusLog('板一覧が不明なフォーマットです。 ({0})\n 詳細：\n{1}', burl, boards); return null; }
		var boards2 = [];
		for (var it in boards) {
			var item  = boards[it];
			if (keyword && String(item[1] + item[2]).indexOf(keyword) != -1) {
				return {url: 'http://' + self.host + '/' + item[0] + '/' , title: convert(String(item[1]))};
			}
			if (bkey && bkey == item[0]) {
				return {url: 'http://' + self.host + '/' + item[0] + '/' , title: convert(String(item[1]))};
			}
			boards2.push({url: 'http://' + self.host + '/' + item[0] + '/', title:convert(String(item[1]))});
		}
		return (!keyword) ? boards2 : null;
	};
	
	{
		var args = String(v2c.context.argLine);
		var matches = [];
		self.host = 'jp.8chan.co';
		if (matches = /\$HOST\(([^\)]+)(?:\) \$|\)$)?/i.exec(args)) {
			self.host = matches[1].replace(/https?:\/\/(.*?)\/?/, '$1');
		}
		self.sort_list = {
			"0" : { 'data-sort' : 'data-bump',  'data-order' : 'desc' },
			"1" : { 'data-sort' : 'data-time',  'data-order' : 'desc' },
			"2" : { 'data-sort' : 'data-reply', 'data-order' : 'desc' },
			"3" : { 'data-sort' : 'random',     'data-order' : ''    }
		};
	}
}

function b8chanCat(bd, sort)
{
	var thl = [], thl2 = [];
	var url = bd.url + 'catalog.json';
	var hr = v2c.createHttpRequest(url);
	var json = hr.getContentsAsString();
	if (!json) {
		statusLog('カタログが取得出来ませんでした。 ({0})', url); return null;
	}
	var catObj = eval('(function() { return ' + json + '})();');
	if (!catObj) {
		statusLog('カタログが不明なフォーマットです。 ({0})\n 詳細：\n{1}', url, catObj); return null;
	}
	
	var pages = catObj.length;
	for (var pidx = 0; pidx < pages; pidx++) {
		var threads = catObj[pidx]["threads"];
		for (var i = 0; i < threads.length; i++) {
			var th = threads[i];
			var th2 = {
				'data-reply' : parseInt(th['replies']),
				'data-bump'  : parseInt(th['last_modified']),
				'data-time'  : parseInt(th['time']),
				'no'         : th['no'],
				'sub'        : th['sub'],
				'com'        : th['com'],
				'country'    : th['country']
			};
			thl.push(th2);
		}
	}
	var bu = new BoardUtils();
	sort = bu.sort_list[sort];
	if (sort["data-sort"] == 'random') {
		thl.sort(
			function() {
				return Math.random() - 0.5;
			}
		);
	} else {
		var prop = sort["data-sort"];
		var order = (sort["data-order"] == 'asc') ? -1 : 1;
		thl.sort(
			// 降順
			function(a, b) {
				if (a[prop] < b[prop]) return order;
				if (a[prop] > b[prop]) return -order;
				return 0;
			}
		);
	}
	var add = 1000000000;
	for (var i = 0; i < thl.length; i++) {
		var th = thl[i];
		var k = 0, t = '', n = 0;
		
		// スレキー
		k = th['no'] + add;
		
		// タイトル
		if (th['sub']) {
			t = th['sub'];
		}
		if (th['com']) {
			t += (t.length > 0) ? ': ' : '';
			if (th['no'] == 1646) {
				v2c.println(th['com']);
			}
			var tmp = th['com'].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
			t += tmp.substr(0, 64);
		}
		if (t.length <= 0) {
			t = 'タイトルなし';
		}
		if (th['country']) {
			t = '[' + th['country'] + ']' + t;
		}
		t = convert(t);
		
		// レス数
		n = th['data-reply'] + 1;
		
		var th2 = bd.getThread(parseInt(k), null, String(t), parseInt(n));
		if (th2)
			thl2.push(th2);
	}
	return thl2;
}

var CHARREF_TABLE = {
	"&quot;":34,"&amp;":38,"&apos;":39,"&lt;":60,"&gt;":62,"&nbsp;":160,
	"&iexcl;":161,"&cent;":162,"&pound;":163,"&curren;":164,"&yen;":165,
	"&brvbar;":166,"&sect;":167,"&uml;":168,"&copy;":169,"&ordf;":170,
	"&laquo;":171,"&not;":172,"&shy;":173,"&reg;":174,"&macr;":175,
	"&deg;":176,"&plusmn;":177,"&sup2;":178,"&sup3;":179,"&acute;":180,
	"&micro;":181,"&para;":182,"&middot;":183,"&cedil;":184,"&sup1;":185,
	"&ordm;":186,"&raquo;":187,"&frac14;":188,"&frac12;":189,"&frac34;":190,
	"&iquest;":191,"&Agrave;":192,"&Aacute;":193,"&Acirc;":194,"&Atilde;":195,
	"&Auml;":196,"&Aring;":197,"&AElig;":198,"&Ccedil;":199,"&Egrave;":200,
	"&Eacute;":201,"&Ecirc;":202,"&Euml;":203,"&Igrave;":204,"&Iacute;":205,
	"&Icirc;":206,"&Iuml;":207,"&ETH;":208,"&Ntilde;":209,"&Ograve;":210,
	"&Oacute;":211,"&Ocirc;":212,"&Otilde;":213,"&Ouml;":214,"&times;":215,
	"&Oslash;":216,"&Ugrave;":217,"&Uacute;":218,"&Ucirc;":219,"&Uuml;":220,
	"&Yacute;":221,"&THORN;":222,"&szlig;":223,"&agrave;":224,"&aacute;":225,
	"&acirc;":226,"&atilde;":227,"&auml;":228,"&aring;":229,"&aelig;":230,
	"&ccedil;":231,"&egrave;":232,"&eacute;":233,"&ecirc;":234,"&euml;":235,
	"&igrave;":236,"&iacute;":237,"&icirc;":238,"&iuml;":239,"&eth;":240,
	"&ntilde;":241,"&ograve;":242,"&oacute;":243,"&ocirc;":244,"&otilde;":245,
	"&ouml;":246,"&divide;":247,"&oslash;":248,"&ugrave;":249,"&uacute;":250,
	"&ucirc;":251,"&uuml;":252,"&yacute;":253,"&thorn;":254,"&yuml;":255,
	"&OElig;":338,"&oelig;":339,"&Scaron;":352,"&scaron;":353,"&Yuml;":376,
	"&fnof;":402,"&circ;":710,"&tilde;":732,"&Alpha;":913,"&Beta;":914,
	"&Gamma;":915,"&Delta;":916,"&Epsilon;":917,"&Zeta;":918,"&Eta;":919,
	"&Theta;":920,"&Iota;":921,"&Kappa;":922,"&Lambda;":923,"&Mu;":924,
	"&Nu;":925,"&Xi;":926,"&Omicron;":927,"&Pi;":928,"&Rho;":929,"&Sigma;":931,
	"&Tau;":932,"&Upsilon;":933,"&Phi;":934,"&Chi;":935,"&Psi;":936,"&Omega;":937,
	"&alpha;":945,"&beta;":946,"&gamma;":947,"&delta;":948,"&epsilon;":949,
	"&zeta;":950,"&eta;":951,"&theta;":952,"&iota;":953,"&kappa;":954,"&lambda;":955,
	"&mu;":956,"&nu;":957,"&xi;":958,"&omicron;":959,"&pi;":960,"&rho;":961,
	"&sigmaf;":962,"&sigma;":963,"&tau;":964,"&upsilon;":965,"&phi;":966,"&chi;":967,
	"&psi;":968,"&omega;":969,"&thetasym;":977,"&upsih;":978,"&piv;":982,"&ensp;":8194,
	"&emsp;":8195,"&thinsp;":8201,"&zwnj;":8204,"&zwj;":8205,"&lrm;":8206,"&rlm;":8207,
	"&ndash;":8211,"&mdash;":8212,"&lsquo;":8216,"&rsquo;":8217,"&sbquo;":8218,
	"&ldquo;":8220,"&rdquo;":8221,"&bdquo;":8222,"&dagger;":8224,"&Dagger;":8225,
	"&bull;":8226,"&hellip;":8230,"&permil;":8240,"&prime;":8242,"&Prime;":8243,
	"&lsaquo;":8249,"&rsaquo;":8250,"&oline;":8254,"&frasl;":8260,"&euro;":8364,
	"&image;":8465,"&weierp;":8472,"&real;":8476,"&trade;":8482,"&alefsym;":8501,
	"&larr;":8592,"&uarr;":8593,"&rarr;":8594,"&darr;":8595,"&harr;":8596,"&crarr;":8629,
	"&lArr;":8656,"&uArr;":8657,"&rArr;":8658,"&dArr;":8659,"&hArr;":8660,"&forall;":8704,
	"&part;":8706,"&exist;":8707,"&empty;":8709,"&nabla;":8711,"&isin;":8712,"&notin;":8713,
	"&ni;":8715,"&prod;":8719,"&sum;":8721,"&minus;":8722,"&lowast;":8727,"&radic;":8730,
	"&prop;":8733,"&infin;":8734,"&ang;":8736,"&and;":8743,"&or;":8744,"&cap;":8745,
	"&cup;":8746,"&int;":8747,"&there4;":8756,"&sim;":8764,"&cong;":8773,"&asymp;":8776,
	"&ne;":8800,"&equiv;":8801,"&le;":8804,"&ge;":8805,"&sub;":8834,"&sup;":8835,
	"&nsub;":8836,"&sube;":8838,"&supe;":8839,"&oplus;":8853,"&otimes;":8855,"&perp;":8869,
	"&sdot;":8901,"&lceil;":8968,"&rceil;":8969,"&lfloor;":8970,"&rfloor;":8971,"&lang;":9001,
	"&rang;":9002,"&loz;":9674,"&spades;":9824,"&clubs;":9827,"&hearts;":9829,"&diams;":9830
};

function convert(srcNCRString) {
	var re = /\&#(x?\d+);/ig;
	var re2 = /(\&[a-zA-Z0-9]+;)/ig;
	return srcNCRString
		.replace(re, function(a, m1) {
			var mx = (m1[0] == 'x') ? '0' + m1 : m1;
			return String.fromCharCode(mx);
		})
		.replace(re2, function(a, m1) {
			var chcode = CHARREF_TABLE[m1];
			return (chcode) ? String.fromCharCode(chcode) : m1;
		});
}

function statusLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.context.setStatusBarText("[get8chanCatalog.js] " + message);
}
function printlnLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.println("[get8chanCatalog.js] " + message);
}