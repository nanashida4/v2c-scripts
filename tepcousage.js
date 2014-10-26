// 【登録場所】 全体、レス表示
// 【ラベル】東京電力電力使用率表示
// 【コマンド】${SCRIPT:FrS} tepcousage.js
// 【備考】json_parse_state.js（https://github.com/douglascrockford/JSON-js）必須

//json_parse_state.js読み込み
var fl = new java.io.File(new java.io.File(v2c.saveDir,'script'),'json_parse_state.js');
eval(String(v2c.readFile(fl)));

var u="http://tepco-usage-api.appspot.com/latest.json";
var hr=v2c.createHttpRequest(u);
var jst=hr.getContentsAsString();

//json_parse_state.js使用
var jobj=json_parse(jst);

//得られたオブジェクトを利用
var tur=100*(jobj["usage"]/jobj["capacity"]);

var bd=new java.math.BigDecimal(tur);
var ur=bd.setScale(1,java.math.BigDecimal.ROUND_HALF_EVEN).doubleValue();

var tview="使用率:"+ur+"%";

v2c.context.setPopupText(tview);
