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

### 雅字库校验与 B02 替换写法

B02 原表存在「（见150）→ 改收【凌】」这类**替换写法**：作者把被弃用的字留在「汉字」列，
把改收的新字塞进本该放拼音的第 3 列，导致整行字段右移一列。受影响的编号为
No.165、169、248、255、298（改收 凌 / 潆 / 恭 / 恪 / 克）；另有 No.222
把改收字的读音 `mín（阳平·平）` 写进了「推荐组合」列。

`build_data.py` 的处理方式：

1. **先识别行结构，再映射字段**——第 3 列不符合 `拼音（声调·平仄）` 格式即判定为
   改收行，改从第 4/5/6 列读取拼音、笔画层级、释义，并从改收说明中提取新字。
2. **剥离编辑痕迹**——释义里残留的「此处改收…→ 旻」等内部批注会被清除，
   不展示给访客，也不据此编造新字数据。
3. **全表门禁校验**——逐条检查字头须为单汉字、拼音/声调/平仄/笔画/层级取值合法、
   释义与组合列不得错位、编号 001—300 连续、**字头不得重复**；任一项失败即
   `SystemExit(1)` 中止写入，不会把错位数据生成到站点里。

改跑后应看到：`字库校验: 300 条 / 300 个不重复字 / 一级 247 · 二级 53`。
改收条目原文没有独立的「推荐组合」列，`combos` 为空；前端会省略「入名示范」行，
不会渲染空标题。

## 云服务接入

诊断（¥199）与定制（¥980）两个预约表单已接入 WorkBuddy Cloud Service 数据库：

- **表 `leads`**：`service`（diagnosis / custom）、`ref_code`（受理编号）、`contact`（联系方式）、`surname`、`gender`、`answers`（JSONB 全量答案）、`created_at`
- **RLS 策略**：仅开放 `INSERT` 给 `anon, authenticated`，**未开放 SELECT** —— 匿名端提交后读不回任何人的记录，避免联系方式泄露
- **前端接入层** `js/cloud.js`：以 CDN 形式加载 `@tencent-ai/workbuddy-cloud-sdk@dev`，初始化参数来自云服务 `publicConfig`（`endpoint` / `publishableKey` / `oauthRelayBaseUrl`），这些值可安全存在于前端
- **降级策略**：SDK 未加载或提交失败时，页面仍会本地生成完整文本并提示「请复制后扫码微信发送」，表单功能不会因云端异常而失效
- **提交成功后**回显受理编号（如 `NYU173X5MA`），用户可凭编号在微信核对

> 云环境与应用绑定同一个 release 域名，重新发布请复用同一 `applicationId`，否则域名变化会导致 Origin 校验失败。

## 合规声明

本站不收八字、不算五格、不判吉凶，仅从文字学（本义、训诂、字形）与汉语音韵学（声调、平仄、谐音）角度提供命名参考，不承诺任何命理或运势效果。
