// 【登録場所】 お気に入り・ツールバー
// 【ラベル】 全板ランキング
// 【コマンド1】 ${SCRIPT:S} getRankingThreads.js または ${SCRIPT:S} getRankingThreads.js n u d e //1～100位まですべて
// 【コマンド2】 ${SCRIPT:S} getRankingThreads.js n uw l //新スレと順位が閾値以上上昇したスレ、かつレス数が1001以下を表示
//※使用できる引数： n 新着, u 上昇, uw 上昇(閾値以上), d 下降, dw 下降(閾値以上), e 順位変動なし, l レス数が1001以下
// 【内容】 全板縦断ランキングAPI(ttp://2ch-ranking.net/api.html)を利用してスレッド一覧に表示する
// 【スクリプト】
//設定
var ThresholdUp = 20; //正の数値以上、引数uw使用の場合、順位がかなり上昇したスレッドを表示する
var ThresholdDown = -20; //負の数値以上、引数dw使用の場合、順位があまり下降していないスレッドを表示する
//設定ここまで
function callback(ls) {
  var thl = [], pt = new RegExp('^(new|↑|↓|=)([-\\d]*)$'), opts = v2c.context.args;
  var view = {n:false, u:false, uw:false, d:false, dw:false, e:false, l:false};
  for (var i = 0; i < opts.length; i++) {
    view[opts[i]] = true;
  };
  for ( var j = 0; j < ls.length; j++ ) {
    ls[j].updown.match(pt);
    ls[j].sign = RegExp.$1;
    ls[j].range = RegExp.$2;
    var obj = ls[j];
    var live = !view.l || obj.res < 1001;
    if ( !i
      || (i == 0 && live)
      || (view.n && obj.sign == 'new' && live)
      || (view.e && obj.sign == '=' && live)
      || (view.u && obj.sign == '↑' && live)
      || (view.d && obj.sign == '↓' && live)
      || (view.uw && obj.sign == '↑' && obj.range >= ThresholdUp && live)
      || (view.dw && obj.sign == '↓' && obj.range > ThresholdDown && live)
      ) {
      var th = v2c.getThread('h' + 'ttp://' + obj.url, obj.title, obj.res);
      if (th) thl.push(th);
    };
  };
  return thl;
};
function getThreads(cx) {
  var checkErr = function(c, m) {
    if (c && typeof(m) === 'undefined') cx.skip = true;
    cx.message = m;
    return c;
  };
  var getURL = function(n) {
    return 'h' + 'ttp://2ch-ranking.net/ranking.json?board=' + n;
  };
  var decodeData = function(d) {
    return unescape((d+'').replace(/\\\//g,'/').replace(/\\u/g,'%u'))
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/ "/g,'"');
  };
  if (checkErr(!v2c.online)) return null;
  var hr = v2c.createHttpRequest(getURL('zenban'));
  if (checkErr(v2c.interrupted, 'キャンセルしました。')) return null;
  var data = hr.getContentsAsString();
  if (checkErr(!data, 'APIからの取得に失敗しました。')) return null;
  return eval(decodeData(data));
};
