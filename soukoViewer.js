//【登録場所】全体
//【ラベル】過去ログ倉庫
//【内容】V2Cで取得できない2012/11以降の過去ログ倉庫を表示する
//【コマンド】${SCRIPT:ST} soukoViewer.js
//【更新日時】2013/12/18
//【スクリプト】
var n = new SoukoForm();
n.show();
function SoukoForm()
{
	var SwingGui = JavaImporter(java.awt,
								java.awt.event,
								Packages.javax.swing,
								Packages.javax.swing.event,
								javax.swing.table
								);

	var frame = null;
	var textField = null;
	var server = null;
	var table = null;
	
	with (SwingGui) {
		with (frame = JFrame('過去ログ倉庫')) {
			defaultCloseOperation = DISPOSE_ON_CLOSE;
			setSize(new Dimension(550, 380));
			setLayout(new BorderLayout());
			setResizable(false);
			setLocationRelativeTo(null);
			add(new createFormPanel());
		}
	}

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
			var frm = new JFrame('過去ログ倉庫');
			frm.setSize(new Dimension(300, 120));
			frm.setLayout(new BorderLayout());
			frm.setResizable(false);
			frm.setLocationRelativeTo(null);
			frm.add((function() { 
				var p = new JPanel();
				with (p) {
					var gridBagLayout = new GridBagLayout();
					gridBagLayout.columnWidths = [0, 30, 0, 0];
					gridBagLayout.rowHeights = [0, 0, 0];
					gridBagLayout.columnWeights = [0.0, 0.0, 1.0, java.lang.Double.MIN_VALUE];
					gridBagLayout.rowWeights = [0.0, 0.0, java.lang.Double.MIN_VALUE];
					setLayout(gridBagLayout);
					
					var lblchnet = new JLabel("\u30B5\u30FC\u30D0 :");
					lblchnet.setFont(new Font("MS UI Gothic", Font.PLAIN, 13));
					var gbc_lblchnet = new GridBagConstraints();
					gbc_lblchnet.anchor = GridBagConstraints.EAST;
					gbc_lblchnet.insets = new Insets(10, 10, 5, 5);
					gbc_lblchnet.gridx = 0;
					gbc_lblchnet.gridy = 0;
					add(lblchnet, gbc_lblchnet);
					
					var servField = new JTextField();
					servField.setText('hayabusa.2ch.net/news4vip/');
					var gbc_servField = new GridBagConstraints();
					gbc_servField.gridwidth = 2;
					gbc_servField.insets = new Insets(7, 0, 5, 10);
					gbc_servField.fill = GridBagConstraints.HORIZONTAL;
					gbc_servField.gridx = 1;
					gbc_servField.gridy = 0;
					add(servField, gbc_servField);
					servField.setColumns(10);
					
					var btnNewButton = new JButton("OK");
					with (btnNewButton) {
						addActionListener(function(e) {
							server = servField.getText();
							frm.dispose();
							frame.show();
						});
					}
					var gbc_btnNewButton = new GridBagConstraints();
					gbc_btnNewButton.ipady = 5;
					gbc_btnNewButton.fill = GridBagConstraints.BOTH;
					gbc_btnNewButton.anchor = GridBagConstraints.EAST;
					gbc_btnNewButton.gridwidth = 2;
					gbc_btnNewButton.insets = new Insets(10, 65, 5, 5);
					gbc_btnNewButton.gridx = 0;
					gbc_btnNewButton.gridy = 1;
					add(btnNewButton, gbc_btnNewButton);
					
					var btnNewButton_1 = new JButton("Cancel");
					with (btnNewButton_1) {
						addActionListener(function(e) {
							frm.dispose();
						});
					}
					var gbc_btnNewButton_1 = new GridBagConstraints();
					gbc_btnNewButton_1.fill = GridBagConstraints.VERTICAL;
					gbc_btnNewButton_1.insets = new Insets(10, 0, 5, 5);
					gbc_btnNewButton_1.anchor = GridBagConstraints.WEST;
					gbc_btnNewButton_1.gridx = 2;
					gbc_btnNewButton_1.gridy = 1;
					add(btnNewButton_1, gbc_btnNewButton_1);
				}
				return p;
			})());
		}
		frm.show();
	}
	
	function createFormPanel()
	{
		with (SwingGui) {
			var p = new JPanel();
			with (p) {
				var gridBagLayout = new GridBagLayout();
				gridBagLayout.columnWidths = [147, 140, 0];
				gridBagLayout.rowHeights = [44, 100, 0, 0];
				gridBagLayout.columnWeights = [1.0, 1.0, java.lang.Double.MIN_VALUE];
				gridBagLayout.rowWeights = [0.0, 1.0, 0.0, java.lang.Double.MIN_VALUE];
				setLayout(gridBagLayout);
				
				var lists = [];
				var stime = 1275;
				var etime = parseInt((new Date()).getTime() / 1000000000);
				for (var i = stime; i <= etime; i++) {
					var dd = (new Date());
					dd.setTime(i * 1000000000);
					var yy = dd.getYear();
					var mm = dd.getMonth() + 1;
					dd = dd.getDate();
					if (yy < 2000) { yy += 1900; }
					if (mm < 10) { mm = '0' + mm; }
					if (dd < 10) { dd = '0' + dd; }
					lists.push(i + ' [' + yy + '/' + mm + '/' + dd + '～]');
				}
				lists.push('フォルダを選択');
				lists.reverse();
				var model = new DefaultComboBoxModel(lists);
				var comboBox = new JComboBox();
				comboBox.addActionListener(new ActionListener({
					actionPerformed: function(e) { 
						var s = String(comboBox.getSelectedItem()).split(' ')[0];
						if (s == 'フォルダを選択') { return null; }
						var url = 'http://' + server + 'kako/o' + s + '/subject.txt';
						var html = v2c.readURL(url);
						if (!html) { return; }
						var matches = [];
						var tm = table.getModel();
						tm.setRowCount(0);
						var line = String(html).split('\n');
						for ( var i = 0; i < line.length; i++) {
							var t, k, n;
							if (!line[i]) continue;
							var tmp = line[i].split('.dat<>');
							if (!tmp[0]) continue;
							k = parseInt(tmp[0]);
							if (!tmp[1]) continue;
							tmp = tmp[1].split(' (');
							if (!tmp[0]) continue;
							t = tmp[0];
							if (!tmp[1]) continue;
							n = tmp[1].substring(0, tmp[1].length - 1);
							
							var dd = new Date();
							dd.setTime(parseInt(k) * 1000);
							var yy = dd.getYear();
							var mm = dd.getMonth() + 1;
							var hh = dd.getHours();
							var mi = dd.getMinutes();
							var se = dd.getSeconds();
							dd = dd.getDate();
							if (yy < 2000) { yy += 1900; }
							if (mm < 10) { mm = '0' + mm; }
							if (dd < 10) { dd = '0' + dd; }
							if (hh < 10) { hh = '0' + hh; }
							if (mi < 10) { mi = '0' + mi; }
							if (se < 10) { se = '0' + se; }
							
							tm.addRow([n, yy + '/' + mm + '/' + dd + ' ' + hh + ':' + mi + ':' + se, t]);
						}
						/*
						while (matches = /(\d+)\.dat<>([\S\s]+?) \((\d+)\)/g.exec(html)) {
							tm.addRow([RegExp.$3, java.lang.Integer(RegExp.$1), RegExp.$2]);
						}
						*/
					}
				}));
				comboBox.setModel(model);
				var gbc_comboBox = new GridBagConstraints();
				gbc_comboBox.fill = GridBagConstraints.HORIZONTAL;
				gbc_comboBox.anchor = GridBagConstraints.ABOVE_BASELINE;
				gbc_comboBox.insets = new Insets(5, 5, 5, 30);
				gbc_comboBox.gridx = 0;
				gbc_comboBox.gridy = 0;
				add(comboBox, gbc_comboBox);
				
				textField = new JTextField();
				textField.addActionListener(new ActionListener({
					actionPerformed: function(e) {
						var sorter = new TableRowSorter(table.getModel());
						sorter.setRowFilter(RowFilter.regexFilter(textField.getText(), 2));
						table.setRowSorter(sorter);
					}
				}));
				var gbc_textField = new GridBagConstraints();
				gbc_textField.insets = new Insets(5, 50, 5, 5);
				gbc_textField.fill = GridBagConstraints.HORIZONTAL;
				gbc_textField.gridx = 1;
				gbc_textField.gridy = 0;
				add(textField, gbc_textField);
				textField.setColumns(10);
				
				var scrollPane = new JScrollPane();
				var gbc_scrollPane = new GridBagConstraints();
				gbc_scrollPane.gridwidth = 2;
				gbc_scrollPane.insets = new Insets(0, 5, 5, 5);
				gbc_scrollPane.fill = GridBagConstraints.BOTH;
				gbc_scrollPane.gridx = 0;
				gbc_scrollPane.gridy = 1;
				add(scrollPane, gbc_scrollPane);

				var columnNames = ['レス', 'スレ立', 'タイトル'];
				var tableModel = new DefaultTableModel(columnNames, 0);
				table = new JTable(tableModel);
				table.addMouseListener(new MouseListener(new impl_mouseListenerTbl()));
				table.getTableHeader().setResizingAllowed(false);
				table.setRowSelectionAllowed(true);
				//table.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
				table.getColumnModel().getColumn(0).setMinWidth(35);
				table.getColumnModel().getColumn(0).setMaxWidth(35);
				table.getColumnModel().getColumn(1).setMinWidth(135);
				table.getColumnModel().getColumn(1).setMaxWidth(135);
				table.setDefaultEditor((new java.lang.Object).getClass(), null);

				scrollPane.setViewportView(table);
				
				var btnNewButton = new JButton("\u9589\u3058\u308B");
				btnNewButton.setFont(new Font("MS UI Gothic", Font.PLAIN, 12));
				with (btnNewButton) {
					addActionListener(function(e) {
						frame.dispose();
					});
				}
				var gbc_btnNewButton = new GridBagConstraints();
				gbc_btnNewButton.gridwidth = 2;
				gbc_btnNewButton.insets = new Insets(5, 0, 10, 5);
				gbc_btnNewButton.gridx = 0;
				gbc_btnNewButton.gridy = 2;
				add(btnNewButton, gbc_btnNewButton);
			}
			return p;
		}
	}

	function impl_mouseListenerTbl()
	{
		this.mouseClicked = function(e) {
			if (e.getClickCount() >= 2) {
				doOpenThread();
			}
			e.consume();
		};
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
			with(SwingGui) {
				var pmenu = new JPopupMenu();
				var am = c.getActionMap();
				var jm = new JMenuItem("開く");
				jm.addActionListener(new ActionListener({
					actionPerformed: function(e) { doOpenThread(); }
				}));
				pmenu.add(jm);
				pmenu.show(c, x, y);
			}
		}
		function doOpenThread()
		{
			var bd = v2c.getBoard('http://' + server);
			if (!bd) { return; }
			var matches = [];
			var sels = table.getSelectedRows();
			var model = table.getModel();
			if (sels.length <= 0) { return; }
			for (var i = 0; i < sels.length; i++) {
				sels[i] = table.convertRowIndexToModel(sels[i]);
				var n = parseInt(model.getValueAt(sels[i], 0).toString());
				var k = String(model.getValueAt(sels[i], 1).toString());
				k = parseInt((new Date(k)).getTime() / 1000);
				var t = String(model.getValueAt(sels[i], 2).toString());
				v2c.openURL('http://' + server + 'test/read.cgi/' + k + '/');
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

}