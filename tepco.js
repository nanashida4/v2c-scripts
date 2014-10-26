// 情報ソース種別
var SourceApi = 0;	// API(JSON形式)
var SourceCsv = 1;	// 公式CSVファイル

// 情報ソース
//var defSource = SourceApi;
var defSource = SourceCsv;

// データファイル名
var datName = "tepco/latest.txt";

// 最新の情報取得先(API:JSON形式, 公式:CSV形式)
var urlLatest = new Array(
	"http://tepco-usage-api.appspot.com/latest.json",			// API
	"http://www.tepco.co.jp/forecast/html/images/juyo-j.csv"	// CSV
);

// データの更新時刻(分)
var timing = new Array(7, 32);

// データファイルを取得
function getDataFile()
{
	var file = v2c.getScriptDataFile(datName);
	return file;
}

// デバッグ出力フラグ
//var debug = true;
var debug = false;

// デバッグ出力
function debugOut(str)
{
	if (debug) {
		v2c.alert(str);
	}
}

// 日時をパース(API)
function parseDateApi(str)
{
	var year  = str.slice(0, 4);
	var month = str.slice(5, 7);
	var mday  = str.slice(8, 10);
	var hour  = str.slice(11, 13);
	var min   = str.slice(14, 16);
	var sec   = str.slice(17, 19);
	
	var date = new java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("GMT+0"));
	date.set(year, month, mday, hour, min, sec);
	date.get(java.util.Calendar.HOUR_OF_DAY);  // 一旦UTCで適用する
	date.setTimeZone(java.util.TimeZone.getDefault());  // ローカル時間に直す
	date.get(java.util.Calendar.HOUR_OF_DAY);  // ローカル時間を適用する
	return date;
}

// 日時をパース(CSV)
function parseDateCsv(str, sep)
{
	var args = str.split(sep);
	var date = args[0].split("/");
	var time = args[1].split(":");
	
	var year  = date[0];
	var month = date[1];
	var mday  = date[2];
	var hour  = time[0];
	var min   = time[1];
	
	var date = new java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Tokyo"));
	date.set(year, month, mday, hour, min, 0);
	date.get(java.util.Calendar.HOUR_OF_DAY);  // JSTで適用する
	return date;
}

// 数字を指定した桁で0埋めして文字列化(4桁まで対応)
function numToStr(num, digits)
{
	var str = (new Number(num)).toString();
	if (str.length < digits) {
		str = "0000".slice(0, digits - str.length) + str;
	}
	return str;
}

// 日時を文字列化
function formatDate(date, sepDate)
{
	var str = new java.lang.StringBuilder();
	
	str.append(numToStr(date.get(java.util.Calendar.YEAR), 4));
	str.append(sepDate);
	str.append(numToStr(date.get(java.util.Calendar.MONTH), 2));
	str.append(sepDate);
	str.append(numToStr(date.get(java.util.Calendar.DAY_OF_MONTH), 2));
	str.append(" ");
	str.append(numToStr(date.get(java.util.Calendar.HOUR_OF_DAY), 2));
	str.append(":");
	str.append(numToStr(date.get(java.util.Calendar.MINUTE), 2));
	str.append(":");
	str.append(numToStr(date.get(java.util.Calendar.SECOND), 2));
	
	return str.toString();
}

// 時間帯を文字列化
function formatDateRange(date)
{
	var str = new java.lang.StringBuilder();
	
	str.append(numToStr(date.get(java.util.Calendar.YEAR), 4));
	str.append("/");
	str.append(numToStr(date.get(java.util.Calendar.MONTH), 2));
	str.append("/");
	str.append(numToStr(date.get(java.util.Calendar.DAY_OF_MONTH), 2));
	str.append(" ");
	str.append(numToStr(date.get(java.util.Calendar.HOUR_OF_DAY), 2));
	str.append(":00-");
	str.append(numToStr(date.get(java.util.Calendar.HOUR_OF_DAY) + 1, 2));
	str.append(":00");
	
	return str.toString();
}

// データファイルの更新日時から次の更新日時を割り出す
function getNextUpdateTiming(source)
{
	var file = getDataFile();
	
	// ファイルが存在しなければ0を返す
	var modTime = file.lastModified();
	if (modTime == 0) {
		debugOut("データファイル新規作成");
		return 0;
	}
	
	// ファイルの更新日時から次の更新日時を割り出す(JST)
	var nextTiming = new java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Tokyo"));
	nextTiming.setTimeInMillis(modTime);
	nextTiming.set(java.util.Calendar.SECOND, 0);	// 秒とミリ秒は捨てる
	nextTiming.set(java.util.Calendar.MILLISECOND, 0);
	
	debugOut("前回更新日時: " + formatDate(nextTiming, "/"));
	
	// 次の更新タイミング(分)を探す
	var min = nextTiming.get(java.util.Calendar.MINUTE);
	var i;
	for (i = 0; i < timing.length; i++) {
		if (min < timing[i]) {
			nextTiming.set(java.util.Calendar.MINUTE, timing[i]);
			break;
		}
	}
	// なければ次の時間の最初のタイミングを採用
	if (i == timing.length) {
		nextTiming.add(java.util.Calendar.HOUR_OF_DAY, 1);
		nextTiming.set(java.util.Calendar.MINUTE, timing[0]);
	}
	
	debugOut("次回更新日時: " + formatDate(nextTiming, "/"));
	
	return nextTiming.getTimeInMillis();
}

// データを更新するタイミングを取得
function getUpdateTiming(source)
{
	// 次の更新日時を取得
	var nextTiming = getNextUpdateTiming(source);
	
	// ファイルが存在しなければ更新(というか作成)
	if (nextTiming == 0) {
		return true;
	}
	
	// 更新日時を越えていたら更新する
	var curTime = java.util.Calendar.getInstance();
	
	debugOut("現在時刻: " + formatDate(curTime, "/"));
	
	return (curTime.getTimeInMillis() >= nextTiming);
}

// データを保存(API)
function saveDataApi(file, data)
{
	v2c.writeStringToFile(file, data);
}

// データを保存(CSV)
function saveDataCsv(file, data)
{
	var lines = data.split("\r\n");
	var args;
	
	// データ更新時刻(JST)
	var usage_updated = parseDateCsv(lines[0], " ");
	debugOut("データ更新時刻: " + formatDate(usage_updated, "/"));
	
	// ピーク時供給力
	args = lines[2].split(",");
	var capacity = args[0];
	
	// ピーク時台
	var capacity_peak_period = args[1].split(":")[0];
	
	// ピーク時供給力更新日時
	var yearPeak = usage_updated.get(java.util.Calendar.YEAR);
	if (args[2].split("/")[0] == "12" && usage_updated.get(java.util.Calendar.MONTH) ==1) {
		yearPeak--;  // 年またぎ対策
	}
	var capacity_updated = parseDateCsv(yearPeak + "/" + args[2] + "," + args[3], ",");
	
	// 最新の当日実績
	var entryfor = usage_updated.clone();
	var usage = 0;
	var i;
	for (i = 0; i < 24; i++) {
		// 時間帯は基本的に更新時刻の１時間前だが、値が0の場合はその前を採用
		entryfor.add(java.util.Calendar.HOUR_OF_DAY, -1);
		args = lines[5 + entryfor.get(java.util.Calendar.HOUR_OF_DAY)].split(",");
		usage = args[2];
		if (usage != 0) {
			break;
		}
	}
	// 全て0なら、1つ前の時間帯を採用したものと仮定
	if (i == 24) {
		entryfor.clone();
		entryfor.add(java.util.Calendar.HOUR_OF_DAY, -1);
	}
	entryfor.set(java.util.Calendar.MINUTE, 0);
	entryfor.set(java.util.Calendar.SECOND, 0);
	
	var year  = entryfor.get(java.util.Calendar.YEAR);
	var month = entryfor.get(java.util.Calendar.MONTH);
	var day   = entryfor.get(java.util.Calendar.DAY_OF_MONTH);
	var hour  = entryfor.get(java.util.Calendar.HOUR_OF_DAY);
	
	// UTCに変換
	usage_updated.setTimeZone(java.util.TimeZone.getTimeZone("GMT+0"));
	usage_updated.get(java.util.Calendar.HOUR_OF_DAY);
	capacity_updated.setTimeZone(java.util.TimeZone.getTimeZone("GMT+0"));
	capacity_updated.get(java.util.Calendar.HOUR_OF_DAY);
	entryfor.setTimeZone(java.util.TimeZone.getTimeZone("GMT+0"));
	entryfor.get(java.util.Calendar.HOUR_OF_DAY);
	
	// データをJSON形式で保存
	var data = new Array(
		"{",
		"  \"capacity\": " + capacity + ",",
		"  \"capacity_updated\": \"" + formatDate(capacity_updated, "-") + "\",",
		"  \"capacity_peak_period\": " + capacity_peak_period + ",",
		"  \"usage\": " + usage + ",",
		"  \"usage_updated\": \"" + formatDate(usage_updated, "-") + "\",",
		"  \"entryfor\": \"" + formatDate(entryfor, "-") + "\",",
		"  \"year\": " + year + ",",
		"  \"month\": " + month + ",",
		"  \"day\": " + day + ",",
		"  \"hour\": " + hour,
		"}"
	);
	v2c.writeLinesToFile(file, data);
}

// データを保存
var saveData = new Array(
	saveDataApi,
	saveDataCsv
);

// データを更新
function updateData(source)
{
	debugOut("Update");
	
	// データを取得
	var hr = v2c.createHttpRequest(urlLatest[source]);
	var data = hr.getContentsAsString();
	if (data == null) {
		return false;	// データ取得に失敗
	}
	
	// データを保存
	var file = getDataFile();
	saveData[source](file, data);
	
	return true;	// データ取得に成功
}

// データを読み出して解析(API)
function loadData(file)
{
	var json = v2c.readFile(file);
	var data;
	eval("data = " + json);
	data["usage_updated"] = parseDateApi(data["usage_updated"]);
	data["entryfor"] = parseDateApi(data["entryfor"]);
	return data;
}

// データを表示
function showData(error)
{
	var file = getDataFile();
	if (file.lastModified() == 0) {
		v2c.context.setStatusBarText(error);
		return;
	}
	
	var data = loadData(file);
	
	// ピーク比を取得
	var ratio = 100.0 * data["usage"] / data["capacity"];
	ratio = Math.floor(ratio * 10 + 0.5) / 10.0;  // 小数点以下1桁目で四捨五入
	
	// 時間帯を取得
	var dateRange = formatDateRange(data["entryfor"]);
	
	var show = "現在の電力使用量: " + data["usage"] + "万kW (ピーク比 " + ratio + " %) (" + dateRange + ")";
	if (error != "") {
		show += " (" + error + ")";
	}
	
	v2c.context.setStatusBarText(show);
}

// メイン関数
function main(source)
{
	if (source != SourceApi && source != SourceCsv) {
		v2c.context.setStatusBarText("情報ソースが不正です！");
		return;
	}
	
	var error = "";
	
	if (getUpdateTiming(source)) {
		if (!updateData(source)) {
			error = "データの取得に失敗しました";
		}
	}
	
	showData(error);
}

main(defSource);
