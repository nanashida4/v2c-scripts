【登録場所】リンク、URLExec
【ラベル】Youtube動画情報
【内容】Youtube動画情報のポップアップ
【コマンド】${SCRIPT:FrxS} PopupStatusYoutube.js
【URLExec*】https?://(?:\w+\.)?youtube\.(?:\w+|co\.\w+)/.*?v=[\-_\w]{11}.*	$&	${V2CSCRIPT:FrxS} PopupStatusYoutube.js
【URLExec*(短縮URL用)】h?t?tps?://youtu\.be/[\-_\w]{11}	$&	${V2CSCRIPT:FrxS} PopupStatusYoutube.js
【使い方】
「PopupStatusYoutube.js」と「PopupStatusYoutube」フォルダを「V2C保存用」フォルダの「script」フォルダに配置してください。

【補足】
・リンクを右クリックから実行する場合は、上記【ラベル】と【コマンド】をV2Cの外部コマンド設定から登録してください。
・マウスオーバーで実行する場合は、「V2C保存用」フォルダの「URLExec2.dat」に、【URLExec*】のコマンドを追加してください。
　URLExec2.dat が無ければ文字コード「Shift-JIS」でテキストファイルを新規作成し、【URLExec*】のコマンドをペーストし「URLExec2.dat」の名前で保存します。
　短縮URL用に対応するには【URLExec*(短縮URL用)】を同様に追加してください。
・ポップアップのレイアウトは、PopupStatusYoutubeフォルダ内のtemplate.txtのHTMLを書き換えることで変更可能です。
・template.txtに使える変数はparameter.txt参照してください。

【ボタン】
<form action=""><input type="submit" name="Fix" value="固定"></form>
name属性に機能名、value属性にボタンのラベルを記述する

【ボタン機能名】
Fix：ポップアップを閉じないようにする
DL：ダウンローダーにURLを送る
Ext：外部ブラウザで開く
CopyTitle：タイトルをコピーする
CopyURL：URLをコピーする
CopyTytle&URL：タイトル＋改行＋URLをコピーする
CopyInfo:動画情報をコピー

※ボタンを全て削除したいときはtemplate.txtの <!-- ここからボタン --> と <!-- ここまでボタン --> の間を削除してください。
※DLボタン、URLExec.datを使用する場合は、スクリプトのパーミッションを${SCRIPT:FrxS}としてください。
※Fixボタンは動作が不安定です。

【履歴】
--201008270
---とりあえずできた

--201008271
---タグが空の場合エラーが出る問題を修正
---タイトル、コメント、タグに"$"が含まれるときエラーが出る問題を修正
---タグのセパレータを設定できるようにした

--20110510
---短縮URL(http://youtu.be/VIDEO_ID)に対応
---モバイルURL(http://m.youtube.com/*)に対応
---再生数、お気に入り数のフォーマットを追加した(3桁カンマ区切り、日本語表記)
---エラー処理を追加
---大きいサムネイルを取得するようにした
---デフォルトテンプレートを書き直した
---レーティング関係のパラメータを追加
---あまり役に立たないボタンを追加

--20110529
---サムネイルクリック時、URLExec.datの設定に従うことができるようにした
----URLExec.datの設定取得に失敗した場合、browseExtの設定に従って開く
----有効なキーワードは$URL（置換後のURL）、$BASEPATH（V2C保存用フォルダ）のみ
----上記以外のキーワードが含まれるときも、browseExtの設定に従って開く

--20110604
---コメントなどに「$」が複数含まれるとエラーが出る問題を修正
---URLExec.datの一致判定を完全一致から部分一致に変更

--20110606
---固定した後リンクをクリックすると2重にポップアップされる問題を修正
---ダウンローダーに送るときの置換用変数を$URLから$PSYURLに変更
---URLExec.datのエラー処理を強化
---URLExec.datの$BROWSERに暫定対応、$LINK、$POSX、$POSYに対応
----$BROWSERに使用するブラウザはスクリプト内の「browserPath」で設定してください
---ポップアップの文字列を選択可能にした

--20130101
---「.com」以外のドメインに対応

--20130911
---再生できない動画のステータスのyt:state name=processing時にスクリプトエラーが発生するケースの回避コードを追加