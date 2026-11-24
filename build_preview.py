#!/usr/bin/env python3
# build_preview.py — 从私有全量数据切片生成站内试读版 data/preview.js
#
# 背景：全量内容（300 雅字 / 120 名句 / 100 排雷 / 逐姓雷区）是 ¥69 工具包的交付物，
#       不能出现在公开站点上（site/ 会被整体发布）。站内只放限量试读，全量留在 _source_data/。
# 输入：../_source_data/{characters,quotes,mines,surnames,surnames_extra,surnames_all}.js
# 输出：./data/preview.js  —— 唯一对外公开的数据文件
import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(BASE)
PRIVATE = os.path.join(SRC, "_source_data")
OUT = os.path.join(BASE, "data", "preview.js")

# ---------- 试读配额 ----------
CHARS_PER_CATEGORY = 6    # 五大意象 x 6 = 30 字（全量 300）
QUOTES_PER_VOLUME = 3     # 四卷 x 3 = 12 句（全量 120）
MINES_PER_PART = 4        # 三大红线区 x 4 = 12 字（全量 100）
SURNAME_ROWS_PER_GROUP = 4   # 主矩阵每组前 4 姓
EXTRA_ROWS_PER_GROUP = 1     # 扩展姓氏每组前 1 姓
FORMULAS_PER_GROUP = 1       # 每组只放第 1 条黄金公式

# 强制收录：无论排序如何都进试读（创始人本姓，必须在站内可完整体验）
PINNED_SURNAMES = ["苑"]


def clean_surname(v):
    v = re.sub(r"^(?:姓)?[\d/\-—\s]+", "", str(v))
    return v.split("（")[0].split("(")[0].strip()


def pin_into(preview_groups, full_groups, pins):
    """把指定姓氏补进试读分组（若未被切片命中）。"""
    have = set()
    for g in preview_groups:
        for r in g.get("rows", []):
            have.add(clean_surname(r["surname"]))
    for pin in pins:
        if pin in have:
            continue
        done = False
        for fg in full_groups:
            for r in fg.get("rows", []):
                if pin not in clean_surname(r["surname"]):
                    continue
                for pg in preview_groups:
                    if pg.get("tone") == fg.get("tone"):
                        pg["rows"].append(r)
                        have.add(pin)
                        print("  [PIN] 强制收录：%s（%s）" % (r["surname"], fg.get("tone")))
                        done = True
                        break
                if done:
                    break
            if done:
                break


def read_js(name):
    """读取 window.XXX = [...] 形式的生成文件，返回 python 对象。"""
    path = os.path.join(PRIVATE, name + ".js")
    text = open(path, encoding="utf-8").read()
    body = text[text.index("=") + 1:].strip()
    if body.endswith(";"):
        body = body[:-1]
    return json.loads(body)


def head_by(items, key, n):
    """按 key 分组，每组取前 n 条，保持原始顺序。"""
    seen = {}
    out = []
    for it in items:
        k = it.get(key)
        seen[k] = seen.get(k, 0) + 1
        if seen[k] <= n:
            out.append(it)
    return out


def main():
    chars_all = read_js("characters")
    quotes_all = read_js("quotes")
    mines_all = read_js("mines")
    surnames_all = read_js("surnames")
    extra_all = read_js("surnames_extra")
    allsurn_all = read_js("surnames_all")

    chars = head_by(chars_all, "category", CHARS_PER_CATEGORY)
    quotes = head_by(quotes_all, "volume", QUOTES_PER_VOLUME)
    mines = head_by(mines_all, "part", MINES_PER_PART)

    surnames = []
    for g in surnames_all:
        surnames.append({
            "tone": g["tone"],
            "title": g["title"],
            "formulas": g["formulas"][:FORMULAS_PER_GROUP],
            "rows": g["rows"][:SURNAME_ROWS_PER_GROUP],
            "formulasTotal": len(g["formulas"]),
            "rowsTotal": len(g["rows"]),
        })

    extra = []
    for g in extra_all:
        extra.append({
            "tone": g["tone"],
            "rows": g["rows"][:EXTRA_ROWS_PER_GROUP],
            "rowsTotal": len(g["rows"]),
        })

    curated_total = sum(len(g["rows"]) for g in surnames_all) + sum(len(g["rows"]) for g in extra_all)
    pin_into(surnames, surnames_all, PINNED_SURNAMES)
    pin_into(extra, extra_all, PINNED_SURNAMES)
    curated_free = sum(len(g["rows"]) for g in surnames) + sum(len(g["rows"]) for g in extra)

    payload = {
        "meta": {
            "characters": {"total": len(chars_all), "free": len(chars), "unit": "字"},
            "quotes": {"total": len(quotes_all), "free": len(quotes), "unit": "句"},
            "mines": {"total": len(mines_all), "free": len(mines), "unit": "字"},
            "surnames": {"total": curated_total, "free": curated_free, "unit": "姓"},
            "allSurnames": {"total": len(allsurn_all), "free": len(allsurn_all), "unit": "姓"},
        },
        "characters": chars,
        "quotes": quotes,
        "mines": mines,
        "surnames": surnames,
        "surnamesExtra": extra,
        "surnamesAll": allsurn_all,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* 站内限量试读数据 · 由 build_preview.py 自动生成，勿手改\n")
        f.write(" * 全量内容（300 雅字 / 120 名句 / 100 排雷 / 逐姓雷区）属 ¥69 工具包交付物，\n")
        f.write(" * 存放于站点发布目录之外（_source_data/），此处仅为试读切片。 */\n")
        f.write("window.PREVIEW = ")
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")

    m = payload["meta"]
    print("试读版已生成:", OUT)
    print("  雅字   %3d / %3d" % (m["characters"]["free"], m["characters"]["total"]))
    print("  名句   %3d / %3d" % (m["quotes"]["free"], m["quotes"]["total"]))
    print("  排雷   %3d / %3d" % (m["mines"]["free"], m["mines"]["total"]))
    print("  姓氏   %3d / %3d（重点矩阵逐姓雷区）" % (m["surnames"]["free"], m["surnames"]["total"]))
    print("  全量姓氏声调检索 %d 姓（全量保留）" % m["allSurnames"]["total"])
    print("  文件大小: %.1f KB" % (os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    main()
