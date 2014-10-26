// 初期設定
var vcx = v2c.context;

// 実行用関数定義
function creatAutoRegForm(hash, form, resnum)
{
	var md5hash, arrrflen, line;
	var formno = form;
	var regline = "";
	var outline;
	var arrregform = new Array;
	var flag = false;

	// 読み込まれたものがMD5でなければ終了
	if(!/[\dA-F]{32}/.exec(hash))
	{
		v2c.alert("MD5(アルファベットは大文字のみ)ではありませんでした。");
		return;
	}
	else
		md5hash = RegExp.lastMatch;

	// 自動登録書式読み込み、DBAutoRegForm.txtがなければ書式指定は常に0
	// [[ ]]は独自登録書式、タグでは(0)
	try
	{
		arrregform = (v2c.readFile(v2c.saveDir + "\\script\\DBAutoRegForm.txt")).split("\n");
		arrrflen = arrregform.length;
	}
	catch(e)
	{
		formno  = "(0)";
	}
	finally
	{
		if(formno != "(0)")
		{
			for(i=0; i<arrrflen; i++)
			{
				line = arrregform[i]
				if(flag)
				{
					if(line.indexOf("<END>") == 0)
						break;
					else
						regline += line + "\n";
				}
				else if(line.indexOf(formno) == 0)
					flag = true;
			}
			if(!flag)
			{
				v2c.alert("書式指定" + formno + "は見つかりませんでした...");
				return;
			}
			if(/^\[\[[^\]]+\]\]$/.test(formno))
				formno = "(0)";
		}
		else
			regline = "\r\n\r\n\r\n";

		// 自動登録書式作成
		outline = "[####(" + resnum + ")#(" + md5hash + ")#" + formno + "####/]\n"
			+ regline 
			+ "[/####(" + resnum + ")#(" + md5hash + ")#" + formno + "####]";

		// クリップボードにコピペ
		vcx.setClipboardText(outline);
		return;
	}
}

// 実行
creatAutoRegForm(vcx.selText, vcx.argLine, vcx.res.number);
