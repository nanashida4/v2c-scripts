//【登録場所】 "V2C\script\system\getdat.js"
//【内容】 スレッドのログが取得出来ない場合、指定するURLから過去ログを取得する。
//         まず同封のreadme.txtを読んで下さい。
//         htmltodat.exeを使用する場合は/script/htmltodat0.9.0/内にhtmltodat.exe含む全てのファイルをコピペする
//         htmltodat互換モードの場合は/script/htmltodat0.9.0/内にprmファイルだけあれば、exe等他のファイルは不要です
//         ふたば、爆サイ、4chanを使用する場合はgetBakusaiLists.js、get4chanCatalog.js、getFutabaCatalog.js、post.jsをテキストエディタで開いて設定変更或いは導入方法の確認をして下さい
//         それ以外のファイルは閲覧を便利にするためのスクリプトだったりするので必要があればそれも同様に確認して下さい
//         このファイルの設定項目の部分は特に弄らなくても問題ないですが、dat変換内容に気になる点がある場合は変更してみてください
//【コマンド】外部コマンドの設定→スクリプト→getdat.jsのパーミッションを初期値の「S」から「SF」に変更する
//【更新日時】2014/10/23 取得したDATのスレタイの転載禁止文字列を削除する機能の追加(95行目らへんo.sageteyonで設定可)
//            2014/10/17 VICHANtoDAT(8chan)の追加 ※vip板等でIDを取得できない 10/19追記:細かなバグ修正
//            2014/10/10 READCGItoDAT：取得不可＆BEアイコンが表示されない不具合の修正
//            2014/10/02 ふたば：2chanlogの過去ログ取得に再度対応 (サーバー復活したのでチェックしたら取得できなかったのでそれの修正) 10/9追記:Java6用バグ修正
//            2014/09/29 READCGItoDATにbbspinkを加えた。
//                       4chan : 国名表示(/int/板)、ID表示(/b/板)に対応。また、国名表示に関するいくつかの設定項目を追加
//            2014/08/04 READCGItoDATの追加 (2chスレのhtmlからdat変換)
//            2014/07/12 色々バグ修正。futalog差分取得機能の追加 7/13追記：ふたば通信負荷軽減, HTMLtoDATのバグ修正 7/14追記：futalog差分取得の修正
//            2014/07/11 4chanのスレタイ処理の修正
//            2014/07/02 コンソール出力を控えめに。futalogの本文のゴミ削除 7/10追記：futalog ID取得出来ない部分修正
//            2014/06/23 1001以上取得できない不具合の修正
//            2014/06/12 ふたば：getFutalog取得時のAD削除
//            2014/05/29 ふたば：タイトルにスレ消滅時間を加えるか選択する設定項目の追加(406行らへん)
//                       4chan ：DAT取得できない不具合の修正。タイトル付き画像のURLが本文に追加されない不具合の修正
//            2014/05/18 ふたば：2chanlogから過去ログ取得を追加
//            2014/05/17 ふたば：そうだね機能に対応(更新時、新着レスがある場合だけそうだね数が更新されます）
//            2014/04/20 ふたば：futalogでの取得時>>1の画像が常にサムネイルサイズになる不具合を修正した
//            2014/04/11 爆サイ：携帯絵文字でV2Cの2ch閲覧時と同様に対応フォントがあれば表示できるように変更。(設定項目でmsgkwでの絵文字アイコン表示に戻せます)
//                       爆サイ：アンカーズレの修正
//            2014/03/28 may、imgのふたばスレが消滅した場合futalogからDAT変換を試みるようにした。使いたくない場合は設定項目で変更できる
//                       大きい画像がfutalogから取得できなかった場合は小さいサムネイルURLで表示するようにした
//            2014/03/05 2ch、bbspink以外のsrc,dst定義が出来ない不具合の修正、mimizun(まちBBS)サービスの追加
//            2014/02/24 ふたばログ読み込み時にスレ消滅時間をタイトルと>>1に表示するようにした
/* TIPS:
ふたばdatのスレ移動リンクはReplaceStr.txtに
<rx2>(?:&#x68;|h)?t?t?p://(\w+).2chan.net/(\w+)/res/(\d+).htm	$0<br>└( http://$1.2chan.net/test/read.cgi/$2/1$3/ )	msg
の１行追加で移動できるようになります
*/
//【スクリプト】
// getdat.jsの設定用サブフォルダ(V2C/script/system/getdat/)
var scriptSubDir = new java.io.File(v2c.saveDir + '/script/system/getdat');

var opt = {};
setopt(opt);

// -----------------------------設定項目-----------------------------------

/* ■DAT変換定義について
  全部使うと遅いので必要な項目だけコメント(行頭の//のこと)を外すこと
  外部から2ch対応datを取得する場合の記述例
    { name: '表示名', src: new RegExp("正規表現"), dst: "置換パターン" },
  2ch非対応のHTMLからdatに変換して取得する場合の記述例
    { name: '表示名', obj: new DAT変換用のクラス() },
   ----
   name = スクリプトコンソール出力時の表示名
   src  = 2chスレURLの正規表現
   dst  = srcの正規表現の置換パターン
   obj  = DAT変換用のクラス
    HTMLtoDAT(prmファイルのパス)        htmltodat.exeを使用してDAT変換する
    HTMLtoDAT(prmファイルのパス, true)  本スクリプト上でprmファイルを読み込んでhtmltodat.exeをエミュレートしexeの使えないwin以外のOSに対応する
    LOGSOKUtoDAT()                      ログ速HTMLからDAT変換する
    READCGItoDAT))                      2ch＆bbspink公式のhtmlからDAT変換する
    FUTABAtoDAT()                       ふたば☆ちゃんねるログをDAT変換する
    BAKUSAItoDAT()                      爆サイログをDAT変換する
    B4CHANtoDAT()                       4chanログをDAT変換する
    VICHANtoDAT(ホスト名)               vichan式BBSのログをDAT変換する(8chan)
*/

// [設定項目] htmltodatのフォルダパスを指定 (フォルダの区切りは「 \\ 」ではなく「 / 」で、末尾のも「 / 」を記入すること)
var htmltodatDir = v2c.saveDir + '/htmltodat0.9.0/';

// [設定項目] DAT変換、取得定義
var services = [
  { name: 'B4CHANtoDAT', obj: new B4CHANtoDAT()},
  { name: 'BAKUSAItoDAT', obj: new BAKUSAItoDAT()},
  { name: 'FUTABAtoDAT', obj: new FUTABAtoDAT()},
  { name: 'READCGItoDAT', obj: new READCGItoDAT()},
  { name: 'VICHANtoDAT (8chanJP)', obj: new VICHANtoDAT('jp.8chan.co')},
//  { name: 'VICHANtoDAT (8chanEN)', obj: new VICHANtoDAT('8chan.co')},
//  { name: 'offlaw2', src: new RegExp("^^http://([^/]+)/test/[^/]+/(\\w+)/(\\d+).*"), dst: "http://$1/test/offlaw2.so?shiro=kuma&bbs=$2&key=$3" },
  { name: 'mimizun', src: new RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(\\d+).*"), dst: "http://mimizun.com/log/2ch/$2/$3.dat" },
  { name: 'logsoku (LOGSOKUtoDAT)', obj: new LOGSOKUtoDAT() },
//  { name: 'unkar'  , src: new RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(\\d+).*"), dst: "http://unkar.org/convert.php/$2/$3/" },
//  { name: 'logsoku (htmltodat CompatibleMode)', obj: new HTMLtoDAT(htmltodatDir + 'ログ速.prm', true) },
//  { name: 'logsoku (htmltodat)', obj: new HTMLtoDAT(htmltodatDir + 'ログ速.prm') },
//  { name: '暇つぶし2ch', obj: new HTMLtoDAT(htmltodatDir + '暇つぶし2ch.prm', true) },
    /* --- 以下は動作不可のモノ ----------------- */
//  { name: 'mimizun (まちBBS)', src: new RegExp("^http://([^\\.]+)\\.machi\\.to/bbs/[^/]+/(\\w+)/(\\d+).*"), dst: "http://mimizun.com/log/machi/$2/$3.dat" },
//  { name: 'ヴァルタ', src: new RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(((\\d+)\\d)\\d{5}).*"), dst: "http://varda2.com/log/2ch/$2/$1/$2/kako/$5/$4/$3.dat" },
];

// -----------------------------設定項目 その他-----------------------------------
function setopt(o) {

// [設定項目 スレタイの転載禁止文字列を削除するならtrue、削除しないならfalse
o.sageteyon = true;

// [設定項目] may、imgの場合futalog.comから取得を試みる (※既得レスの画像URL等がfutalog形式に変化します。)
o.isFutalog = true;  // 取得するならtrue、取得しないならfalse。

// [設定項目] 二次元裏の場合2chanlog.netから取得を試みる (※既得レスの画像URL等が2chanlog形式に変化します。)(※取得優先順位は futaba > 2chanlog > futalog です)
o.is2chanlog = true;

// [設定項目] ふたばスレ取得済みでふたばスレが消滅していた場合、futalogの差分取得をする(falseなら常に全レス取得)
o.isDiffReadFutalog = true;

// [設定項目] ふたばDAT変換で"そうだね"を表示するならtrue、しないならfalse。
o.isSod = true;

// [設定項目] 爆サイの絵文字表示で、msgkw.txtのアイコンではなくフォントの絵文字を使用する(携帯絵文字に対応しているフォントが必要ですmeiryo-aar等)
o.emojiIconDisabled = true;  // フォントならtrue、msgkwならfalse。

// [設定項目] ふたばスレのタイトルにスレ消滅時間を加える場合はtrue、タイトルを変更したくない場合はfalse。
o.withLimit = false;

// [設定項目] 4chan /int/板および8chanの国名表示にメール蘭を利用する
o.flagPutMail = false;

// [設定項目] 4chan /int/板および8chanの国名日本語置換テーブル
o.flagJpTable = {
	enabled : true,  // 英語のままならfalse,日本語ならtrueを指定

	/* ------- 国名日本語置換テーブル ここから ------ */
	"Andorra" : "アンドラ",
	"United Arab Emirates" : "アラブ首長国連邦", 
	"Afghanistan" : "アフガニスタン", 
	"Antigua and Barbuda" : "アンチグアバーブーダ", 
	"Anguilla" : "アングィラ", 
	"Albania" : "アルバニア", 
	"Armenia" : "アルメニア", 
	"Netherlands Antilles" : "オランダ領アンティル", 
	"Angola" :     "アンゴラ", 
	"Antarctica" : "南極大陸", 
	"Argentina" : "アルゼンチン", 
	"American Samoa" : "米サモア", 
	"Austria" : "オーストリア", 
	"Australia" : "オーストラリア", 
	"Aruba" :     "アルバ", 
	"Aland Islands" : "オーランド諸島", 
	"Azerbaijan" : "アゼルバイジャン", 
	"Bosnia and Herzegovina" : "ボスニア・ヘルツェゴビナ", 
	"Barbados" : "バルバドス", 
	"Bangladesh" : "バングラデシュ", 
	"Belgium" : "ベルギー", 
	"Burkina Faso" : "ブルキナファソ", 
	"Bulgaria" : "ブルガリア", 
	"Bahrain" : "バーレーン", 
	"Burundi" : "ブルンジ", 
	"Benin" :     "ベナン", 
	"Saint-Barthelemy" : "サン・バルテルミー島",
	"Bermuda" : "バミューダ", 
	"Brunei Darussalam" : "ブルネイ",
	"Bolivia" : "ボリビア", 
	"Brazil" :     "ブラジル", 
	"Bahamas" : "バハマ", 
	"Bhutan" :     "ブータン", 
	"Bouvet Island" : "ブーヴェ島", 
	"Botswana" : "ボツワナ", 
	"Belarus" : "ベラルーシ", 
	"Belize" :     "ベリーズ", 
	"Canada" :     "カナダ", 
	"Catalonia" : "カタロニア",
	"Cocos Islands" : "ココス諸島", 
	"Congo" :     "コンゴ民主共和国", 
	"Central African Republic" : "中央アフリカ共和国", 
	"Congo" :     "コンゴ",
	"Switzerland" : "スイス", 
	"Cote dIvoire" : "コートジボワール", 
	"Cook Islands" : "クック諸島", 
	"Chile" :     "チリ", 
	"Cameroon" : "カメルーン", 
	"China" :     "中国", 
	"Colombia" : "コロンビア", 
	"Costa Rica" : "コスタリカ", 
	"Cuba" :     "キューバ", 
	"Cape Verde" : "カーボベルデ", 
	"Christmas Island" : "クリスマス島", 
	"Cyprus" :     "キプロス", 
	"Czech Republic" : "チェコ共和国", 
	"Germany" : "ドイツ", 
	"Djibouti" : "ジブチ", 
	"Denmark" : "デンマーク", 
	"Dominica" : "ドミニカ", 
	"Dominican Republic" : "ドミニカ共和国", 
	"Algeria" : "アルジェリア", 
	"Ecuador" : "エクアドル", 
	"Estonia" : "エストニア", 
	"Egypt" :     "エジプト", 
	"Western Sahara" : "西サハラ", 
	"England" : "イングランド",
	"Eritrea" : "エリトリア", 
	"Spain" :     "スペイン", 
	"Ethiopia" : "エチオピア", 
	"Finland" : "フィンランド", 
	"Fiji" :     "フィジー", 
	"Falkland Islands" : "フォークランド諸島",
	"Micronesia" : "ミクロネシア連邦", 
	"Faroe Islands" : "フェロー諸島", 
	"France" :     "フランス", 
	"Gabon" :     "ガボン", 
	"United Kingdom" : "イギリス", 
	"Grenada" : "グレナダ", 
	"Georgia" : "グルジア", 
	"French Guiana" : "仏領ギアナ", 
	"Guernsey" : "ガーンジー島", 
	"Ghana" :     "ガーナ", 
	"Gibraltar" : "ジブラルタル", 
	"Greenland" : "グリーンランド", 
	"Gambia" :     "ガンビア", 
	"Guinea" :     "ギニア", 
	"Guadeloupe" : "グアドループ島", 
	"Equatorial Guinea" : "赤道ギニア", 
	"Greece" :     "ギリシャ", 
	"South Georgia" : "サウスジョージア・サウスサンドウィッチ諸島",
	"Guatemala" : "グアテマラ", 
	"Guam" :     "グアム島", 
	"Guinea-Bissau" : "ギニアビサウ", 
	"Guyana" :     "ガイアナ", 
	"Hong Kong" : "香港",
	"Heard Island and Mcdonald Islands" : "ハード島・マクドナルド諸島", 
	"Honduras" : "ホンジュラス", 
	"Croatia" : "クロアチア", 
	"Haiti" :     "ハイチ", 
	"Hungary" : "ハンガリー", 
	"Indonesia" : "インドネシア", 
	"Ireland" : "アイルランド", 
	"Israel" :     "イスラエル", 
	"Isle of Man" : "マン島", 
	"India" :     "インド", 
	"British Indian Ocean Territory" : "イギリス領インド洋地域", 
	"Iraq" :     "イラク", 
	"Iran" :     "イラン", 
	"Iceland" : "アイスランド", 
	"Italy" :     "イタリア", 
	"Jersey" :     "ジャージー", 
	"Jamaica" : "ジャマイカ", 
	"Jordan" :     "ヨルダン", 
	"Japan" :     "日本", 
	"Kenya" :     "ケニア", 
	"Kyrgyzstan" : "キルギスタン", 
	"Cambodia" : "カンボジア", 
	"Kiribati" : "キリバス", 
	"Comoros" : "コモロ", 
	"Saint Kitts and Nevis" : "セントクリストファー・ネイビス", 
	"North Korea" : "北朝鮮",
	"South Korea" : "韓国",
	"Kuwait" :     "クウェート", 
	"Cayman Islands" : "ケイマン諸島", 
	"Kazakhstan" : "カザフスタン", 
	"Lao PDR" : "ラオス", 
	"Lebanon" : "レバノン", 
	"Saint Lucia" : "セントルシア", 
	"Liechtenstein" : "リヒテンシュタイン", 
	"Sri Lanka" : "スリランカ", 
	"Liberia" : "リベリア", 
	"Lesotho" : "レソト", 
	"Lithuania" : "リトアニア", 
	"Luxembourg" : "ルクセンブルグ", 
	"Latvia" :     "ラトビア", 
	"Libya" :     "リビア", 
	"Morocco" : "モロッコ", 
	"Monaco" :     "モナコ", 
	"Moldova" : "モルドバ", 
	"Montenegro" : "モンテネグロ", 
	"Saint-Martin" : "サン・マルタン",
	"Madagascar" : "マダガスカル", 
	"Marshall Islands" : "マーシャル諸島", 
	"Macedonia, Republic of" : "マケドニア共和国", 
	"Mali" :     "マリ", 
	"Myanmar" : "ミャンマー", 
	"Mongolia" : "モンゴル国", 
	"Macao" :     "マカオ", 
	"Northern Mariana Islands" : "北マリアナ諸島連邦", 
	"Martinique" : "マルティニーク島", 
	"Mauritania" : "モーリタニア", 
	"Montserrat" : "モントセラト", 
	"Malta" :     "マルタ", 
	"Mauritius" : "モーリシャス", 
	"Maldives" : "モルディブ", 
	"Malawi" :     "マラウイ", 
	"Mexico" :     "メキシコ", 
	"Malaysia" : "マレーシア", 
	"Mozambique" : "モザンビーク", 
	"Namibia" : "ナミビア", 
	"New Caledonia" : "ニューカレドニア", 
	"Niger" :     "ニジェール", 
	"Norfolk Island" : "ノーフォーク島", 
	"Nigeria" : "ナイジェリア", 
	"Nicaragua" : "ニカラグア", 
	"Netherlands" : "オランダ", 
	"Norway" :     "ノルウェー", 
	"Nepal" :     "ネパール", 
	"Nauru" :     "ナウル", 
	"Niue" :     "ニウエ", 
	"New Zealand" : "ニュージーランド", 
	"Oman" :     "オマーン", 
	"Panama" :     "パナマ", 
	"Peru" :     "ペルー", 
	"French Polynesia" : "フランス領ポリネシア", 
	"Papua New Guinea" : "パプアニューギニア",
	"Philippines" : "フィリピン", 
	"Pakistan" : "パキスタン", 
	"Poland" :     "ポーランド", 
	"Saint Pierre and Miquelon" : "サンピエールミクロン", 
	"Pitcairn" : "ピトケアン", 
	"Puerto Rico" : "プエルトリコ", 
	"Palestinian Territory" : "被パレスチナ占領地域",
	"Portugal" : "ポルトガル", 
	"Palau" :     "パラオ", 
	"Paraguay" : "パラグアイ", 
	"Qatar" :     "カタール", 
	"Reunion" : "レユニオン", 
	"Romania" : "ルーマニア", 
	"Serbia" :     "セルビア", 
	"Russian Federation" : "ロシア連邦", 
	"Rwanda" :     "ルワンダ", 
	"Saudi Arabia" : "サウジアラビア", 
	"Scotland" : "スコットランド",
	"Solomon Islands" : "ソロモン諸島", 
	"Seychelles" : "セイシェル", 
	"Sudan" :     "スーダン", 
	"Sweden" :     "スウェーデン", 
	"Singapore" : "シンガポール", 
	"Saint Helena" : "セントヘレナ島", 
	"Slovenia" : "スロベニア", 
	"Svalbard and Jan Mayen Islands" : "スバールバル諸島とヤンマイエン島", 
	"Slovakia" : "スロバキア", 
	"Sierra Leone" : "シエラレオネ", 
	"San Marino" : "サンマリノ", 
	"Senegal" : "セネガル", 
	"Somalia" : "ソマリア", 
	"Suriname" : "スリナム",
	"South Sudan" : "南スーダン", 
	"Sao Tome and Principe" : "サントメプリンシペ", 
	"El Salvador" : "エルサルバドル", 
	"Syrian Arab Republic" : "シリア",
	"Swaziland" : "スワジランド", 
	"Turks and Caicos Islands" : "タークスカイコス諸島", 
	"Chad" :     "チャド", 
	"French Southern Territories" : "フランス南部領", 
	"Togo" :     "トーゴ", 
	"Thailand" : "タイ", 
	"Tajikistan" : "タジキスタン", 
	"Tokelau" : "トケラウ諸島", 
	"Timor-Leste" : "東ティモール", 
	"Turkmenistan" : "トルクメニスタン", 
	"Tunisia" : "チュニジア", 
	"Tonga" :     "トンガ", 
	"Turkey" :     "トルコ", 
	"Trinidad and Tobago" : "トリニダード・トバゴ",
	"Tuvalu" :     "ツバル", 
	"Taiwan" :     "台湾",
	"Tanzania" : "タンザニア",
	"Ukraine" : "ウクライナ", 
	"Uganda" :     "ウガンダ", 
	"United States Minor Outlying Islands" :"アメリカ合衆国外諸島",  
	"United States" : "アメリカ合衆国", 
	"Uruguay" : "ウルグアイ", 
	"Uzbekistan" : "ウズベキスタン", 
	"Holy See" : "ローマ法王庁",
	"Saint Vincent and Grenadines" : "セントビンセントおよびグレナディーン諸島", 
	"Venezuela" : "ベネズエラ",
	"British Virgin Islands" : "英領ヴァージン諸島", 
	"Virgin Islands" : "米領バージン諸島", 
	"Viet Nam" : "ベトナム", 
	"Vanuatu" : "バヌアツ", 
	"Wallis and Futuna Islands" : "ウォリス・フツナ諸島", 
	"Samoa" :     "サモア諸島", 
	"Yemen" :     "イエメン", 
	"Mayotte" : "マヨット島", 
	"South Africa" : "南アフリカ", 
	"Zambia" :     "ザンビア", 
	"Zimbabwe" : "ジンバブエ",

	/* ------- 国名日本語置換テーブル ここまで ------- */
};

}
// -----------------------------設定項目ここまで---------------------------

// ◆Utilities

function printlnLog(format /*, ...*/)
{
	var args = arguments;
	var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1]; });

	v2c.println("[getdat.js] " + message);
};
function getFormatString(/*format, ...*/)
{
	var args = (arguments[0] instanceof Array)? arguments[0] : arguments;
	return String(args[0]).replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1]; });
};
function isProcessRunning(processName)
{
	var cnt = 0;
	try {
		var runtime = java.lang.Runtime.getRuntime();
		var p;
		var OS = java.lang.System.getProperty("os.name").toLowerCase();
		if (OS.indexOf('win') >= 0) {
			p = runtime.exec(['cmd.exe', '/c', 'tasklist | findstr "' +processName + '"']);
		} else {
			p = runtime.exec(['/bin/sh', '-c', 'ps ux | pgrep -lf "' + processName + '"']);
		}
		var is = p.getInputStream();
		var isr = new java.io.InputStreamReader(is);
		var br = new java.io.BufferedReader(isr);
		while (br.readLine()) { cnt++; }
		
		br.close();
		isr.close();
		is.close();
	} catch (e) {
		if (e.javaException) {
			printlnLog('プロセス名の取得に失敗しました。 ({0})', e.javaException);
		} else {
			printlnLog('プロセス名の取得に失敗しました。 (e={0})', e);
		}
	}
	return (cnt)? true : false;
};
function getThreadLog(url)
{
	if (!url) {
		return null;
	}
	var req = v2c.createHttpRequest(url);
	req.setRequestProperty('Accept-Encoding', 'gzip');
	var content = req.getContentsAsString();
	if (req.responseCode==200 || req.responseCode==302) {
		if (req.responseCode == 302) {
			var newUrl = req.getResponseHeader('Location');
			content = v2c.readURL(newUrl);
		}
	} else {
		return null;
	}

	if(!content) {
		return null;
	}

	return content;
};

function getEndTag(html, startIdx, tagName) {
	var sTag = '<' + tagName;
	var eTag = '</' + tagName + '>';
	html = String(html);
	var loopcount = 5000;
	var traverse = function(gen, idx)
	{
		var t1 = -1, t2 = -1;
		if (--loopcount < 0) {
			v2c.println('[getEndTag():Error] ループ回数の最大値を超えたので中断します。');
			return -1;
		}
		
		t1 = html.indexOf(sTag, idx);
		t2 = html.indexOf(eTag, idx);
		
		if (t1 < t2 && t1 != -1)
			idx = traverse(++gen, t1 + sTag.length);
		else if (t2 != -1) {
			if (--gen > 0)
				idx = traverse(gen, t2 + eTag.length);
			else
				idx = t2 + eTag.length;
		} else {
			v2c.println('[getEndTag():Error] エンドタグを辿れませんでした');
			return -1;
		}
		return idx;
	}
	return traverse(0, startIdx);
};

HTMLParser.prototype.getEndTag = getEndTag;
function HTMLParser()
{
	var self = this;
	var doc  = arguments[0] || '';
	this.index = 0;
	this.endIndex = doc.length;

	this.getHtml = function() { return doc; };
	this.setHtml = function(v) {
		doc = v;
		self.index = 0;
		self.endIndex = doc.length;
	};
	this.ParseInnerHtml = function(tagName) {
		var stag = '<' + tagName;
		var etag = '</' + tagName + '>';
		var idx = doc.indexOf(stag, self.index);
		if (idx == -1) {
			return null;
		}
		var idx2 = self.getEndTag(doc, idx, tagName);
		if (idx2 == -1) {
			return null;
		}
		self.index = idx2;
		idx2 -= etag.length;
		idx += stag.length;
		for (idx = doc.indexOf('>', idx); doc[idx - 1] == '\\'; idx++) {
			idx = doc.indexOf('>', idx);
		}
		return doc.substring(idx, idx2);
	};
	this.Parse = function(startkey, endkey /* isStartKey = false, isEndKey = false, noMove = false */)
	{
		var ret = '';
		var ix1,ix2;
		var isStartKey = arguments[2] || false;
		var isEndKey   = arguments[3] || false;
		var noMove     = arguments[4] || false;
		
		if (-1 == (ix1 = doc.indexOf(startkey, self.index)))
			return ret;
		if (!isStartKey)
			ix1 += startkey.length;
		
		if (-1 == (ix2 = doc.indexOf(endkey, ix1)))
			return ret;
			
		if (isEndKey)
			ix2 += endkey.length;

		if (ix2 > self.endIndex)
			return ret;
		
		ret = doc.substring(ix1, ix2);
		if (!noMove)
			self.index = ix2;
		return ret;
	};
	this.ParseLine = function()
	{
		var ret = '';
		var end = doc.indexOf('\n', self.index);
		if ((end > 0) && (end <= self.endIndex)) {
			ret = doc.substring(self.index, end);
			self.index = end;
		}
		return ret;
	};
	this.ParseShift = function(startkey, endkey)
	{
		var ret = self.Parse(startkey, endkey);
		self.Shift();
		return ret;
	};
	this.Shift = function()
	{
		doc = doc.substr(self.index);
		self.endIndex -= self.index;
		self.index = 0;
	};
	this.MoveNext = function(key, endIdxKey /* isStartKey = false, isEndKey = false */)
	{
		var isStartKey = arguments[2] || false;
		var isEndKey   = arguments[3] || false;
		var ix1, ix2;
		if ((ix1 = doc.indexOf(key, self.index)) == -1)
			return false;
		if (!isStartKey)
			ix1 += key.length;
		if ((ix2 = doc.indexOf(endIdxKey, ix1)) == -1)
			return false;
		if (ix1 == ix2)
			return false;
		
		self.index = ix1;
		if (isEndKey)
			self.endIndex = ix2;
		return self.index;
	};
	this.Cut = function(startkey, endkey)
	{
		self.index = doc.indexOf(startkey, self.index) + startkey.length;
		doc = doc.substring(self.index, doc.lastIndexOf(endkey));
		self.index = 0;
		self.endIndex = doc.length;
		return doc;
	};
};

function convDate(utctime)
{
	if (utctime == null) { return '1900/01/01(月) 00:00:00'; }
	var weeks = new Array("日","月","火","水","木","金","土");
	var dd = new Date();
	dd.setTime(parseInt(utctime) * 1000);
	var yy = dd.getYear();
	var mm = dd.getMonth() + 1;
	var hh = dd.getHours();
	var mi = dd.getMinutes();
	var se = dd.getSeconds();
	dy = dd.getDate();
	if (yy < 2000) { yy -= 100 }
	if (mm < 10) { mm = '0' + mm; }
	if (dy < 10) { dy = '0' + dy; }
	if (hh < 10) { hh = '0' + hh; }
	if (mi < 10) { mi = '0' + mi; }
	if (se < 10) { se = '0' + se; }
	return yy + '/' + mm + '/' + dy + '(' + weeks[dd.getDay()] + ') ' + hh + ':' + mi + ':' + se;
};

function removeSageteyon(title)
{
	var re = /\[転載禁止\] (.+)&copy;2ch\.net\t(.*?)/;
	return (opt.sageteyon) ? title.replace(re, '$1$2') : title;
};

//◆Scrapies

//=============================================================
// ■4chan
//=============================================================
B4CHANtoDAT.prototype.printlnLog = printlnLog;
B4CHANtoDAT.prototype.HTMLParser = HTMLParser;
B4CHANtoDAT.prototype.getThreadLog = getThreadLog;
B4CHANtoDAT.prototype.convDate = convDate;
function B4CHANtoDAT()
{
	var self = this;
	this.flagPutMail = opt.flagPutMail;
	this.flagJpTable = opt.flagJpTable;
	this.getURL = function(thread)
	{
		var s1 = String(thread.url.toString());
		var s2 = s1.replace(/http:\/\/boards\.4chan\.org\/test\/read\.cgi\/(\w+)\/(\d+)\//, function(a, g1, g2) {
			var add = 1000000000;
			return 'http://boards.4chan.org/' + g1 + '/res/' + (parseInt(g2) - add);
		});
		return (s2 != s1) ? s2 : '';
	};
	
	this.exec = function(thread)
	{
		var url = self.getURL(thread);
		if (!url) { return ''; }
		var html = null;
		html = self.getThreadLog(url);
		if (!html) { self.printlnLog('4chanログが取得できませんでした。'); return ''; }
		var dat = new java.lang.StringBuilder();
		var parser = new self.HTMLParser(String(html));
		var matches = [];
		
		var cutKey    = {start:'<div class="board">', end:'</div><hr><div class="navLinks'};
		var postOpKey = {start:'class="postContainer opContainer"', end:'</blockquote></div></div>'};
		var resKey    = {start:'class="postContainer replyContainer"', end:'</blockquote></div></div>'};
		
		var rImgKey  = {start:'File: <a ', end:'target="_blank">'}; //無い場合もあるのでindexを戻す
		var rSubKey   = {start:'<span class="subject">', end:'</span>'};
		var rMailKey  = {start:'<class="useremail" href="', end:'">'}; //無い場合もあるのでindexを戻す
		var rNameKey  = {start:'<span class="name">', end:'</span>'};
		var rIntKey   = {start:'<span title="', end:'" class="flag'};
		var rDateKey  = {start:'<span class="dateTime" data-utc="', end:'">'};
		var rNoKey    = {start:'javascript:quote(\'', end:'\');'};
		var rIdKey    = {start:'posteruid id_', end:'">(ID: '};
		var rMesKey   = {start:'class="postMessage"', end:'</blockquote>'};
		var tagRegex  = /<(?:wbr|span|\/span)("[^"]*"|'[^']*'|[^'">])*>/g;
		var rImgRegex = /href="([^"]+)"/i;
		var anchorRegex = /<a href="[^"]+"[^>]+>&gt;&gt;(\d+)<\/a>/g;
		var idarry = {};
		var cnt = 1;
		var flagSplitStr = '＠';
		
		parser.Cut(cutKey.start, cutKey.end);
		
		var res;
		var tk = postOpKey;
		while (res = parser.Parse(tk.start, tk.end, false, true)) {
			if (v2c.interrupted) { return ''; }
			var pTitle, rSub, rName, rInt, rId, rMail, rDate, rMes, rNo, rImg = '';
			var tmp = new HTMLParser(res);
			var idx = tmp.index;
			rImg = tmp.Parse(rImgKey.start, rImgKey.end).match(rImgRegex);
			rImg = (rImg)? rImg[1] : '';
			tmp.index = idx;
			rSub = tmp.Parse(rSubKey.start, rSubKey.end);
			idx = tmp.index;
			rMail= tmp.Parse(rMailKey.start, rMailKey.end);
			if (rMail == null || rMail.length <= 0)
				tmp.index = idx;
			rName= tmp.Parse(rNameKey.start, rNameKey.end);
			idx = tmp.index;
			rInt = tmp.Parse(rIntKey.start, rIntKey.end);
			tmp.index = idx;
			rId = tmp.Parse(rIdKey.start, rIdKey.end);
			tmp.index = idx;
			rDate = self.convDate(tmp.Parse(rDateKey.start, rDateKey.end));
			rNo  = tmp.Parse(rNoKey.start, rNoKey.end);
			idarry[rNo] = cnt++;
			rMes = tmp.Parse(rMesKey.start + ' id="m' + rNo + '">', rMesKey.end);
			rMes = rMes.replace(tagRegex, '').replace(/<br\s*?\/>/g, '<br>').replace(anchorRegex, function(a, g1) {
				if (idarry[g1]) {
					return '<a href="' + thread.url.toString() + idarry[g1] + '" target="_blank">&gt;&gt;' + idarry[g1] + '</a>';
				}
				return a;
			});
			if (rImg.length > 0)
				rMes += '<br> http:' + rImg;
			if (rId)
				rDate += ' ID:' + rId;
			if (rInt) {
				if (self.flagJpTable.enabled && (rInt in self.flagJpTable)) {
					rInt = self.flagJpTable[rInt];
				}
				if (self.flagPutMail)
					rMail += rInt;
				else
					rName += flagSplitStr + rInt;
			}
			if (tk == postOpKey) {
				pTitle = (rSub && rSub.length > 0) ? rSub + ': ' + rMes.substr(0, 64) : rMes.substr(0, 64);
				pTitle = pTitle.split('<br>').join(' ');
				dat.append(rName + '<>' + rMail + '<>' + rDate + ' No.' + rNo + '<> ' + rMes + ' <>' + pTitle + '\n');
				tk = resKey;
				continue;
			}
			dat.append(rName + '<>' + rMail + '<>' + rDate + ' No.' + rNo + '<> ' + rMes + ' <>\n');
		}
		return dat.toString();
	};
}

//=============================================================
// ■vichan (8chan)
//=============================================================
VICHANtoDAT.prototype.printlnLog = printlnLog;
VICHANtoDAT.prototype.HTMLParser = HTMLParser;
VICHANtoDAT.prototype.getThreadLog = getThreadLog;
VICHANtoDAT.prototype.convDate = convDate;
function VICHANtoDAT(host) {
	var self = this;
	this.flagPutMail = opt.flagPutMail;
	this.flagJpTable = opt.flagJpTable;
	this.countrySplitStr = '＠';
	this.getURL = function(thread)
	{
		var s1 = String(thread.url.toString());
		var re = new RegExp('http://' + host + '/test/read.cgi/(\\w+)/(\\d+)/');
		var s2 = s1.replace(re, function(a, g1, g2) {
			var add = 1000000000;
			return 'http://' + host + '/' + g1 + '/res/' + (parseInt(g2) - add) + '.json';
		});
		return (s2 != s1) ? s2 : '';
	};

	this.exec = function(thread)
	{
		var url = self.getURL(thread);
		if (!url) { return ''; }
		var json = self.getThreadLog(url);
		if (!json) { self.printlnLog(host + 'ログが取得できませんでした。'); return ''; }
		json = eval('(function() { return ' + json + '})();');
		if (!json) { self.printlnLog('不明なフォーマットです。 ({0})\n 詳細：\n{1}', host, json); return ''; }

		var posts = json['posts'];
		var dat = new java.lang.StringBuilder();
		
		var tagRegex  = /<(?:\/?a|wbr|\/?span)("[^"]*"|'[^']*'|[^'">])*>/g;
		var anchorRegex = /&gt;&gt;(\d+)/g;
		var idarry = {};

		for (var i = 0; i < posts.length; i++) {
			
			var res = posts[i];
			var rName = res["name"] || '';
			var rDate = self.convDate(res["time"] || '');
			var rMail = res["email"] || '';
			var country = res["country_name"] || '';
			if (country) {
				if (self.flagJpTable.enabled && (country in self.flagJpTable)) {
					country = self.flagJpTable[country];
				}
				if (self.flagPutMail)
					rMail += country;
				else
					rName += self.countrySplitStr + country;
			}
			var rNo = res["no"] || '';
			idarry[rNo] = i + 1;
			var rMes = res["com"] || '';
			rMes = rMes.replace(tagRegex, '').replace(/<br\s*?\/>/g, '<br>').replace(anchorRegex, function(a, g1) {
				if (idarry[g1]) {
					return '<a href="' + thread.url.toString() + idarry[g1] + '" target="_blank">&gt;&gt;' + idarry[g1] + '</a>';
				}
				return a;
			});

			dat.append(rName + '<>' + rMail + '<>' + rDate + ' No.' + rNo + '<> ');
			
			var title = '';
			if (res["resto"] == 0) {
				var sub = res["sub"] || '';
				if (res["country"]) {
					title = '[' + res["country"] + ']';
				}
				var sub2 = rMes.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
				title += (sub && sub.length > 0) ? sub + ': ' + sub2.substr(0, 64) : sub2.substr(0, 64);
			}
			
			if (res["filename"])
				rMes += '<br> http://' + host + '/' + thread.board.key + '/src/' + res["filename"] + res["ext"];

			dat.append(rMes + ' <>' + title + '\n');
		}
		return dat.toString();
	};
};

//=============================================================
// ■爆サイ
//=============================================================
function BAKUSAItoDAT()
{
	var self = this;
	this.emojiIconDisabled = opt.emojiIconDisabled;
	this.getURL = function(thread)
	{
		var s1 = String(thread.url.toString());
		var s2 = s1.replace(/http:\/\/bakusai\.com\/test\/read\.cgi\/a(\d+)c(\d+)b(\d+)\/(\d+).*/, 'http://bakusai.com/thr_res/acode=$1/ctgid=$2/bid=$3/tid=$4/rw=1/');
		return (s2 != s1) ? s2 : '';
	};
	
	this.exec = function(thread)
	{
		var url = this.getURL(thread);
		if (!url) { return ''; }
		var page = 1;
		var lines = [];
		var dat = new java.lang.StringBuilder();
		if (/(a\d+c\d+b\d+\/\d+)/i.exec(thread.url.toString())) {
			var data = v2c.readLinesFromFile(v2c.saveDir + '/log/bakusai.com/' + RegExp.$1 + '.dat');
			if (data) {
				page = parseInt((data.length + 29) / 30);
				if (page > 1) {
					lines = data.slice(0, ((page - 1) * 30 + 1));
					dat.append(lines.join('\n') +'\n');
				}
			}
		}
		var title = '';
		var topMes, topDate, topMail, topName;
		var titleRegex = /<div id="title_thr"><strong>([^<]*)<\/strong><\/div>/;
		var topMesRegex = /<div id="title_thr"><h2>([\S\s]*?)<\/h2>.*\[(?:<a href="mailto:([^"]+)">)?(?:<span class="[^"]+">)?([^<\]]*)?(?:<\/span><\/a>)?(◆\S{8})?/;
		var thDateRegex = /<span class="posts">([^<]+)<\/span>/;
		var mesRegex = /<div class="article">.*?&nbsp;(?:<span>([^<]+)<\/span>)?.*?class="resbo(?:[^>]+)>([\s\S]*?)(?:<\/span><\/dd>|<\/div><br \/>.*?(?:<dd class="name">)?\[(?:<a href="mailto:([^"]+)">)?(?:<span class="[^"]+">)?([^<\]]*)?(?:<\/span><\/a>)?(◆\S{8})?)/g;
		var linkRegex = /<a href="\/thr(_res)?_show\/acode=\d+\/(?:ctgid=\d+\/)?bid=\d+\/tid=\d+\/(?:rrid=(\d+)\/)?"/g;
		var directRegex = /<a href="http:\/\/bakusai\.com\/thr_res\/acode=(\d+)\/ctgid=(\d+)\/bid=(\d+)\/tid=(\d+)\/(?:rrid=\d+\/)?" target="_blank">[^<]+<\/a>/g;
		var emojiRegex = /<img src="http:\/\/img2\.bakusai\.com\/p\/pictograms\/[a-zA-Z]\/([a-zA-Z0-9]+)\.gif"[^>]+>/g;
		var anchorRegex = /(?:&gt;){2}([0-9,\-]+)/g;
		var initialized = false;
		
		function getWeek(d)
		{
		
			var weeks = new Array("日","月","火","水","木","金","土");
			var days = d.split(' ');
			return days[0] + '(' + weeks[(new Date(days[0])).getDay()] + ') ' + days[1];
		}
		
		var replinkFunc = function(a, g1, g2) {
			if (g2) {
				return '<a href="' + thread.url.toString() + g2 + '"';
			} else {
				return '<a href="' + thread.url.toString() + '"';
			}
		};
		
		var emojiFunc = function(a, g1) {
			if (self.emojiIconDisabled) {
				var num = parseInt(g1, 16);
				if (isNaN(num))
					return '';
				else
					return '&#' + num + ';';
			} else {
				return '&#x' + g1.toLowerCase() + ';';
			}
		};
		
		var directFunc = function(a, g1, g2, g3, g4) {
			var add = 1000000000;
			var k = parseInt(g4) + add;
			return 'http://bakusai.com/test/read.cgi/a' + g1 + 'c' + g2 + 'b' + g3 + '/' + k + '/';
		};
		
		var anchorInclementFunc = function(g1, m1) {
			return '&gt;&gt;' + m1.replace(/\d+/g, function(g1) { return parseInt(g1) + 1; });
		};

		url = String(url).replace(/(.*)tid=(\d+)(.*)/, function(a, g1, g2, g3) {
			var add = 1000000000;
			return g1 + 'tid=' + (parseInt(g2) - add) + g3;
		});
		while (1) {
			if (v2c.interrupted)
				return '';
			var html = v2c.readURL(url + '/p=' + page + '/');
			var matches = [];

			if (!initialized) {
				title = (matches = titleRegex.exec(html)) ? matches[1] : '';
				topDate = (matches = thDateRegex.exec(html)) ? getWeek(matches[1]) : '';
				if (matches = topMesRegex.exec(html)) {
					topMes = (matches[1]) ? matches[1].split('\r\n').join('').split('\n').join('').replace(linkRegex, replinkFunc).replace(emojiRegex, emojiFunc) : '';
					topMes = topMes.replace(directRegex, directFunc);
					topMail = (matches[2]) ? matches[2] : '';
					topName = (matches[3]) ? matches[3] : '';
					topName = (matches[4]) ? matches[3] + matches[4]
					                       : (matches[3]) ? matches[3] : '';
				}
				dat.append(topName + '<>' + topMail + '<>' + topDate + ' ID:???<> ' + topMes + ' <>' + title + '\n');
				initialized = true;
			}
			html = (matches = /<dl id="res_list">([\s\S]*?)<\/dl>/.exec(html)) ? matches[1] : '';
			if (!html) { return ''; }
			if (html.indexOf('<div style="margin:20px 0;">まだ投稿がありません</div>') >= 0)
				break;

			while (matches = mesRegex.exec(html)) {
				var rDate = (matches[1]) ? getWeek(matches[1]) : '';
				var rMes  = (matches[2]) ? matches[2].split('\r\n').join('').split('\n').join('').replace(linkRegex, replinkFunc).replace(emojiRegex, emojiFunc) : '';
				rMes = rMes.replace(directRegex, directFunc).replace(anchorRegex, anchorInclementFunc);
				var rMail = (matches[3]) ? matches[3] : '';
				var rName = (matches[5]) ? matches[4] + matches[5]
				                         : (matches[4]) ? matches[4] : '';
				dat.append(rName + '<>' + rMail + '<>' + rDate + ' ID:???<> ' + rMes + ' <>\n');
			}
			
			page = page + 1;
		}
		return  dat.toString();
	}
}

//=============================================================
// ■ふたば☆ちゃんねる
//=============================================================
FUTABAtoDAT.prototype.printlnLog = printlnLog;
FUTABAtoDAT.prototype.HTMLParser = HTMLParser;
FUTABAtoDAT.prototype.getThreadLog = getThreadLog;
function FUTABAtoDAT()
{
	var self = this;
	this.isFutalog = opt.isFutalog;
	this.is2chanlog = opt.is2chanlog;
	this.isDiffReadFutalog = opt.isDiffReadFutalog;
	this.isSod = opt.isSod;
	this.withLimit = opt.withLimit;
	this.getURL = function(thread)
	{
		var s1 = String(thread.url.toString());
		var s2 = s1.replace(/http:\/\/(.+\.2chan\.net)\/test\/read\.cgi\/(\w+)\/(\d+)\//, function (a, g1, g2, g3) {
			var add = 1000000000;
			return 'http://' + g1 + '/' + g2 + '/res/' + (parseInt(g3) - add) + '.htm';
		});
		return (s2 != s1) ? s2 : '';
	};
	
	this.getThreadLog2 = function(url) {
		var ret = '';
		var hr = v2c.createHttpRequest(url + '?' + Math.random());
		if (hr.getHead()) {
			var rc = hr.responseCode;
			var mes;
			switch (rc) {
				case 404 :
					mes = 'スレッドがありません';
					v2c.removeProperty('FUTABAtoDAT_' + url);
					break;
				case 200 :
					var llm = v2c.getProperty('FUTABAtoDAT_' + url);
					var rlm = hr.lastModified;
					mes = (llm != rlm) ? '新着あり' : '新着無し';
					if (llm != rlm) {
						v2c.putProperty('FUTABAtoDAT_' + url, rlm);
						ret = self.getThreadLog(url);
					} else {
						ret = '新着無し';
					}
					break;
				default :
					mes = '通信エラー';
					break;
			}
			self.printlnLog('↓' + rc + ' : ' + mes);
		}
		return ret;
	};
	this.get2chanlog = function(bdkey, key)
	{
		var host = bdkey + '.2chanlog.net';
		var url = 'http://' + host + '/b/res/' + key + '.htm';
		var tiRegex = new RegExp("<title>(.*?) - ふたばちゃんろぐ\\(" + bdkey + "\\)</title>", "i");
		var html = self.getThreadLog(url);
		if ((!html) || (!tiRegex.test(html))) {
			self.printlnLog('↓302 : 過去ログがありません (2chanlog.net)');
			return '';
		}
		var title = RegExp.$1;
		var dat = new java.lang.StringBuilder();
		var parser = new self.HTMLParser(String(html));
		var matches = [];
		
		// タイトルの取得
		//var title = parser.Parse('<h1>', '</h1>');
		// レス部分のみ抽出
		var cutkey = {start:'</p>\r\n画像ファイル名：', end:'<br>\r\n<table><tr><td>\r\n'};
		var p = parser.Parse(cutkey.start, cutkey.end);
		// スレ立て画像の取得
		var thImgKey = {start:'<a href="', end:'" target='};
		var thImg = parser.Parse(thImgKey.start, thImgKey.end);
		
		// １のレスの取得
		var artkey = {start:'value=delete id=delcheck', end:'</blockquote></td></tr></table>'};
		var infoKey = {start: 'value=delete id=delcheck', end:'</blockquote>'};
		var idRegex = new RegExp('(\\d+/\\d+/\\d+\\(.\\)\\d+:\\d+:\\d+)(?:<!--[^>]+>)? ((?:(?:ID|IP):[^ ]+ )?No\\.\\d+)', 'i');
		var nameRegex = new RegExp('<font color=\'#117743\'><b>([^<]+)</b>', 'i');
		var mailRegex = new RegExp('<a href="mailto:([^"]+)">', 'i');
		var mesRegex = new RegExp('<blockquote[^>]*>(.*)</blockquote>', 'i');
		var imgRegex = new RegExp('<a href="([^"]+)" target=["\']_blank["\']>', 'i');
		var linkRegex = new RegExp('h?t?t?p://(\\w+).2chan.net/(\\w+)/res/(\\d+).htm', 'g');
		var sodRegex = new RegExp('class=sod id=sd\\d+>(.*?)</a>', 'i');
		
		var first = true;
		do {
			var rName, rMail, rId, rDate, rMes, rSod, rImg, limit, tmp;
			tmp = parser.Parse(infoKey.start, infoKey.end, true, true);
			if (matches = idRegex.exec(tmp)) {
				rDate = (matches[1]) ? '20' + matches[1] : '';
				rDate = rDate.split(')').join(') ');
				rId   = matches[2];
			}
			rSod  = (self.isSod && (matches = sodRegex.exec(tmp))) ? ((matches[1] == '+') ? '' : ' ' + matches[1]) : '';
			rName = (matches = nameRegex.exec(tmp)) ? matches[1] : '';
			rMail = (matches = mailRegex.exec(tmp)) ? matches[1] : '';
			rMes  = (matches = mesRegex.exec(tmp)) ? matches[1] : '';
			rMes  = rMes.replace(linkRegex, function(a, g1, g2, g3) {
				var add = 1000000000;
				return 'http://' + g1 + '.2chan.net/test/read.cgi/' + g2 + '/' + (parseInt(g3) + add) + '/';
			});
			if (first) {
				rImg = thImg;
			} else {
				rImg = (matches = imgRegex.exec(tmp)) ? matches[1] : '';
			}
			if (rImg) {
				rMes += ' <br> http://' + host + rImg.replace('image/', '');
			}
			dat.append(rName + '<>' + rMail + '<>' + rDate + ' ' + rId + rSod + '<> ' + rMes);
			if (first) {
				dat.append('<hr>このスレッドは <font color=red>' + host + '</font> から取得しました。 <>' + title);
				first = false;
			}
			dat.append('\n');
		} while (parser.MoveNext(artkey.start, artkey.end, true, false));
		self.printlnLog('↓200 : 過去ログ発見！ (2chanlog.net)');
		return dat.toString();
	};
	
	this.getFutalog = function(host, key /* , rescount */)
	{
		// 取得先の決定 (差分取得によるページスキップ含む)
		var futalogHost = 'futalog.com';
		if (host.indexOf('img.2chan.net') >= 0) {
			futalogHost = 'imgbako.com';
		}
		var rescount = arguments[2] || null;
		var haveCount = 0, havePages = 0, haveRemain = 0;
		if (rescount) {
			haveCount = Math.max(rescount.total - 1, 0);
			havePages = parseInt(haveCount / 200);
			haveRemain = haveCount % 200;
			if (rescount.delCnt.length > havePages) {
				haveRemain -= rescount.delCnt[havePages];
			}
		}
		var url = 'http://' + futalogHost + '/' + key;
		if (havePages > 0) {
			url += '_' + (havePages + 1);
		}
		url += '.htm';

		// 初回ページ取得
		var html = self.getThreadLog(url);
		if ((!html) || (html.indexOf('<br><b>このスレッドはすでに削除されているか、存在しません。<br>') >= 0)) {
			self.printlnLog('↓404 : 過去ログがありません (futalog.com)');
			return '';
		}
		
		// HTML->datの変換定義
		var cutkey = {start: '<hr>\r\n\r\n画像ファイル名：', end: '<hr><a href="#toko">'};
		var thImgKey = {start:'<a href=\'./pic/l_', end:'\' '};
		var artkey = {start:'<font color=\'#cc1105\'>', end:'</blockquote>'};
		var idRegex = new RegExp('(\\d+/\\d+/\\d+\\(.\\)\\d+:\\d+:\\d+)(?:<!--[^>]+>)? ((?:\\w{8}|[0-9\.:]+) )?(No\\.\\d+)', 'i');
		var nameRegex = new RegExp('<font color=\'#117743\'><b>([^<]+)</b>', 'i');
		var mailRegex = new RegExp('<a href="mailto:([^"]+)">', 'i');
		var mesRegex = new RegExp('<blockquote[^>]*>(.*?)(?:<br>|\s)+?</blockquote>', 'i');
		var thImgRegex = new RegExp('<a href=\'./pic/l_(\\d+)_(\\d+)_(jpe?g|gif|bmp|png)', 'i');
		var imgRegex = new RegExp('<img src=\'\./pic/m/(\\d+/\\d+\.(?:jpe?g|gif|png|bmp))', 'i');
		var linkRegex = new RegExp('h?t?t?p://(\\w+).2chan.net/(\\w+)/res/(\\d+).htm', 'g');
		var nextlinkRegex = new RegExp('<a href=\'([0-9_]+\.htm)\'(?: title=\'[^>]+)?>次の200レス');
		if (futalogHost == 'imgbako.com') {
			cutkey = {start: '<hr>\r\n\r\n\r\n画像ファイル名：', end: '<hr><a href="#toko">'};
			artkey = {start: '<td bgcolor=\'#F0E0D6\'>', end: '</blockquote>'};
		}

		// 変換実行
		var dat = new java.lang.StringBuilder();
		var isFirst = false;
		var OPNo;
		do {
			var parser = new HTMLParser(String(html));
			parser.Cut(cutkey.start, cutkey.end);
			var thImgHtml = parser.Parse(thImgKey.start, thImgKey.end, true);

			var imgdir = (thImgRegex.test(thImgHtml)) ? RegExp.$1 : '';
			var imgname= RegExp.$2 + '.' + RegExp.$3;
			var imgref = 'http://' + futalogHost + '/pic/l_' + RegExp.$1 + '_' + RegExp.$2 + '_' + RegExp.$3 + '_' + key + 'a.html';
			var thImg;

			// 初回のみスレ主のレス取得
			{
				var rName = '', rMail = '', rId = '', rNo = '', rDate = '', rMes = '', title = '', limit = '';
				var tmp = parser.Parse('hspace=20', artkey.end, true, true);
				if (!isFirst) {
					if (matches = idRegex.exec(tmp)) {
						rDate = (matches[1]) ? '20' + matches[1] : '';
						rDate = rDate.split(')').join(') ');
						thImg = 'http://' + futalogHost + '/pic/l/' + imgdir + '/' + imgname;

						rId   = (matches[2]) ? 'ID:' + matches[2] : '';
						rNo   = matches[3];
						OPNo  = rNo; // スレ立て主の投稿ナンバーを広告除去用に保存
						rId  += rNo;
					}
					// 差分取得の場合は広告除去用の投稿ナンバーのみ記憶して処理をスキップ
					if (haveCount < 1) {
						rName = (matches = nameRegex.exec(tmp)) ? matches[1] : '';
						rMail = (matches = mailRegex.exec(tmp)) ? matches[1] : '';
						rMes  = (matches = mesRegex.exec(tmp)) ? matches[1] : '';
						rMes  = rMes.replace(linkRegex, function(a, g1, g2, g3) {
							var add = 1000000000;
							return 'http://' + g1 + '.2chan.net/test/read.cgi/' + g2 + '/' + (parseInt(g3) + add) + '/';
						});
						title = rMes.split('<br>').join('').replace(/<a href=[^>]+>([^<]+)<\/a>/ig, '$1').replace(/<img src="([^"]+)"[^>]+>/ig, '$1').substring(0, 100);
						dat.append(rName + '<>' + rMail + '<>' + rDate + ' ' + rId + '<> ' + rMes + ' <br> ' + thImg + '<hr>このスレッドは <font color=red>' + futalogHost + '</font> から取得しました。 <>' + title + '\n');
					}
					isFirst = true;
				}
			}
			// それ以降のレスの取得
			var tmp = null
			var testCnt = 2; //※消す
			while (tmp = parser.Parse(artkey.start, artkey.end, true, true)) {
				var rName = '', rMail = '', rId = '', rNo = '', rDate = '', rMes = '', rImg = '', rImgFname = '';
				
				if (matches = idRegex.exec(tmp)) {
					rDate = (matches[1]) ? '20' + matches[1] : '';
					rDate = rDate.split(')').join(') ');
					rId   = (matches[2]) ? 'ID:' + matches[2] : '';
					rNo   = matches[3];
					if (rNo == OPNo) continue;	//スレ主と同じ投稿ナンバーは広告なのでスキップ
					rId  += rNo;
				}
				rName = (matches = nameRegex.exec(tmp)) ? matches[1] : '';
				rMail = (matches = mailRegex.exec(tmp)) ? matches[1] : '';
				rMes  = (matches = mesRegex.exec(tmp)) ? matches[1] : '';
				if (rMes.indexOf('[ＡＤ]') == 0 && rMes.length < 10) { continue; } // 広告スキップ
				// 差分取得の場合取得済みのレス数(ページ分抜かした余り)分スキップ
				if (haveRemain-- > 0) {
					continue;
				}
				rMes  = rMes.replace(linkRegex, function(a, g1, g2, g3) {
					var add = 1000000000;
					return 'http://' + g1 + '.2chan.net/test/read.cgi/' + g2 + '/' + (parseInt(g3) + add) + '/';
				});
				if (futalogHost == 'futalog.com') {
					rImgFname  = (matches = thImgRegex.exec(tmp)) ? matches[1] : '';
					if (rImgFname) {
						rImg = 'http://' + futalogHost + '/pic/l/' + RegExp.$1 + '/' + RegExp.$2 + '.' + RegExp.$3;
					}
				}
				if (rImg) {
					rMes += ' <br> ' + rImg;
				}
				var line = rName + '<>' + rMail + '<>' + rDate + ' ' + rId + '<> ' + rMes + ' <>';
				dat.append(line + '\n');
			}
			// 次の200レスのリンクがある場合レス末端ではないので処理続行
			if (nextlinkRegex.test(html)) {
				html = self.getThreadLog('http://' + futalogHost + '/' + RegExp.$1);
			} else {
				html = null;
			}
		} while (html);
		self.printlnLog('↓200 : 過去ログ発見！ (futalog.com)');
		return dat.toString();
	};
	
	this.exec = function(thread)
	{
		var url = self.getURL(thread);
		if (!url) { return ''; }
		var html = null;
		html = self.getThreadLog2(url);
		if (html == '新着無し') { 
			return v2c.readStringFromFile(thread.localFile, 'MS932');
		}
		if (!html) {
			var ret = '';
			if (self.is2chanlog) {
				if (/http:\/\/(may|img|jun|dec|dat)\.2chan\.net\/b\/res\/(\d+)\.htm/.test(url)) {
					ret = self.get2chanlog(RegExp.$1, RegExp.$2);
				}
			}
			if (self.isFutalog && !ret) {
				if (/http:\/\/(may|img)\.2chan\.net\/b\/res\/(\d+)\.htm/.test(url)) {
					if (self.isDiffReadFutalog && thread.localResCount > 1) {
						// 既得スレの削除レスをカウントしてfutalogの取得レス位置を補整する
						// (1ページ200レスの削除レス分追加で読み込んでしまうので2ページ目で重複してしまう)
						var delstr = '<font color="#ff0000">書き込みをした人によって削除されました</font>';
						var rescount = {
							total : thread.localResCount,
							delCnt : []
						};
						for (var i = 0; i <= parseInt((rescount.total - 1) / 200); i++) { rescount.delCnt.push(0); }
						var dat2 = v2c.readStringFromFile(thread.localFile, 'MS932');
						var dat2sp = dat2.split('\n');
						for (var i = 1; i < dat2sp.length; i++) {
							if (dat2sp[i].indexOf(delstr) != -1) {
								var idx = parseInt(i / 200);
								rescount.delCnt[idx] += 1;
							}
						}
						ret = self.getFutalog(RegExp.$1 + '.2chan.net', RegExp.$2, rescount);
						if (ret) {
							ret = dat2 + ret;
						} else {
							ret = '';
						}
					} else {
						ret = self.getFutalog(RegExp.$1 + '.2chan.net', RegExp.$2);
					}
				}
			}
			if (!ret) {
				self.printlnLog('ふたば☆ちゃんねるログが取得できませんでした。');
			}
			return ret;
		}
		var dat = new java.lang.StringBuilder();
		var parser = new HTMLParser(String(html));
		var matches = [];
		
		// レス部分のみ抽出
		var cutkey = {start:'</iframe></div>画像ファイル名：', end:'<div style="clear:left"></div>'};
		parser.Cut(cutkey.start, cutkey.end);
		
		// スレ立て画像の取得
		var thImgKey = {start:'<a href="', end:'" target='};
		var thImg = parser.Parse(thImgKey.start, thImgKey.end);
		
		// １のレスの取得
		var artkey = {start:'value=delete id=delcheck', end:'</blockquote></td></tr></table>'};
		var infoKey = {start: 'value=delete id=delcheck', end:'</blockquote>'};
		var idRegex = new RegExp('(\\d+/\\d+/\\d+\\(.\\)\\d+:\\d+:\\d+)(?:<!--[^>]+>)? ((?:(?:ID|IP):[^ ]+ )?No\\.\\d+)', 'i');
		var nameRegex = new RegExp('<font color=\'#117743\'><b>([^<]+)</b>', 'i');
		var mailRegex = new RegExp('<a href="mailto:([^"]+)">', 'i');
		var mesRegex = new RegExp('<blockquote[^>]*>(.*)</blockquote>', 'i');
		var imgRegex = new RegExp('<a href="([^"]+)" target=["\']_blank["\']>', 'i');
		var linkRegex = new RegExp('h?t?t?p://(\\w+).2chan.net/(\\w+)/res/(\\d+).htm', 'g');
		var limitRegex = new RegExp('<span id="contdisp">(.*?)頃消えます');
		var sodRegex = new RegExp('class=sod id=sd\\d+>(.*?)</a>', 'i');
		
		{
			var rName = '', rMail = '', rId = '', rDate = '', rMes = '', rSod = '', title = '', limit = '';

			var tmp = parser.Parse(infoKey.start, infoKey.end, true, true);
			if (matches = idRegex.exec(tmp)) {
				rDate = (matches[1]) ? '20' + matches[1] : '';
				rDate = rDate.split(')').join(') ');
				rId   = matches[2];
			}
			rSod  = (self.isSod && (matches = sodRegex.exec(tmp))) ? ((matches[1] == '+') ? '' : ' ' + matches[1]) : '';
			rName = (matches = nameRegex.exec(tmp)) ? matches[1] : '';
			rMail = (matches = mailRegex.exec(tmp)) ? matches[1] : '';
			limit = (matches = limitRegex.exec(String(html))) ? matches[1] : '';
			rMes  = (matches = mesRegex.exec(tmp)) ? matches[1] : '';
			rMes  = rMes.replace(linkRegex, function(a, g1, g2, g3) {
				var add = 1000000000;
				return 'http://' + g1 + '.2chan.net/test/read.cgi/' + g2 + '/' + (parseInt(g3) + add) + '/';
			});
			title = rMes.split('<br>').join('').replace(/<a href=[^>]+>([^<]+)<\/a>/ig, '$1').replace(/<img src="([^"]+)"[^>]+>/ig, '$1').substring(0, 100);
			title = (self.withLimit) ? title + ' [～' + limit + '] ' : title;
			dat.append(rName + '<>' + rMail + '<>' + rDate + ' ' + rId + rSod + '<> ' + rMes + ' <br> ' + thImg + '<hr>このスレッドは <font color=red>' + limit + '</font> 頃消えます <>'+ title + '\n');
		}
		// それ以降のレスの取得
		while (parser.MoveNext(artkey.start, artkey.end, true, false)) {
			var rName = '', rMail = '', rId = '', rDate = '', rMes = '', rSod = '', rImg = '';
			
			var tmp = parser.Parse(infoKey.start, infoKey.end, true, true);
			if (matches = idRegex.exec(tmp)) {
				rDate = (matches[1]) ? '20' + matches[1] : '';
				rDate = rDate.split(')').join(') ');
				rId   = matches[2];
			}
			rSod  = (self.isSod && (matches = sodRegex.exec(tmp))) ? ((matches[1] == '+') ? '' : ' ' + matches[1]) : '';
			rName = (matches = nameRegex.exec(tmp)) ? matches[1] : '';
			rMail = (matches = mailRegex.exec(tmp)) ? matches[1] : '';
			rMes  = (matches = mesRegex.exec(tmp)) ? matches[1] : '';
			rMes  = rMes.replace(linkRegex, function(a, g1, g2, g3) {
				var add = 1000000000;
				return 'http://' + g1 + '.2chan.net/test/read.cgi/' + g2 + '/' + (parseInt(g3) + add) + '/';
			});
			rImg  = (matches = imgRegex.exec(tmp)) ? matches[1] : '';
			
			if (rImg) {
				rMes += ' <br> ' + rImg;
			}
			dat.append(rName + '<>' + rMail + '<>' + rDate + ' ' + rId + rSod + '<> ' + rMes + ' <>\n');
		}

		return dat.toString();
	};
}

//=============================================================
// ■HTMLtoDAT
//=============================================================
function HTMLtoDAT(prm /* CompatibleMode = false */)
{
	var CompatibleMode, prmPath, prmBuffer, URLRegex, BeforeRegexArr, AfterRegexArr, MatchString, ResRegex;
	//var isProxy, ProxyAddress, AdditionalHTTPHeaderArr, Server, Board, isConvertDisabled, isAnchorRemoved, isBECodeRemoved, isAboneReplaced;
	var prmFile = new java.io.File(prm);
	
	if (!prmFile.exists()) {
		printlnLog('ファイルが見つかりません。 ({0})', prmFile.getPath());
	} else {
		CompatibleMode = arguments[1] || false;
		prmPath = prm;
		prmBuffer = v2c.readLinesFromFile(prmFile);
		URLRegex = PropertyGenerate('URLの変換', '');	// prmファイルフォーマットは複数行だけど１行しか使わないっぽいのでこれで
		BeforeRegexArr = ConvertRegex(PropertyGenerate('前処理', '', true));
		AfterRegexArr = ConvertRegex(PropertyGenerate('後処理', '', true));
		MatchString = PropertyGenerate('変換結果式', '');
		ResRegex = ConvertRegex(PropertyGenerate('正規表現', ''));
		
		/* CompatibleMode用 以下のプロパティはとりあえず非対応。必要に応じて対応 */
		/*
		isProxy = PropertyGenerate('Proxyを使う', false);
		ProxyAddress = PropertyGenerate('Proxyアドレス', '');
		AdditionalHTTPHeaderArr = PropertyGenerate('HTTPヘッダの追加', '', true);
		Server = PropertyGenerate('$server', '');
		Board = PropertyGenerate('$board', '');
		isConvertDisabled = PropertyGenerate('dat変換をしない', '');
		isAnchorRemoved = PropertyGenerate('アンカー削除', '');
		isBECodeRemoved = PropertyGenerate('beコード削除', '');
		isAboneReplaced = PropertyGenerate('透明あぼーんを補う', '');
		*/
	}
	this.getURL = function(thread)
	{
		if (!prmBuffer) return '';
		var s1 = thread.url.toString();
		// ホストを置換しないケースを想定して2ch非互換BBSのホスト名で除外する
		if (s.indexOf('bakusai.com') >= 0 || s.indexOf('4chan.org') >= 0 || s.indexOf('2chan.net') >= 0)
			return '';
		var arr = URLRegex.split('#');
		return s1.replaceAll(arr[1], arr[2]);
	};
	this.CompatibleExec = function(thread)
	{
		var logsoku_url = this.getURL(thread);
		if (!logsoku_url) { return ''; }
		var html = '';
		var local = arguments[1] || false;
		if (local) {
			html = local;
		} else {
			html = getThreadLog(logsoku_url);
		}
		if (!html) return '';
		html = String(html).split('\r\n').join('').split('\n').join('');
		//前変換
		for (var i = 0; i < BeforeRegexArr.length; i++) {
			html = html.replace(BeforeRegexArr[i].regex, BeforeRegexArr[i].match);
		}
		var title = /<title>(.*?)<\/title>/i.exec(html)[1];
		//DAT変換
		var dat = [];
		var resre = new RegExp(ResRegex[0].regex.source, "ig");
		var item;
		while ((item = resre.exec(html)) !== null) {
			var tmp = MatchString;
			for (var i = 1; i < item.length; i++) {
				tmp = tmp.replace('$'+ i.toString(), (item[i])? item[i] : '');
			}
			if (title) {
				tmp += title;
				title = '';
			}
			dat.push(tmp);
		}
		dat = dat.join('\n');
		dat += '\n';
		//後変換
		for (var i = 0; i < AfterRegexArr.length; i++) {
			dat = dat.replace(AfterRegexArr[i].regex, AfterRegexArr[i].match);
		}
		return new java.lang.String(dat);
	};
	this.exec = function(thread)
	{
		if (!prmBuffer) return '';
		var OS = java.lang.System.getProperty("os.name").toLowerCase();
		if (OS.indexOf('win') < 0) {
			printlnLog('HTMLtoDATはWindows以外では動きません。HTMLtoDATCompatibleを使用します。');
			return this.CompatibleExec(thread);
		}
		
		// V2Cログ・設定保存用フォルダにhtmltodat0.9.0フォルダを入れる。フォルダ名等が違う場合は便宜変更。
		var exe = htmltodatDir + 'htmltodat.exe';
		
		if (!(new java.io.File(exe)).exists()) {
			printlnLog('htmltodat.exeがなかったので実行できませんでした。({0})',exe);
			return '';
		}
		
		var tmpPath = scriptSubDir + '/tmp_' + Math.floor(Math.random() * 1000).toString() + (new Date()).getTime().toString() + '.dat';
		if (!(scriptSubDir.exists())) {
			scriptSubDir.mkdir();
		}
		if (!URLRegex) {
			var endl = java.lang.System.getProperty("line.separator");
			printlnLog('prmファイルにURLの変換を記述して下さい。以下はログ速の場合の記述例です。');
			v2c.println('URLの変換：' + endl + 's#http://(.+?)/test/read\\.cgi/(.+?)/(\\d+)/?.*#http://logsoku.com/thread/$1/$2/$3/#' + endl + '[ここに空行を１行必ず入れること]');
			return '';
		}
		v2c.exec([exe, thread.url.toString(), prmPath, tmpPath]);
		java.lang.Thread.sleep(300);
		while (isProcessRunning('htmltodat.exe')) {
			java.lang.Thread.sleep(1000);
		}
		var f = new java.io.File(tmpPath);
		var dat = v2c.readStringFromFile(f);
		f["delete"]();
		if (dat) {
			dat = String(dat).split('\n');
			var res1 = dat[0].split('<>');
			var tidx = res1.length - 1;
			res1[tidx] = removeSageteyon(res1[tidx]);
			dat[0] = res1.join('<>');
			dat = dat.join('\n');
		}
		return dat;
	};

	if (CompatibleMode) {
		this.exec = this.CompatibleExec;
	}
	
	function ConvertRegex(regexes)
	{
		var ret = [];
		var regs = regexes;
		if (!(regexes instanceof Array)) {
			regs = (String(regexes)).replace(/\r\n?/g, '\n').split('\n');
		}
		
		for (var i = 0; i < regs.length; i++) {
			var arr = (String(regs[i])).split('#');
			var opt = '';
			var num = (arr[0] === 'm')? 2 : 3;
			if (arr[num]) {
				if (arr[num].indexOf('g') >= 0) opt += 'g';
				if (arr[num].indexOf('i') >= 0) opt += 'i';
				if (arr[num].indexOf('m') >= 0) opt += 'm';
			}
			var re = new RegExp(arr[1], opt);
			ret.push({regex: re, match: arr[2]});
		}
		return ret;
	}
	
	function PropertyGenerate(propName, initValue /* isMultiLine = false */)
	{
		var isMultiLine = arguments[2] || false;
		var fileext = arguments[3] || false;
		
		var ret = [];
		var idx = -1;
		var p = java.util.regex.Pattern.compile('^'+propName+'.*?');
		for (var i = 0; i < prmBuffer.length; i++) {
			if (prmBuffer[i].length() > 0) {
				if (p.matcher(prmBuffer[i]).matches()) {
					idx = i;
					break;
				}
			}
		}
		if (idx < 0) { return initValue; }

		var idx2 = 0;
		if (-1 != (idx2 = prmBuffer[idx].indexOf('='))) {
			// 外部ファイル指定された場合 ログ・設定保存用フォルダ/htmltodat0.9.0/フォルダ内のファイルを読み込む
			ret = prmBuffer[idx].substring(idx2 + 1);
			switch (propName) {
				case '変換結果式' : ret += '.cvr'; break;
				case '後処理' : ret += '.acv'; break;
				case '前処理' : ret += '.bcv'; break;
				case 'URLの変換' : ret += '.ucv'; break;
				case 'HTTPヘッダの追加' : ret += '.hdr'; break;
				case 'Proxyアドレス' : ret += '.txt'; break;
				default: break;
			}
			var f = new java.io.File(htmltodatDir + ret);
			if (!f.exists()) {
				printlnLog('ファイルが見つかりません。 ({0})', f.getPath());
			}
			ret =  v2c.readLinesFromFile(f);
			if ((ret instanceof Array) && ret.length == 1) {
				ret = ret[0];
			}
		}
		else {
			// prmファイルに記述されてる場合
			idx++;
			while (prmBuffer[idx].length() <= 0) { idx++; }
			while ((idx < prmBuffer.length) && (prmBuffer[idx].length() > 0)) {
				if (isMultiLine) {
					ret.push(prmBuffer[idx++]);
				} else {
					ret = prmBuffer[idx];
					break;
				}
			}
		}

		if (ret instanceof Array) {
			for (var i = 0; i < ret.length; i++) {
				if (ret[i].charAt(0) === '#'.charCodeAt(0)) {
					ret.splice(i--, 1);
				}
			}
		}
		if (ret.length == 0) {
			ret = initValue;
		}
		
		return ret;
	}
}

//=============================================================
// ■ログ速
// 仕様:
// 以下のログ速の仕様のためオリジナルdatとのバイナリ一致は不可能
// >1などアンカミスを>>1にしてしまう
// 2chURLが全てrogsokuのURLに置換されてるのでh抜き等に対応できない(全てhttp://で書きだす)
// また同様に2chURLのホスト名が不明なので現サーバーのホスト名で2chURLを生成している(ログ速のapiを叩けば拾えるがdat生成が遅くなるのと相手先に負荷がかかるため実装しない)
//=============================================================
function LOGSOKUtoDAT()
{
	this.getURL = function(thread)
	{
		var s1 = String(thread.url.toString());
		// BBSPINKの”過去ログ”は保管していないので取得しない
		var s2 = s1.replace(/^http:\/\/(.+\.2ch\.net)\/test\/read[^\/]+\/(.+?)\/(\d+).*/, 'http://logsoku.com/thread/$1/$2/$3/');
		return (s2 != s1) ? s2 : '';
	};
	
	this.exec = function(thread)
	{
		var logsoku_url = this.getURL(thread);
		if (!logsoku_url) { return ''; }
		var html = '';
		var local = arguments[1] || false;
		if (local) {
			html = local;
		} else {
			html = getThreadLog(logsoku_url);
		}
		if (!html) {
			printlnLog("ログ速のHTMLが取得できませんでした。");
			return '';
		}
		var dat = new java.lang.StringBuilder();
		var title = '';
		var parser = new HTMLParser(String(html));
		// タイトルの取得
		var keyword = {start :'og:title" content="', end :' | ログ速"/>'};
		if (!(title = parser.Parse(keyword.start, keyword.end))) {
			printlnLog("ログ速のHTMLからスレッドタイトルが取得できませんでした。(仕様変更？)");
			return '';
		}
		title = removeSageteyon(title);
		// レス部分だけ抜き出し
		keyword.start = '<div id="comments">';
		keyword.end = '</div> <hr class="divider"';
		parser.Cut(keyword.start, keyword.end);

		var nkey = {start :'em"> <b>', end :'</b></span>'};				// 名前欄
		var mkey = {start :'[', end :']'};								// メール欄
		var tkey = {start :'投稿日：', end :' <a href="/id/'};						// 日時
		var idkey = {start : '<a href="/id/', end :'<div class="comment">'};		// ID
		var meskey = {start :'<div class="comment"> ', end :'</div>'};		// 本文欄
		var artkey = {start :'<div id="', end :'</div> </div>'};			// 単レスのタグ範囲指定
		var bdkey = thread.board.key;
		var thkey = thread.key;
		
		var thumbRegex = /<br\/><(iframe|img class).+<br\/>/g;				// ニコニコとYoutubeのサムネ用のタグ削除
		var tagRegex   = /(<|(\[))("[^"]*"|'[^']*'|[^'">])*[>\])]/g;		// ID,BE,株主らへんのタグ削除＋発言回数削除
		var kabRegex   = /^ (.+?) /;										// 株の１文字表記のみリンク化
		var ssspRegex  = /<img src="http:\/\/cdn\.logsoku\.com\/(.+)">/g;	// BEアイコンのURL修正及びタグ削除
		var linkRegex  = /<a href[^>]+target="_blank"[^>]*>(.+?)<\/a>/g;			// その他リンクタグ削除
		var thLinkRegex= /<a href="\/r\/[^>]+>http:\/\/www\.logsoku\.com\/r\/([^\/]+)\/([^<]+)<\/a>/g;					// 他スレッドへのリンクタグを平文に置換
		var anchorRegex= /<a href=".*data-pop-res="(\d+)"[^>]*>/g;								// アンカーのURL修正
		var playerRegex   = /<\/?(div|img)[^>]*>/g;							// Youtubeプレイヤーの除去
		
		while (parser.MoveNext(artkey.start, artkey.end)) {

			var name = parser.Parse(nkey.start, nkey.end);
			var mail = parser.Parse(mkey.start, mkey.end);
			var date = parser.Parse(tkey.start, tkey.end);
			parser.index++; // 日時とIDの間の半角スペースを飛ばす
			var mes = '';
			if (date) {
				var idset = parser.Parse(idkey.start, idkey.end, true, false);
				if (idset) {
					idset = idset.replace(tagRegex, '');
					idset = idset.replace(kabRegex, ' <a href="http://2ch.se/">$1</a> ');
					date += ' ' + idset;
				}
				
				mes = parser.Parse(meskey.start, meskey.end);
				mes = mes.replace(thumbRegex, '');
				if (mes.indexOf('<') >= 0) {
					mes = mes.replace(ssspRegex, 'sssp://$1');
					mes = mes.replace(linkRegex, '$1');
					mes = mes.replace(anchorRegex, '<a href="../test/read.cgi/'+ bdkey + '/' + thkey + '/$1" target="_blank">');
					mes = mes.replace(thLinkRegex, function(whole, m1, m2) {
						return 'http://' + v2c.bbs2ch.getBoard(m1).url.host + '/test/read.cgi/' + m1 + '/' + m2;
					});
					mes = mes.replace(playerRegex, '');
				}
				mes = mes.split("<br/>").join('<br>');
			} else {
				date = 'Over 1000 Thread';

				var mArr = parser.Parse(meskey.start, meskey.end).split("<br/>");		// <br/> → <br>にするついでに<br>以外のタグを削除
				for (var i = 0; i < mArr.length; i++) {
						mArr[i] = mArr[i].replace(/<.+?>/g, '');
				}
				mes = mArr.join('<br>');
				mes = mes.split('&gt;').join('>').split('&lt;').join('<').split('&quot;').join('"');	// 1001ではHTMLエンコードされないようだ
			}
			
			if (dat.length() == 0) {
				dat.append(name + '<>' + mail + '<>' + date + '<> ' + mes + ' <>'+title+'\n');
			} else {
				dat.append(name + '<>' + mail + '<>' + date + '<> ' + mes + ' <>\n');
			}
		}
		return dat.toString();
	};
}


//=============================================================
// ■2chのread.cgiが生成するhtmlをdatに変換する
//   2014年秋のdat仕様変更に備えて
//=============================================================
READCGItoDAT.prototype.printlnLog = printlnLog;
READCGItoDAT.prototype.HTMLParser = HTMLParser;
READCGItoDAT.prototype.getThreadLog = getThreadLog;
function READCGItoDAT()
{
	var self = this;
	
	this.getURL = function(thread)
	{
		var s1 = String(thread.url.toString());
		var r  = /^http:\/\/(.+\.(?:2ch\.net|bbspink\.com)\/test\/read[^\/]+\/.+?\/\d+\/).*/;
		var s2 = '';
		if (r.test(s1)) {
			s2 = 'http://' + RegExp.$1;
		}
		return s2;
	};
	this.exec = function(thread)
	{
		var url = self.getURL(thread);
		if (!url)
			return '';
		var html = String(self.getThreadLog(url));
		if (!html)
			return '';

		var dat = new java.lang.StringBuilder();

		var title = html.match(/<title>(.*?)<\/title>/)[1] || null;
		if (!title) {
			self.printlnLog("2chのHTMLからスレッドタイトルが取得できませんでした。(仕様変更？)");
			return '';
		}
		title = removeSageteyon(title);
		var cutkey = {start : '<dt>1 ：', end : '</dl>'};
		html = html.substring(html.indexOf(cutkey.start), html.indexOf(cutkey.end) - 1);
		if (!html) {
			self.printlnLog("2chのHTMLから想定しているHTMLタグが見つかりませんでした。(仕様変更？)");
			return '';
		}
		html = html.split('\n');
		var parser = new self.HTMLParser();
		var ndiRepPtn = ['</b></font>：', '</b></a>：'];
		for (var i = 0; i < html.length; i++) {
			if (html[i]) {
				parser.setHtml(html[i]);
				var mail = '', ndi = '', mes = '';
				mail = parser.Parse('mailto:', '">', false, false, true);
				ndi = parser.Parse('<b>', '<dd>');
				var ndiridx = +(mail.length != 0);
				ndi = ndi.split(ndiRepPtn[ndiridx]);
				ndi[1] = ndi[1].replace(/<a href="javascript:be\((\d+)\);">\?([^<]+)<\/a>/, 'BE:$1-$2');
				mes = parser.Parse('<dd>', '<br><br>');
				mes = mes.replace(/<img src="http:\/\/([^\/]+\/(?:img|ico)\/[^"]+)">/ig, 'sssp://$1');
				if (i == 0) {
					dat.append(ndi[0] + '<>' + mail + '<>' + ndi[1] + '<>' + mes + '<>'+title+'\n');
				} else {
					dat.append(ndi[0] + '<>' + mail + '<>' + ndi[1] + '<>' + mes + '<>\n');
				}
			}
		}
		return dat.toString();
	};
}

//◆Others

//=============================================================
// ■getdat.jsコールバック
//=============================================================
function getDat(thread)
{
	if (thread.bbs.twitter) {
		return null;
	}
	var retrievedResCount = thread.localResCount;
	var dat = null;
	var found = '';
	for(var i = 0; (!thread.bbs.is2ch || retrievedResCount < 1001) && i < services.length; i++)
	{
		v2c.setStatus("過去ログを取得中........( ´∀｀)つ旦 " + services[i].name);
		var content = '';
		var url = '';
		if (services[i].obj) {
			content = services[i].obj.exec(thread);
		} else if (services[i].src && services[i].dst) {
			url = String(thread.url.toString());
			if ((!(/(?:2chan|bakusai|4chan|8chan)/.test(url))) && services[i].src.test(url)) {
				url = (String(thread.url.toString())).replace(services[i].src, services[i].dst);
				content = getThreadLog(url);
				if (content) {
					content = String(content).split('\n');
					var res1 = content[0].split('<>');
					var tidx = res1.length - 1;
					res1[tidx] = removeSageteyon(res1[tidx]);
					content[0] = res1.join('<>');
					content = content.join('\n');
				}
			} 
		}
		if (v2c.interupted) { return null; }
		if (!content) {
			continue;
		} else if (!found) {
			found = 'not modified ';
		}

		var resCount = content.split("\n").length;
		if ((resCount == 1) && (content.split("\n")[0].match(/unkar\.org/))) continue;
		
		printlnLog("{0} ({1}): {2}", services[i].name, resCount, url);

		if(retrievedResCount < resCount)
		{
			dat = { service: services[i], content: content };
			retrievedResCount = resCount;
			found = 'retrieved from ';
		}
	}
	found = (dat) ? found + dat.service.name : (found) ? found : 'not found';
	printlnLog("{0}: {1} (+{2})", found, thread.title, retrievedResCount - thread.localResCount);

	return dat ? dat.content : null;
}

//=============================================================
// ■外部へのオブジェクト渡し
//=============================================================
(function() {
var ret = {
	"B4CHANtoDAT" : B4CHANtoDAT,
	"FUTABAtoDAT" : FUTABAtoDAT,
	"BAKUSAItoDAT": BAKUSAItoDAT,
	"READCGItoDAT": READCGItoDAT,
	"VICHANtoDAT" : VICHANtoDAT
};
return ret;
})();
