#!/usr/bin/env python3
# build_toolkit.py — 生成 ¥69 工具包交付物（四合一 PDF 的打印源）
#
# 输入：../_source_data/{characters,quotes,mines,surnames,surnames_extra,surnames_all}.js（全量）
# 输出：../_deliverables/toolkit_print.html → 再用无头 Chrome 打印为 PDF
# 注意：本文件与产物都放在站点发布目录之外，绝不进入公开仓库。
import html
import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(BASE)
PRIVATE = os.path.join(SRC, "_source_data")
OUTDIR = os.path.join(SRC, "_deliverables")
OUT = os.path.join(OUTDIR, "toolkit_print.html")

E = html.escape


def read_js(name):
    text = open(os.path.join(PRIVATE, name + ".js"), encoding="utf-8").read()
    body = text[text.index("=") + 1:].strip()
    if body.endswith(";"):
        body = body[:-1]
    return json.loads(body)


def clean_surname(v):
    v = re.sub(r"^(?:姓)?[\d/\-—\s]+", "", str(v))
    return v.strip()


CSS = """
@page { size: A4; margin: 15mm 13mm 15mm 13mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: "Songti SC", "STSong", "Noto Serif SC", "SimSun", serif;
  font-size: 9pt; line-height: 1.62; color: #1c1a16; -webkit-print-color-adjust: exact;
}
h1, h2, h3, h4 { font-family: "PingFang SC", "Heiti SC", "Noto Sans SC", sans-serif; font-weight: 700; }

/* ---------- 封面 ---------- */
.cover { height: 253mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-after: always; }
.cover-seal { width: 22mm; height: 22mm; border: 1.2mm solid #9d392b; color: #9d392b; font-size: 15mm; line-height: 20mm; font-family: "PingFang SC", sans-serif; font-weight: 700; margin-bottom: 10mm; }
.cover-kicker { font-size: 9pt; letter-spacing: 4pt; color: #8a7340; margin-bottom: 7mm; }
.cover h1 { font-size: 25pt; letter-spacing: 3pt; line-height: 1.55; margin-bottom: 5mm; }
.cover-sub { font-size: 11pt; letter-spacing: 6pt; color: #6b6252; border-top: 0.4pt solid #c9bda2; border-bottom: 0.4pt solid #c9bda2; padding: 3mm 0; margin-bottom: 10mm; }
.cover-items { font-size: 9.5pt; line-height: 2.3; color: #33302a; margin-bottom: 12mm; }
.cover-items div { letter-spacing: 0.5pt; }
.cover-foot { font-size: 8pt; line-height: 2; color: #7a7263; letter-spacing: 0.5pt; }

/* ---------- 通用章节 ---------- */
.chapter { page-break-before: always; }
.chapter-head { border-left: 3.5pt solid #9d392b; padding-left: 4mm; margin-bottom: 6mm; }
.chapter-num { font-size: 8pt; letter-spacing: 2pt; color: #a8843f; }
.chapter-head h2 { font-size: 16pt; letter-spacing: 2pt; margin: 1mm 0 1.5mm; }
.chapter-head p { font-size: 8.5pt; color: #6b6252; line-height: 1.75; }

.part-title { font-size: 11pt; letter-spacing: 1.5pt; margin: 7mm 0 2mm; padding-bottom: 1.5mm; border-bottom: 0.5pt solid #d8cdb4; page-break-after: avoid; }
.part-note { font-size: 8pt; color: #6b6252; line-height: 1.8; margin-bottom: 3mm; page-break-after: avoid; }

/* ---------- 字库表 ---------- */
table { width: 100%; border-collapse: collapse; }
.char-table th { font-family: "PingFang SC", sans-serif; font-size: 7.5pt; font-weight: 700; background: #f2ece0; border-bottom: 0.5pt solid #b9ab8c; padding: 1.5mm 1.2mm; text-align: left; letter-spacing: 0.5pt; }
.char-table td { border-bottom: 0.3pt solid #e2dac8; padding: 1.4mm 1.2mm; vertical-align: top; font-size: 7.8pt; line-height: 1.55; }
.char-table tr { page-break-inside: avoid; }
.c-no { width: 8mm; color: #9a917e; font-size: 7pt; }
.c-glyph { width: 11mm; font-size: 13pt; font-weight: 700; text-align: center; color: #1c1a16; }
.c-py { width: 21mm; font-size: 7.4pt; }
.c-sl { width: 15mm; font-size: 7.2pt; color: #5c5545; }
.c-mean { }
.c-combo { width: 42mm; font-size: 7.4pt; color: #3f5c4b; }

/* ---------- 名句 ---------- */
.quote-item { page-break-inside: avoid; padding: 2.5mm 0; border-bottom: 0.3pt solid #e2dac8; }
.q-head { font-size: 7.8pt; color: #8a7340; letter-spacing: 0.5pt; margin-bottom: 1mm; }
.q-text { font-size: 10pt; line-height: 1.7; margin-bottom: 1mm; }
.q-ctx { font-size: 7.8pt; color: #5c5545; line-height: 1.65; }
.q-names { font-size: 8pt; color: #3f5c4b; margin-top: 0.8mm; }

/* ---------- 姓氏 ---------- */
.formula-box { background: #faf6ec; border: 0.4pt solid #ddd2ba; padding: 3mm 4mm; margin-bottom: 3mm; page-break-inside: avoid; }
.formula-row { font-size: 8.2pt; line-height: 1.9; }
.formula-row b { color: #9d392b; font-family: "PingFang SC", sans-serif; }
.surn-table th { font-family: "PingFang SC", sans-serif; font-size: 7.5pt; font-weight: 700; background: #f2ece0; border-bottom: 0.5pt solid #b9ab8c; padding: 1.5mm; text-align: left; }
.surn-table td { border-bottom: 0.3pt solid #e2dac8; padding: 1.6mm 1.5mm; vertical-align: top; font-size: 7.8pt; line-height: 1.6; }
.surn-table tr { page-break-inside: avoid; }
.s-name { width: 20mm; font-weight: 700; }
.s-rec { width: 46mm; color: #3f5c4b; }

/* ---------- 六步打勾 ---------- */
.gate-item { display: flex; gap: 3mm; padding: 3mm 0; border-bottom: 0.3pt dashed #cfc4aa; page-break-inside: avoid; }
.gate-box { flex: none; width: 6mm; height: 6mm; border: 0.6pt solid #6b6252; margin-top: 1mm; }
.gate-body h4 { font-size: 9pt; margin-bottom: 1mm; }
.gate-body p { font-size: 8pt; color: #5c5545; line-height: 1.75; }

/* ---------- 附录 ---------- */
.all-surn { column-count: 6; column-gap: 5mm; font-size: 7.5pt; line-height: 1.85; }
.all-surn span { display: inline-block; }
.all-surn b { font-weight: 700; }

/* ---------- 说明页 ---------- */
.plain p { font-size: 8.6pt; line-height: 1.95; margin-bottom: 2.5mm; }
.plain h3 { font-size: 10pt; margin: 5mm 0 2mm; }
.plain ol, .plain ul { margin: 0 0 2.5mm 5mm; }
.plain li { font-size: 8.6pt; line-height: 1.9; margin-bottom: 1mm; }
.notice-box { border-left: 2.5pt solid #a8843f; background: #faf6ec; padding: 3mm 4mm; font-size: 8.2pt; line-height: 1.85; margin: 3mm 0; }
.step-item { page-break-inside: avoid; margin-bottom: 4mm; padding-left: 9mm; position: relative; }
.step-num { position: absolute; left: 0; top: 0; width: 6.5mm; height: 6.5mm; line-height: 6mm; text-align: center; border: 0.5pt solid #9d392b; color: #9d392b; font-family: "PingFang SC", sans-serif; font-size: 8pt; font-weight: 700; }
.step-item h4 { font-size: 9.5pt; margin-bottom: 1mm; }
.step-item p { font-size: 8.4pt; line-height: 1.85; color: #33302a; }
"""


def build():
    chars = read_js("characters")
    quotes = read_js("quotes")
    surnames = read_js("surnames")
    extra = read_js("surnames_extra")
    allsurn = read_js("surnames_all")

    P = []
    P.append('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">')
    P.append("<title>名扬天下·中国家庭自主起名实操工具包（69元四合一完整版）</title>")
    P.append("<style>%s</style></head><body>" % CSS)

    # ---------- 封面 ----------
    P.append(
        '<section class="cover">'
        '<div class="cover-seal">名</div>'
        '<div class="cover-kicker">名扬天下 · 中国姓名学教研组</div>'
        "<h1>中国家庭自主起名<br>实操工具包</h1>"
        '<div class="cover-sub">四 合 一 完 整 版</div>'
        '<div class="cover-items">'
        "<div>模块一 · 300 个低频高雅入名字库（五大意象分册）</div>"
        "<div>模块二 · 120 句经史安全化用名句库（四卷）</div>"
        "<div>模块三 · 117 姓四声平仄矩阵与逐姓谐音黑名单</div>"
        "<div>模块四 · 办证前六步魔鬼排雷打勾表</div>"
        "<div>附赠 · 五步定名流程 ／ 1071 姓声调速查</div>"
        "</div>"
        '<div class="cover-foot">'
        "依据《通用规范汉字表》（2013 年版）与《说文解字》编纂<br>"
        "不谈八字 · 不算五格 · 不信生肖 · 只讲文字学"
        "</div></section>"
    )

    # ---------- 使用许可 ----------
    P.append('<section class="chapter plain">')
    P.append('<div class="chapter-head"><div class="chapter-num">使用许可与声明</div><h2>请先读这一页</h2></div>')
    P.append(
        '<div class="notice-box"><b>正版识别：</b>本工具包由公众号「名有来处」·《名扬天下：中国姓名学》教研组出品，'
        "读者专享价 69 元（原价 199 元）。正版文件由教研组通过微信直接发送，不含任何第三方水印或代理标识。</div>"
    )
    P.append(
        "<h3>使用范围</h3>"
        "<p>本文件仅供购买者本人及家庭为子女命名使用，可自行打印装订。请勿转售、公开分发、二次上传至网盘或社群。"
        "如需为亲友代查，建议请对方自行购买正版——这也是这套内容能持续修订的唯一支撑。</p>"
    )
    P.append(
        "<h3>内容边界（重要）</h3>"
        "<p>本工具包属文字学与音韵学范畴，全部结论出自《通用规范汉字表》（2013 年版）、《说文解字》及经史典籍，"
        "<b>不涉及算命、占卜、风水、命理</b>，不采集生辰八字，不测算五行缺补、五格笔画吉凶与生肖喜忌。"
        "书中不提供任何超出文献考据范围的「吉凶」判断。</p>"
        "<p>名字最终能否登记，以当地公安机关户籍管理规定为准。若遇极个别地区对二级字另有内部掌握口径，"
        "请以户籍窗口现场答复为准，本工具包不承担因地方执行差异产生的后果。</p>"
    )
    P.append(
        "<h3>版本与更新</h3>"
        "<p>本版为定稿版。如后续因国家字表调整或内容勘误产生修订，同一微信号可免费获取更新版，无需二次付费。"
        "发现错漏欢迎通过公众号反馈，教研组会逐条核校。</p>"
    )
    P.append("</section>")

    # ---------- 五步定名流程 ----------
    steps = [
        ("第一步 · 定意象（先想清楚要什么气质）", "不要一上来就翻字。先写下一两句话：希望孩子将来是什么样的人——温润笃定？清朗开阔？沉静有锋？"
         "这句话决定了后面翻哪一册。「想不出」的话，用最朴素的办法：把你最欣赏的一位长辈或历史人物写下来，提炼两个形容词。"),
        ("第二步 · 查字（模块一，只在这一册里挑）", "按意象翻对应分册，每册 60 字。挑字时同时看四项：字表层级（只用一级或二级）、《说文》本义（须无凶苦）、笔画（4—16 画为宜）、"
         "入名示范（看它通常跟什么字搭）。先挑出 6—10 个候选字，不要急着定。"),
        ("第三步 · 配句（模块二，给名字找出处）", "拿候选字去名句库里对，找出含该字、或意境相合的原句。有出处的名字，将来孩子问「我名字什么意思」时，你答得出来。"
         "建议配 3 组，每组记下原句与出处，后面和长辈沟通、以及办证填表都用得上。"),
        ("第四步 · 过姓氏平仄（模块三 + 附录）", "先在附录查自家姓氏属阴平 / 阳平 / 上声 / 去声，再到模块三找该组的黄金公式与逐姓谐音黑名单。"
         "重点三件事：① 不能三平调、三上声、三去声相连；② 该姓的谐音黑名单里有的音，一律换掉；③ 名字连读十遍，别拗口。"),
        ("第五步 · 六步打勾（模块四，最后一关）", "把定下来的 2—3 组名字，逐组走一遍六步自检。六关全过再上户口。"
         "特别提醒：第四关要分别用普通话、父亲方言、母亲方言连读十遍并倒读三遍——方言谐音是事后最难改的坑。"),
    ]
    P.append('<section class="chapter plain">')
    P.append('<div class="chapter-head"><div class="chapter-num">附赠 A</div><h2>五步定名流程</h2>'
             "<p>照着走，不要在四个模块之间来回迷路。全程约两到三个晚上。</p></div>")
    for i, (t, d) in enumerate(steps, 1):
        P.append('<div class="step-item"><div class="step-num">%d</div><h4>%s</h4><p>%s</p></div>' % (i, E(t), E(d)))
    P.append("</section>")

    # ---------- 模块一：字库 ----------
    cats = []
    for c in chars:
        if c["category"] not in cats:
            cats.append(c["category"])
    P.append('<section class="chapter">')
    P.append('<div class="chapter-head"><div class="chapter-num">模块一</div>'
             "<h2>三百个低频高雅入名字库</h2>"
             "<p>全部选自《通用规范汉字表》一级字表（3500 常用字）中的低频雅字与二级字表（3000 次常用字）中的经典名物字，"
             "不含三级生僻字与异体字，全国户籍、银行、民航、学信网零报错。按五大文化意象分册，每字六项标注。</p></div>")
    for cat in cats:
        group = [c for c in chars if c["category"] == cat]
        P.append('<div class="part-title">%s（%d 字）</div>' % (E(cat), len(group)))
        note = {"第一类": "君子比德于玉，温润而栗，缜密以栗，具名门世家的端庄贵气与法度感。",
                "第二类": "草木有本心，四时自成序。取香草嘉木之清芬，得生生不息之韧。",
                "第三类": "上善若水，澄澈而能容。取江海云雨之象，得开阔与通透。",
                "第四类": "日月昭昭，星辰有序。取晨光与旷野之气，得明朗与远志。",
                "第五类": "仁者不忧，智者不惑。取心性言行之正，得立身之本。"}
        key = cat[:3]
        P.append('<div class="part-note">适用期许：%s</div>' % E(note.get(key, "")))
        P.append('<table class="char-table"><thead><tr>'
                 '<th class="c-no">编号</th><th class="c-glyph">字</th><th class="c-py">拼音·声调·平仄</th>'
                 '<th class="c-sl">笔画/层级</th><th class="c-mean">《说文解字》造字本义与典籍出处</th>'
                 '<th class="c-combo">推荐入名组合与适用气质</th></tr></thead><tbody>')
        for c in group:
            sl = "%s画/%s" % (c["strokes"], c["level"]) if c.get("strokes") else (c.get("level") or "")
            py = "%s（%s·%s）" % (c["pinyin"], c.get("tone", ""), c.get("pingze", ""))
            P.append(
                "<tr>"
                '<td class="c-no">%03d</td>'
                '<td class="c-glyph">%s</td>'
                '<td class="c-py">%s</td>'
                '<td class="c-sl">%s</td>'
                '<td class="c-mean">%s</td>'
                '<td class="c-combo">%s</td>'
                "</tr>" % (c["id"], E(c["char"]), E(py), E(sl), E(c.get("meaning", "")), E(c.get("combos", "") or "—"))
            )
        P.append("</tbody></table>")
    P.append("</section>")

    # ---------- 模块二：名句 ----------
    vols = []
    for q in quotes:
        if q["volume"] not in vols:
            vols.append(q["volume"])
    P.append('<section class="chapter">')
    P.append('<div class="chapter-head"><div class="chapter-num">模块二</div>'
             "<h2>一百二十句经史安全化用名句库</h2>"
             "<p>全部逐篇核查《十三经注疏》与原诗小序，剔除悼亡、弃妇、贬谪、讽刺、绝命语境。"
             "每句附语境释义与 2—4 个可落户备选名，并标平仄。</p></div>")
    for vol in vols:
        group = [q for q in quotes if q["volume"] == vol]
        P.append('<div class="part-title">%s</div>' % E(re.sub(r"（句.*$", "", vol)))
        for q in group:
            P.append(
                '<div class="quote-item">'
                '<div class="q-head">%s ｜ %s</div>'
                '<div class="q-text">%s</div>'
                '<div class="q-ctx">语境：%s</div>'
                '<div class="q-names">备选名：%s</div>'
                "</div>" % (E(q["id"]), E(q["source"]), E(q["quote"]), E(q.get("context", "")), E(q.get("names", "")))
            )
    P.append("</section>")

    # ---------- 模块三：姓氏 ----------
    P.append('<section class="chapter">')
    P.append('<div class="chapter-head"><div class="chapter-num">模块三</div>'
             "<h2>一百一十七姓四声平仄矩阵与逐姓谐音黑名单</h2>"
             "<p>一个名字好不好听，八成取决于姓氏声调与后两字的平仄组合。本矩阵按阴平 / 阳平 / 上声 / 去声四组编排，"
             "每组给黄金公式，并逐姓标注谐音雷区与平仄合规的雅名示范。</p></div>")
    P.append(
        '<div class="notice-box"><b>三大绝对声学禁区：</b>'
        "① 严禁三平调（如「张思源」），读来一条直线飘在空中；"
        "② 严禁三上声（如「李雨果」），连读变调、舌头打结；"
        "③ 严禁三去声（如「赵志尚」），连续重音砸下，像在训话。</div>"
    )
    for g in surnames:
        ex = [e for e in extra if e["tone"] in g["tone"]]
        exrows = []
        for e in ex:
            exrows.extend(e["rows"])
        P.append('<div class="part-title">%s</div>' % E(g["title"]))
        P.append('<div class="formula-box">')
        for f in g["formulas"]:
            P.append('<div class="formula-row"><b>%s</b>　%s</div>' % (E(f["name"]), E(f["desc"])))
        P.append("</div>")
        P.append('<table class="surn-table"><thead><tr>'
                 '<th class="s-name">姓氏</th><th>谐音雷区（连读十遍必翻车）</th>'
                 '<th class="s-rec">正统雅名示范（平仄合规）</th></tr></thead><tbody>')
        for r in g["rows"] + exrows:
            P.append("<tr><td class=\"s-name\">%s</td><td>%s</td><td class=\"s-rec\">%s</td></tr>"
                     % (E(clean_surname(r["surname"])), E(r["blacklist"]), E(r["recommended"])))
        P.append("</tbody></table>")
    P.append("</section>")

    # ---------- 模块四：六步打勾 ----------
    gates = [
        ("第 1 关：国家规范字表关（防系统死机）",
         "检查名字中每一个字是否 100% 属于《通用规范汉字表》一级字（3500）或二级字（3000）。"
         "凡三级字表生僻字、表外古字、及「喆、堃、昇、甯」等异体字，一律淘汰。"),
        ("第 2 关：《说文》本义与原典语境关（防训诂翻车）",
         "是否查过每个字的造字本义？绝无「夭、殇、戾、芜、默、孤、冥、恙、佞、姬」等凶苦本义；"
         "所引古诗是否核查过全诗背景？绝非悼亡诗、弃妇诗、亡国词、绝命词。"),
        ("第 3 关：四声平仄与唇舌咬字关（防拗口扁平）",
         "连姓氏用标准普通话大声朗读 5 遍：是否避开三平调、三上声、三去声？"
         "三字声母是否避开连续同部位「吃螺丝」？"),
        ("第 4 关：普通话、方言语与英文 Pinyin 三重谐音关（防校园外号）",
         "用普通话、父亲方言、母亲方言、常住城市方言分别快速连读 10 遍并倒读 3 遍，有无不雅谐音？"
         "写成汉语拼音是否撞车英文粗口或负面词？"),
        ("第 5 关：汉字几何建筑与书写工学关（防视觉呆板）",
         "连姓氏在内三字，是否避开「三个左右结构并排」或「三个上下结构堆叠」？"
         "单字笔画是否在 4—16 画之间（不含「淼、鑫、焱、垚」等三叠字），确保六岁写得动、成年后签名流畅？"),
        ("第 6 关：家族长辈避讳与时代抗老化关（防三十年后尴尬）",
         "是否已排查父系、母系三代长辈姓名，确保无同字及高频同音字？"
         "闭眼想象孩子四十五岁成为学者、高管时，这名字印在名片与著作封面上，是否依然端庄得体、不显低幼甜腻？"),
    ]
    P.append('<section class="chapter">')
    P.append('<div class="chapter-head"><div class="chapter-num">模块四</div>'
             "<h2>办证前六步魔鬼排雷打勾表</h2>"
             "<p>本页可单独打印，贴在冰箱或书桌前。六关全过，再去办理《出生医学证明》。</p></div>")
    P.append('<div class="notice-box" style="text-align:center;font-size:9pt;">'
             "待核验姓名：__________________　姓氏声调组：__________　核验日期：__________</div>")
    for t, d in gates:
        P.append('<div class="gate-item"><div class="gate-box"></div>'
                 '<div class="gate-body"><h4>%s</h4><p>%s</p></div></div>' % (E(t), E(d)))
    P.append('<div class="notice-box" style="margin-top:6mm;">'
             "<b>六关全过：</b>□ 是　□ 否（否 → 回到对应关卡修正后重走）</div>")
    P.append("</section>")

    # ---------- 附录 B：1071 姓声调 ----------
    GN = {1: "阴", 2: "阳", 3: "上", 4: "去"}
    P.append('<section class="chapter">')
    P.append('<div class="chapter-head"><div class="chapter-num">附赠 B</div><h2>117 姓之外的全量姓氏声调速查</h2>'
             "<p>共 %d 个姓氏（含复姓），按人口排名排列，逐姓标注拼音与四声归属。"
             "先查自家姓氏属哪一组，再到模块三找对应公式与逐姓雷区。</p></div>" % len(allsurn))
    P.append('<div class="part-note">体例：姓氏（拼音）· 声调字　｜　阴=阴平（平）　阳=阳平（平）　上=上声（仄）　去=去声（仄）</div>')
    P.append('<div class="all-surn">')
    for s, py, t, pop in allsurn:
        P.append("<span><b>%s</b>（%s）%s</span>" % (E(s), E(py), GN.get(t, "")))
    P.append("</div></section>")

    # ---------- 版权尾页 ----------
    P.append('<section class="chapter plain">')
    P.append('<div class="chapter-head"><div class="chapter-num">出品</div><h2>名有来处</h2></div>')
    P.append(
        "<p>名以正体，字以表德。本教研组秉承《说文解字》训诂正脉与汉语音韵学，"
        "为中国家庭提供经得起时间与户籍系统双重检验的命名服务。</p>"
        "<p><b>不谈八字，不算五格，不信生肖——只讲文字学。</b></p>"
        "<h3>我们的三级服务体系</h3>"
        "<ul>"
        "<li>自主起名实操工具包 ¥69（本文件）——预算有限、愿意自己动手的家庭</li>"
        "<li>五维姓名美学诊断 ¥199／次——已有 1—3 个备选名、全家争执不下，24 小时出报告</li>"
        "<li>传世家风·典籍定制起名 ¥980／单——希望老师从典籍原创 6 组方案，3 个工作日交付</li>"
        "</ul>"
        "<h3>获取后续支持</h3>"
        "<p>微信公众号：名有来处　｜　回复【工具包】获取购买与更新，回复【诊断】预约评估，回复【排雷】领取免费排雷手册。</p>"
        '<div class="notice-box" style="margin-top:8mm;">本文件为原创知识产品，著作权归教研组所有。'
        "欢迎引用观点并注明出处，请勿整册复制分发。</div>"
    )
    P.append("</section>")

    P.append("</body></html>")

    os.makedirs(OUTDIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(P))
    print("打印源已生成:", OUT)
    print("  字库 %d 条 / 名句 %d 条 / 姓氏 %d 行 / 全量姓氏 %d"
          % (len(chars), len(quotes), sum(len(g["rows"]) for g in surnames) + sum(len(g["rows"]) for g in extra), len(allsurn)))
    print("  HTML 大小: %.1f KB" % (os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    build()
