//【登録場所】全体、レス表示
//【ラベル】ヴァルダID検索
//【内容】ヴァルダID検索(http://varda2.com/varirei/)の外部ブラウザ表示
//【コマンド】${SCRIPT:S} vardaID.js
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var res = vcx.res;
var th = vcx.thread;
var bd = th.board;
if (th && res && res.id && res.id.match(/^([.\+\/\w]{9})/)) {
  v2c.browseURL('h' + 'ttp://varda2.com/varirei/search.cgi/' + bd.key + '/id/' + RegExp.$1 + '/');
}
// ----- 前の行まで -----