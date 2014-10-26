//【登録場所】 全体、レス表示
//【ラベル】 時計（＋外部コマンド）
//【コマンド1】 ${SCRIPT:T} clock.js　時計表示
//【コマンド2】 ${SCRIPT:FST} clock.js excmd　起動時、起動後、レス表示切り替え時に外部コマンドを実行
//＊コマンドや条件の設定はコマンド2の初回起動(時計表示のみ)で作成されるscript\scdataフォルダ内の『clk_cmd.txt』を編集する。
//（もしくは自分で作成してutf-8でscdataフォルダ内に保存）
//＊clk_cmd.txtの説明
//　[Directory]下ではディレクトリを記述
//　　Dir1="C:\Program Files\foobar2000\foobar2000.exe"
//　　Dir2="C:\sample1.m3u"
//　　Dir3="C:\sample2.m3u"
//　のように記述する。[StartCommand]以降では『%Dir1%』や『%Dir2%』とすることで使い回しができる。
//　[Argument]下ではコマンドの引数を記述
//　　Arg1=/hide
//　　Arg2=/exit
//　　Arg3=/rand
//　のように記述する。[StartCommand]以降では『%Arg1%』や『%Arg2%』とすることで使い回しができる。
//　[StartCommand]下ではスクリプト起動時のコマンドを記述
//　　%Dir1% %Arg1%
//　[EndCommand]下ではスクリプト終了（時計右上の×をクリック）時のコマンドを記述
//　　%Dir1% %Arg3%
//　[BoardKey, ChengeCommand]下ではレス表示切替時に設定した条件があれば実行される。
//　　software,%Dir1% %Arg2% %Dir2%
//　　v2cj,%Dir1% %Arg2% %Dir2%
//　のように記述する。
//　『板キー,外部コマンド』とすることで設定板キーの場合に『,』以降の外部コマンドが実行される。
//　[ThreadTitleKeyword, ChengeCommand]下もレス表示切替時に設定した条件があれば実行される。
//　　V2C,%Dir1% %Arg2% %Dir3%
//　　ブラウザ,%Dir1% %Arg2% %Dir3%
//　のように記述する。
//　『キーワード,外部コマンド』とすることで設定キーワードがあるスレッドの場合に『,』以降の外部コマンドが実行される。
//＊板キーよりもキーワードが優先
//＊clk_cmd.txt記述例
//　例：foobar2000
//　foobar2000のPreferences > Shell Integration の「ファイルを追加したらウィンドウを前面に表示する」のチェックを外しておくといいかも。
//　　例１：foobar2000で指定m3uファイルを板が変わったときにランダム実行
/*
[Directory]
[Argument]
[StartCommand]
"C:\Program Files\foobar2000\foobar2000.exe" /hide
[EndCommand]
"C:\Program Files\foobar2000\foobar2000.exe" /exit
[BoardKey, ChengeCommand]
.*,"C:\Program Files\foobar2000\foobar2000.exe" /rand "C:\sample1.m3u"
[ThreadTitleKeyword, ChengeCommand]
*/
//　　例２：foobar2000で指定条件の場合に指定m3uをランダム実行
//　　　ただし下にあるRun Commandが必要です。foobar2000\componentsフォルダに入れてください。
//　　　http://www.foobar2000.org/components/view/foo_runcmd
/*
[Directory]
Dir1="C:\Program Files\foobar2000\foobar2000.exe"
Dir2="C:\sample1.m3u"
Dir3="C:\sample2.m3u"
Dir4="C:\sample3.m3u"
Dir5="C:\sample4.m3u"
[Argument]
Arg1=/hide /runcmd="File/New Playlist"
Arg2=/runcmd="File/Remove Playlist" /runcmd="File/New Playlist" /runcmd="Edit/Add to Playlist"
Arg3=/runcmd="File/Remove Playlist" /exit
[StartCommand]
%Dir1% %Arg1%
[EndCommand]
%Dir1% %Arg3%
[BoardKey, ChengeCommand]
software,%Dir1% %Arg2% %Dir2%
v2cj,%Dir1% %Arg2% %Dir3%
[ThreadTitleKeyword, ChengeCommand]
V2C,%Dir1% %Arg2% %Dir5%
ブラウザ,%Dir1% %Arg2% %Dir4%
*/
//【更新日】20100503
//【元URL】http://yy61.60.kg/test/read.cgi/v2cj/1252074124/180
//【スクリプト】
// ----- 次の行から -----
var options = v2c.context.args, isExCmd = options[0]+"" == "excmd";
var jd, jl, jls, jlt, tm, or, nr, er, mt, tt, psw, tbk = tbt = cmd = "", isScroll = false;
var nh1 = "<html><body><center>", nh2 = "</center><table border='0' cellspacing='0' cellpadding='0'><tr>";
var nh3 = "<td><div style='background-color: ", nh4 = "; width: ", nh5 = "px; font-size: 4px;'> </div></td>";
var nh6 = "</tr></table></body></html>", tmp_m = tmp_n = "", mboard, nword;
var df = new java.text.SimpleDateFormat(" HH:mm:ss "), cf = new java.text.DecimalFormat("#######.#");
var al = new java.awt.event.ActionListener() {
	actionPerformed: function(e) {
		if (jd.isVisible()) {
			jl.setText(df.format(new Date()));
			var thc = v2c.resPane.selectedThread;
			if(!thc){
				jlt.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
				or = nr = mt = 0, er = 100, tt = "";
			} else {
				var lrc = thc.localResCount;
				if(lrc > 1000) {
					or = java.lang.Math.ceil((lrc-thc.newResCount) * 100 / thc.localResCount); nr = java.lang.Math.ceil(thc.newResCount * 100 / lrc); er = 0;
				} else {
					or = java.lang.Math.ceil((lrc - thc.newResCount) * 0.1); nr = java.lang.Math.ceil(thc.newResCount * 0.1); er = 100 - or - nr;
				}
				if(tt != thc.title) {
					jlt.setText(thc.title); psw = jlt.getPreferredSize().width; isScroll = psw > jlt.getWidth();
					(isScroll)? jlt.setHorizontalAlignment(javax.swing.SwingConstants.LEFT) : jlt.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
					if (mt != 0) mt=0;
					if(isExCmd) {
						tbk = thc.board.key + "";
						for(var m = 0, mlen = board.length; m < mlen; m++){
							mboard = (tbk.match(new RegExp(board[m])) || [])[0];if (mboard) {cmd = changeCmdB[m];break;}
						}
						tbt = thc.title + "";
						for(var n = 0, nlen = keyword.length; n < nlen; n++){
							nword = (tbt.match(new RegExp(keyword[n])) || [])[0];if (nword) {cmd = changeCmdK[n];break;}
						}
						if (cmd != "" && (!(tmp_m == mboard && tmp_n == nword) && !(mlen == m && nlen == n)) && !(nlen != n && tmp_n == nword)) {
							if(cmd.length > 0)v2c.exec(cmd);tmp_m = mboard;tmp_n = nword;
						}
					}
				}
				if(psw <= 0) mt=0;
				if (isScroll) {
					jlt.setText(thc?thc.title.substring(mt):"------");psw = jlt.getPreferredSize().width
				} else {
					jlt.setText(thc?thc.title:"------");
				}
				jlt.getCaret().setDot(0);
				jls.setText(thc?nh1+cf.format(thc.speed)+nh2+nh3+"blue"+nh4+or+nh5+nh3
					+"yellow"+nh4+nr+nh5+nh3+"gray"+nh4+er+nh5+nh6:nh1+"-.-"+nh2+nh3+"gray"+nh4+er+nh5+nh6);
				jls.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);mt++;thc?tt=thc.title:tt="";
			}
			tm.start();
		}
	}
};
var wl = new java.awt.event.WindowListener() {
		 windowActivated: function(e) {}, windowClosed: function(e) {},
		 windowClosing: function(e) {if(isExCmd && endCmd.length > 0) v2c.exec(endCmd);},
		 windowDeactivated: function(e) {}, windowDeiconified: function(e) {},
		 windowIconified: function(e) {}, windowOpened: function(e) {}
};
var rc = new java.lang.Runnable() {
	run: function() {
		jd = new javax.swing.JDialog();jd.setAlwaysOnTop(true);
		jd.setModalityType(java.awt.Dialog.ModalityType.MODELESS);
		jd.setDefaultCloseOperation(javax.swing.WindowConstants.DISPOSE_ON_CLOSE);
		jl = new javax.swing.JLabel(" 00:00:00 ");
		jl.setFont(jl.getFont().deriveFont(java.awt.Font.PLAIN,24));jd.add(jl);
		jlt = new javax.swing.JTextField("スレタイ");
		jlt.setFocusable(false);jlt.setEditable(false);jlt.setBorder(null);
		jlt.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
		jd.add(jlt,java.awt.BorderLayout.SOUTH);
		jls = new javax.swing.JLabel(nh1+"-.-"+nh2+nh3+"gray"+nh4+100+nh5+nh6);
		jd.add(jls,java.awt.BorderLayout.NORTH);jd.pack();jd.setLocation(0,0);jd.setVisible(true);
		jd.addWindowListener(wl);
		tm = new javax.swing.Timer(500,al);tm.setRepeats(false);if(isExCmd && startCmd.length > 0)v2c.exec(startCmd);tm.start();
	}
};
if(isExCmd) {
	var txt = v2c.getScriptDataFile('clk_cmd.txt'), cecd = 'utf-8', fs = java.io.File.separator;
	if(v2c.readFile(txt) == null){
		var MenuList = ["[Directory]","Dir1=","[Argument]","Arg1=","[StartCommand]","[EndCommand]",
			"[BoardKey, ChengeCommand]","[ThreadTitleKeyword, ChengeCommand]"];
		v2c.writeLinesToFile(txt,MenuList,'utf-8');isExCmd = false;
	} else {
		var cmdArr = new Array();dir = new Array();arg = new Array();board = new Array();
		changeCmdB = new Array();keyword = new Array();changeCmdK = new Array();
		var startCmd = endCmd = "", sw = 0, mt;
		var cmdTxt = function(str){return str.replace(/%Dir(\d)%/g, function(str, num){
			return dir[num-1];}).replace(/%Arg(\d)%/g, function(str, num){return arg[num-1];});}
		cmdArr = v2c.readLinesFromFile(txt,cecd);
		for (i = 0, il = cmdArr.length; i < il; i++) {
			cmdArr[i] = cmdArr[i].replaceAll(fs+fs,fs+fs+fs+fs); cmdArr[i] = cmdArr[i] + "";
			if(cmdArr[i].indexOf("[Directory]") != -1) sw = 1;
			else if(cmdArr[i].indexOf("[Argument]") != -1) sw = 2;
			else if(cmdArr[i].indexOf("[StartCommand]") != -1) sw = 3;
			else if(cmdArr[i].indexOf("[EndCommand]") != -1) sw = 4;
			else if(cmdArr[i].indexOf("[BoardKey, ChengeCommand]") != -1) sw = 5;
			else if(cmdArr[i].indexOf("[ThreadTitleKeyword, ChengeCommand]") != -1) sw = 6;
			else {
				if(sw > 2) cmdArr[i] = cmdTxt(cmdArr[i]+"");
				switch(sw){
					case 1:
						mt = cmdArr[i].match(/^Dir\d=(.*)$/);if(mt) dir.push(mt[1]);break;
					case 2:
						mt = cmdArr[i].match(/^Arg\d=(.*)$/);if(mt) arg.push(mt[1]);break;
					case 3:
						startCmd = cmdArr[i]+"";break;
					case 4:
						endCmd = cmdArr[i]+"";break;
					case 5:
						board.push((cmdArr[i]+"").split(",")[0]);changeCmdB.push((cmdArr[i]+"").split(",")[1]);break;
					case 6:
						keyword.push((cmdArr[i]+"").split(",")[0]);changeCmdK.push((cmdArr[i]+"").split(",")[1]);break;
					default:
				}
			}
		}
	}
}
javax.swing.SwingUtilities.invokeLater(rc);
// ----- 前の行まで -----