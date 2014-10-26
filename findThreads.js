//【登録場所】お気に入り・ツールバー
//【ラベル】板から目的のスレを検索して一覧表示
//【コマンド】$SCRIPT findThreads.js スレ名 板URL
//例：$SCRIPT findThreads.js エロ ttp://kilauea.bbspink.com/hgame/
//【内容】 板から目的のスレを検索して一覧表示
//【スクリプト】
function getThreads(cx) {
    //検索したいスレ名を正規表現で
    var KENSAKUSURE = v2c.context.args[0]; ;
    //検索対象板URL
    var bdUrl = v2c.context.args[1]; ;
    if (bdUrl == "" || KENSAKUSURE == "") return null;
    if (!v2c.online) {
        cx.skip = true;
        return null;
    }
    var bd = v2c.getBoard(bdUrl);
    if (!bd) {
        cx.message = '板オブジェクトの取得に失敗';
        return null;
    }
    var thListText = v2c.readURL(bdUrl + 'subject.txt');
    if (v2c.interrupted) {
        return null;
    }
    if (!thListText) {
        v2c.alert('スレッドリスト取得失敗');
    }
    var rth = new RegExp('^(\\d+)\\.dat<>(.+' + KENSAKUSURE + '.+) \\((\\d+)\\)$', 'gm');
    var thl = [];
    var rt;
    while (rt = rth.exec(thListText)) {
        var ttitle = rt[2].replace(/</g, '<').replace(/>/g, '>').replace(/&/g, '&');
        var th = bd.getThread(rt[1], bdUrl, ttitle, rt[3]);
        if (th) {
            thl.push(th);
        }
    }
    return thl;
}