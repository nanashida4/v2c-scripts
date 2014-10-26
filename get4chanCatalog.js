//【登録場所】お気に入り、ツールバー
//【ラベル】検索キーワード名＠板名 など
//【コマンド】${SCRIPT:SFRx} get4chanCatalog.js $BOARD(板URL)
//【アクション】スレ一覧で開く ←※忘れやすいんで設定し忘れに注意
//【更新日】2014/07/11 スレタイにサブジェクトの追加＆文字参照を置換。 $BOARDのURL形式で取得できない不具合の修正
//          2013/12/21 初版
//例：${SCRIPT:SFRx} get4chanCatalog.js $BOARD(http://boards.4chan.org/b/)
//例：${SCRIPT:SFRx} get4chanCalalog.js $SEARCH(Random)
//　　↑4chan random板からカタログをスレ一覧に変換して取得する
//【内容】
// ０．※get4chanCatalog.jsとgetdat.jsが必要
// １. お気に入り一覧かツールバーのボタン登録領域に上記例のようなコマンドのボタンを作成する(登録領域の場所がわからない場合wikiのfindThreadsMod.jsの詳細を参照)
// ２. 作成したボタンを押すとカタログがスレ一覧に表示される
// ３．板が作成されてなければ再起動し、再度スレ一覧を開いてスレを選択しスレが表示されれば成功
//【コマンドの書式】
// ${SCRIPT:SFRx} get4chanCatalog.js 引数１ 引数２ 引数３ ... (以下の引数を半角スペースを空けて連続して書く。)
// $BOARD(板URL) = 板URL(http://boards.4chan.org/b/みたいな) ※必須・複数回定義不可
// $SEARCH(板名) = 板KEY(RandomやAnimeみたいな板名) ※BOARDと両方指定は不可、板名の一部でも可
// $SORT(0 or 1 or 2 or 3) = $BOARD使用時のカタログの並び替え順序を指定します 0=既定,1=最終レス日時順, 2=スレ立て日時順, 3=レス数順
//【スクリプト】
function getThreads(cx) {
	if (!v2c.online) { cx.skip = true; return null; }
	var catHtml = null;
	var bd = null;
	var thl = [];
	
	if (v2c.context.args.length > 0) {
		var tmp = String(v2c.context.argLine);
		
		var matches = [];
		var sort = "alt";
		if (matches = /\$SORT\(([^\)]+)(?:\) \$|\)$)?/i.exec(tmp)) {
			switch (parseInt(matches[1])) {
				case 1 : sort = "date"; break;
				case 2 : sort = "absdate"; break;
				case 3 : sort = "r"; break;
				default : sort = "alt"; break;
			}
		}
		if (matches = /\$SEARCH\(([^\)]+)(?:\) \$|\)$)?/i.exec(tmp)) {
			var q = matches[1];
			var menuUrl = 'http://www.4chan.org/framesnav?disclaimer=accept';
			html = v2c.readURL(menuUrl);
			if (!html) { statusLog('4chanメニューの取得に失敗 ({0})', menuUrl); return null; }
			var reg = new RegExp('<a href="//(boards\.4chan\.org/[^/]+/)" target="main" title="(.*?' + q + '[^"]*?)">', 'i');
			if (matches = reg.exec(html)) {
				var u = 'http://' + matches[1];
				bd = v2c.getBoard(u);
				if (!bd) {
					insertTreeCode(u, matches[2]);
				}
			} else {
				statusLog('虹覧カタログから本家URLの取得失敗。'); throw 'カタログの取得に失敗しました。'; return null;
			}
			thl = b4chanCat(bd, sort);
		} 
		else if (matches = /\$BOARD\(([^\)]+)(?:\) \$|\)$)?/i.exec(tmp)) {
			if (matches[1].length == 0) { statusLog('$BOARD(板URL)の「板URL」に何も入力されていません。'); throw '$BOARD(板URL)の「板URL」に何も入力されていません。'; return null; }
			var catUrl = matches[1];
			var urltmp = catUrl + "catalog";
			catHtml = v2c.readURL(urltmp);
			if (!catHtml) { statusLog('カタログの取得に失敗。({0})', catUrl); throw 'カタログの取得に失敗しました。'; return null; }
			if (matches = /<title>\/\w+\/ - ([\w\s]+?) - Catalog<\/title>/i.exec(catHtml)) {
				var title = matches[1];
				bd = v2c.getBoard(catUrl, title);
				if (!bd) { 
					insertTreeCode(catUrl, title);
				}
			} else {
				statusLog('カタログのタイトル取得に失敗。'); throw 'カタログの取得に失敗しました。'; return null;
			}
			thl = b4chanCat(bd, sort);
		}
	}
	return thl;
}

function insertTreeCode(url, title)
{
	var f = new java.io.File(v2c.saveDir + '/BBS/UserDefined/bbstree.txt');
	var tmp = String(v2c.readStringFromFile(f));
	var treecode = '2,' + url + ',' + title + '\r\n';
	if (tmp.indexOf(treecode) < 0) {
		if (tmp.indexOf('1,C,4chan') >= 0) {
			tmp = tmp.split('1,C,4chan\r\n').join('1,C,4chan\r\n' + treecode);
		} else {
			tmp += '1,C,4chan,\r\n' + treecode;
		}
		v2c.writeStringToFile(f, tmp, "UTF-8");
		v2c.alert('『' + title + '』板を作成しました。V2Cを再起動します。');
		v2c.restart();
	}

}
function b4chanCat(bd, sort)
{
	var thl = [];
	var hr = v2c.createHttpRequest(bd.url + 'catalog');
	var html = hr.getContentsAsString();
	var tmp = html.split('var catalog ='); if (tmp.length > 0) { tmp = tmp[1]; }
	tmp = tmp.split('var style_group'); if (tmp.length > 0) { tmp = tmp[0]; }
	var catObj = eval('(function() { return ' + tmp + '})();');
/* カタログオブジェクトフォーマット
	var catalog = {
		threads : {
			"\d+" : {
				date : 作成日時,
				r : レス数,
				i : ？,
				lr: { // 最終レス
					id : ID名,
					date : 投稿日時,
					author : ハンドル名
				},
				author : スレ主名,
				imgurl : スレ画像,
				tn_w : スレ画像解像度Width,
				tn_h : スレ画像解像度Height,
				sub : ？,
				teaser : 本文
			},
			// …
		},
		order : { // ソート順
			absdate :,	// 最終レス日時順
			date :,		// スレ立て日時順
			alt :,		// agesage順(既定)
			r :			// レス数順
		},
		count : スレッド数,
		slug : 板key,
		anon : 名無し名,
		mtime : 作成時間,
		pagesize : 表示スレッド数
	};
*/
	var orders = catObj.order[sort];

	var add = 1000000000;
	for (var i = 0; i < orders.length; i++) {
		var item = catObj.threads[orders[i]];
		var k, t, n

		k = orders[i] + add;
		var tmp = item.teaser.substr(0, 64);
		if (tmp.length <= 0)
			tmp = 'タイトルなし';
		else
			tmp = (item.sub) ? item.sub + ': ' + tmp : tmp;
		t = convert(tmp);
		n = item.r;
		var th = bd.getThread(parseInt(k), null, String(t), parseInt(n));
		if (th)
			thl.push(th);
	}
	return thl;
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
		v2c.context.setStatusBarText("[get4chanCatalog.js] " + message);
}
function printlnLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.println("[get4chanCatalog.js] " + message);
}