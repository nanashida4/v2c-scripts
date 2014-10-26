//【登録場所】レス表示
//【ラベル】単発IDのレスを非表示
//【内容】
//  NG設定の無い単発IDのレスに「このレスを非表示」を適用する。NGラベルは「レス番号」となる。
//  一方で、単発IDじゃないのに「レス番号」NGとなっているレス（おそらく手動で設定したもの）は
//  無条件に「このレスを非表示」を解除される。
//  これは、前回単発IDだったレスが更新で単発じゃないとなった場合、再表示するようにしたい為。
//【コマンド】$SCRIPT setNG_1ID_Res.js
//【スクリプト】
// ----- 次の行から -----
var th = v2c.context.thread

if (th)
{
    var format1 = '単発IDレス非表示[ 設定数: '
    var format2 = ' / 解除数: '
    var format3 = ' ]'
    var ng = 0
    var ok = 0

    for ( var i = 0; i < th.localResCount; i++ )
    {
        var res = th.getRes(i)
        if (!res) continue;

        // 単発IDで他にNG設定が無ければ、「レス番号」NGを設定して非表示にする。
        if ( res.idCount == 1 )
        {
            if ( !res.ng )
            {
                res.setNGRes()
                ng++
            }
        }
        // 単発でなく「レス番号」NGであれば無条件に解除する。
        // threadld.js内のres.setNGRes()でNGラベルを指定出来たらいいのになー
        // else if ( res.ngReason == '単発ID' )
        else if ( res.ngReason == 'レス番号' )
        {
            res.resetNGRes()
            ok++
        }

        v2c.setStatus( format1 + ng + format2 + ok + format3 )
    }
}
v2c.beep()
// ----- 前の行まで -----