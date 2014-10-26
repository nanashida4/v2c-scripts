//【登録場所】 全体
//【ラベル】 ログ検索
//【内容】 ログ検索で抽出結果を1スレにまとめる
//【コマンド】 ${SCRIPT:FrwT} logsearch.js
//【更新日】 2013/03/01
//【元URL】 http://jbbs.shitaraba.net/bbs/read.cgi/computer/43680/1359018517/33,36
//【スクリプト】
// ----- 次の行から -----
importPackage(javax.swing);
importPackage(javax.swing.table);
importPackage(javax.swing.event);
importPackage(java.awt);
importPackage(java.awt.event);
importPackage(java.util);
importPackage(java.util.regex);
importPackage(java.util.concurrent);
importPackage(java.lang);
importPackage(java.io);

var APP_NAME = "logsearch";

var g = {
    cancel: false,
	thread: createCachedThreadPool(),
	defaultValues: (function () {
		var o = {
			blist   : [],
			set1    : false,
			set2    : false,
			set3    : false,
			set4    : false,
			title   : null,
			name    : null,
			mail    : null,
			id      : null,
			be      : null,
			message : null,
			label   : null,
			lnum    : null,
			unum    : null,
			lanc    : null,
			uanc    : null,
			lyear   : null,
			lmonth  : null,
			ldate   : null,
			lday    : null,
			lhours  : null,
			lmin    : null,
			uyear   : null,
			umonth  : null,
			udate   : null,
			uday    : null,
			uhours  : null,
			umin    : null,
			repanc  : false,
			addourl : false,
			opguide : false,
			addcsv  : false
		};
			
		var argLine = v2c.context.argLine + "";
		if (argLine !== "") {
			eval(argLine);
			for (var arg in args) {
				o[arg] = args[arg];
			}
		}
		
		return o;
	}())
}

var normalizeStr = (function () {
	var table = {
		"ｶﾞ": "ガ", "ｷﾞ": "ギ", "ｸﾞ": "グ", "ｹﾞ": "ゲ", "ｺﾞ": "ゴ",
		"ｻﾞ": "ザ", "ｼﾞ": "ジ", "ｽﾞ": "ズ", "ｾﾞ": "ゼ", "ｿﾞ": "ゾ",
		"ﾀﾞ": "ダ", "ﾁﾞ": "ヂ", "ﾂﾞ": "ヅ", "ﾃﾞ": "デ", "ﾄﾞ": "ド",
		"ﾊﾞ": "バ", "ﾋﾞ": "ビ", "ﾌﾞ": "ブ", "ﾍﾞ": "ベ", "ﾎﾞ": "ボ",
		"ﾊﾟ": "パ", "ﾋﾟ": "ピ", "ﾌﾟ": "プ", "ﾍﾟ": "ペ", "ﾎﾟ": "ポ",
		"ｳﾞ": "ヴ",
		"ｱ": "ア","ｲ": "イ", "ｳ": "ウ", "ｴ": "エ", "ｵ": "オ",
		"ｶ": "カ", "ｷ": "キ", "ｸ": "ク", "ｹ": "ケ", "ｺ": "コ",
		"ｻ": "サ", "ｼ": "シ", "ｽ": "ス", "ｾ": "セ", "ｿ": "ソ",
		"ﾀ": "タ", "ﾁ": "チ", "ﾂ": "ツ", "ﾃ": "テ", "ﾄ": "ト",
		"ﾅ": "ナ", "ﾆ": "ニ", "ﾇ": "ヌ", "ﾈ": "ネ", "ﾉ": "ノ",
		"ﾊ": "ハ", "ﾋ": "ヒ", "ﾌ": "フ", "ﾍ": "ヘ", "ﾎ": "ホ",
		"ﾏ": "マ", "ﾐ": "ミ", "ﾑ": "ム", "ﾒ": "メ", "ﾓ": "モ",
		"ﾔ": "ヤ", "ﾕ": "ユ", "ﾖ": "ヨ",
		"ﾗ": "ラ", "ﾘ": "リ", "ﾙ": "ル", "ﾚ": "レ", "ﾛ": "ロ",
		"ﾜ": "ワ", "ｦ": "ヲ", "ﾝ": "ン",
		"ｧ": "ァ", "ｨ": "ィ", "ｩ": "ゥ", "ｪ": "ェ", "ｫ": "ォ", "ｬ": "ャ", "ｭ": "ュ", "ｮ": "ョ", "ｯ": "ッ",
		"｡": "。", "｢": "「", "｣": "」", "､": "、", "･": "・", "ｰ": "ー"
	};
	
	return function (str) {
		str = str + "";
		str = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
			return String.fromCharCode(s.charCodeAt(0) - 65248);
		});
		var result = "";
		var str = str.split("");
		for (var i = 0; i < str.length; i++){
			var c = str[i];
			var nc = str[i + 1];
			if (table[c + nc]) {
				result += table[c + nc];
				i++;
			}
			else {
				result += (table[c]) ? table[c] : c;
			}
		}
		return result;
	};
}());

function createCachedThreadPool () {
	var ex = java.util.concurrent.Executors.newCachedThreadPool();
	return {
		submit: function (f) {
			return ex.submit(new Callable() {
				call: function () {
					return f();
				}
			});
		}
	};
}

function saveDat (boardName, dat, subject, resCount) {
	var s = File.separator;
	var unixtime = Math.floor((new Date()) / 1000);
	
	var dir = new File(v2c.saveDir, s + "log" + s + "localboard");
	if (!dir.exists()) dir.mkdir();
	dir = new File(dir, boardName);
	if (!dir.exists()) dir.mkdir();
	var datFile = new File(dir, unixtime + ".dat");
	
	var pw = new PrintWriter(new BufferedWriter(new FileWriter(datFile, false)));
	pw.print(dat);
	pw.close();


	var subjectFile = new File(dir, "subject.txt");
	var pw = new PrintWriter(new BufferedWriter(new FileWriter(subjectFile, true)));
	pw.print(unixtime + ".dat<>" + subject + " (" + resCount + ")" + "\n");
	pw.close();
	
	return unixtime;
}

function readDat(file) {
	var resList = new ArrayList();
	var br = new BufferedReader(new FileReader(file));
	var line;
	while( (line = br.readLine()) ) {
		resList.add(line);
	}
	br.close();
	return resList;
}

function getMatchesResFromThread(thread, o, callback) {
	/*
	o = 
	{
		beID: BeID
		id: ID
		lowerRefCount: 被参照数 下限
		upperRefCount: 被参照数 上限
		lowerNumber: レス番号 下限
		upperNumber: レス番号 上限
		mail: メール欄
		name: 名前欄
		title: スレタイ
		message: 本文
		lowerDate: 投稿時刻 下限
		upperDate: 投稿時刻 上限
			投稿時刻 = {
				fullYear: 年 4ケタ
				month: 月 0から11の整数 0=1月
				date: 日 1から31の整数
				day: 曜日 0から6の整数 0=日曜日
				hours: 時間 0から23の整数
				minutes: 分 0から59の整数
			}
		resLabel: レスに設定されているレスラベル
	}
	*/
	
	var e = {};
	var list = new ArrayList();

	if (o) {
		
		
		if (o.lowerDate) {
			if (o.lowerDate.month   === undefined) o.lowerDate.month   = 0;
			if (o.lowerDate.date    === undefined) o.lowerDate.date    = 1;
			if (o.lowerDate.hours   === undefined) o.lowerDate.hours   = 0;
			if (o.lowerDate.minutes === undefined) o.lowerDate.minutes = 0;
			o.lowerDate.monthdate = parseInt(o.lowerDate.month) + parseInt(o.lowerDate.date) * 0.01;
			o.lowerDate.hoursminutes = parseInt(o.lowerDate.hours) + parseInt(o.lowerDate.minutes) * 0.01;
			var lowerDate = o.lowerDate;
		}
		
		if (o.upperDate) {
			if (o.upperDate.month   === undefined) o.upperDate.month   = 11;
			if (o.upperDate.date    === undefined) o.upperDate.date    = 31;
			if (o.upperDate.hours   === undefined) o.upperDate.hours   = 23;
			if (o.upperDate.minutes === undefined) o.upperDate.minutes = 59;
			o.upperDate.monthdate = parseInt(o.upperDate.month) + parseInt(o.upperDate.date) * 0.01;
			o.upperDate.hoursminutes = parseInt(o.upperDate.hours) + parseInt(o.upperDate.minutes) * 0.01;
			var upperDate = o.upperDate;
		}
	
		if (o.title    && !(o.title    instanceof RegExp)) o.title    = new RegExp(o.title);
		if (o.message  && !(o.message  instanceof RegExp)) o.message  = new RegExp(o.message);
		if (o.resLabel && !(o.resLabel instanceof RegExp)) o.resLabel = new RegExp(o.resLabel);
		if (o.beID     && !(o.beID     instanceof RegExp)) o.beID     = new RegExp(o.beID);
		if (o.id       && !(o.id       instanceof RegExp)) o.id       = new RegExp(o.id);
		if (o.mail     && !(o.mail     instanceof RegExp)) o.mail     = new RegExp(o.mail);
		if (o.name     && !(o.name     instanceof RegExp)) o.name     = new RegExp(o.name);
		
		if (o.title && !o.title.test(thread.title)) {
			return list;
		}
	}
	
	for (var resCount = thread.resCount, i = 0; i < resCount; i++) {
		var res = thread.getRes(i);
		
		if (!res) continue;
		if ((res.date && res.date + "") === "Over 1000 Thread") continue;
		
		if (o) {
			if ( ( o.message  && !o.message.test(res.message)                              ) ||
				 ( o.resLabel && ( !res.resLabel  || !o.resLabel.test(res.resLabel.name) ) ) ||
				 ( o.beID     && ( res.beID === 0 || !o.beID.test(res.beID)              ) ) ||
				 ( o.id       && ( !res.id        || !o.id.test(res.id)                  ) ) ||
				 ( o.mail     && (                   !o.mail.test(res.mail)              ) ) ||
				 ( o.name     && (                   !o.name.test(res.name)              ) )
			) {
				continue;
			}
			
			if ( (o.lowerNumber && o.lowerNumber > res.number) ||
			     (o.upperNumber && o.upperNumber < res.number)
			) {
				continue;
			}
			
			if ( (o.lowerRefCount && o.lowerRefCount > res.refCount) ||
				 (o.upperRefCount && o.upperRefCount < res.refCount)
			) {
				continue;
			}
			
			if (o.lowerDate || o.upperDate) {
				var date = new Date(res.time);
				var monthdate = date.getMonth() + date.getDate() * 0.01;
				var hoursminutes = date.getHours() + date.getMinutes() * 0.01;
			}
			
			if ( (o.lowerDate && (
					                 ( lowerDate.fullYear != undefined && lowerDate.fullYear     > date.getFullYear() ) ||
					                 (                                    lowerDate.monthdate    > monthdate          ) ||
					                 ( lowerDate.day      != undefined && lowerDate.day          > date.getDay()      ) ||
					                 (                                    lowerDate.hoursminutes > hoursminutes       )
				                 )
				 ) ||
				 (o.upperDate && (
				                     ( upperDate.fullYear != undefined && upperDate.fullYear     < date.getFullYear() ) ||
				                     (                                    upperDate.monthdate    < monthdate          ) ||
				                     ( upperDate.day      != undefined && upperDate.day          < date.getDay()      ) ||
				                     (                                    upperDate.hoursminutes < hoursminutes       )
				                 )
				 )
			) {
				continue;
			}
		}

		list.add(res);
		
		
		if (callback) {
			e.progressValue = (i + 1) / resCount;
			if (callback(e) === false) break;
		}
	}
	
	return list;
}


function makeModelItem(displayString, value) {
	return {
		displayString: displayString,
		value: value
	};
}
function listModelWrapper () {
	var listItems = new LinkedList();
	//var listenerList = new EventListenerList();
	var listModel = new ListModel({
		addListDataListener: function (l) {
			//listenerList.add(l.getClass(), l);
		},
		removeListDataListener: function () {
			//listenerList.remove(l.getClass(), l);
		},
		getElementAt: function (index) {
			return listItems.get(index).displayString;
		},
		getSize: function () {
			return listItems.size();
		}
	});
	
	return {
		addListDataListener: listModel.addListDataListener,
		removeListDataListener: listModel.removeListDataListener,
		getElementAt: listModel.getElementAt,
		getSize: listModel.getSize,
		model: listModel,
		items: listItems,
		add: function (item) {
			listItems.add(item);
		},
		addFirst: function (item) {
			listItems.addFirst(item);
		},
		exists: function (item) {
			for (var length = listItems.size(), i = 0; i < length; i++) {
				var lItem = listItems.get(i);
				if (lItem.displayString === item.displayString && lItem.value === item.value) {
					return true;
				}
			}
			return false;
		},
		remove: function (index) {
			listItems.remove(index);
		},
		clear: function () {
			for (var length = listItems.size(), i = length - 1; i >= 0; i--) {
				this.remove(i);
			}
		}
	};
}

function createGridBagPanel () {
	var panel = new JPanel(new GridBagLayout());
	return {
		getPanel: function () {
			return panel;
		},
		add: function (o) {
			var gbc = new GridBagConstraints();
			for(var option in o.options) {
				gbc[option] = o.options[option];
			}
			panel.add(o.component, gbc);
		}
	};
}

function Window() {
	var gbp = createGridBagPanel();
	var frame = new JFrame();
	//frame.setSize(width, height);

	frame.setAlwaysOnTop(true);

	
	frame.addWindowListener(new WindowListener() {
		windowActivated: function (e) {},
		windowClosed: function (e) {},
		windowDeactivated: function (e) {},
		windowDeiconified: function (e) {},
		windowIconified: function (e) {},
		windowOpened: function (e){},
		windowClosing: function (e) {
			frame.dispose();
		}
	});
	
	frame.add(gbp.getPanel());
	
	return {
		add: gbp.add,
		frame: frame,
		show: function () {
			frame.pack();
			frame.setLocationRelativeTo(null);
			frame.setVisible(true);
		}
	};
}

function makeBoardsModel () {
	var boards = v2c.boards;
	var model = listModelWrapper();
	
	for (var i = 0, length = boards.length; i < length; i++) {
		var board = boards[i];
		if (board.bbs.is2ch) {
			var name = board.name;
			if (name.length() === 0) name = "名無しの板 " + "(" + board.url + ")";
			
			model.add(makeModelItem(name, board));
		}
	}
	
	return model;
}

function makeSearchModel () {
	var boards = v2c.boards;
	var model = listModelWrapper();
	
	for (var i = 0, length = boards.length; i < length; i++) {
		model.add(makeModelItem("dummy", null));
	}
	
	return model;
}

function resMatcher (searchOptions) {
	var e = {};
	var matches = new HashMap();
	
	var dispatchOnProgress = function (callback, progressValue) {
		if (callback) {
			e.progressValue = progressValue;
			var ret = callback(e);
			if (ret === false) return false;
		}
		return true;
	};
	
	return {
		matchThread: function (thread, callback) {
			if (!matches.containsKey(thread)) {
				var list = getMatchesResFromThread(thread, searchOptions, function (e) {
					return dispatchOnProgress(callback, e.progressValue);
				});
				if (list.size() !== 0) {
					matches.put(thread, list);
				}
			}
		},
		matchBoard: function (board, callback) {
			var threads = board.threadsWithLog;
			if (threads.length === 0) {
				dispatchOnProgress(callback, 1.0);
			}
			else {
				for (var length = threads.length, i = 0; i < length; i++) {
					var thread = threads[i];
					this.matchThread(thread);
					
					if (dispatchOnProgress(callback, (i + 1) / length) === false) return;
				}
			}
		},
		build: function (argString, options) {
			var sb = new StringBuilder();
			var itiSb = new StringBuilder();
			
			var threads = matches.keySet().toArray();
			
			threads = threads.sort(function(a, b){
				return (a.key - b.key);
			});
			
			var cancel = false;
			var date = new Date();
			var dateStr = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
			var iti = "抽出<><>" + dateStr + " ID:V2C<>パネルの設定<br>" + argString +"<br><br>$message<>抽出\n";
			var count = 2;
			
			for (var length = threads.length, i = 0; i < length; i++) {
				var thread = threads[i];
				var matchesRes = matches.get(thread);
				var size = matchesRes.size();
				
				var resList = readDat(thread.localFile);
				
				if (size === 1) {
					var anchor = '&gt;&gt;' + count;
				}
				else {
					var anchor = '&gt;&gt;' + count + '-' + (count + size - 1);
				}
				
				count += size;
				
				var rescsv = "";
				for (var j = 0; j < size; j++) {
					var res = matchesRes.get(j);
					rescsv += (j === 0) ? res.number : "," + res.number;
					
					//var source = res.source;
					var source = resList.get(res.index);
					
					if (options && options.callback) {
						var e = {};
						e.progressValue = i / length + (j + 1) / size / length;

						if (options.replaceAnchor) {
							source = source.replaceAll("<a.+?([0-9]+)</a>", "&gt;&gt;" + thread.url + "$1");
						}
						if (options.addOriginalResURL) {
							source = source.replaceAll("(.+)<>.*$", '$1<br><hr>' + thread.title + " " + thread.url + res.number + "<>");
						}
						
						if (options.callback(e) === false) {
							cancel = true;
						}
						if (cancel) break;
					}

					sb.append(source);
					sb.append("\n");
				}
				
				
				itiSb.append(anchor + " " + thread.title + " " + thread.url);
				if (options && options.addCSVList) {
					itiSb.append(rescsv);
				}
				itiSb.append("<br>");
				if (cancel) break;
			}
			
			if (options && options.outputGuide) {
				sb.insert(0, iti.replace("$message", itiSb.toString()));
			}
			
			return sb.toString();
		}
	};
}


var window = new Window();

var components = (function () {

	var refSearch = new JTextField();
	var refSearchEnable = true;
	var boardsModel = makeBoardsModel();
	var defaultModelItems = boardsModel.items.clone();
	var boardsList = new JList(boardsModel.model);
	var boardsListScroll = new JScrollPane(boardsList);
	
	var toRightButton = new JButton("↓");
	var toLeftButton = new JButton("↑");
	
	toRightButton.setPreferredSize(new Dimension(50, 20));
	toLeftButton.setPreferredSize(new Dimension(50, 20));
	
	var searchModel = makeSearchModel();
	var searchList = new JList(searchModel.model);
	var searchListScroll = new JScrollPane(searchList);
	
	var searchButton = new JButton("検索開始");
	var cancelButton = new JButton("キャンセル");
	cancelButton.setEnabled(false);
	
	var searchTitleCheck = new JCheckBox("スレタイ");
	var searchTitle = new JTextField();
	var searchNameCheck = new JCheckBox("名前");
	var searchName = new JTextField();
	var searchMailCheck = new JCheckBox("メール");
	var searchMail = new JTextField();
	var searchIDCheck = new JCheckBox("ID");
	var searchID = new JTextField();
	var searchBeIDCheck = new JCheckBox("BE");
	var searchBeID = new JTextField();
	var searchMessageCheck = new JCheckBox("本文");
	var searchMessage = new JTextField();
	var searchLabelCheck = new JCheckBox("ラベル");
	var list = ["全てのラベル"];
	for (var i = 0; i < v2c.resLabels.length; i++) {
		list.push(v2c.resLabels[i].name);
	}
	var searchLabel = new JComboBox(list);
	var list = [];
	for (var i = 1999; i <= parseInt((new Date()).getFullYear()); i++) {
		list.push(i.toString());
	}
	var searchYear1Check = new JCheckBox("年");
	var searchYear1 = new JComboBox(list);
	var searchYear2Check = new JCheckBox("年");
	var searchYear2 = new JComboBox(list);
	
	var list = [];
	for (var i = 1; i <= 12; i++) {
		list.push(i.toString());
	}
	var searchMonth1Check = new JCheckBox("月");
	var searchMonth1 = new JComboBox(list);
	var searchMonth2Check = new JCheckBox("月");
	var searchMonth2 = new JComboBox(list);
	
	var list = [];
	for (var i = 1; i <= 31; i++) {
		list.push(i.toString());
	}
	var searchDate1Check = new JCheckBox("日");
	var searchDate1 = new JComboBox(list);
	var searchDate2Check = new JCheckBox("日");
	var searchDate2 = new JComboBox(list);
	
	var searchDay1Check = new JCheckBox("曜日");
	var searchDay1 = new JComboBox(["日", "月", "火", "水", "木", "金", "土"]);
	var searchDay2Check = new JCheckBox("曜日");
	var searchDay2 = new JComboBox(["日", "月", "火", "水", "木", "金", "土"]);
	
	var list = [];
	for (var i = 0; i <= 23; i++) {
		list.push(i.toString());
	}
	var searchHours1Check = new JCheckBox("時");
	var searchHours1 = new JComboBox(list);
	var searchHours2Check = new JCheckBox("時");
	var searchHours2 = new JComboBox(list);
	
	var list = [];
	for (var i = 0; i <= 59; i++) {
		list.push(i.toString());
	}
	var searchMinutes1Check = new JCheckBox("分");
	var searchMinutes1 = new JComboBox(list);
	var searchMinutes2Check = new JCheckBox("分");
	var searchMinutes2 = new JComboBox(list);
	
	var searchNumber1Check = new JCheckBox("下限");
	var searchNumber1 = new JSpinner();
	searchNumber1.setValue(1);
	searchNumber1.setEditor(new JSpinner.NumberEditor(searchNumber1, "###0"));
	
	var searchNumber2Check = new JCheckBox("上限");
	var searchNumber2 = new JSpinner();
	searchNumber2.setEditor(new JSpinner.NumberEditor(searchNumber2, "###0"));
	searchNumber2.setValue(1);
	
	var searchRefcount1Check = new JCheckBox("下限");
	var searchRefcount1 = new JSpinner();
	searchRefcount1.setEditor(new JSpinner.NumberEditor(searchRefcount1, "###0"));
	searchRefcount1.setValue(0);
	
	var searchRefcount2Check = new JCheckBox("上限");
	var searchRefcount2 = new JSpinner();
	searchRefcount2.setEditor(new JSpinner.NumberEditor(searchRefcount2, "###0"));
	searchRefcount2.setValue(0);
	
	var searchSelectedThreadCheck = new JCheckBox("選択しているスレッドを含める");
	var searchSelectedBoardCheck = new JCheckBox("選択している板を含める(未実装)");
	searchSelectedBoardCheck.setEnabled(false);
	var searchViewThreadCheck = new JCheckBox("開いているスレッドを含める");
	var searchViewBoardCheck = new JCheckBox("開いている板を含める(未実装)");
	searchViewBoardCheck.setEnabled(false);
	var searchViewThreadBoardCheck = new JCheckBox("開いているスレッドが所属する板を含める");
	var searchSelectedThreadBoardCheck = new JCheckBox("選択しているスレッドが所属する板を含める");
	
	var progressLabel = new JLabel("");
	var progress = new JProgressBar(0, 100);
	
	var replaceAnchorCheck = new JCheckBox("アンカーを絶対参照に書き換える");
	var addOriginalResURLCheck = new JCheckBox("レスの最後に元レスのURLを付加する");
	var outputGuideCheck = new JCheckBox(">>1にガイドを出力する");
	var addCSVListCheck = new JCheckBox(">>1にガイドを出力する場合、URLにレスをカンマ区切りで付ける");
	
	refSearch.addKeyListener(function () {
		this.keyReleased = function (e) {
			if (refSearchEnable) {
				boardsModel.clear();
				var regExp = new RegExp(normalizeStr(refSearch.getText()), "i");
				for (var i = 0, length = defaultModelItems.size(); i < length; i++) {
					var item = defaultModelItems.get(i);
					var name = normalizeStr(item.displayString);
					if (name.match(regExp) && !searchModel.exists(item)) {
						boardsModel.add(item);
					}
				}
				boardsList.repaint();
				boardsList.revalidate();
			}
		}
	});
	refSearch.addInputMethodListener(function () {
		this.inputMethodTextChanged = function (e) {
			refSearchEnable = (e.getText() === null);
		}
	});
	
	toLeftButton.addActionListener(new ActionListener({
		actionPerformed: function (e) {
			var index = searchList.getSelectedIndices();
			for (var length = index.length, i = length - 1; i >= 0; i--) {
				boardsModel.addFirst(searchModel.items.get(index[i]));
				searchModel.remove(index[i]);
			}
			boardsList.repaint();
			boardsList.revalidate();
			searchList.repaint();
			searchList.revalidate();
			searchList.clearSelection();
			boardsList.clearSelection();
		}
	}));
	
	toRightButton.addActionListener(new ActionListener({
		actionPerformed: function (e) {
			var index = boardsList.getSelectedIndices();
			for (var length = index.length, i = length - 1; i >= 0; i--) {
				searchModel.add(boardsModel.items.get(index[i]));
				boardsModel.remove(index[i]);
			}
			boardsList.repaint();
			boardsList.revalidate();
			searchList.repaint();
			searchList.revalidate();
			searchList.clearSelection();
			boardsList.clearSelection();
		}
	}));
	
	var makeSearchOptions = function () {
		
		var searchOptions = {};
		if (searchTitleCheck.isSelected()  ) searchOptions.title   = searchTitle.getText();
		if (searchNameCheck.isSelected()   ) searchOptions.name    = searchName.getText();
		if (searchMailCheck.isSelected()   ) searchOptions.mail    = searchMail.getText();
		if (searchIDCheck.isSelected()     ) searchOptions.id      = searchID.getText();
		if (searchBeIDCheck.isSelected()   ) searchOptions.beID    = searchBeID.getText();
		if (searchMessageCheck.isSelected()) searchOptions.message = searchMessage.getText();
		if (searchLabelCheck.isSelected()  ) {
			if (searchLabel.getSelectedIndex() === 0) {
				searchOptions.resLabel = new RegExp(".+");
			}
			else {
				searchOptions.resLabel = new RegExp("^" + searchLabel.getSelectedItem() + "$");
			}
		}
		
		
		if (searchNumber1Check.isSelected()) searchOptions.lowerNumber = searchNumber1.getValue();
		if (searchNumber2Check.isSelected()) searchOptions.upperNumber = searchNumber2.getValue();
		if (searchRefcount1Check.isSelected()) searchOptions.lowerRefCount = searchRefcount1.getValue();
		if (searchRefcount2Check.isSelected()) searchOptions.upperRefCount = searchRefcount2.getValue();
		
		searchOptions.lowerDate = {};
		searchOptions.upperDate = {};
		var dayTable = {
			"日": "0",
			"月": "1",
			"火": "2",
			"水": "3",
			"木": "4",
			"金": "5",
			"土": "6"
		};

		if (searchYear1Check.isSelected()   ) searchOptions.lowerDate.fullYear = searchYear1.getSelectedItem();
		if (searchMonth1Check.isSelected()  ) searchOptions.lowerDate.month = parseInt(searchMonth1.getSelectedItem()) - 1;
		if (searchDate1Check.isSelected()   ) searchOptions.lowerDate.date = parseInt(searchDate1.getSelectedItem());
		if (searchDay1Check.isSelected()    ) searchOptions.lowerDate.day = dayTable[(searchDay1.getSelectedItem() + "")];
		if (searchHours1Check.isSelected()  ) searchOptions.lowerDate.hours = parseInt(searchHours1.getSelectedItem());
		if (searchMinutes1Check.isSelected()) searchOptions.lowerDate.minutes = parseInt(searchMinutes1.getSelectedItem());

		if (searchYear2Check.isSelected()   ) searchOptions.upperDate.fullYear = searchYear2.getSelectedItem();
		if (searchMonth2Check.isSelected()  ) searchOptions.upperDate.month = parseInt(searchMonth2.getSelectedItem()) - 1;
		if (searchDate2Check.isSelected()   ) searchOptions.upperDate.date = parseInt(searchDate2.getSelectedItem());
		if (searchDay2Check.isSelected()    ) searchOptions.upperDate.day = dayTable[(searchDay2.getSelectedItem() + "")];
		if (searchHours2Check.isSelected()  ) searchOptions.upperDate.hours = parseInt(searchHours2.getSelectedItem());
		if (searchMinutes2Check.isSelected()) searchOptions.upperDate.minutes = parseInt(searchMinutes2.getSelectedItem());
		
		return searchOptions;
	};
	
	searchButton.addActionListener(new ActionListener({
		actionPerformed:
			function () {
				g.thread.submit(
					function () {
						
						g.cancel = false;
						searchButton.setEnabled(false);
						cancelButton.setEnabled(true);
						progress.setValue(0);
						
						var searchOptions = makeSearchOptions();
						var progressValue = 0;
						
						var matcher = resMatcher(searchOptions);
						
						
						var taskNo = 1;
						var taskCount = 0;
						if (searchModel.items.size() > 0)                taskCount += 1;
						if (searchSelectedThreadCheck.isSelected())      taskCount += 1;
						if (searchViewThreadCheck.isSelected())          taskCount += 1;
						if (searchSelectedThreadBoardCheck.isSelected()) taskCount += 1;
						if (searchViewThreadBoardCheck.isSelected())     taskCount += 1;
						
						/**********************************
						 * 板指定
						 **********************************/
						if (!g.cancel && searchModel.items.size() > 0) {
							progressLabel.setText(taskNo + " / " + taskCount);
							taskNo += 1;
							
							var items = searchModel.items;
							for (var size = items.size(), i = 0; i < size; i++) {
								if (g.cancel) break;
								var board = items.get(i).value;
								matcher.matchBoard(board, function (e) {
									progressValue = i / size + e.progressValue / size;
									progress.setValue(progressValue * 100);
									if (g.cancel) return false;
								});
							}
						}

						/**********************************
						 * 選択しているスレッドを含める
						 **********************************/
						if (!g.cancel && searchSelectedThreadCheck.isSelected()) {
							progressLabel.setText(taskNo + " / " + taskCount);
							taskNo += 1;
							
							var thread = v2c.resPane.selectedThread;
							matcher.matchThread(thread, function (e) {
								progressValue = e.progressValue;
								progress.setValue(progressValue * 100);
								if (g.cancel) return false;
							});
						}
						
						/**********************************
						 * 開いているスレッドを含める
						 **********************************/
						if (!g.cancel && searchViewThreadCheck.isSelected()) {
							progressLabel.setText(taskNo + " / " + taskCount);
							taskNo += 1;
							
							var threads = v2c.resPane.threads;
							for (var length = threads.length, i = 0; i < length; i++) {
								if (g.cancel) break;

								var thread = threads[i];
								matcher.matchThread(thread, function (e) {
									progressValue = i / length + e.progressValue / length;
									progress.setValue(progressValue * 100);
									if (g.cancel) return false;
								});
							}
						}
						
						
						/**********************************
						 * 選択しているスレッドが所属する板を含める
						 **********************************/
						if (!g.cancel && searchSelectedThreadBoardCheck.isSelected()) {
							progressLabel.setText(taskNo + " / " + taskCount);
							taskNo += 1;
							
							var board = v2c.resPane.selectedThread.board;
							matcher.matchBoard(board, function (e) {
								progressValue = e.progressValue;
								progress.setValue(progressValue * 100);
								if (g.cancel) return false;
							});
						}
						
						/**********************************
						 * 開いているスレッドが所属する板を含める
						 **********************************/
						if (!g.cancel && searchViewThreadBoardCheck.isSelected()) {
							progressLabel.setText(taskNo + " / " + taskCount);
							taskNo += 1;
							var memo = {};
							var threads = v2c.resPane.threads;
							for (var length = threads.length, i = 0; i < length; i++) {
								if (g.cancel) break;
								var thread = threads[i];
								var board = thread.board;
								
								if (!memo[board.url]) {
									memo[board.url] = true;
									
									matcher.matchBoard(board, function (e) {
										progressValue = i / length + e.progressValue / length;
										progress.setValue(progressValue * 100);
										if (g.cancel) return false;
									});
								}
							}
						}
						
						g.cancel = false;
						
						var resTitle = "抽出結果";
						var dat = matcher.build(getArgsString(), {
							replaceAnchor: replaceAnchorCheck.isSelected(),
							addOriginalResURL: addOriginalResURLCheck.isSelected(),
							outputGuide: outputGuideCheck.isSelected(),
							addCSVList: addCSVListCheck.isSelected(),
							callback: function (e) {
								progressLabel.setText("抽出結果構成中");
								progress.setValue(e.progressValue * 100);
								if (g.cancel) return false;
							}
						});
						
						var resCount = dat.split("\n").length;
						var unixtime = saveDat(APP_NAME, dat, resTitle, resCount);
						var lth = v2c.getThread("http://localboard/test/read.cgi/" + APP_NAME + "/" + unixtime + "/", resTitle, resCount);
						lth.open(false);
						
						progressLabel.setText("完了");
						searchButton.setEnabled(true);
						cancelButton.setEnabled(false);
					}
				);
			}
	}));

	cancelButton.addActionListener(new ActionListener({
		actionPerformed: function (e) {
			g.cancel = true;
		}
	}));

	return {
		refSearch                      : refSearch,
		boardsList                     : boardsList,
		searchList                     : searchList,
		boardsModel                    : boardsModel,
		searchModel                    : searchModel,
		boardsListScroll               : boardsListScroll,
		searchListScroll               : searchListScroll,
		toRightButton                  : toRightButton,
		toLeftButton                   : toLeftButton,
		searchButton                   : searchButton,
		cancelButton                   : cancelButton,
		searchTitle                    : searchTitle,
		searchName                     : searchName,
		searchMail                     : searchMail,
		searchID                       : searchID,
		searchBeID                     : searchBeID,
		searchMessage                  : searchMessage,
		searchLabel                    : searchLabel,
		searchTitleCheck               : searchTitleCheck,
		searchNameCheck                : searchNameCheck,
		searchMailCheck                : searchMailCheck,
		searchIDCheck                  : searchIDCheck,
		searchBeIDCheck                : searchBeIDCheck,
		searchMessageCheck             : searchMessageCheck,
		searchLabelCheck               : searchLabelCheck,
		searchYear1                    : searchYear1,
		searchYear1Check               : searchYear1Check,
		searchMonth1                   : searchMonth1,
		searchMonth1Check              : searchMonth1Check,
		searchDate1                    : searchDate1,
		searchDate1Check               : searchDate1Check,
		searchDay1                     : searchDay1,
		searchDay1Check                : searchDay1Check,
		searchHours1                   : searchHours1,
		searchHours1Check              : searchHours1Check,
		searchMinutes1                 : searchMinutes1,
		searchMinutes1Check            : searchMinutes1Check,
		searchYear2                    : searchYear2,
		searchYear2Check               : searchYear2Check,
		searchMonth2                   : searchMonth2,
		searchMonth2Check              : searchMonth2Check,
		searchDate2                    : searchDate2,
		searchDate2Check               : searchDate2Check,
		searchDay2                     : searchDay2,
		searchDay2Check                : searchDay2Check,
		searchHours2                   : searchHours2,
		searchHours2Check              : searchHours2Check,
		searchMinutes2                 : searchMinutes2,
		searchMinutes2Check            : searchMinutes2Check,
		searchNumber1                  : searchNumber1,
		searchNumber1Check             : searchNumber1Check,
		searchNumber2                  : searchNumber2,
		searchNumber2Check             : searchNumber2Check,
		searchRefcount1                : searchRefcount1,
		searchRefcount1Check           : searchRefcount1Check,
		searchRefcount2                : searchRefcount2,
		searchRefcount2Check           : searchRefcount2Check,
		searchSelectedThreadCheck      : searchSelectedThreadCheck,
		searchSelectedBoardCheck       : searchSelectedBoardCheck,
		searchViewThreadCheck          : searchViewThreadCheck,
		searchViewBoardCheck           : searchViewBoardCheck,
		searchViewThreadBoardCheck     : searchViewThreadBoardCheck,
		searchSelectedThreadBoardCheck : searchSelectedThreadBoardCheck,
		progress                       : progress,
		progressLabel                  : progressLabel,
		replaceAnchorCheck             : replaceAnchorCheck,
		addOriginalResURLCheck         : addOriginalResURLCheck,
		outputGuideCheck               : outputGuideCheck,
		addCSVListCheck                : addCSVListCheck,
	};
}());



window.add({
	component:
		(function () {
			var panel = new JPanel();
			panel.setLayout(new BoxLayout(panel, BoxLayout.PAGE_AXIS));
			
			var gbp = createGridBagPanel();
			
			gbp.add({
				component:
					new JLabel("フィルタ"),
				options:
				{
					gridx: 0,
					gridy: 0
				}
			});
			gbp.add({
				component:
					components.refSearch,
				options:
				{
					gridx: 1,
					gridy: 0,
					weightx: 1,
					insets: new Insets(0, 5, 0, 0),
					fill: GridBagConstraints.BOTH
				}
			});
			gbp.add({
				component:
					components.boardsListScroll,
				options:
				{
					gridx: 0,
					gridy: 1,
					weightx: 1,
					weighty: 1,
					gridwidth: 2,
					insets: new Insets(10, 0, 0, 0),
					fill: GridBagConstraints.BOTH
				}
			});

			var panel1 = gbp.getPanel();
			panel1.setBorder(BorderFactory.createTitledBorder("板一覧"));
			
			var panel2 = new JPanel();
			panel2.setLayout(new BoxLayout(panel2, BoxLayout.LINE_AXIS));
			panel2.add(components.toRightButton);
			panel2.add(components.toLeftButton);
			
			var panel3 = new JPanel();
			panel3.setLayout(new BoxLayout(panel3, BoxLayout.PAGE_AXIS));
			panel3.add(components.searchListScroll);
			panel3.setBorder(BorderFactory.createTitledBorder("検索対象"));
			
			panel.add(panel1);
			panel.add(panel2);
			panel.add(panel3);
			panel.setBorder(BorderFactory.createTitledBorder("板指定"));

			return panel;
		}()),
	options:
	{
		gridx: 0,
		gridy: 0,
		weightx: 0.5,
		weighty: 1,
		gridheight: 4,
		insets: new Insets(10, 10, 10, 10),
		fill: GridBagConstraints.BOTH
	}
});

window.add({
	component:
		(function () {
			var gbp = createGridBagPanel();
			var panel = gbp.getPanel();
			var set = function (component, x, y) {
				gbp.add({
					component: component,
					options:
					{
						gridx: x,
						gridy: y,
						fill: GridBagConstraints.BOTH
					}
				});
			};
			
			set(components.searchSelectedThreadCheck, 0, 0);
			set(components.searchSelectedThreadBoardCheck, 0, 1);
			
			set(components.searchViewThreadCheck, 1, 0);
			set(components.searchViewThreadBoardCheck, 1, 1);

			// set(components.searchSelectedBoardCheck, 2, 0);
			// set(components.searchViewBoardCheck, 2, 1);
			
			panel.setBorder(BorderFactory.createTitledBorder("その他指定"));

			return panel;
		}()),
	options:
	{
		gridx: 1,
		gridy: 0,
		weightx: 0.5,
		insets: new Insets(10, 10, 3, 10),
		fill: GridBagConstraints.BOTH
	}
});

window.add({
	component:
		(function () {
			var gbp = createGridBagPanel();
			var i = 0;
			var set = function (name, index) {
				gbp.add({
					component: components[name + "Check"],
					options:
					{
						gridx: 0,
						gridy: index,
						anchor: GridBagConstraints.WEST
					}
				});
				gbp.add({
					component: components[name],
					options:
					{
						gridx: 1,
						gridy: index,
						weightx: 1,
						insets: new Insets(0, 0, 5, 0),
						fill: GridBagConstraints.BOTH
					}
				});
			}
			
			set("searchTitle", i++);
			set("searchName", i++);
			set("searchMail", i++);
			set("searchID", i++);
			set("searchBeID", i++);
			set("searchMessage", i++);
			set("searchLabel", i++);
			
			
			gbp.add({
				component:
					(function () {
						
						var panel = new JPanel();
						panel.setLayout(new BoxLayout(panel, BoxLayout.LINE_AXIS));
						
						var panel1 = new JPanel();
						panel1.setLayout(new BoxLayout(panel1, BoxLayout.LINE_AXIS));
						panel1.add(components.searchNumber1Check);
						panel1.add(components.searchNumber1);
						panel1.add(components.searchNumber2Check);
						panel1.add(components.searchNumber2);
						panel1.setBorder(BorderFactory.createTitledBorder("レス番号"));
						
						var panel2 = new JPanel();
						panel2.setLayout(new BoxLayout(panel2, BoxLayout.LINE_AXIS));
						panel2.add(components.searchRefcount1Check);
						panel2.add(components.searchRefcount1);
						panel2.add(components.searchRefcount2Check);
						panel2.add(components.searchRefcount2);
						panel2.setBorder(BorderFactory.createTitledBorder("被参照数"));
						
						panel.add(panel1);
						panel.add(panel2);
						
						return panel;
					}()),
				options:
				{
					gridx: 0,
					gridy: i++,
					gridwidth: 2,
					fill: GridBagConstraints.BOTH
				}
			});
			
			gbp.add({
				component:
					(function () {
						var panel = new JPanel();
						panel.setLayout(new BoxLayout(panel, BoxLayout.LINE_AXIS));
						panel.add(components.searchYear1Check);
						panel.add(components.searchYear1);
						panel.add(components.searchMonth1Check);
						panel.add(components.searchMonth1);
						panel.add(components.searchDate1Check);
						panel.add(components.searchDate1);
						panel.add(components.searchDay1Check);
						panel.add(components.searchDay1);
						panel.add(components.searchHours1Check);
						panel.add(components.searchHours1);
						panel.add(components.searchMinutes1Check);
						panel.add(components.searchMinutes1);
						panel.setBorder(BorderFactory.createTitledBorder("投稿時刻 下限"));
						return panel;
					}()),
				options:
				{
					gridx: 0,
					gridy: i++,
					gridwidth: 2,
					fill: GridBagConstraints.BOTH
				}
			});
			
			gbp.add({
				component:
					(function () {
						var panel = new JPanel();
						panel.setLayout(new BoxLayout(panel, BoxLayout.LINE_AXIS));
						panel.add(components.searchYear2Check);
						panel.add(components.searchYear2);
						panel.add(components.searchMonth2Check);
						panel.add(components.searchMonth2);
						panel.add(components.searchDate2Check);
						panel.add(components.searchDate2);
						panel.add(components.searchDay2Check);
						panel.add(components.searchDay2);
						panel.add(components.searchDay2Check);
						panel.add(components.searchDay2);
						panel.add(components.searchHours2Check);
						panel.add(components.searchHours2);
						panel.add(components.searchMinutes2Check);
						panel.add(components.searchMinutes2);
						panel.setBorder(BorderFactory.createTitledBorder("投稿時刻 上限"));
						return panel;
					}()),
				options:
				{
					gridx: 0,
					gridy: i++,
					gridwidth: 2,
					fill: GridBagConstraints.BOTH
				}
			});

			var panel = gbp.getPanel();
			panel.setBorder(BorderFactory.createTitledBorder("検索条件"));
			
			return panel;
		}()),
	options:
	{
		gridx: 1,
		gridy:1,
		weightx: 0.5,
		insets: new Insets(3, 10, 3, 10),
		fill: GridBagConstraints.HORIZONTAL
	}
});


window.add({
	component:
		(function () {
			var gbp = createGridBagPanel();
			var panel = gbp.getPanel();
			var set = function (component, x, y) {
				gbp.add({
					component: component,
					options:
					{
						gridx: x,
						gridy: y,
						fill: GridBagConstraints.BOTH
					}
				});
			};
			
			set(components.replaceAnchorCheck, 0, 0);
			set(components.addOriginalResURLCheck, 1, 0);
			set(components.outputGuideCheck, 0, 1);
			set(components.addCSVListCheck, 1, 1);
			

			panel.setBorder(BorderFactory.createTitledBorder("オプション"));

			return panel;
		}()),
	options:
	{
		gridx: 1,
		gridy: 2,
		weightx: 1,
		insets: new Insets(0, 10, 3, 10),
		fill: GridBagConstraints.BOTH
	}
});

window.add({
	component:
		(function () {
			var gbp = createGridBagPanel();
			var panel = gbp.getPanel();
			
			var panel1 = new JPanel(new GridLayout(2,1));
			
			panel1.add(components.progressLabel);
			panel1.add(components.progress);
			
			var panel2 = new JPanel();
			panel2.setLayout(new BoxLayout(panel2, BoxLayout.LINE_AXIS));
			panel2.add(components.searchButton);
			panel2.add(components.cancelButton);
			
			gbp.add({
				component: panel1,
				options:
				{
					gridx: 0,
					gridy: 0,
					weightx: 1000,
					insets: new Insets(5, 5, 5, 5),
					fill: GridBagConstraints.HORIZONTAL
				}
			});
			gbp.add({
				component: panel2,
				options:
				{
					gridx: 0,
					gridy: 1
				}
			});
			panel.setBorder(BorderFactory.createTitledBorder("実行"));
			return panel;
		}()),
	options:
	{
		gridx: 1,
		gridy: 3,
		weightx: 1,
		insets: new Insets(0, 10, 10, 10),
		fill: GridBagConstraints.HORIZONTAL
	}
});






function setDefaultValues() {
	
	var setComboBox = function (componentName, compValue) {
		var combobox = components[componentName];
		var check = components[componentName + "Check"];
		for (var i = 0; i < combobox.getItemCount(); i++) {
			var value = combobox.getItemAt(i);
			if (compValue + "" === value + "") {
				check.setSelected(true);
				combobox.setSelectedIndex(i);
				break;
			}
		}
	}
	
	var h = {};
	var boardList = g.defaultValues.blist;
	for (var i = 0; i < boardList.length; i++) {
		h[boardList[i]] = true;
	}

	for (var i = components.boardsModel.items.size() - 1; i >= 0; i--) {
		var modelItem = components.boardsModel.items.get(i);
		var url = modelItem.value.url;
		if (h[url]) {
			components.boardsModel.remove(modelItem);
			components.searchModel.add(modelItem);
		}
	}

	components.searchSelectedThreadCheck.setSelected(g.defaultValues.set1);
	components.searchViewThreadCheck.setSelected(g.defaultValues.set2);
	components.searchSelectedThreadBoardCheck.setSelected(g.defaultValues.set3);
	components.searchViewThreadBoardCheck.setSelected(g.defaultValues.set4);
	components.replaceAnchorCheck.setSelected(g.defaultValues.repanc);
	components.addOriginalResURLCheck.setSelected(g.defaultValues.addourl);
	components.outputGuideCheck.setSelected(g.defaultValues.opguide);
	components.addCSVListCheck.setSelected(g.defaultValues.addcsv);
	

	if (g.defaultValues.title !== null) {
		components.searchTitleCheck.setSelected(true);
		components.searchTitle.setText(g.defaultValues.title);
	}
	if (g.defaultValues.name !== null) {
		components.searchNameCheck.setSelected(true);
		components.searchName.setText(g.defaultValues.name);
	}
	if (g.defaultValues.mail !== null) {
		components.searchMailCheck.setSelected(true);
		components.searchMail.setText(g.defaultValues.mail);
	}
	if (g.defaultValues.id !== null) {
		components.searchIDCheck.setSelected(true);
		components.searchID.setText(g.defaultValues.id);
	}
	if (g.defaultValues.be !== null) {
		components.searchBeIDCheck.setSelected(true);
		components.searchBeID.setText(g.defaultValues.be);
	}
	if (g.defaultValues.message !== null) {
		components.searchMessageCheck.setSelected(true);
		components.searchMessage.setText(g.defaultValues.message);
	}
	if (g.defaultValues.label !== null) {
		setComboBox("searchLabel", g.defaultValues.label);
	}
	if (g.defaultValues.lnum !== null) {
		components.searchNumber1Check.setSelected(true);
		components.searchNumber1.setValue(parseInt(g.defaultValues.lnum));
	}
	if (g.defaultValues.unum !== null) {
		components.searchNumber2Check.setSelected(true);
		components.searchNumber2.setValue(parseInt(g.defaultValues.unum));
	}
	if (g.defaultValues.lanc !== null) {
		components.searchRefcount1Check.setSelected(true);
		components.searchRefcount1.setValue(parseInt(g.defaultValues.lanc));
	}
	if (g.defaultValues.uanc !== null) {
		components.searchRefcount2Check.setSelected(true);
		components.searchRefcount2.setValue(parseInt(g.defaultValues.uanc));
	}
	if (g.defaultValues.lyear  !== null) setComboBox("searchYear1"    , g.defaultValues.lyear);
	if (g.defaultValues.uyear  !== null) setComboBox("searchYear2"    , g.defaultValues.uyear);
	if (g.defaultValues.lmonth !== null) setComboBox("searchMonth1"   , g.defaultValues.lmonth);
	if (g.defaultValues.umonth !== null) setComboBox("searchMonth2"   , g.defaultValues.umonth);
	if (g.defaultValues.ldate  !== null) setComboBox("searchDate1"    , g.defaultValues.ldate);
	if (g.defaultValues.udate  !== null) setComboBox("searchDate2"    , g.defaultValues.udate);
	if (g.defaultValues.lday   !== null) setComboBox("searchDay1"     , g.defaultValues.lday);
	if (g.defaultValues.uday   !== null) setComboBox("searchDay2"     , g.defaultValues.uday);
	if (g.defaultValues.lhours !== null) setComboBox("searchHours1"   , g.defaultValues.lhours);
	if (g.defaultValues.uhours !== null) setComboBox("searchHours2"   , g.defaultValues.uhours);
	if (g.defaultValues.lmin   !== null) setComboBox("searchMinutes1" , g.defaultValues.lmin);
	if (g.defaultValues.umin   !== null) setComboBox("searchMinutes2" , g.defaultValues.umin);
}

function getArgsString() {
	var args = "${SCRIPT:FrwT} " + APP_NAME + ".js args={";
	
	var blist = [];
	for (var i = components.searchModel.items.size() - 1; i >= 0; i--) {
		var modelItem = components.searchModel.items.get(i);
		blist.push('"' + modelItem.value.url + '"');
	}
	
	if (blist.toString() != "") args += "blist:[" + blist.toString() + "],";
	
	if (components.searchSelectedThreadCheck.isSelected())      args += "set1:true,";
	if (components.searchViewThreadCheck.isSelected())          args += "set2:true,";
	if (components.searchSelectedThreadBoardCheck.isSelected()) args += "set3:true,";
	if (components.searchViewThreadBoardCheck.isSelected())     args += "set4:true,";
	if (components.replaceAnchorCheck.isSelected())             args += "repanc:true,";
	if (components.addOriginalResURLCheck.isSelected())         args += "addourl:true,";
	if (components.outputGuideCheck.isSelected())               args += "opguide:true,";
	if (components.addCSVListCheck.isSelected())                args += "addcsv:true,";
		
	if (components.searchTitleCheck.isSelected()  ) args += "title:\""   + components.searchTitle.getText()         + "\",";
	if (components.searchNameCheck.isSelected()   ) args += "name:\""    + components.searchName.getText()          + "\",";
	if (components.searchMailCheck.isSelected()   ) args += "mail:\""    + components.searchMail.getText()          + "\",";
	if (components.searchIDCheck.isSelected()     ) args += "id:\""      + components.searchID.getText()            + "\",";
	if (components.searchBeIDCheck.isSelected()   ) args += "be:\""      + components.searchBeID.getText()          + "\",";
	if (components.searchMessageCheck.isSelected()) args += "message:\"" + components.searchMessage.getText()       + "\",";
	if (components.searchLabelCheck.isSelected()  ) args += "label:\""   + components.searchLabel.getSelectedItem() + "\",";
	
	if (components.searchNumber1Check.isSelected()  ) args += "lnum:"    + ~~components.searchNumber1.getValue()   + ",";
	if (components.searchNumber2Check.isSelected()  ) args += "unum:"    + ~~components.searchNumber2.getValue()   + ",";
	if (components.searchRefcount1Check.isSelected()) args += "lanc:"    + ~~components.searchRefcount1.getValue() + ",";
	if (components.searchRefcount2Check.isSelected()) args += "uanc:"    + ~~components.searchRefcount2.getValue() + ",";
	
	if (components.searchYear1Check.isSelected()   ) args += "lyear:"  + components.searchYear1.getSelectedItem()    + ",";
	if (components.searchMonth1Check.isSelected()  ) args += "lmonth:" + components.searchMonth1.getSelectedItem()   + ",";
	if (components.searchDate1Check.isSelected()   ) args += "ldate:"  + components.searchDate1.getSelectedItem()    + ",";
	if (components.searchDay1Check.isSelected()    ) args += "lday:\"" + components.searchDay1.getSelectedItem()     + "\",";
	if (components.searchHours1Check.isSelected()  ) args += "lhours:" + components.searchHours1.getSelectedItem()   + ",";
	if (components.searchMinutes1Check.isSelected()) args += "lmin:"   + components.searchMinutes1.getSelectedItem() + ",";

	if (components.searchYear2Check.isSelected()   ) args += "uyear:"  + components.searchYear2.getSelectedItem()    + ",";
	if (components.searchMonth2Check.isSelected()  ) args += "umonth:" + components.searchMonth2.getSelectedItem()   + ",";
	if (components.searchDate2Check.isSelected()   ) args += "udate:"  + components.searchDate2.getSelectedItem()    + ",";
	if (components.searchDay2Check.isSelected()    ) args += "uday:\"" + components.searchDay2.getSelectedItem()     + "\",";
	if (components.searchHours2Check.isSelected()  ) args += "uhours:" + components.searchHours2.getSelectedItem()   + ",";
	if (components.searchMinutes2Check.isSelected()) args += "umin:"   + components.searchMinutes2.getSelectedItem() + ",";
	
	args = args.replace(/,$/, "}");
	
	return args;
}

window.show();
components.searchModel.clear();
setDefaultValues();
