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


def parse_b02_characters():
    text = open(B02, encoding="utf-8").read()
    lines = text.splitlines()
    chars = []
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
            pinyin_raw = cols[2]  # e.g. "zhāng（阴平·平）"
            pm = re.match(r"([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)（(.+?)）", pinyin_raw)
            pinyin = pm.group(1) if pm else pinyin_raw
            tone_info = pm.group(2) if pm else ""
            tone = tone_info.split("·")[0] if "·" in tone_info else tone_info
            pingze = tone_info.split("·")[-1] if "·" in tone_info else ""
            sl = cols[3]  # e.g. "15画/二级"
            sm = re.match(r"(\d+)画/(.+)", sl)
            strokes = int(sm.group(1)) if sm else None
            level = sm.group(2) if sm else sl
            chars.append({
                "id": int(cols[0]),
                "char": cols[1],
                "pinyin": pinyin,
                "tone": tone,
                "pingze": pingze,
                "strokes": strokes,
                "level": level,
                "meaning": cols[4],
                "combos": cols[5],
                "category": category,
            })
    return chars


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
    chars = parse_b02_characters()
    quotes = parse_b02_quotes()
    surnames = parse_b02_surnames()
    write_js("mines", mines)
    write_js("characters", chars)
    write_js("quotes", quotes)
    write_js("surnames", surnames)
    # sanity
    print("mines:", len(mines), "chars:", len(chars), "quotes:", len(quotes))
    for g in surnames:
        print(g["title"], "formulas:", len(g["formulas"]), "rows:", len(g["rows"]))


if __name__ == "__main__":
    main()
