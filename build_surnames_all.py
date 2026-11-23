#!/usr/bin/env python3
# build_surnames_all.py — 1074 姓氏全量库：拼音声调标注 + 生成 surnames_all.js
# 数据源：data/surnames_raw.json（由 Chinese_Family_Name（1k）.xlsx 导出，顺序即人口排名）
import json
import re

BASE = "/Users/yuanpengfei/Desktop/Projects/01-内容生产/business/site"

from pypinyin import pinyin as pp_pinyin, Style

# ---------- 姓氏专读音人工勘误表（pypinyin 默认读音≠姓氏读音的多音字） ----------
OVERRIDE = {
    "仇": "chóu", "单": "shàn", "解": "xiè", "区": "ōu", "查": "zhā", "曾": "zēng",
    "乐": "yuè", "朴": "piáo", "种": "chóng", "覃": "qín", "折": "shé", "盖": "gě",
    "曲": "qū", "訾": "zī", "缪": "miào", "员": "yùn", "繁": "pó", "都": "dū",
    "冼": "xiǎn", "莘": "shēn", "恽": "yùn", "尉": "yù", "秘": "bì", "应": "yīng",
    "燕": "yān", "华": "huà", "过": "guō", "於": "yū", "能": "nài", "郇": "xún",
    "祭": "zhài", "蔚": "yù", "相": "xiàng", "贲": "bēn", "哈": "hǎ", "郤": "xì",
    "郗": "xī", "句": "gōu", "召": "shào", "那": "nā", "郄": "qiè", "逄": "páng",
    "麹": "qū", "颉": "xié", "乜": "niè", "佴": "nài", "呙": "guō", "禤": "xuān",
    # 复姓（整姓读音）
    "万俟": "mòqí", "尉迟": "yùchí", "长孙": "zhǎngsūn", "令狐": "línghú",
    "澹台": "táitái", "相里": "xiànglǐ", "拓跋": "tuòbá", "单于": "chányú",
}

# ---------- 原表疑似错录条目（站内不展示，避免误导用户） ----------
EXCLUDE = {
    "殴阳": "疑为「欧阳」错录，且表中另有「欧阳」",
    "夏候": "疑为「夏侯」笔误，且表中另有「夏侯」",
    "冷狐": "标准复姓表中查无此姓，待人工核验",
}

TONE_MARKS = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹ"
GROUP_NAMES = {1: "阴平", 2: "阳平", 3: "上声", 4: "去声"}


def tone_of(pinyin_str):
    """取整姓最后一个调号对应的声调（复姓按与名字相邻的末字归组）"""
    t = 0
    for ch in pinyin_str:
        idx = TONE_MARKS.find(ch)
        if idx >= 0:
            t = idx % 4 + 1
    return t


def to_pinyin(surname):
    """返回整姓带调拼音字符串"""
    if surname in OVERRIDE:
        return OVERRIDE[surname]
    py = pp_pinyin(surname, style=Style.TONE, heteronym=False)
    return "".join(item[0] for item in py)


def main():
    raw = json.load(open(f"{BASE}/data/surnames_raw.json", encoding="utf-8"))
    out = []
    excluded = []
    for rank, item in enumerate(raw, 1):
        s = item["surname"]
        if s in EXCLUDE:
            excluded.append((s, EXCLUDE[s]))
            continue
        py = to_pinyin(s)
        # 复姓按最后一个音节（与名字相邻的字）定声调组
        t = tone_of(py)
        if t == 0:
            t = 4  # 兜底：无调号按去声
        out.append([s, py, t, item["pop"]])

    # 写 JS 数据（紧凑数组：[姓, 拼音, 声调号, 人口万人]，下标即排名）
    lines = ",\n".join(
        '["%s","%s",%d,%d]' % (s, py, t, pop) for s, py, t, pop in out
    )
    js = "/* 全量姓氏声调库：原表 1074 姓，剔除 3 条疑似错录后收录 1071 姓 · 由 build_surnames_all.py 生成，勿手改 */\nwindow.SURNAMES_ALL = [\n%s\n];\n" % lines
    open(f"{BASE}/data/surnames_all.js", "w", encoding="utf-8").write(js)

    # ---------- 校验报告 ----------
    from collections import Counter
    groups = Counter(GROUP_NAMES.get(t, "?") for _, _, t, _ in out)
    print("收录姓氏:", len(out), "| 剔除疑似错录:", len(excluded))
    for s, why in excluded:
        print("  剔除:", s, "——", why)
    print("声调分布:", dict(groups))
    compounds = [r for r in out if len(r[0]) > 1]
    print("复姓数量:", len(compounds), "| 示例:", ", ".join("%s %s(%s)" % (r[0], r[1], GROUP_NAMES[r[2]]) for r in compounds[:8]))

    # 与现有重点矩阵做收录一致性抽查（主文件格式如 "姓003 张（Zhāng）"，含 萧/肖 变体）
    curated = set()
    for fn in ("surnames.js", "surnames_extra.js"):
        txt = open(f"{BASE}/data/{fn}", encoding="utf-8").read()
        for m in re.finditer(r'"?surname"?\s*:\s*"([^"]+)"', txt):
            val = m.group(1)
            val = re.sub(r"^(?:姓)?[\d/]+(?:[—–\-][\d/]+)?\s*", "", val)
            val = val.split("（")[0].split("(")[0].strip()
            for part in re.split(r"[/、]", val):
                part = part.strip()
                if part:
                    curated.add(part)
    all_map = {s: GROUP_NAMES[t] for s, _, t, _ in out}
    print("重点矩阵姓氏数(去重):", len(curated),
          "| 未在全量库中的:", sorted(c for c in curated if c not in all_map)[:15])
    # 标注示例
    print("标注示例:", ", ".join("%s %s(%s)" % (s, py, GROUP_NAMES[t]) for s, py, t, _ in out[:12]))


if __name__ == "__main__":
    main()
