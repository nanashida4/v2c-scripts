//【概要】本スクリプトはmenu.jsの分割ファイルになります。外部コマンドには使用しないで下さい。
// *--------------------------------------------------------------------------------------------------*
// * tablemaker_menu.js : tablemaker.jsの設定を右クリックメニューから出来るようにする                 *
// *  Author: ◆IJa6whaByU                                                                            *
// *    Date: 2013/01/31                                                                              *
// * Version: 1.00 (this is βversion)                                                                *
// * License: JaneView License                                                                        *
// * !!■注意■!! このスクリプトはV2C専用です。尚且つ外部コマンドからは呼び出せない特殊用途です。     *
// *              scriptフォルダにtablemaker.jsがあることが前提のスクリプトです。                     *
// *              また、systemスクリプトのmenu.jsも同封のmenu.jsに置き換えて下さい。                  *
// *              もしあなたが開発者でmenu.jsに自分のスクリプトメニュー追加したい場合は               *
// *              是非使って下さいSystemスクリプト上ではv2c.contextを使えないので注意                 *
// *              v2c.resPaneで表示中のスレッドだけはなんとか取得出来る                               *
// *--------------------------------------------------------------------------------------------------*
(function() {

var __vstmmenud__ = null;
var DEBUG = callTableMaker().DEBUG;
if (!DEBUG) {
	__vstmmenud__ = v2c.getProperty('__V2C_SCRIPT_TABLE_MAKER_MENU_DYNAMIC__');
	if (__vstmmenud__) { return __vstmmenud__; }
}

var SwingGui = JavaImporter(Packages.javax.swing,
                            java.lang.Short,
                            java.awt,
                            java.awt.event
);

// ■JMenuItemをrootのメニューの一番下に追加する
// root : JPopupMenu、JMenu
//      追加するメニュー階層
// menuName : string
//      作成するメニューアイテムの項目名
// action : Object、function
//      メニューアイテムがクリックされたときに実行するActionListenerインターフェースの実装オブジェクト
//      actionPerformed(ActionEvent e)は単一のメソッドなのでfunction(e) { }の形で記述可能
// return : 追加したJMenuItem
function addMenuItem(root, menuName, action) {
	var o = new SwingGui.JMenuItem(menuName);
	if (typeof action == 'function') {
		o.addActionListener(action);
	} else {
		o.addActionListener(new SwingGui.ActionListener(action));
	}
	return root.add(o);
}

// ■JPopupBoxMenuItemをrootのメニューの一番下に追加する
// root : JPopupMenu、JMenu
//      追加するメニュー階層
// menuName : string
//      作成するメニューアイテムの項目名
// initValue : boolean
//      メニュー生成直後の初期値。tureならチェックされた状態で表示する
// action : Object、function
//      メニューアイテムがクリックされたときに実行するChangeListenerインターフェースの実装オブジェクト
//      stateChanged(ChangeEvent e)は単一のメソッドなのでfunction(e) { }の形で記述可能
//      チェック状態をチェックする場合はe.source.isSelected()で確認できる。
//      チェック状態を変更するする場合はe.source.setSelected(true)で。
// return : 追加したJPopupBoxMenuItem
function addCheckBoxMenuItem(root, menuName, initValue, action) {
	var o = new SwingGui.JCheckBoxMenuItem(menuName, initValue);
	if (typeof action == 'function') {
		o.addChangeListener(action);
	} else {
		o.addChangeListener(new SwingGui.ChangeListener(action));
	}

	return root.add(o);
}
// ■JMenuItemをrootのメニューのparentName(JMenuItem)の直上に追加する
// root : JPopupMenu、JMenu
//      追加するメニュー階層
// parentName : strung
//      rootのメニュー一覧の中でこの名前にメニューアイテムの直上に追加する
// menuName : string
//      作成するメニューアイテムの項目名
// action : Object、function
//      メニューアイテムがクリックされたときに実行するActionListenerインターフェースの実装オブジェクト
//      actionPerformed(ActionEvent e)は単一のメソッドなのでfunction(e) { }の形で記述可能
// return : 追加したJMenuItem
function insertMenuItem(root, parentName, menuName, action) {
    for (var i = root.getItemCount() - 1; i >= 0; i--) {
        var mi = root.getItem(i);
        if (!(mi instanceof SwingGui.JMenuItem)) { continue; } // セパレータ
        if (String(mi.getText()).indexOf(parentName) != -1) {
            var o = new SwingGui.JMenuItem(menuName);
            if (typeof action == 'function') {
            	o.addActionListener(action);
            } else {
            	o.addActionListener(new SwingGui.ActionListener(action));
            }
            return root.insert(o, i);
        }
    }
    return null;
}

// ■JMenu,JMenuItem等をrootのメニューのparentName(JMenuItem)の直上に追加する
// root : JPopupMenu
//      追加するメニュー階層
// parentName : strung
//      rootのメニュー一覧の中でこの名前にメニューアイテムの直上に追加する
// menuItem : JMenu, JMenuItem, JCheckBoxMenuItem
//      作成するメニューアイテムの項目名
// return 追加できた場合はtrue
function insertMenu(root, parentName, menuItem) {
    for (var i = root.getComponentCount() - 1; i >= 0; i--) {
        var mi = root.getComponent(i);
        if (!(mi instanceof SwingGui.JMenuItem)) { continue; } // セパレータ
        if (String(mi.getText()).indexOf(parentName) != -1) {
        	root.insert(menuItem, i);
        	return true;
        }
    }
	return false;
}

function findMenuItem(root, menuItemName) {

    for (var i = root.getComponentCount() - 1; i >= 0; i--) {
        var mi = root.getComponent(i);
        if (!(mi instanceof SwingGui.JMenuItem)) { continue; } // セパレータ
        if (String(mi.getText()) == menuItemName) {
        	return true;
        }
    }
	return false;
}

function callTableMaker(isReload)
{
	var __vstmd__ = v2c.getProperty('__V2C_SCRIPT_TABLE_MAKER_DYNAMIC__');
	if (__vstmd__ && (isReload == undefined || isReload == false)) { return __vstmd__; }
	var path = new java.io.File(v2c.saveDir + '/script/tablemaker.js');
	__vstmd__ = eval(String(v2c.readStringFromFile(path)));
	if (!__vstmd__) { 
		v2c.println('[tablemaker_menu.js] menu.jsからtablemaker.jsが読み込めませんでした。\n 「' + path + '」にファイルが存在しているか確認して下さい。');
		return null;
	}
	v2c.putProperty('__V2C_SCRIPT_TABLE_MAKER_DYNAMIC__', __vstmd__);
	return __vstmd__;
}
function Settings()
{
	var self = this;
	var tm = callTableMaker(true);
	if (!tm) { return false; }
	self.__defineGetter__('USE_UNICODE', function() { return tm.USE_UNICODE; });
	self.__defineSetter__('USE_UNICODE', function(val) { if (tm.USE_UNICODE != (!!val)) { tm.USE_UNICODE = (!!val); save(); } });
	self.__defineGetter__('TAILCUT', function() { return tm.TAILCUT; });
	self.__defineSetter__('TAILCUT', function(val) { if (tm.TAILCUT != (!!val)) { tm.TAILCUT = (!!val); save(); } });
	self.__defineGetter__('SEPARATOR', function() { return tm.SEPARATOR; });
	self.__defineSetter__('SEPARATOR', function(val) { if (tm.SEPARATOR != String(val) ) { tm.SEPARATOR = String(val); save(); } });
	self.__defineGetter__('USER_KEISEN', function() { return tm.USER_KEISEN; });
	self.__defineSetter__('USER_KEISEN', function(val) { if (tm.USER_KEISEN != String(val) ) { tm.USER_KEISEN = String(val); save(); } });
	self.__defineGetter__('STYLE', function() { return tm.STYLE; });
	self.__defineSetter__('STYLE', function(val) {  if (tm.STYLE != parseInt(val.toString())) { tm.STYLE = parseInt(val.toString()); save(); } });
	self.__defineGetter__('PREVIEW', function() { return tm.PREVIEW; });
	self.__defineSetter__('PREVIEW', function(val) { if (tm.PREVIEW != (!!val)) { tm.PREVIEW = (!!val); save(); } });
	
	self.path = new java.io.File(v2c.saveDir + '/script/scdata/tablemaker.settings');
	if (!self.path.exists()) {
		save();
	} else {
		load();
	}
	function load() {
		var str = v2c.readStringFromFile(self.path);
		tm.USE_UNICODE = /^USE_UNICODE=(true|1)$/im.test(str);
		tm.TAILCUT = /^TAILCUT=(true|1)$/im.test(str);
		tm.SEPARATOR = (/^SEPARATOR=(.*)$/im.test(str) && RegExp.$1.length > 0) ? RegExp.$1 : tm.SEPARATOR;
		tm.USER_KEISEN = (/^USER_KEISEN=(.*)$/im.test(str) && RegExp.$1.length > 0) ? RegExp.$1 : tm.USER_KEISEN;
		tm.STYLE = (/^STYLE=(\d+)$/im.test(str)) ? parseInt(RegExp.$1) : tm.STYLE;
		tm.PREVIEW = /^PREVIEW=(true|1)$/im.test(str);
	}
	function save()
	{
		var tmp = [];
		tmp.push('[General]');
		tmp.push('USE_UNICODE=' + self.USE_UNICODE);
		tmp.push('TAILCUT=' + self.TAILCUT);
		tmp.push('SEPARATOR=' + self.SEPARATOR);
		tmp.push('USER_KEISEN=' + self.USER_KEISEN);
		tmp.push('STYLE=' + self.STYLE);
		tmp.push('PREVIEW=' + self.PREVIEW);
		v2c.writeLinesToFile(self.path, tmp);
	}
}
function createTableMakerMenu()
{
	var config = null;
	var addedWriteMessage = false;
	var addedWPSelText = false;
	var root = null;
	init();
	function init() {
		addedWriteMessage = false;
		addedWPSelText = false;
		config = new Settings();
		root = new SwingGui.JMenu('テーブルメイカー');
		addMenuItem(root, '選択範囲を表に変換する', function(e) { callTableMaker().Run(); });
		
		var sub = root.add(new SwingGui.JMenu('スタイルを選択して変換'));
		addMenuItem(sub, '位置揃えのみ', function(e) { callTableMaker().Convert(0); });
		addMenuItem(sub, '区切り文字', function(e) { callTableMaker().Convert(1); });
		sub.addSeparator();
		addMenuItem(sub, '半角文字の罫線', function(e) { callTableMaker().Convert(21); });
		addMenuItem(sub, '細い罫線', function(e) { callTableMaker().Convert(31); });
		addMenuItem(sub, 'ヘッダー行が太い罫線', function(e) { callTableMaker().Convert(41); });
		addMenuItem(sub, '太い罫線', function(e) { callTableMaker().Convert(51); });
		addMenuItem(sub, 'ユーザー指定罫線', function(e) { callTableMaker().Convert(91); });
		sub.addSeparator();
		addMenuItem(sub, '半角文字の罫線（内枠のみ）', function(e) { callTableMaker().Convert(20); });
		addMenuItem(sub, '細い罫線（内枠のみ）', function(e) { callTableMaker().Convert(30); });
		addMenuItem(sub, 'ヘッダー行が太い罫線（内枠のみ）', function(e) { callTableMaker().Convert(40); });
		addMenuItem(sub, '太い罫線（内枠のみ）', function(e) { callTableMaker().Convert(50); });
		addMenuItem(sub, 'ユーザー指定罫線（内枠のみ）', function(e) { callTableMaker().Convert(90); });
		sub.addSeparator();
		addMenuItem(sub, '半角文字の罫線（横線なし）', function(e) { callTableMaker().Convert(22); });
		addMenuItem(sub, '細い罫線（横線なし）', function(e) { callTableMaker().Convert(32); });
		addMenuItem(sub, 'ヘッダー行が太い罫線（横線なし）', function(e) { callTableMaker().Convert(42); });
		addMenuItem(sub, '太い罫線（横線なし）', function(e) { callTableMaker().Convert(52); });
		addMenuItem(sub, 'ユーザー指定罫線（横線なし）', function(e) { callTableMaker().Convert(92); });
		
		root.addSeparator();
//		sub = root.add(new SwingGui.JMenu('変換設定'));
		addCheckBoxMenuItem(root, 'ユニコード空白文字を使用する', config.USE_UNICODE, function(e) { config.USE_UNICODE = (e.source.isSelected()) ? true : false; });
		addMenuItem(root, '区切り文字列を変更する', function(e) {
			var ret = v2c.prompt('区切り文字列を変更する', config.SEPARATOR);
			if (ret) { config.SEPARATOR = ret; }
		});
		addMenuItem(root, 'ユーザー指定の罫線を変更する', function(e) {
			var ret = v2c.prompt('ユーザー指定罫線の設定「&br;」で区切って罫線種類を書き換えて下さい。詳細は同封のtablemaker-readme.txtに', config.USER_KEISEN);
			if (ret) { config.USER_KEISEN = ret; }
		});
		addCheckBoxMenuItem(root, '行の末尾を揃える', !config.TAILCUT, function(e) { config.TAILCUT = (e.source.isSelected()) ? false : true; });
		addCheckBoxMenuItem(root, '変換後にプレビューする', config.PREVIEW, function(e) { config.PREVIEW = (e.source.isSelected()) ? true : false; });
		var sub2 = root.add(new SwingGui.JMenu('既定のスタイルの選択'));
		
		function func(e) {
			if (!e.source.getSelectedObjects()) { return; }
			var style = -1;
			var label = String(e.source.getSelectedObjects()[0]).replace(/）/, '').split('（');
			switch (label[0]) {
				case '半角文字の罫線' : style = 21; break;
				case '細い罫線' : style = 31; break;
				case 'ヘッダー行が太い罫線' : style = 41; break;
				case '太い罫線' : style = 51; break;
				case 'ユーザー指定罫線' : style = 91; break;
				case '位置揃えのみ' : style = 0; break;
				case '区切り文字' : style = 1; break;
				default :
					v2c.println('[tablemaker_menu.js] Error チェックボックスメニュー（' + label + '）が想定していない文字列なのでスタイルを取得できませんでした。');
					return false;
			}
			if (style > 20) {
				switch (label[1]) {
					case '内枠のみ' : style--; break;
					case '横線なし' : style++; break;
					default : break;
				}
			}

			if (style >= 0 && config.STYLE != style) {
				config.STYLE = style;
			}
			for (var i = sub2.getItemCount() - 1; i >= 0; i--) {
				var mi = sub2.getItem(i);
				if (!(mi instanceof SwingGui.JMenuItem || mi instanceof SwingGui.JCheckBoxMenuItem)) {
					continue;
				}
				if (mi instanceof SwingGui.JCheckBoxMenuItem) {
					if (mi === e.source) { continue; }
					if (mi.isSelected()) { mi.setSelected(false); }
				}
			}
		}
		addCheckBoxMenuItem(sub2, '位置揃えのみ', (config.STYLE == 0), func);
		addCheckBoxMenuItem(sub2, '区切り文字', (config.STYLE == 1), func);
		sub2.addSeparator();
		addCheckBoxMenuItem(sub2, '半角文字の罫線', (config.STYLE == 21), func);
		addCheckBoxMenuItem(sub2, '細い罫線', (config.STYLE == 31), func);
		addCheckBoxMenuItem(sub2, 'ヘッダー行が太い罫線', (config.STYLE == 41), func);
		addCheckBoxMenuItem(sub2, '太い罫線', (config.STYLE == 51), func);
		addCheckBoxMenuItem(sub2, 'ユーザー指定罫線', (config.STYLE == 91), func);
		sub2.addSeparator();
		addCheckBoxMenuItem(sub2, '半角文字の罫線（内枠のみ）', (config.STYLE == 20), func);
		addCheckBoxMenuItem(sub2, '細い罫線（内枠のみ）', (config.STYLE == 30), func);
		addCheckBoxMenuItem(sub2, 'ヘッダー行が太い罫線（内枠のみ）', (config.STYLE == 40), func);
		addCheckBoxMenuItem(sub2, '太い罫線（内枠のみ）', (config.STYLE == 50), func);
		addCheckBoxMenuItem(sub2, 'ユーザー指定罫線（内枠のみ）', (config.STYLE == 90), func);
		sub2.addSeparator();
		addCheckBoxMenuItem(sub2, '半角文字の罫線（横線なし）', (config.STYLE == 22), func);
		addCheckBoxMenuItem(sub2, '細い罫線（横線なし）', (config.STYLE == 32), func);
		addCheckBoxMenuItem(sub2, 'ヘッダー行が太い罫線（横線なし）', (config.STYLE == 42), func);
		addCheckBoxMenuItem(sub2, '太い罫線（横線なし）', (config.STYLE == 52), func);
		addCheckBoxMenuItem(sub2, 'ユーザー指定罫線（横線なし）', (config.STYLE == 92), func);
	}
	this.register = function(pm, sn) {
		if (sn == 'WriteMessage') {
			if (addedWriteMessage) {
				init();
			}
			insertMenu(pm, '余分な空白と改行を削除', root);
			v2c.println('[tablemaker_menu.js:register()] ポップアップメニュー「WriteMessage」に「テーブルメイカ―」メニュー項目を追加しました。');
			addedWriteMessage = true;
		}
		if (sn == 'WPSelText') {
			if (addedWPSelText) {
				init();
			}
			insertMenu(pm, '変換不能文字→参照', root);
			v2c.println('[tablemaker_menu.js:register()] ポップアップメニュー「WPSelText」に「テーブルメイカ―」メニュー項目を追加しました。');
			addedWPSelText = true;
		}
	};
}

var __vstmmenud__ = new createTableMakerMenu();
if (!DEBUG) { v2c.putProperty('__V2C_SCRIPT_TABLE_MAKER_MENU_DYNAMIC__', __vstmmenud__); }
return __vstmmenud__;

})();