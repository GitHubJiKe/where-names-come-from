#!/usr/bin/env python3
# export_surnames.py — 从 xlsx 导出姓氏人口 JSON（由 sheet-agent 生成的主代理运行版）
import json
import os
from openpyxl import load_workbook

BASE = os.path.dirname(os.path.abspath(__file__))
PRIVATE = os.path.join(os.path.dirname(BASE), "_source_data")
SRC = os.path.join(PRIVATE, "Chinese_Family_Name（1k）.xlsx")
DST = os.path.join(PRIVATE, "surnames_raw.json")

wb = load_workbook(SRC, read_only=True, data_only=True)
ws = wb["中文姓氏1074个"]  # 数据：第 2~1075 行，A=姓氏，B=人口(万人)

data = []
for name, tf in ws.iter_rows(min_row=2, max_row=1075, min_col=1, max_col=2, values_only=True):
    if name is None or tf is None:
        continue
    # 四舍五入取整（int(x+0.5)，避免 Python round 的银行家舍入）
    data.append({"surname": str(name).strip(), "pop": int(float(tf) + 0.5)})

os.makedirs(os.path.dirname(DST), exist_ok=True)
with open(DST, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

# ---- 验证输出 ----
print(f"导出条数: {len(data)}（预期 1074）")
print("前 3 条:", json.dumps(data[:3], ensure_ascii=False))
print("后 3 条:", json.dumps(data[-3:], ensure_ascii=False))
print(f"文件路径: {DST}")
print(f"文件大小: {os.path.getsize(DST)} bytes（约 {os.path.getsize(DST)/1024:.1f} KB）")
