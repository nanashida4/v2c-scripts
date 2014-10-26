//【概要】本スクリプトはmenu.jsの分割ファイルになります。外部コマンドには使用しないで下さい。
// オートリロードに設定したスレッドのタブをタブロックにする
(function() {
	this.register = function(pm, sn) {
		if (sn == 'ThreadPanel') {
			for (var i=pm.getComponentCount()-1; i>=0; i--) {
				var mi=pm.getComponent(i);
				if (!(mi instanceof javax.swing.JMenuItem)) { // セパレータ
					continue;
				}
				if (mi.getText().startsWith('オートリロード')) {
					var hook = new javax.swing.JMenuItem('オートリロード+');
					hook.addActionListener(function(e) {
						var ls = mi.getActionListeners();
						if (ls && ls.length > 0 && ls[0].getClass().getName() == 'org.monazilla.v2c.V2CAction$ShowAutoReloadController') {
							v2c.resPane.selectedThread.lock = true;
							ls[0].actionPerformed(e);
						}
					});
					pm.insert(hook, i + 1);
					pm.remove(i);
					break;
				}
			}
		}
	};
	return this;
})();