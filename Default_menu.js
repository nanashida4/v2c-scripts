//【概要】本スクリプトはmenu.jsの分割ファイルになります。外部コマンドには使用しないで下さい。
(function() {
	// レス番号ポップアップメニューの「設定」の最初のセパレータまでの項目を展開する
	this.registerExpandSettingMenu = function(pm, sn) {
		if (sn=='ResNum') {
			loop:
			for (var i=pm.getComponentCount()-1; i>=0; i--) {
				var mi=pm.getComponent(i);
				if (!(mi instanceof javax.swing.JMenuItem)) { // セパレータ
					continue;
				}
				if (mi.getText()=='設定') {
					// mi は javax.swing.JMenu
					for (var j=0; j<mi.getItemCount(); j++) {
						var mj=mi.getItem(j);
						if (!(mj instanceof javax.swing.JMenuItem)) { // セパレータ
							mi.remove(j);
							for (var k=j-1; k>=0; k--) {
								pm.insert(mi.getItem(k),i);
							}
							break loop;
						}
					}
					break;
				}
			}
		}
	};
	// レス表示ポップアップメニューの抽出系の項目を下位メニューにまとめる
	this.registerCollapseFilterItems= function(pm, sn) {
		if (sn=='ThreadPanel') {
			var ie=-1;
			for (var i=pm.getComponentCount()-1; i>=0; i--) {
				var mi=pm.getComponent(i);
				if (!(mi instanceof javax.swing.JMenuItem)) { // セパレータ
					continue;
				}
				var sl=mi.getText();
				if (ie<0) {
					if (sl.startsWith('抽出ダイアログ')) {
						ie = i;
					}
				} else {
					if (sl.startsWith('リンクを含むレスを抽出')) {
						var m=new javax.swing.JMenu('抽出');
						for (var j=ie; j>=i; j--) {
							m.insert(pm.getComponent(j),0);
						}
						pm.insert(m,i);
						break;
					}
				}
			}
		}
	};
	// レス表示ポップアップメニューから「マーカーを引いたレスを抽出」を削除する
	this.registerRemoveMarkedResFilterItem = function(pm, sn) {
		if (sn=='ThreadPanel') {
			for (var i=pm.getComponentCount()-1; i>=0; i--) {
				var mi=pm.getComponent(i);
				if (!(mi instanceof javax.swing.JMenuItem)) { // セパレータ
					continue;
				}
				if (mi.getText().startsWith('マーカーを引いたレスを抽出')) {
					pm.remove(i);
					break;
				}
			}
		}
	};
	return this;
})();