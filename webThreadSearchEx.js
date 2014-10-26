//【登録場所】お気に入り、ツールバーの登録領域
//【ラベル】Webスレッド検索EX
//【内容】V2CのWebスレッド検索が対応していないスレッド検索サイトに対応するスクリプトベースのWebスレッド検索
//【コマンド】${SCRIPT:ST} webThreadSearchEx.js
//【アクション】スレ一覧で開く
//【更新日時】2014/06/27 ログ速の書式変更に対応
//            2014/05/14 ログ速検索の追加
//            2014/05/10 デュアルディスプレイ用にダイアログの表示位置を指定する設定項目を追加した。ワード未入力時等に前回の結果が表示される不具合の修正
//            2014/04/21 初版
//            2014/04/21 rev2 フォーカスの変更と前回の検索ワードの記憶
//【説明】
// コマンドの登録方法はお気に入り又は登録領域を右クリ→コマンド登録...から
// コマンド、アクション、ラベルを設定して登録
// 以降作成したコマンドを実行すると検索フォームが表示され検索を押すとスレ一覧に結果が出ます
// ※登録領域とはfirefoxで言うブックマークツールバーのようなV2Cの機能です。登録方法が分かりにくいので
//   よく分からない方はfindThreadsMod.jsの画像付きの解説(http://v2c.kaz-ic.net/wiki/?%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88%2FfindThreadsMod.js)を参考にしてください
// ※Webスレッド検索でいう「新タブで開く」機能は無理です
// ※検索したワードをタブ名にするのは無理です
//【スクリプト】

// ---- [設定項目] -----------------------------------------------
// [ダイアログの表示位置]
//   複数のディスプレイの場合でセカンダリに表示したい場合はプライマリの解像度を足せば表示できます。(ダイアログのサイズは300x120で左上端が基点です)
//   例 『 diagX = 1920 + 800 - 150; 』『 diagY = 600 - 60; 』 ※プライマリ(1920x1080)とセカンダリ(1600x1200)を水平に連結してセカンダリの中央に表示する場合
//   以下の２行の行頭の「//」を外すとダイアログの表示位置を指定できます
//var diagX = 100;  // ダイアログの横方向の表示位置 ( 左端が 0 )
//var diagY = 100;  // ダイアログの縦方向の表示位置 ( 上端が 0 )
 
// [Webスレッド検索の登録]
//   ※javascriptの多少の知識がないと追加するのは難しいです
//   servicesの追加方法
//   { name: '○○○', query: '○○○', func: ○○○ }, の形で追加。※最後の行は末尾のコンマを外し、それ以外の行はコンマを付ける
//  【name 】コンボボックスでの表示名
//  【query】リクエストを投げるURL。 $INPTEXTU にだけ対応(UTF-8)
//  【func 】queryを投げて取得したHTMLからスレッドオブジェクトArrayを作成して返す関数(個別に関数を作成する必要があります
//
var services = [
	{ name: 'ff2ch', query: 'http://ff2ch.syoboi.jp/?q=$INPTEXTU', func: ff2chfunc },
	{ name: 'ログ速 (現在)', query: 'http://www.logsoku.com/search?q=$INPTEXTU&active=1', func: logsokufunc },
	{ name: 'ログ速 (過去)', query: 'http://www.logsoku.com/search?q=$INPTEXTU&active=0', func: logsokufunc },
	{ name: 'ログ速 (現在+過去)', query: 'http://www.logsoku.com/search?q=$INPTEXTU', func: logsokufunc },
	{ name: 'ログ速 (現在+過去+スレ作成順)', query: 'http://www.logsoku.com/search?q=$INPTEXTU&sort=create', func: logsokufunc },
	{ name: 'ログ速 (現在+嫌儲のみ)', query: 'http://www.logsoku.com/search?1bbs=poverty&q=$INPTEXTU', func: logsokufunc }
];

// [servicesに登録する関数群]
//   function 関数名(query) の形で、queryには検索ワード入りのURLが入ります。
//   関数内でHTMLを取得解析し、thオブジェクトArrayを作成して返して下さい
function ff2chfunc(query)
{
	var thl = [];
	var html = v2c.readURL(encodeURI(query));
	if (html) {
		html = html.split('<!-- 検索結果 -->')[1].split('</ul>')[0];
		var re = new RegExp('<li><a href="([^"]+)">([^<]+)</a><span class="count"> \\((\\d+)\\)', 'ig');
		var matches = [];
		while (matches = re.exec(html)) {
			thl.push(v2c.getThread(matches[1], matches[2], matches[3]));
		}
	}
	return thl;
}

function logsokufunc(query)
{
	// [設定] 検索結果の内スレ一覧に表示するスレ数の上限 ※1000件取得するのにかかる時間は5秒以上、ログ速に20回接続します(50件につき１回接続) やり過ぎるとアク禁食らうので注意
	var limit = 100;
	
	// -----
	
	var thl = [];
	var p = 1;
	var thRegex = /<tr class="(?:odd|even)[ _]?(?:first|last)?">[\s\S]*?<\/tr>/ig;
	var lenRegex = /<td class="length">(\d+)<\/td>/;
	var otherRegex = /<a href="\/r\/([^\/]+)\/(\d+)\/" title="(.*?) ?">/;
	var loopcnt = parseInt(limit / 50) + 5;
	while (thl.length < limit) {
		if (loopcnt-- < 0) { 
			v2c.println('[webThreadSearchEx.js:logsokufunc()] Error:ループ上限につき停止しました。（仕様変更かIPのアクセス制限)'); 
			return [];
		}
		var html = v2c.readURL(encodeURI(query + '&p=' + p));
		if (html) {
			var m;
			while (m = thRegex.exec(html)) {
				if (thl.length >= limit) {
					break;
				}
				var len;
				if (lenRegex.test(m[0])) {
					len = RegExp.$1;
				}
				var val = m[0].match(otherRegex);
				if (!val) {
					v2c.println('[webThreadSearchEx.js:logsokufunc()] 取得できません（仕様変更かIPのアクセス制限)');
					return [];
				}
				var bd = v2c.bbs2ch.getBoard(val[1]);
				if (bd) {
					var th = bd.getThread(val[2], null, val[3], len);
					if (th) { 
						thl.push(th);
					}
				}
			}
			if (/p=(\d+)">次へ<\/a>/i.test(html) && parseInt(RegExp.$1) != p) {
				p++;
			} else {
				break;
			}
		} else {
			break;
		}
	}
	return thl;
}

// ---- [設定項目ここまで] ---------------------------------------

// グローバル変数(diagXとdiagY)が宣言されているかチェックするためのグローバルオブジェクト
var global = ( function() { return this; } ).apply( null, [] );

// getThreadsに渡す変数
var inputQuery = null;
var inputService = null;

// 実行時にまずWebスレッド検索EXフォームを表示する
var n = new WebThreadSearchExForm();
n.show();

//Webスレッド検索EXフォームのGUI本体。検索ボタン実行時に上記の変数に値が入る
function WebThreadSearchExForm()
{
	var SwingGui = JavaImporter(java.awt,
								java.awt.event,
								Packages.javax.swing,
								Packages.javax.swing.event,
								javax.swing.table
								);

	this.closed = false;
	
	this.show = function() {
		selectServerForm();
	};

	
	function impl_mouseListener()
	{
		this.mouseClicked = function(e) {};
		this.mouseEntered = function(e) {};
		this.mouseExited  = function(e) {};
		this.mousePressed = function(e) {};
		this.mouseReleased= function(e) {
			if (javax.swing.SwingUtilities.isRightMouseButton(e)) {
				var c = e.getSource();
				showPopup(c, e.getX(), e.getY());
				e.consume();
			}
		};
		function showPopup(c, x, y)
		{
			with(JavaImporter(Packages.javax.swing.text.DefaultEditorKit,
					Packages.javax.swing.JPopupMenu, Packages.javax.swing.KeyStroke, java.awt.event.KeyEvent)) {
				var pmenu = new JPopupMenu();
				var am = c.getActionMap();
				addMenu(pmenu, "切り取り(X)", am.get(DefaultEditorKit.cutAction), 'X', KeyStroke.getKeyStroke(KeyEvent.VK_X, KeyEvent.CTRL_DOWN_MASK));
				addMenu(pmenu, "コピー(C)", am.get(DefaultEditorKit.copyAction), 'C', KeyStroke.getKeyStroke(KeyEvent.VK_C, KeyEvent.CTRL_DOWN_MASK));
				addMenu(pmenu, "貼り付け(V)", am.get(DefaultEditorKit.pasteAction), 'V', KeyStroke.getKeyStroke(KeyEvent.VK_V, KeyEvent.CTRL_DOWN_MASK));
				addMenu(pmenu, "すべて選択(A)", am.get(DefaultEditorKit.selectAllAction), 'A', KeyStroke.getKeyStroke(KeyEvent.VK_A, KeyEvent.CTRL_DOWN_MASK));
				pmenu.show(c, x, y);
			}
		}
		function addMenu(pmenu, text, action, mnemonic, ks)
		{
			if (action != null) {
				var mi = pmenu.add(action);
				if (text != null) mi.setText(text);
				if (mnemonic != 0) mi.setMnemonic(mnemonic);
				if (ks != null) mi.setAccelerator(ks);
			}
		}
	}

	function selectServerForm()
	{
		with (SwingGui) {
			var dialog = new JDialog(new java.awt.Frame(), new java.lang.String('Webスレッド検索EX'), true);
			if ("diagX" in global && "diagY" in global) {
				dialog.setBounds(diagX, diagY, 300, 120);
			} else {
				dialog.setSize(new Dimension(300, 120));
				dialog.setLocationRelativeTo(null);
			}
			dialog.setLayout(new BorderLayout());
			dialog.setResizable(false);
			dialog.add((function() { 
				var p = new JPanel();
				with (p) {
					var gridBagLayout = new GridBagLayout();
					gridBagLayout.columnWeights = [1.0, 1.0, 1.0, java.lang.Double.MIN_VALUE];
					gridBagLayout.rowWeights = [1.0, 1.0, java.lang.Double.MIN_VALUE];
					setLayout(gridBagLayout);
					
					var lists = [];
					for (var i = 0; i < services.length; i++) {
						lists.push(services[i].name);
					}
					var model = new DefaultComboBoxModel(lists);
					var conboBox = new JComboBox();
					conboBox.setModel(model);
					var gbc_conboBox = new GridBagConstraints();
					gbc_conboBox.gridwidth = 2;
					gbc_conboBox.insets = new Insets(10, 10, 5, 0);
					gbc_conboBox.fill = GridBagConstraints.BOTH;
					gbc_conboBox.gridx = 0;
					gbc_conboBox.gridy = 0;
					add(conboBox, gbc_conboBox);
					
					
					var servField = new JTextField();
					var tmp = v2c.getScriptObject();
					if (tmp) {
						servField.setText(tmp.query || '');
						conboBox.setSelectedIndex(tmp.index || 0);
					}
					var gbc_servField = new GridBagConstraints();
					gbc_servField.gridwidth = 3;
					gbc_servField.insets = new Insets(5, 10, 10, 0);
					gbc_servField.fill = GridBagConstraints.BOTH;
					gbc_servField.gridx = 0;
					gbc_servField.gridy = 1;
					add(servField, gbc_servField);
					servField.addMouseListener(new MouseListener(new impl_mouseListener()));
					
					var btnNewButton = new JButton("検索");
					with (btnNewButton) {
						addActionListener(function(e) {
							inputQuery = servField.getText();
							inputService = services[conboBox.getSelectedIndex()];
							v2c.setScriptObject({ query: inputQuery, index: conboBox.getSelectedIndex()});
							dialog.dispose();
						});
					}
					var gbc_btnNewButton = new GridBagConstraints();
					gbc_btnNewButton.fill = GridBagConstraints.BOTH;
					gbc_btnNewButton.anchor = GridBagConstraints.EAST;
					gbc_btnNewButton.insets = new Insets(5, 5, 10, 10);
					gbc_btnNewButton.gridx = 3;
					gbc_btnNewButton.gridy = 1;
					add(btnNewButton, gbc_btnNewButton);
					dialog.getRootPane().setDefaultButton(btnNewButton);
					
					dialog.addWindowListener(new WindowListener({
						windowActivated : function(e) {},
						windowClosed : function(e) {},
						windowClosing : function(e) {},
						windowDeactivated : function(e) {},
						windowDeiconified : function(e) {},
						windowIconified : function(e) {},
						windowOpened : function(e) {
							servField.setRequestFocusEnabled(true);
							servField.requestFocusInWindow();
						}
					}));
					
				}
				return p;
			})());
		}
		dialog.setVisible(true);
	}
}

// スレ一覧作成用のV2Cのコールバック関数

function getThreads(cx)
{
	var stime = new Date();
	if (!v2c.online) {
		cx.message = '[webThreadSearchEx.js] オンラインでないので取得出来ません。メニューバーのファイル(F)→オンライン(O)にチェックを入れて下さい';
		cx.skip = true;
		return null;
	}
	if ((!inputQuery) || inputQuery.length() == 0) {
		cx.message = '[webThreadSearchEx.js] 検索ワードが入力されていません';
		return [];
	}
	if (!inputService) {
		cx.message = '[webThreadSearchEx.js] serviceが取得できませんでした。jsファイル内のservicesの設定を見なおして下さい';
		return [];
	}
	var thl = inputService.func(inputService.query.replace('$INPTEXTU', inputQuery));
	
	if ((!thl) || thl.length == 0) {
		cx.message = '[webThreadSearchEx.js] 該当するスレッドは0件でした。あるいは検索結果の取得に失敗したのでスレ一覧に表示できません';
		return [];
	}
	
	var etime = new Date();
	v2c.println('[webThreadSearchEx.js] completed. (処理時間: ' + (etime - stime) + 'ミリ秒)\n\t【検索サイト】' + inputService.name + '【検索ワード】' + inputQuery + '【検索結果】' + thl.length + '件Hit');

	return thl;
}
