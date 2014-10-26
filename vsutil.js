/* --------------------------------------------------------------------------- */
// V2Cスクリプトを作成するときにあると便利(？)あるいは多用する関数群
// 実際にスクリプトで使うには以下のようにします
/*
	var vsutil = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/vsutil.js'))));
	vsutil.writeStringToSettingFile(hoge, hage);
*/
//【パーミッション】F
//【更新履歴】初版 rescheck.js ng_poverty_imgres用に幾つか作成
/* --------------------------------------------------------------------------- */

(function() {
var __vsutil__ = v2c.getProperty('__V2C_SCRIPT_UTILITIES__');
if (__vsutil__) { return __vsutil__; }
__vsutil__ = {
	// V2C設定ファイルに書き込み、リロード可能な設定ファイルであれば即時リロードします
	// NG関連はV2Cがメモリ内で管理しているため同期が取れないので確実に反映させるためには再起動させる必要があります。更にcache取得済みの場合再度画像を読み込まないと反映されません
	// setting_fname = 設定ファイル名又はそのjava.io.File又はその絶対パス
	// val = 設定ファイルに上書きする文字列(全文)
	// sjis = (省略可) trueなら設定ファイルをShift_JISとして上書きします(Jane互換設定ファイル用)
	writeStringToSettingFile : function(setting_fname, val /*, sjis = false */)
	{
		var setting = [
			'samba24.txt', 'msgkw.txt', 'AAList.txt', 'ImageViewURLReplace.dat', 'ReplaceStr.txt',
			'ReplaceStr_Tw.txt', 'URLExec.dat', 'URLExec2.dat', 'URLExec3.dat', 'NGBE.txt'
		];
		var c = 'UTF-8';
		var f;
		if (arguments.length > 2 && arguments[2])
			c = 'MS932';
		if (setting_fname instanceof java.io.File) {
			f = setting_fname;
		} else if (setting_fname instanceof String || typeof setting_fname == 'string') {
			var idx = setting.indexOf(setting_fname);
			if (idx == -1 && /[\/\\]/.test(String(setting_fname)))
				f = new java.io.File(setting_fname);
			else 
				f = new java.io.File(v2c.saveDir + '/' + setting_fname);
		}
		if (!f.exists()) {
			throw '[writeStringToSettingFile()] File Not Found. setting_fnameにはjava.io.File、V2CSettingFileName、絶対パスの何れかを指定して下さい。';
			return;
		}
		var tmpf = v2c.getScriptDataFile('newV2CSettingFile.tmp');
		var OS = java.lang.System.getProperty("os.name").toLowerCase();
		if (OS.indexOf('win') >= 0) {
			cpcmd = ['cmd', '/c', 'move', tmpf.getAbsolutePath(), f.getAbsolutePath()];
		} else if (/(?:mac|nix|nux|aix|sunos)/.test(String(OS))) {
			cpcmd = ['mv', '-f', tmpf.getAbsolutePath(), f.getAbsolutePath()];
		} else {
			throw '[writeStringToSettingFile()] 対応していないOSです。';
			return;
		}
		v2c.writeStringToFile(tmpf, val, c);
		v2c.exec(cpcmd);
		java.lang.Thread.sleep('300');
		v2c.reloadSettingFile(f.getName());
	},
	// ファイルのハッシュを取得します
	// stringORbytesArray : byte配列又は文字列
	// algorithmName : ハッシュ関数名 (指定できる文字列はjava.security.MessageDigestを参照)
	getHash : function(stringORbytesArray, algorithmName)
	{
		if (typeof stringORbytesArray == 'string' || stringORbytesArray instanceof String)
			stringORbytesArray = (new java.lang.String(stringORbytesArray)).getBytes();
		var m = new java.security.MessageDigest.getInstance(algorithmName);
		m.reset();
		var hash = m.digest(stringORbytesArray);
		var sb = new java.lang.StringBuffer(hash.length * 2);
		for ( var i = 0; i < hash.length; i++) {
			var b = java.lang.Integer.toHexString(hash[i] & 0xff);
			if (b.length() == 2)
				sb.append(b);
			else if (b.length() == 1)
				sb.append('0' + b);
				
		}
		return sb.toString();
	},
	// ファイルのSHA-1を取得します
	// stringORbytesArray : byte配列又は16進文字列
	getSHA : function(stringOrbytesArray)
	{
		return this.getHash(stringOrbytesArray, 'SHA-1');
	},
	// ファイルのMD5を取得します
	// stringORbytesArray : byte配列又は16進文字列
	getMD5 : function(stringOrbytesArray)
	{
		return this.getHash(stringOrbytesArray, 'MD5')
	}
};
v2c.putProperty('__V2C_SCRIPT_UTILITIES__', __vsutil__);
return __vsutil__;
})();
