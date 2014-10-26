//【登録場所】お気に入り、ツールバー
//【ラベル】検索キーワード名＠板名 など
//【コマンド】${SCRIPT:SFRx} getFutabaCatalog.js $BOARD(板URL)
//【アクション】スレ一覧で開く ←※忘れやすいんで設定し忘れに注意
//【更新日】2014/07/12 虹覧のURL変更 07/25追加：$ALLBOARDSのバグ修正
//          2014/04/19 スレ一覧変換の最適化
//          2014/04/07 板一覧の更新(半手動)のコマンド追加
//          2014/03/01 ふたばカタログのスレを全取得(100x100)するようにした
//          2013/12/12 初回実行時に板を自動的に作成するようになりました (ユーザー定義に板を作成する必要がなくなった) パーミッションが SFRxに変わります
//          2012/12/12 rev.2 カタログにタイトルがない場合スレからタイトルを取得する処理の追加
//          2012/12/12 rev.3 $BOARDでのカタログ取得時にソート指定できるようにした
//例：${SCRIPT:SFRx} getFutabaCatalog.js $BOARD(http://dec.2chan.net/b/)
//例：${SCRIPT:SFRx} getFutabaCatalog.js $NIJIRAN(DEC)
//　　↑二次元裏(Dec)からカタログをスレ一覧に変換して取得する
//例：${SCRIPT:SFRx} getFutabaCatalog.js $ALLBOARDS
//　　↑ふたばのbbsmenuにある全ての板用のコマンドををお気に入りに登録する。実行後手動でV2C保存用フォルダ/script/getFutabaCatalog/favorite.txtをV2C保存用フォルダ/favorte.txtに上書きする必要があります
//【内容】
// ０．※getFutabaCatalog.jsとgetdat.jsが必要
// １. お気に入り一覧かツールバーのボタン登録領域に上記例のようなコマンドのボタンを作成する(登録領域の場所がわからない場合wikiのfindThreadsMod.jsの詳細を参照)
// ２. 作成したボタンを押すとカタログがスレ一覧に表示される
// ３．板が作成されてなければ再起動し、再度スレ一覧を開いてスレを選択しスレが表示されれば成功
//【コマンドの書式】
// ${SCRIPT:SFRx} getFutabaCatalog.js 引数１ 引数２ 引数３ ... (以下の引数を半角スペースを空けて連続して書く。)
// $BOARD(板URL) = 板URL(http://dec.2chan.net/b/みたいな) ※必須・複数回定義不可
// $NIJIRAN(板KEY) = 板KEY(IDやDECみたいな) ※BOARDと両方指定は不可
// $SORT(0 or 1 or 2 or 3 or 4) = $BOARD使用時のカタログの並び替え順序を指定します 0=既定,1=新順, 2=古順, 3=多順, 4=少順
// $ALLBOARDS = 板一覧の更新(半手動) ※外部コマンド→全体などにコマンドを追加してください。
//【スクリプト】
if (v2c.context.args.length > 0) {
	var args = String(v2c.context.argLine);
	var matches = [];
	var sort = 0;
	if (matches = /\$SORT\(([^\)]+)(?:\) \$|\)$)?/i.exec(args)) {
		sort = parseInt(matches[1]);
	}
	if (matches = /\$ALLBOARDS/i.exec(args)) {
		var html = v2c.readURL('http://www.2chan.net/bbsmenu.html');
		if (html) {
			html = html.split('<b>画像板</b><br>')[1].split('<b>スクリプト</b><br>')[0];
			var favfile = v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/favorite.txt'));
			var boards = [];
			while (matches = /<a href="(http:\/\/[^\/]+?\/[^\/]+?\/)futaba.htm[^>]+?>([^<]+?)<\/a>/g.exec(html)) {
				boards.push({url: matches[1], title:matches[2]});
			}
			insertFavCode(boards, sort);
		}
	}
}

function getThreads(cx) {
	if (!v2c.online) { cx.skip = true; return null; }
	var catHtml = null;
	var bd = null;
	var thl = [];
	
	if (v2c.context.args.length > 0) {
		var tmp = String(v2c.context.argLine);
		
		var matches = [];
		var sort = 0;
		if (matches = /\$SORT\(([^\)]+)(?:\) \$|\)$)?/i.exec(tmp)) {
			sort = parseInt(matches[1]);
		}
		if (matches = /\$NIJIRAN\(([^\)]+)(?:\) \$|\)$)?/i.exec(tmp)) {
			var server = matches[1].toUpperCase();
			var nranUrl = 'http://nijiran.hobby-site.org/nijiran/fCatalog_' + server + '.html';
			catHtml = v2c.readURL(nranUrl);
			if (!catHtml) { statusLog('カタログの取得に失敗 ({0})', nranUrl); return null; }
			if (matches = /<a href="([^"]+)" id="reload_b" target="_blank">本家へ<\/a>/i.exec(catHtml)) {
				bd = v2c.getBoard(matches[1]);
				if (!bd) {
					var bdnames = {
						'DIS' : '東日本大震災＠ふたば',
						'ATM' : '発電＠ふたば',
						'DEC' : '二次裏＠ふたば',
						'MAY' : '二次裏＠ふたば',
						'ID'  : '二次裏＠ふたば',
						'JUN' : '二次裏＠ふたば',
						'NOV' : '二次裏＠ふたば',
						'IMG' : '二次裏＠ふたば',
						'DAT' : '二次裏＠ふたば',
						'MRC' : '東方＠ふたば',
						'MRU' : '東方裏＠ふたば',
						'MKI' : '模型＠ふたば',
						'MKU' : '模型裏＠ふたば',
						'LIV' : '二次元実況＠ふたば',
						'LIVU': '二次元実況裏＠ふたば',
						'L3D' : '三次実況＠ふたば',
						'GOV' : '政治＠ふたば',
						'GRU' : 'グロ裏＠ふたば',
						'LAY' : 'ﾚｲｱｳﾄ＠ふたば',
						'DECT': 'decてすと＠ふたば',
						'TJUN': 'てすとjun＠ふたば'
					};
					var bdn = bdnames[server];
					if (bdn.indexOf('二次裏＠ふたば') >= 0) {
						bdn += ' (' + server + ')';
					}
					insertTreeCode(matches[1], bdn);
				}
			} else {
				statusLog('虹覧カタログから本家URLの取得失敗。'); throw 'カタログの取得に失敗しました。'; return null;
			}
			thl = nijiranCat(catHtml, bd);
		} 
		else if (matches = /\$BOARD\(([^\)]+)(?:\) \$|\)$)?/i.exec(tmp)) {
			if (matches[1].length == 0) { statusLog('$BOARD(板URL)の「板URL」に何も入力されていません。'); throw '$BOARD(板URL)の「板URL」に何も入力されていません。'; return null; }
			var catUrl = matches[1];
			var urltmp = catUrl + "futaba.php?mode=cat";
			if (sort > 0) {
				urltmp = urltmp + '&sort=' + sort;
			}
			var hr = v2c.createHttpRequest(urltmp);
			hr.setRequestProperty('Cookie', 'cxyl=100x100x100');
			catHtml = hr.getContentsAsString();
		
			if (!catHtml) { statusLog('カタログの取得に失敗。({0})', catUrl); throw 'カタログの取得に失敗しました。'; return null; }
			
			if (matches = /<title>([^>]+)<\/title>/ig.exec(catHtml)) {
				var title = matches[1];
				if (title.indexOf('二次元裏＠ふたば') >= 0) {
					matches = /http:\/\/(\w+)\.2chan\.net\/(\w+)\//i.exec(catUrl);
					if (RegExp.$2 == 'id') {
						title += ' (ID)';
					} else {
						title += ' (' + RegExp.$1.toUpperCase() + ')';
					}
				}
				bd = v2c.getBoard(catUrl, title);
				if (!bd) { 
					insertTreeCode(catUrl, title);
				}
			} else {
				statusLog('カタログのタイトル取得に失敗。'); throw 'カタログの取得に失敗しました。'; return null;
			}
			thl = futabaCat(catHtml, bd);
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
		if (tmp.indexOf('1,C,ふたば☆ちゃんねる') >= 0) {
			tmp = tmp.split('1,C,ふたば☆ちゃんねる\r\n').join('1,C,ふたば☆ちゃんねる\r\n' + treecode);
		} else {
			tmp += '1,C,ふたば☆ちゃんねる\r\n' + treecode;
		}
		v2c.writeStringToFile(f, tmp, "UTF-8");
		v2c.alert('『' + title + '』板を作成しました。V2Cを再起動します。');
		v2c.restart();
	}

}

function insertFavCode(boards, sort)
{
	var f = new java.io.File(v2c.saveDir + '/favorite.txt');
	var tmp = String(v2c.readStringFromFile(f));
	var tmp2 = [];
	if (tmp.indexOf('0,C,ふたば☆ちゃんねる') >= 0) {
		tmp2 = tmp.split('0,C,ふたば☆ちゃんねる\r\n');

	} else {
		tmp2[0] = tmp;
		tmp2[1] = '';
	}
	for (var i = boards.length - 1; i >= 0; i--) {
		var treecode = '1,CMD:G:C${SCRIPT:SFRx} getFutabaCatalog.js $BOARD(' + boards[i].url + ') $SORT(' + sort + ')\tL' + boards[i].title + '(' + boards[i].url.split('.')[0].split('//')[1] + ')\ta1\r\n';
		if (tmp2[1].indexOf(treecode) < 0) {
			tmp2[1] = treecode + tmp2[1];
		}
	}
	tmp = tmp2.join('0,C,ふたば☆ちゃんねる\r\n');
	var f2 = v2c.getScriptSubFile('favorite.txt');
	v2c.writeStringToFile(f2, tmp, "UTF-8");
	v2c.alert(f2.toString() + '\r\nにふたば板群を追加した新しいfavorite.txtを作成しました。\r\n手動でV2C保存用フォルダにあるfavorite.txtに上書きして、V2Cを再起動してください。');
}

function nijiranCat(catHtml, bd)
{
	var add = 1000000000;
	var html = catHtml.split('↓隔離されたスレ')[0];
	html = html.split('<div style="text-align: center;"><table class="nom" cellspacing="0">')[1];
	var cat2thReg = /<a href="http:\/\/\w+\.2chan\.net\/\w+\/res\/(\d+)\.htm" target="_blank"><span class="cat"><img[^>]+><br><\/span>([^<]+)<br><\/a><[^>]+>(\d+)<\/span>/ig;
	var matches = [];
	var thl = [];
	while (matches = cat2thReg.exec(html)) {
		var k, t, n;
		if (!matches[1]) continue;
		k = matches[1];
		t = convert(matches[2]);
		n = matches[3];
		var th = bd.getThread(parseInt(k) + add, null, t, n);
		thl.push(th);
	}
	return thl;
}

function futabaCat(catHtml, bd)
{
	var cat2thReg = new RegExp("<td><a href='res/([^']+)\\.htm'.+<small>([^<]+)</small>(?:</a>)?<br><font size=2>([^<]+)</font>", "igm");
	var thl = [];
	var matches = [];
	var add = 1000000000;
	
	while (matches = cat2thReg.exec(catHtml)) {
		var k, t, n;
		if (!matches[1]) continue;
		else k = matches[1];
		t = (!matches[2]) ? "タイトルなし" : convert(matches[2]);
		n = (!matches[3]) ? 0 : parseInt(matches[3], 10);
		var th = bd.getThread(parseInt(k) + add, null, t, n);
		thl.push(th);
	}
	return thl;
}

function convert(srcNCRString) {
	var re = /\&#(x?\d+);/ig;
	return srcNCRString
		.replace(re, function(a, m1) {
			var mx = (m1[0] == 'x') ? '0' + m1 : m1;
			return String.fromCharCode(mx);
		});
};

function statusLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.context.setStatusBarText("[getFutabaCatalog.js] " + message);
}
function printlnLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.println("[getFutabaCatalog.js] " + message);
}