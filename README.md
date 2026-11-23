# 名有来处 · 正统姓名学服务站

> 名以正体，字以表德。不谈八字，不算五格，不信生肖——只讲文字学。

基于《说文解字》训诂正脉与汉语音韵学的姓名服务网站。纯静态站点，无构建步骤、无后端依赖，克隆后即可运行。

## 页面

| 页面 | 内容 |
| --- | --- |
| `index.html` | 首页：品牌主张、三大起名雷区、三级服务体系（¥69 / ¥199 / ¥980）、流程与 FAQ |
| `library.html` | 300 雅字库 + 120 经史名句库，按意象 / 平仄 / 层级检索 |
| `surnames.html` | 姓氏平仄黄金公式：重点 148 姓专属谐音雷区 + 1071 姓全量声调检索 |
| `mine.html` | 100 个伪古风烂俗字与生僻字排雷速查 + 办证前六步自检 |
| `diagnosis.html` | 五维姓名美学诊断（¥199）：评分体系、样板报告、合规采集表单 |
| `custom.html` | 传世家风典籍定制（¥980）：考据模块、定制书样板、深度访谈表 |

## 本地运行

```bash
python3 -m http.server 8931 --bind 127.0.0.1
# 打开 http://127.0.0.1:8931/index.html
```

也可直接双击任意 `.html` 打开（页面间为相对路径链接）。

## 目录结构

```
index.html / library.html / surnames.html / mine.html / diagnosis.html / custom.html
css/style.css            新中式设计系统（宣纸底 / 墨色 / 朱砂 / 金）
js/common.js             全站导航、页脚、二维码点击放大
js/*.js                  各页交互逻辑
data/*.js                内容数据（window 全局变量，直接 <script> 引入）
assets/                  二维码等图片资源
```

## 数据生成

`data/` 下的内容数据由脚本生成，改动源数据后重新运行即可：

```bash
python3 build_data.py          # 解析内容文档 → 字库 / 名句 / 排雷表 / 姓氏矩阵（需 python3）
pip3 install openpyxl pypinyin # 姓氏全量库所需依赖
python3 build_surnames_raw.py  # xlsx → data/surnames_raw.json
python3 build_surnames_all.py  # 标注拼音声调 → data/surnames_all.js
```

- `data/surnames_extra.js` 为人工撰写数据，不参与自动生成
- 多音字姓氏（仇 chóu、单 shàn、查 zhā、万俟 mòqí 等）在 `build_surnames_all.py` 的 `OVERRIDE` 表中勘误
- 复姓按与名字相邻的末字声调归组

## 合规声明

本站不收八字、不算五格、不判吉凶，仅从文字学（本义、训诂、字形）与汉语音韵学（声调、平仄、谐音）角度提供命名参考，不承诺任何命理或运势效果。
