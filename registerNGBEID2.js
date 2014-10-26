//【登録場所】レス表示
//【更新日時】2014/07/26 BeIDのコピーコマンドの追加
//            2014/06/15 バグ修正
//            2014/06/13 BEの仕様変更に対応(bbspinkの追加)
//            2014/06/07 初版 (6/8追記 バグ修正)
//【内容】 BE2.0に対応したNGBEID機能
//【使い方】以下のコマンドを設定後、BEプロフ付きのレス上で右クリ→設定したコマンドをクリック
//【注意事項】
//            ・別途本スクリプトに対応したrescheck.jsとsubject.js、threadld.jsが必要です。
//            ・NGスレ登録後履歴から再度そのスレを表示した場合はV2Cメモリキャッシュに残ってるだけなのでNG関連が機能しません。再取得すれば反映されます
//            ・本スクリプトで指定できるハイライト($HILIGHT)とはレス番号右クリ→ラベルから設定できるレスラベルのことを指します
//              V2Cの本来の機能のハイライト(BE番号部分を着色)はできません。ハイライト名にはレスラベル名を入力して下さい。
//              また、レスラベルは即時反映されません。スレ更新操作後に反映されます。
//            ・設定したNGの一覧は(GUI作るのが面倒ry)表示できません
//              以下の記述例の[NGファイルを開く]のコマンドでテキストエディターで開いて削除したいNGの行を１行削除して下さい
//【ラベル】NG登録
//【コマンド】${SCRIPT:FS} registerNGBEID2.js $ADD $RES $LABEL
//
// ▼コマンドの記述方法
// ${SCRIPT:FS} registerNGBEID2.js 引数１ 引数２ 引数３ ... (▼引数一覧にある引数を半角スペースを空けて連続して書く。)
//
// ▼コマンドの記述例 ※ []内の文字はラベルです
//         [NG登録] ${SCRIPT:FS} registerNGBEID2.js $ADD $RES $LABEL
//     [NGスレ登録] ${SCRIPT:FS} registerNGBEID2.js $ADD $TH $LABEL
//     [NG完全登録] ${SCRIPT:FS} registerNGBEID2.js $ADD $RES $TH $LABEL
//   [NG登録(粘着)] ${SCRIPT:FS} registerNGBEID2.js $ADD $RES $LABEL(粘着)
//     [透明NG登録] ${SCRIPT:FS} registerNGBEID2.js $ADD $RES $LABEL $TRANS
// [透明NGスレ登録] ${SCRIPT:FS} registerNGBEID2.js $ADD $TH $LABEL $TRANS
// [透明NG完全登録] ${SCRIPT:FS} registerNGBEID2.js $ADD $RES $TH $LABEL $TRANS
// [BeIDレスの強調] ${SCRIPT:FS} registerNGBEID2.js $ADD $HILIGHT(デフォルト)
// [登録状況の確認] ${SCRIPT:FS} registerNGBEID2.js $VIEW
//   [NG登録の削除] ${SCRIPT:FS} registerNGBEID2.js $REMOVE
//   [BeIDをコピー] ${SCRIPT:FS} registerNGBEID2.js $COPY
//
// [NGファイルを開く] ${SCRIPT:FS} registerNGBEID2.js $TEXTEDIT(C:\Windows\System32\notepad.exe)
// ↑登録場所：全体でも可 ※あくまでも例なので。勝手に文字コード変えて保存する可能性のあるメモ帳(notepad.exe)の使用は推奨しません
//
// ▼引数一覧 
// $ADD       = 非表示リストに指定したレスのNGBEIDを追加します
// $REMOVE    = 非表示リストから指定したレスのNGBEIDを削除します
// $VIEW      = 指定したレスのNGBEIDの非表示設定を表示します
// $COPY      = BeIDをクリップボードにコピーします
// $TEXTEDIT(テキストエディタの絶対パス)  = NGBEIDリストファイルをテキストエディタで開きます
// $RES       = ($ADDとの組合せ)このBeが付いたレスを非表示にします。 
// $TH        = ($ADDとの組合せ)スレッドを取得した時最初にレスにこのBeが付いている場合、スレッド一覧で非表示にします
// $TRANS     = ($ADDとの組合せ)透明非表示に設定します
// $LABEL(名前) = ($ADDとの組合せ)ラベルを設定します (空文字の場合BeID番号が入る)
// $LABEL     = ($ADDとの組合せ)登録時に入力してラベルを設定します (無指定の場合BeID番号が入る)
// $HILIGHT(ハイライト名) = ($ADDとの組合せ)ハイライトを設定します
// $HILIGHT   = ($ADDとの組合せ)登録時にハイライトを選択して設定します
// $WEIGHT(値)    = ($ADDとの組合せ)ウェイト値 省略した場合はウェイト0
//
//【スクリプト】
// ----- 次の行から -----

function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

// NGBEIDリストの入出力 [フォーマット] HTht:Ixxxxxxxxx	Lxxxx	Nxxxx
var beIdList = {
	ngfile : new java.io.File(v2c.saveDir + '/script/scdata/scriptNGBEID.txt'),
	nglist : [],
	template : function() {
		return { number : -1, transparent : false, thread: false, res : false, label : null, hilight : null, weight : 0 };
	},
	restore : function() {
		var tmp = String(v2c.readStringFromFile(this.ngfile, 'UTF-8') || '');
		tmp = tmp.split(/\r\n|\r|\n/);
		if (!tmp[tmp.length - 1]) {
			tmp.pop();
		}
		this.nglist = tmp;
	},
	getList : function() {
		if (this.nglist.length == 0) { this.restore(); }
		return this.nglist;
	},
	register : function(num, res, th, trans /*, label, hilight , weight */) {
		var label = (arguments.length > 4 && arguments[4]) ? arguments[4] : num;
		var hilight = (arguments.length > 5 && arguments[5]) ? arguments[5] : '';
		var weight = (arguments.length > 6 && arguments[6]) ? arguments[6] : 0;
		var line = (res)  ? 'H' : '';
		line += (trans)   ? 'T' : '';
		line += (hilight) ? 'h' : '';
		line += (th)      ? 't' : '';
		line += ':I' + num;
		line += '\tL' + label;
		line += (hilight) ? '\tN' + hilight : '';
		line += (weight) ? '\tw' + weight : '';
		var list = this.getList();
		var idx = list.length;
		for (var i = 0; i < idx; i++) {
			if (list[i].indexOf(':I' + num) >= 0) { idx = i; break; }
		}
		list[idx] = line;
		v2c.writeLinesToFile(this.ngfile, list, 'UTF-8');
		//忘備録: (un)register後にrestoreする必要があるがどのスクリプトから呼び出される時もファイルから読み込み直すので(un)register直後に取得する必要があるとき以外不要
		//そうなるとputPropertyを使いたいがテキストファイルを直接書き換えたりするので毎回ファイルから直接読み込む方がいい
	},
	unregister : function(num) {
		var list = this.getList();
		for (var i = 0; i < list.length; i++) {
			if (list[i].indexOf(':I' + num) >= 0) {
				list.splice(i, 1);
				v2c.writeLinesToFile(this.ngfile, list, 'UTF-8');
				return;
			}
		}
	},
	getMaxWeight : function() {
		var list = this.getList();
		var weight = 0;
		for (var i = 0; i < list.length; i++) {
			if (/\tw([0-9\-]+)/.test(list[i])) { weight = parseInt(RegExp.$1); }
		}
		return weight;
	},
	getBeList : function() {
		var list = this.getList();
		var ret = [];
		for (var i = 0; i < list.length; i++) {
			ret.push(list[i].split('\t')[0].split(':I')[1]);
		}
		return ret;
	},
	getNgThreadBeList : function() {
		var list = this.getList();
		var ret = [];
		for (var i = 0; i < list.length; i++) {
			var tmp = list[i].split('\t')[0].split(':I');
			if (tmp[0].indexOf('t') >= 0) {
				ret.push(tmp[1]);
			}
		}
		return ret;
	},
	getItem : function(num) {
		var list = this.getList();
		if (list.length == 0) { return null; }
		for (var i = 0; i < list.length; i++) {
			if (list[i].indexOf(':I' + num) >= 0) {
				var ret = this.template();
				var chArr = String(list[i]).split('');
				
				for (var j = 0; j < chArr.length; j++) {
					var tmp = '';
					switch (chArr[j]) {
						case 'H' : ret.res = true; break;
						case 'T' : ret.transparent = true; break;
						case 't' : ret.thread = true; break;
						case 'w' :
							while (++j < chArr.length && '0123456789-'.indexOf(chArr[j]) >= 0) { tmp += chArr[j]; }
							res.weight = parseInt(tmp);
							break;
						case 'I' : 
							while (++j < chArr.length && chArr[j] != '\t') { tmp += chArr[j]; }
							j--;
							if (tmp.length > 0) { ret.number = parseInt(tmp); }
							break;
						case 'L' :
							while (++j < chArr.length && chArr[j] != '\t') {
								tmp += chArr[j];
							}
							ret.label = tmp;
							tmp = '';
							break;
						case 'N' :
							while (++j < chArr.length && chArr[j] != '\t') {
								tmp += chArr[j];
							}
							ret.hilight = tmp;
							break;
						default: break;
					}
				}
				return ret;
			}
		}
		return null;
	}
};

(function() {
	// systemスクリプトにbeIdListを渡す
	var cx = v2c.context;
	if (!cx) {
		return beIdList;
	}

	// コマンドの解析
	var CMD = {
		REG : true, VIEW : false, COPY : false,
		RES : false, TH : false, TRANS : false, 
		LABEL : null, HILIGHT : null, DEBUG : false, TEXTEDIT : ''
	};
	if (v2c.context.args.length > 0) {
		var tmp = String(v2c.context.argLine);
		var matches = [];
		CMD.REG = (/\$REMOVE/i.test(tmp)) ? false : CMD.REG;
		CMD.REG = (/\$ADD/i.test(tmp)) ? true : CMD.REG;
		CMD.VIEW = /\$VIEW/i.test(tmp);
		CMD.COPY = /\$COPY/i.test(tmp);
		CMD.RES = /\$RES/i.test(tmp);
		CMD.TH  = /\$TH/i.test(tmp);
		CMD.TRANS = /\$TRANS/i.test(tmp);
		CMD.DEBUG = /\$DEBUG/i.test(tmp);
		if (matches = /\LABEL\((.*?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { throw '[registerNGBEID2.js] ラベル名が入力されていません'; }
			CMD.LABEL = matches[1];
		} else {
			CMD.LABEL = (/\$LABEL/i.test(tmp)) ? v2c.prompt('BeID: ' + beID + ' のラベル:', beID) : null;
		}
		if (matches = /\HILIGHT\((.*?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { throw '[registerNGBEID2.js] ハイライト名が入力されていません'; }
			CMD.HILIGHT = matches[1];
		} else {
			CMD.HILIGHT = (/\$HILIGHT/i.test(tmp)) ? v2c.prompt('BeID: ' + beID + ' のハイライト:', '') : null;
		}
		if (matches = /\TEXTEDIT\((.*?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { throw '[registerNGBEID2.js] テキストエディタのパスが入力されていません'; }
			CMD.TEXTEDIT = matches[1];
		}
		if (matches = /\WEIGHT\(([0-9\-]+?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { throw '[registerNGBEID2.js] ウェイト値が入力されていません'; }
			CMD.WEIGHT = matches[1];
		} else {
			CMD.WEIGHT = 0;
		}
	}
	if (CMD.DEBUG) { v2c.print('コマンド # '); for (var it in CMD) { v2c.print('[' + it + ':' + CMD[it] + '] , '); } v2c.print('\n'); }

	// テキストエディタでリストファイルを開く
	if (CMD.TEXTEDIT) {
		var path = beIdList.ngfile.getAbsolutePath();
		v2c.exec([CMD.TEXTEDIT, path]);
		return;
	}
	
	
	// Beの取得
	var beID = (/ BE:(\d+)/.test(cx.res.source)) ? RegExp.$1 : null;
	if (!beID) { return; }

	// BeIDをクリップボードにコピーする
	if (CMD.COPY) {
		v2c.context.setClipboardText(beID);
		return;
	}
	
	// デバッグ用コマンド
	if (CMD.DEBUG) { v2c.print('登録済み？ # '); var li = beIdList.getItem(beID); for (var it in li) { v2c.print('[' + it + ':' + li[it] + '] , '); } v2c.print('\n'); }

	
	// beNgListの再取得
	beIdList.restore();

	if (CMD.VIEW) {
		//リストを表示
		var putProp = function(name, value) {
			if (is('Boolean', value)) {
				value = (value) ? '有効' : '';
			} else if (!value) {
				value = '';
			}
			return '<tr><td align="right" style="background-color:#FFCC33;"><b>' + name + '</b></td><td>' + value + '</td></tr>\n';
		};
		var item = beIdList.getItem(beID);
		var s = '';
		if (item) {
			s = putProp('レス番号', cx.res.number) + putProp('BeID', item.number) + putProp('レス', item.res)
			  + putProp('スレ', item.thread) + putProp('透明', item.transparent)
			  + putProp('ラベル', item.label)+ putProp('ハイライト', item.hilight)
			  + putProp('ウェイト', item.weight.toString());
			s = '<html><body><table>' + s + '</table></body></html>';
		} else {
			s = '<html><body height="40" style="background-color:#FFCC33;"><p align="center">BeID: <b>' + beID + '</b> は未登録です。</p></body><html>';
		}
		cx.setPopupHTML(s);
	} else {
		if (CMD.REG) {
			// リストに登録
			beIdList.register(beID, CMD.RES, CMD.TH, CMD.TRANS, CMD.LABEL, CMD.HILIGHT, CMD.WEIGHT);
			var th = cx.thread;
			if (CMD.RES) {
				// 2ch,bbspink以外の板を除外して非表示のチェック
				var rp = v2c.resPane;
				var thArr = rp.threads;
				for (var i = 0; i < thArr.length; i++) {
					if (thArr[i].bbs.is2ch) {
						rp.checkNG(thArr[i]);
					}
				}
			}
			if (CMD.TH) { v2c.openURL(cx.thread.board.url); cx.thread.close(); }
		} else {
			//リストから削除する
			beIdList.unregister(beID);
			// 2ch,bbspink以外の板を除外して非表示の再チェック
			var rp = v2c.resPane;
			var thArr = rp.threads;
			for (var i = 0; i < thArr.length; i++) {
				if (thArr[i].bbs.is2ch) {
					rp.checkNG(thArr[i]);
				}
			}
		}
	}
})();
