//【登録場所】 全体、レス表示
//【ラベル】IDランキング
//【内容】IDをレス数などでランキング表示する。複数スレを対象にしたり集計範囲なども設定可能。
//【コマンド1】　${SCRIPT:Frw} idrank.js　実行スレッドですべてのレスから30位以内のレスの多いIDをランキング
// 　※デフォルトの場合、【コマンド2】の保存により変わる。
//【コマンド2】　${SCRIPT:Frw} idrank.js input　ランキングの設定表示
//【コマンド3】　${SCRIPT:Frw} idrank.js respane　別タブ表示、無し（デフォルト）でポップアップ表示
//【コマンド4】　${SCRIPT:Frw} idrank.js range　スクリプトを実行したレスで集計範囲指定
// 　※手順：開始する日時（レス）でスクリプト実行（ステータスバーに「開始日時を保存～」）→終了する日時（レス）で同スクリプト実行
// 　※引数「range」のとき、設定の保存で「範囲」のチェックが自動的にはずれる仕様になっています。
//【コマンド5】　${SCRIPT:Frw} idrank.js input respane range　コマンド2～4の組み合わせ
// 　※2012/9/23より設定保存先がidrankフォルダ内(idrank\config.txt)に変更されました。旧ファイル(scdata\idrank.txt)は削除してください。
// 　※コピーボタンを削除したい場合は、idrank\graph.htmlの87行目を削除またはコメントアウト
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context,
	vrpx = v2c.resPane,
	res = vcx.res,
	th = vcx.thread;
//デフォルト値
var Status = {
	//設定ここから
	threshold: 30, //ID順位の閾値（閾値より低い順位はポップアップ表示しない）
	sortColumn: 0, //ソートカラム（0:レス数、1:被参照数、2:文字数、3:平均文字数、4:リンク数、5:NGレス数、6:書込スレ数）
	limitedBar: 100, //レス数と被参照数の棒グラフにおけるバー長さの制限数、超えると改行
	saveAndSubmit: false, //実行ボタンをおした場合でもチェック対象のデータを保存
	startFromTarget: false, //選択されたレスの時間を開始時間にする（引数のrangeがない場合）
	stopEndDay: false, //本日の最終時間(23:59:59.999)を終了時間にする（引数がrangeがない場合）
	dispResPane: false, //レス表示欄で表示する、falseだとポップアップ表示
	copyHTMLGraph: false, //コピーしたとき、HTMLのままで取得、falseだとグラフの並びをTEXT変換して取得
	//設定ここまで
	
	//対象[すべてのタブ, このタブ]
	targetRes: ['', 'checked'], //'checked'であらかじめチェック ※どちらか一方
	
	//範囲[すべてのレス, 開始から終了までのレス]
	typeRange: ['checked', ''], //'checked'であらかじめチェック ※どちらか一方
	
	//表示カラム[レス数, 被参照数, 文字数, 平均文字数, リンク数, NGレス数, 書込スレ数]
	viewColumn: ['checked', 'checked', 'checked', '', 'checked', '', 'checked'], //'checked'であらかじめチェック
	
	//データの取得を開始する日時
	startDate: {},
	startArr: [0,0,0,0,0,0,0],
	
	//データの取得を終了する日時
	stopDate: {},
	stopArr: [0,0,0,0,0,0,0],
	
	//保存するデータ
	tempSettings: ['', '', '', '', 'checked', 'checked'],
	
	//対象の集計時間範囲を指定
	setTimeRange: function(r) {
		//対象レスの日時
		var resDate = res && res.time ? new Date(res.time) : new Date();
		//日付Object→日付Array
		var getDateArr = function(d) {
			return [
				d.getFullYear(),
				parseInt(d.getMonth() + 1),
				d.getDate(),d.getHours(),
				d.getMinutes(),
				d.getSeconds(),
				d.getMilliseconds()
			];
		};
		if (r) {
			var obj = v2c.getProperty('TimeRange') || {};
			if (obj && obj.startDate) {
				this.startDate = obj.startDate;
				this.stopDate = resDate;
				this.typeRange = ['', 'checked']
				v2c.removeProperty('TimeRange');
			} else {
				obj.startDate = resDate;
				v2c.putProperty('TimeRange',obj);
				vcx.setStatusBarText('(idrank.js)開始日時を保存しました。終了日時を指定してください。')
				return true;
			}
		} else {
			var presArr = getDateArr(new Date());
			this.startDate = this.startFromTarget ? resDate : new Date(presArr[0], presArr[1]-1, presArr[2]);
			this.stopDate = this.stopEndDay ?
				new Date(presArr[0], presArr[1]-1, presArr[2], 23, 59, 59, 999) : new Date();
		}
		this.startArr = getDateArr(this.startDate);
		this.stopArr = getDateArr(this.stopDate);
	}
};

var GraphString = '', //IDグラフコピーデータ
	InitStatus = [
		'[TempSettings]',
		'TargetRes=',
		'TimeRange=',
		'StartTime=',
		'StopTime=',
		'Threshold=',
		'SortColumn=',
		'ViewColumn='
	],
	StatusLines = [], //設定行の配列
	ConfigFile = v2c.getScriptSubFile('config.txt'),
	GraphHTML_File = v2c.getScriptSubFile('graph.html'),
	SettingHTML_File = v2c.getScriptSubFile('setting.html'),
	CharacterEncoding = 'utf-8',
	DispNewPane = true;

//グラフ用IDデータ
var ID_Data = (function() {
	var length = 0,
		data = [],
		allCount = 0,
		pattern1 = /^([.\+\/\w]{8}(?:O|P|Q|i|I|o|0|))/,
		pattern2 = /\n/g,
		pattern3 = /tp:\/\//g,
		key = '',
		url = '',
		title = '';
	return {
		setData: function(res) {
			if (!res || !res.id || !(res.id + '').match(pattern1)) return false;
			var name = RegExp.$1;
			var idx = this.getIdx(name);
			var refc = res.refCount;
			var numc = (res.message + '').replace(pattern2, '').length;
			//var linkc = res.links.length;//本文KWでURL挿入していない場合はこれで問題なし
			var linkc = 0;
			if (res.links.length) {
				while (pattern3.exec(res.message + '') != null) {
					linkc++;
				}
			}
			var ngc = res.ng ? 1 : 0;
			if (idx) {
				data[idx].rescount++;
				data[idx].refcount += refc;
				data[idx].charcount += numc;
				data[idx].linkcount += linkc;
				data[idx].ngcount += ngc;
				if (data[idx].urls[key]) {
					data[idx].urls[key] += ',' + res.number;
				} else {
					data[idx].urls[key] = url + res.number;
					data[idx].thcount++;
					data[idx].titles[key] = title;
				}
			} else {
				data[length] = {
					id:name,
					rescount:1,
					refcount:refc,
					charcount:numc,
					linkcount:linkc,
					ngcount:ngc,
					urls:{},
					thcount:1,
					titles:{},
					meancharcount:0
				};
				data[length].urls[key] = url + res.number;
				data[length].titles[key] = title;
				length++;
			}
			allCount++;
			return true;
		},
		setReCalc: function() {
			for (var i = 0; i < length; i++) {
				data[i].meancharcount = Math.ceil(data[i].charcount / data[i].rescount);
			}
		},
		setThread: function(th) {
			if (th) {
				key = th.key + '';
				url = th.url + '';
				title = th.title + '';
			}
		},
		getIdx: function(str) {
			for (var i = data.length-1; i >= 0; i--) {
				if (data[i].id == str) {
					return i;
				}
			}
			return null;
		},
		getData: function(n) { return n > -1 ? data[n] : data; },
		
		//ランキング対象となる総レス数
		getAllCount: function() { return allCount; },
		
		//グラフ用IDデータのソート
		sortData: function() {
			switch (Status.sortColumn) {
				case '1': //被参照数
					data.sort(function(a, b) { return b.refcount - a.refcount; });
					break;
				case '2': //文字数
					data.sort(function(a, b) { return b.charcount - a.charcount; });
					break;
				case '3': //平均文字数
					data.sort(function(a, b) { return b.meancharcount - a.meancharcount; });
					break;
				case '4': //リンク数
					data.sort(function(a, b) { return b.linkcount - a.linkcount; });
					break;
				case '5': //ＮＧレス数
					data.sort(function(a, b) { return b.ngcount - a.ngcount; });
					break;
				case '6': //書込スレ数
					data.sort(function(a, b) { return b.thcount - a.thcount; });
					break;
				default: //レス数
					data.sort(function(a, b) { return b.rescount - a.rescount; });
					break;
			}
		}
	};
})();

//実行
(function() {
	if (Status.setTimeRange(checkOptions('range'))) return;
	readDataToStateTxt();
	if (checkOptions('respane')) Status.dispResPane = true;
	if (checkOptions('input')) {
		if (Status.typeRange[0] == 'checked') getRangeResDate();
		inputGraphSetting();
	} else {
//		var begin = new Date();
		createIdRankData(Status.startDate, Status.stopDate);
//		var end = new Date();
//		v2c.println('実行時間: ' + (end-begin) + ' ms');
		if (Status.typeRange[0] == 'checked') getRangeResDate();
		ID_Data.sortData();
		createIdRankGraph(Status.startDate, Status.stopDate);
	}
})();

//引数オプションの確認
function checkOptions(str) {
	var a = vcx.args;
	for (var i = 0, il = a.length; i < il; i++) {
		if (str == a[i]) {
			return true;
		}
	}
	return false;
};

//保存用データ作成・読み込み
function readDataToStateTxt() {
	if (v2c.readFile(ConfigFile) == null) {
		v2c.writeLinesToFile(ConfigFile, InitStatus, CharacterEncoding);
	} else {
		var mt;
		var pattern = /^(TargetRes|TimeRange|StartTime|StopTime|Threshold|SortColumn|ViewColumn)=(.+)$/;
		StatusLines = v2c.readLinesFromFile(ConfigFile, CharacterEncoding);
		for (var i = 0, il = StatusLines.length; i < il; i++) {
			mt = (StatusLines[i] + '').match(pattern) || [];
			switch (mt[1]) {
				case 'TargetRes':
					Status.targetRes = mt[2].split(',');
					Status.tempSettings[0] = 'checked';
					break;
				case 'TimeRange':
					if (checkOptions('range')) break;
					Status.typeRange = mt[2].split(',');
					Status.tempSettings[1] = 'checked';
					break;
				case 'StartTime':
					Status.startArr = mt[2].split(',');
					Status.tempSettings[2] = 'checked';
					break;
				case 'StopTime':
					Status.stopArr = mt[2].split(',');
					Status.tempSettings[3] = 'checked';
					break;
				case 'Threshold':
					Status.threshold = mt[2];
					Status.tempSettings[4] = 'checked';
					break;
				case 'SortColumn':
					Status.sortColumn = mt[2];
					break;
				case 'ViewColumn':
					Status.viewColumn = mt[2].split(',');
					Status.tempSettings[5] = 'checked';
					break;
				default:
					break;
			}
		}
	}
};

//Tableを表示のままの並びでコピー
function copyTable(str) {
	str = str.replace(/<form[^]+?\/form>/, '');
	if (!Status.copyHTMLGraph) {
		str = str.replace(/\s/g, '')
		.replace(/<!--[^]{0,}?-->/ig, '')
		.replace(/<[^<>]{0,}>/ig, function(a) {
			if (a == '</tr>' || a.indexOf('<table ') > -1)
				return '\n';
			else if (a == '</th>' || a == '</td>')
				return '　';
			else
				return '';
			}).replace(/( |　|&nbsp;){1,}/ig, '　');
	}
	vcx.setClipboardText(str);
};

//順位のチェック
function checkSameRank(comp, data, count) {
//	v2c.println('(comp:' + comp + ', data:' + data + ')? --> count:' + count);
	if (data == 0) { //データが0
		return null;
	} else if (comp == data) { //同順位
		return count + 1;
	} else { //単独順位
		comp = data;
		return 0;
	}
};

//日時のフォーマット（ポップアップ文字用）
function toMyLocaleString(d) {
	return java.text.SimpleDateFormat("yyyy/MM/dd'&nbsp;'HH:mm:ss.SSS").format(d);
};

//グラフ用IDデータの作成
function createIdRankData(st, et) {
	var thx;
	var resx;
	var time = 0;
	var this_th = Status.targetRes[1] == 'checked';
	var il = this_th ? 1 : vrpx.threads.length;
	for (var i = 0; i < il; i++) {
		thx = this_th ? th : vrpx.getThread(i);
		ID_Data.setThread(thx);
		if (thx && !thx.bbs.twitter) {
			v2c.setStatus('(' + (i + 1) + '/' + il + ') ' + thx.title + ' ………');
			for (var j = 0,jl = thx.localResCount; j < jl; j++) {
				resx = thx.getRes(j);
				time = resx.time - 0;
				if (Status.typeRange[1] == 'checked' &&
					(time < st.getTime() || time > et.getTime())) continue; //終了時間は含めない場合 time >= et
				ID_Data.setData(resx);
			}
		}
	}
	ID_Data.setReCalc();
//	ID_Data.sortData();
//	v2c.println(ID_Data.getData(0).id);
//	v2c.println(ID_Data.getAllCount());
};

//ポップアップグラフの表示
function createIdRankGraph(st, et) {
	var res_count = 0,
		ref_count = 0,
		char_count = 0,
		mean_char_count = 0,
		link_count = 0,
		ng_count = 0,
		th_count = 0,
		rank_num = 1
		all_res_num = ID_Data.getAllCount();
	var graphStr = v2c.readFile(GraphHTML_File, CharacterEncoding);
	var graphArr = (graphStr + '').split('</tr>');
	var data = ID_Data.getData();
	var data_len = data.length;
//	v2c.println(graphArr);
	var dataArr = [];
	var resBarDiv = '';
	var refBarDiv = '';
	//HTML_グラフの作成
	for (var q = 0; q < graphArr.length; q++) {
		switch (q) {
			case 0: //
				dataArr[0] = graphArr[0].replace(/\$SortColumn(\d)\$/g,function(a,b) {
						return b == Status.sortColumn ? 'selected' : '';
					}).replace(/\$Threshold\$/g, Status.threshold);
				break;
			case 1: //
				dataArr[1] = graphArr[1].replace(/\$StartTime\$/g, toMyLocaleString(st))
					.replace(/\$StopTime\$/g, toMyLocaleString(et))
				break;
			case 2: //
				dataArr[2] = graphArr[2];
				break;
			case 3: //
				for (var p = 0, n = 0; p < data_len; p++) {
					switch (Status.sortColumn) {
						case '1': //被参照数
							n = checkSameRank(ref_count, data[p].refcount, n);
							break;
						case '2': //文字数
							n = checkSameRank(char_count, data[p].charcount, n);
							break;
						case '3': //平均文字数
							n = checkSameRank(mean_char_count, data[p].meancharcount, n);
							break;
						case '4': //リンク数
							n = checkSameRank(link_count, data[p].linkcount, n);
							break;
						case '5': //ＮＧレス数
							n = checkSameRank(ng_count, data[p].ngcount, n);
							break;
						case '6': //書込スレ数
							n = checkSameRank(th_count, data[p].thcount, n);
							break;
						default: //レス数
							n = checkSameRank(res_count, data[p].rescount, n);
							break;
					}
					if (n != null) {
						if (n == 0) {
							rank_num = p + 1;
							if (rank_num > Status.threshold) break;
						}
					} else {
						break;
					}
					res_count = data[p].rescount;
					ref_count = data[p].refcount;
					char_count = data[p].charcount;
					mean_char_count = data[p].meancharcount;
					link_count = data[p].linkcount;
					ng_count = data[p].ngcount;
					th_count = data[p].thcount;
					if (p%2) {
						dataArr[p + 3] = graphArr[3];
					} else {
						dataArr[p + 3] = graphArr[4];
					}
					if (res_count > Status.limitedBar) {
						for (var m = 0, c = Math.floor(res_count/Status.limitedBar); m < c; m++) {
							resBarDiv += '<div class="bar" style="width: ' + Status.limitedBar + ';"></div>';
						}
						resBarDiv += '<div class="bar" style="width: ' + res_count%Status.limitedBar + ';"></div>';
					} else {
						resBarDiv = '<div class="bar" style="width: ' + res_count + ';"></div>';
					}
					if (ref_count > Status.limitedBar) {
						for (var m = 0, c = Math.floor(ref_count/Status.limitedBar); m < c; m++) {
							refBarDiv += '<div class="bar" style="width: ' + Status.limitedBar + ';"></div>';
						}
						refBarDiv += '<div class="bar" style="width: ' + ref_count%Status.limitedBar + ';"></div>';
					} else {
						refBarDiv = '<div class="bar" style="width: ' + ref_count + ';"></div>';
					}
					dataArr[p + 3] = dataArr[p + 3].replace(/\$RankNum\$/g, rank_num)
						.replace(/\$ID\$/g, function(a) {
							var k = 0, s='';
							for (var j in data[p].urls) {
								k++;
								if (k == 1) s = data[p].urls[j];
							}
							if (k==1) {
								return '<a href="' + s + '" style="color:blue">' + data[p].id + '</a>';
							} else {
								return '<a href="http:' + p +'" style="color:red">' + data[p].id + '</a>';// + ' [' + k + ']';
							}
						})
						.replace(/\$ResCount\$/g, res_count)
						.replace(/\$ResCountBar\$/g, resBarDiv)
						.replace(/\$RefCount\$/g, ref_count)
						.replace(/\$RefCountBar\$/g, refBarDiv)
						.replace(/\$CharCount\$/g, char_count)
						.replace(/\$MeanCharCount\$/g, mean_char_count)
						.replace(/\$LinkCount\$/g, link_count)
						.replace(/\$NG_Count\$/g, ng_count)
						.replace(/\$Th_Count\$/g, th_count);
					resBarDiv = '';
					refBarDiv = '';
				}
				break;
			case 4: //
				break;
			case 5: //
				dataArr[p + 3] = graphArr[5].replace(/\$AllResNum\$/g, all_res_num)
					.replace(/\$ID_Num\$/g, data_len)
					.replace(/\$MeanResNum\$/g, Math.ceil(all_res_num/data_len*100)/100);
			case 6: //
				dataArr[p + 4] = graphArr[6];
			default: //
				break;
		}
	}
	GraphString = dataArr.slice(0, p + 5).join('</tr>');
//	v2c.println(GraphString);
	//HTML_グラフで該当する列を非表示
	for (var s = 0; s < 7; s++) {
		if (Status.viewColumn[s] != 'checked') {
			switch (s) {
				case 1: //被参照数
					GraphString = GraphString.replace(/(t[hd] class="ref".+?\/t[hd])/g, '!--$1--');
					break;
				case 2: //文字数
					GraphString = GraphString.replace(/(t[hd] class="char".+?\/t[hd])/g, '!--$1--');
					break;
				case 3: //平均文字数
					GraphString = GraphString.replace(/(t[hd] class="mchar".+?\/t[hd])/g, '!--$1--');
					break;
				case 4: //リンク数
					GraphString = GraphString.replace(/(t[hd] class="link".+?\/t[hd])/g, '!--$1--');
					break;
				case 5: //ＮＧレス数
					GraphString = GraphString.replace(/(t[hd] class="ng".+?\/t[hd])/g, '!--$1--');
					break;
				case 6: //書込スレ数
					GraphString = GraphString.replace(/(t[hd] class="th".+?\/t[hd])/g, '!--$1--');
					break;
				default: //レス数
					GraphString = GraphString.replace(/(t[hd] class="res".+?\/t[hd])/g, '!--$1--');
					break;
			}
		}
	}
//	v2c.println(GraphString);
	//HTML_グラフ出力
	if (Status.dispResPane) {
		vcx.setResPaneHTML(GraphString, 'IDランキング', DispNewPane);
	} else {
		vcx.setPopupFocusable(true);
		vcx.setPopupHTML(GraphString);
	}
	vcx.setTrapFormSubmission(true);
	vcx.setRedirectURL(true);
	vcx.setCloseOnLinkClick(false);
};

//リンククリック処理
function redirectURL(u) {
	vcx.setCloseOnLinkClick(false);
	vcx.setRedirectURL(true);
	if ((u + '').indexOf('http://') == 0) { return u; }
	var i = (u + '').replace(/http:/, ''),
			k = 0,
			al = [],
			data = ID_Data.getData();
	for (var j in data[i].urls) {
		k++;
		al.push(k + ' : <a href="' + data[i].urls[j] + '" style="color:blue">' + data[i].titles[j] + '</a> ' + data[i].urls[j].split(',').length + 'res');
	}
	var html = '<html><body style = " margin:10px; ">' + al.join('<br>') + '</body></html>';
	vcx.setPopupHTML(html);
	vcx.setCloseOnMouseExit(true);
};

//フォームデータ処理
function formSubmitted(u, sm, sd) {
//	v2c.println('url:' + u);
//	v2c.println('get|post:' + sm);
//	v2c.println('data:' + sd);
	if (sd.indexOf('redisp=') > -1) {
		while(/([a-z]+)=(\d+)(?:&|$)/g.exec(sd)){
			if(RegExp.$1 == 'ct'){
				Status.sortColumn = RegExp.$2;
			} else if(RegExp.$1 == 'hd'){
				Status.threshold = RegExp.$2;
			}
		};
		ID_Data.sortData();
		DispNewPane = false;
		if (!Status.dispResPane) vcx.closeOriginalPanel();
		createIdRankGraph(Status.startDate, Status.stopDate);
		return;
	}
	if (sd.indexOf('copy=') > -1) {
//		v2c.println(GraphString);
		copyTable(GraphString);
		return;
	}
	if (sd.indexOf('docking=') > -1) {
		DispNewPane = !Status.dispResPane;
		vcx.closeOriginalPanel();
		Status.dispResPane = !Status.dispResPane;
		createIdRankGraph(Status.startDate, Status.stopDate);
		return;
	}
	vcx.closeOriginalPopup();
	m1=sd.match(/\d+/g);
	Status.targetRes = ['',''];
	Status.typeRange = ['',''];
	m1[0] == 1 ? Status.targetRes[1] = 'checked' : Status.targetRes[0] = 'checked';
	m1[1] == 1 ? Status.typeRange[1] = 'checked' : Status.typeRange[0] = 'checked';
	Status.startDate = new Date(m1[2], m1[3] - 1, m1[4], m1[5], m1[6], m1[7], m1[8]);
	Status.stopDate = new Date(m1[9], m1[10] - 1, m1[11], m1[12], m1[13], m1[14], m1[15]);
	Status.sortColumn = m1[16];
	Status.threshold = m1[17];
	Status.viewColumn = ['','','','','','',''];
	m2=sd.match(/v=\d+/g) || [];
	for (var i = j = 0, il=m2.length; i < il; i++) {
		j = (m2[i] + '').replace('v=', '');
		 Status.viewColumn[j] = 'checked';
	}
	m3=sd.match(/o=\d+/g) || [];
	Status.tempSettings = ['','','','','',''];
	for (var k = 0, lk = m3.length; k < lk; k++) {
		j = (m3[k] + '').replace('o=', '');
		Status.tempSettings[j] = 'checked';
	}
	if (sd.indexOf('&tt=') > -1 || Status.saveAndSubmit) {
		StatusLines = v2c.readLinesFromFile(ConfigFile, CharacterEncoding);
		var pattern = /^(TargetRes|TimeRange|StartTime|StopTime|Threshold|SortColumn|ViewColumn)=(.*)$/;
		for (var n = 0, nl = StatusLines.length; n < nl; n++) {
			StatusLines[n] += '';
			if (StatusLines[n].indexOf('[TempSettings]') != -1) {
				sw = 1;
			} else {
				switch (sw) {
					case 1:
						mt = StatusLines[n].match(pattern);
						if (!mt) continue;
						switch (mt[1]) {
							case 'TargetRes':
								StatusLines[n] = Status.tempSettings[0] == 'checked' ?
									'TargetRes=' + Status.targetRes.join(',') : 'TargetRes=';
								break;
							case 'TimeRange':
								StatusLines[n] = Status.tempSettings[1] == 'checked' ?
									'TimeRange=' + Status.typeRange.join(',') : 'TimeRange=';
								break;
							case 'StartTime':
								StatusLines[n] = Status.tempSettings[2] == 'checked' ?
									'StartTime=' + [m1[2],m1[3],m1[4],m1[5],m1[6],m1[7],m1[8]] : 'StartTime=';
								break;
							case 'StopTime':
								StatusLines[n] = Status.tempSettings[3] == 'checked' ?
									'StopTime=' + [m1[9],m1[10],m1[11],m1[12],m1[13],m1[14],m1[15]] : 'StopTime=';
								break;
							case 'Threshold':
								StatusLines[n] = Status.tempSettings[4] == 'checked' ?
									'Threshold=' + Status.threshold : 'Threshold=';
								break;
							case 'SortColumn':
								StatusLines[n] = Status.tempSettings[4] == 'checked' ?
									'SortColumn=' + Status.sortColumn : 'SortColumn=';
								break;
							case 'ViewColumn':
								StatusLines[n] = Status.tempSettings[5] == 'checked' ?
									'ViewColumn=' + Status.viewColumn.join(',') : 'ViewColumn=';
								break;
							default:
								break;
						}
						break;
					default:
						break;
				}
			}
		}
	}
	if ((sd.indexOf('&sb=') > -1 && Status.saveAndSubmit)|| sd.indexOf('&tt=') > -1)  {
		v2c.writeLinesToFile(ConfigFile, StatusLines, CharacterEncoding);
	}
	if (sd.indexOf('&tt=') == -1) {
//		var begin = new Date();
		createIdRankData(Status.startDate, Status.stopDate);
//		var end = new Date();
//		v2c.println('実行時間: ' + (end-begin) + ' ms');
		if (Status.typeRange[0] == 'checked') getRangeResDate();
		ID_Data.sortData();
		createIdRankGraph(Status.startDate, Status.stopDate);
	}
};

//すべてのスレッドの最古レスと最新レスの時間を取得
function getRangeResDate() {
	var oldResTime = new Date().getTime(),
		newResTime = 0,
		thx = {},
		ort = 0,
		lrt = oldResTime;
	var this_th = Status.targetRes[1] == 'checked';
	var il = this_th ? 1 : vrpx.threads.length;
	for (var i = 0; i < il; i++) {
		thx = this_th ? th : vrpx.getThread(i);
		if (thx && !thx.bbs.twitter) {
			ort = thx.getRes(0).time;
			if (oldResTime > ort) {
				Status.startDate = new Date(ort);
			}
			lrt = thx.getRes(thx.localResCount - 1).time;
			if (newResTime < lrt) {
				Status.stopDate = new Date(lrt);
			}
		}
	}
};

//データ入力ポップアップの表示
function inputGraphSetting() {
	var SettingHTML = v2c.readFile(SettingHTML_File, CharacterEncoding);
	var par2data = ( function(){
		var data = {
			'OldDate': toMyLocaleString(Status.startDate),
			'NewDate': toMyLocaleString(Status.stopDate),
			'TargetRes': Status.targetRes,
			'TypeRange': Status.typeRange,
			'StartArr': function(num) { return num == 6 ? ("00" + Status.startArr[6]).slice(-3) : Status.startArr[num]; },
			'StopArr': function(num) { return num == 6 ? ("00" + Status.stopArr[6]).slice(-3) :Status.stopArr[num]; },
			'SortColumn': function(num) { return num == Status.sortColumn ? 'selected' : ''; },
			'Threshold': Status.threshold,
			'ViewColumn': Status.viewColumn,
			'TempSettings': Status.tempSettings
		};
		return function(str) {
			return str.replace(/\$([a-z]+?)(\d?)\$/ig, function(a, par, num) {
				return typeof data[par] == 'function' ? data[par](num) : num == '' ? data[par] : data[par][num];
			});
		};
	})();
	SettingHTML = par2data(SettingHTML + '');
	vcx.setPopupHTML(SettingHTML);
	vcx.setPopupFocusable(true);
	vcx.setTrapFormSubmission(true);
	return;
};
// ----- 前の行まで -----