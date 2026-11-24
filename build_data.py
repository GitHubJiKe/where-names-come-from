#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Parse B01/B02 markdown into JS data files for the site."""
import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(BASE)
OUT = os.path.join(BASE, "data")

B01 = os.path.join(SRC, "B01｜《起名必避的100个伪古风烂俗字与生僻字排雷表》（完整交付版）.md")
B02 = os.path.join(SRC, "B02｜《名扬天下·中国家庭自主起名实操工具包（69元四合一完整版）》.md")


def clean(text):
    t = text.strip()
    t = t.replace("<br>", "\n").replace("<br/>", "\n")
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t)
    t = t.replace("`", "")
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


def split_row(line):
    # split markdown table row on | (no escaped pipes in these docs)
    parts = line.strip().strip("|").split("|")
    return [clean(p) for p in parts]


def is_data_row(line):
    return line.strip().startswith("|") and not re.match(r"^\|[\s\-|]+\|$", line.strip()) and "编号" not in line.split("|")[1] and "句号" not in line.split("|")[1]


def parse_b01():
    text = open(B01, encoding="utf-8").read()
    lines = text.splitlines()
    mines = []
    part = None
    zone = None
    for line in lines:
        if line.startswith("## 第一部分"):
            part = "伪古风烂俗字"
        elif line.startswith("## 第二部分"):
            part = "训诂翻车字"
        elif line.startswith("## 第三部分"):
            part = "生僻歧义字"
        elif line.startswith("### "):
            m = re.match(r"###\s+(.+?)（(No\.\d+)", line)
            zone = re.sub(r"###\s*", "", line).strip()
        elif is_data_row(line) and part:
            cols = split_row(line)
            m = re.match(r"No\.(\d+)", cols[0])
            if not m:
                continue
            entry = {
                "id": int(m.group(1)),
                "char": cols[1].strip("→ ").strip(),
                "part": part,
                "zone": zone or "",
            }
            if part == "伪古风烂俗字":
                entry["diagnosis"] = cols[2]
                entry["alternatives"] = cols[3]
            elif part == "训诂翻车字":
                entry["misuse"] = cols[2]
                entry["diagnosis"] = cols[3]
                entry["alternatives"] = cols[4]
            else:
                entry["reading"] = cols[2]
                entry["diagnosis"] = cols[3]
                entry["alternatives"] = cols[4]
            mines.append(entry)
    return mines


# ---------- B02 雅字库：单元格格式、行结构识别与校验 ----------
# B02 原表存在「（见150）→ 改收【凌】」这类替换写法：作者把被弃用的字留在
# 「汉字」列，把「改收的新字」塞进本该放拼音的第 3 列，导致后续字段整体右移
# 一列。旧版解析器直接按列切分且不校验，于是这几条记录字段全部错位。
# 现在改为「先识别行结构、再映射字段」，并对全表做严格校验。
_PINYIN_CHARS = r"a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńň/"
PINYIN_CELL_RE = re.compile(r"^([%s]+)（(.+?)）$" % _PINYIN_CHARS)
PINYIN_ONLY_RE = re.compile(r"^[%s]+$" % _PINYIN_CHARS)
STROKE_CELL_RE = re.compile(r"^(\d+)画/(.+)$")
CJK_RE = re.compile(r"^[一-龥]$")
VALID_TONES = {"阴平", "阳平", "上声", "去声"}
VALID_PINGZE = {"平", "仄"}
VALID_LEVELS = {"一级", "二级"}


def parse_pinyin_cell(cell):
    """解析「líng（阳平·平）」；兼容多音「xiù/sù（去声·仄）」。失败返回 None。"""
    m = PINYIN_CELL_RE.match(cell)
    if not m:
        return None
    tone, _, pingze = m.group(2).partition("·")
    return m.group(1), tone.strip(), pingze.strip()


def parse_stroke_cell(cell):
    """解析「10画/一级」。失败返回 None。"""
    m = STROKE_CELL_RE.match(cell)
    if not m:
        return None
    return int(m.group(1)), m.group(2).strip()


def extract_revised_char(cell):
    """从替换说明里提取「改收」的新字（cell 已 clean：** 去除、<br> 转换行）。"""
    # 优先「【凌】」这类方括号标注
    m = re.findall(r"【([一-龥])】", cell)
    if m:
        return m[-1]
    # 其次「<br>**潆**」换行后的独立单字
    tail = cell.split("\n")[-1].strip()
    if CJK_RE.match(tail):
        return tail
    # 最后「（见150）→ 凌」箭头后的字
    m = re.search(r"→\s*([一-龥])\s*$", cell)
    return m.group(1) if m else None


def strip_editorial_tail(meaning):
    """清理释义里残留的内部改收批注（No.222 一类），只保留面向客户的正文。

    B02 作者在释义列里写过「，此处改收单音字 【宸→改收 宇/宙/旻】）→ 旻」
    这种编辑痕迹；它不该出现在客户看到的页面上，但也不代表新字数据，
    因此只做剥离、不补写任何内容。
    """
    s = re.sub(r"[，,]\s*此处改收[^）]*）\s*→.*$", "）", meaning)
    s = re.sub(r"\s*→\s*[一-龥]\s*$", "", s)
    return s.strip()


def parse_b02_characters():
    text = open(B02, encoding="utf-8").read()
    lines = text.splitlines()
    chars = []
    revisions = []
    category = None
    in_module1 = False
    for line in lines:
        if line.startswith("## 模块一"):
            in_module1 = True
        elif line.startswith("## 模块二"):
            in_module1 = False
        elif in_module1 and line.startswith("### "):
            category = re.sub(r"^###\s*", "", line)
            category = re.sub(r"（No\.\d+.*", "", category).strip()
        elif in_module1 and is_data_row(line):
            cols = split_row(line)
            if len(cols) < 6 or not re.match(r"^\d{3}$", cols[0]):
                continue
            cid = int(cols[0])
            py = parse_pinyin_cell(cols[2])
            st = parse_stroke_cell(cols[3])

            if py and st:
                # ---- 标准行：编号 | 汉字 | 拼音 | 笔画/层级 | 释义 | 组合 ----
                char = cols[1]
                pinyin, tone, pingze = py
                strokes, level = st
                meaning, combos = cols[4], cols[5]
                # 少数行把「改收字的读音」写进第 6 列（如 No.222 的
                # 「mín（阳平·平）」），它不是入名组合，不能当 combos 展示。
                if parse_pinyin_cell(combos):
                    revisions.append((cid, "末列为改收字读音，已忽略：" + combos))
                    combos = ""
            else:
                # ---- 改收行：第 3 列是替换说明，字段整体右移一列 ----
                # 编号 | 被弃用字 | 改收说明 | 拼音 | 笔画/层级 | 释义
                char = extract_revised_char(cols[2])
                py2 = parse_pinyin_cell(cols[3])
                st2 = parse_stroke_cell(cols[4])
                if not (char and py2 and st2):
                    raise ValueError(
                        "No.%03d 行结构无法识别（疑似新的字段错位）：%r" % (cid, cols[:6])
                    )
                pinyin, tone, pingze = py2
                strokes, level = st2
                meaning = cols[5]
                combos = ""  # 原表改收行没有独立的「推荐组合」列
                revisions.append((cid, "改收 %s → %s（原说明：%s）" % (
                    cols[1], char, cols[2].replace("\n", " / "))))

            meaning = strip_editorial_tail(meaning)
            chars.append({
                "id": cid,
                "char": char,
                "pinyin": pinyin,
                "tone": tone,
                "pingze": pingze,
                "strokes": strokes,
                "level": level,
                "meaning": meaning,
                "combos": combos,
                "category": category,
            })
    return chars, revisions


def validate_characters(chars):
    """全表字段级校验：任何列错位 / 重复字 / 非法值都显式报错，不静默通过。"""
    errors = []
    seen = {}
    for c in chars:
        tag = "No.%03d「%s」" % (c["id"], c["char"])
        if not CJK_RE.match(c["char"] or ""):
            errors.append("%s 字头非单个汉字：%r" % (tag, c["char"]))
        if not PINYIN_ONLY_RE.match(c["pinyin"] or ""):
            errors.append("%s 拼音列异常：%r" % (tag, c["pinyin"]))
        if c["tone"] not in VALID_TONES:
            errors.append("%s 声调非法：%r" % (tag, c["tone"]))
        if c["pingze"] not in VALID_PINGZE:
            errors.append("%s 平仄非法：%r" % (tag, c["pingze"]))
        if not isinstance(c["strokes"], int) or c["strokes"] <= 0:
            errors.append("%s 笔画非法：%r" % (tag, c["strokes"]))
        if c["level"] not in VALID_LEVELS:
            errors.append("%s 字表层级非法：%r" % (tag, c["level"]))
        if not c["meaning"] or re.match(r"^\d+画/", c["meaning"]):
            errors.append("%s 释义列疑似错位：%r" % (tag, (c["meaning"] or "")[:30]))
        if "改收" in c["meaning"] or re.search(r"（见\d+）|→", c["meaning"]):
            errors.append("%s 释义残留内部编辑批注：%r" % (tag, c["meaning"][:40]))
        if c["combos"] and PINYIN_CELL_RE.match(c["combos"]):
            errors.append("%s 组合列疑似错位（是拼音）：%r" % (tag, c["combos"][:30]))
        if not c["category"]:
            errors.append("%s 缺少意象分类" % tag)
        if c["char"] in seen:
            errors.append("重复字「%s」：No.%03d 与 No.%03d"
                          % (c["char"], seen[c["char"]], c["id"]))
        else:
            seen[c["char"]] = c["id"]
    ids = [c["id"] for c in chars]
    if ids != list(range(1, len(chars) + 1)):
        errors.append("编号不连续/缺失：期望 1..%d，实际 %d 条" % (len(chars), len(chars)))
    return errors, seen


def parse_b02_quotes():
    text = open(B02, encoding="utf-8").read()
    lines = text.splitlines()
    quotes = []
    volume = None
    in_module2 = False
    for line in lines:
        if line.startswith("## 模块二"):
            in_module2 = True
        elif line.startswith("## 模块三"):
            in_module2 = False
        elif in_module2 and line.startswith("### "):
            volume = re.sub(r"^###\s*", "", line)
            volume = re.sub(r"（句\d+.*", "", volume).strip()
        elif in_module2 and is_data_row(line):
            cols = split_row(line)
            if len(cols) < 5 or not cols[0].startswith("句"):
                continue
            quotes.append({
                "id": cols[0],
                "source": cols[1],
                "quote": cols[2],
                "context": cols[3],
                "names": cols[4],
                "volume": volume,
            })
    return quotes


def parse_b02_surnames():
    text = open(B02, encoding="utf-8").read()
    lines = text.splitlines()
    groups = []
    group = None
    in_module3 = False
    for line in lines:
        if line.startswith("## 模块三"):
            in_module3 = True
        elif line.startswith("## 模块四"):
            in_module3 = False
        elif in_module3 and line.startswith("### "):
            title = re.sub(r"^###\s*", "", line).strip()
            group = {"title": title, "tone": re.sub(r"（.*", "", title), "formulas": [], "rows": []}
            groups.append(group)
        elif in_module3 and group is not None:
            s = line.strip()
            m = re.match(r"^(?:\d+\.|-)\s+\*\*(.+?)\*\*(.+)$", s)
            if m and "公式" in m.group(1):
                desc = clean(m.group(2)).lstrip("（：").rstrip("）")
                if len(desc) > 8:
                    group["formulas"].append({"name": clean(m.group(1)), "desc": desc})
            elif is_data_row(line):
                cols = split_row(line)
                if len(cols) >= 3 and ("姓" in cols[0] or "龚" in cols[0]):
                    group["rows"].append({
                        "surname": cols[0],
                        "blacklist": cols[1],
                        "recommended": cols[2],
                    })
    return groups


def write_js(name, obj):
    path = os.path.join(OUT, name + ".js")
    with open(path, "w", encoding="utf-8") as f:
        f.write("// auto-generated from business docs, do not edit by hand\n")
        f.write("window." + name.upper().replace("-", "_") + " = ")
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"wrote {path}: {len(obj)} items")


def main():
    mines = parse_b01()
    chars, revisions = parse_b02_characters()
    quotes = parse_b02_quotes()
    surnames = parse_b02_surnames()

    # 门禁：雅字库全表校验通过才允许写入，避免错位数据悄悄进站点
    errors, seen = validate_characters(chars)
    levels = {}
    for c in chars:
        levels[c["level"]] = levels.get(c["level"], 0) + 1
    print("mines:", len(mines), "chars:", len(chars), "quotes:", len(quotes))
    print("字库校验: %d 条 / %d 个不重复字 / %s"
          % (len(chars), len(seen),
             " · ".join("%s %d" % (k, levels[k]) for k in ("一级", "二级") if k in levels)))
    if revisions:
        print("改收条目 (%d):" % len(revisions))
        for cid, note in revisions:
            print("  No.%03d  %s" % (cid, note))
    if errors:
        print("\n[FAIL] 校验未通过，共 %d 项，已中止写入：" % len(errors))
        for e in errors:
            print("  -", e)
        raise SystemExit(1)
    print("[OK] 全表校验通过\n")

    write_js("mines", mines)
    write_js("characters", chars)
    write_js("quotes", quotes)
    write_js("surnames", surnames)
    for g in surnames:
        print(g["title"], "formulas:", len(g["formulas"]), "rows:", len(g["rows"]))


if __name__ == "__main__":
    main()
