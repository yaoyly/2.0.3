# 爪爪接力站

喜茶式大留白 + 稚拙手绘风手机网页（暖白底、大量留白、细线框无填充按钮、淡彩弱化点缀、墨色拙趣手绘标题、线性猫狗插画与五角星/小怪兽涂鸦），原生 HTML / CSS / JavaScript，无构建依赖。标题为离屏渲染的透明底 PNG（assets/title/，不嵌入字体文件、不依赖运行环境本地字体）；首页主视觉与循环护照卡片各含一张手绘插画（assets/img/，本地随项目加载）；其余图标与商品示意均以 SVG 路径原创绘制，无网络资源。风格复刻提示词见《手绘风格复刻提示词.md》。

Open index.html directly. See the app for all updated demo flows.

Verification: node verify.cjs (45 workflow assertions).
Browser verification: node browser-check.cjs (Windows Edge, isolated profile).
Passed real browser flows, photo uploads, persistence and 20 mobile viewport/page overflow checks.
Screenshots: previews/.

All data is local demo data; no real payment, shipment, recycling or refund occurs.
