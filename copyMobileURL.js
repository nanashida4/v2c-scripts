//【登録場所】全体・レス表示
//【ラベル】携帯スレの書込URLをコピー
//【コマンド】$SCRIPT copyMobileURL.js
//【内容】2chスレの携帯版書き込み欄のURLをクリップボードにコピーする
//【スクリプト】

var th = v2c.context.thread;
if (th && th.bbs.is2ch) {
//  v2c.context.setClipboardText('h' + 'ttp://c.2ch.net/test/-/' + th.board.key + '/' + th.key);//スレッドURL
  v2c.context.setClipboardText('h' + 'ttp://c.2ch.net/test/-/' + th.board.key + '/' + th.key + '/w');//スレッド書き込み欄URL
}