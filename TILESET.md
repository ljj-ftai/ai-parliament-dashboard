# 图块集说明

## 官方图块集

用户购买了 Pixel Agents 官方图块集，包含像素风格的办公室元素。

### 下载图块集

百度网盘链接：https://pan.baidu.com/s/18GwqFTJJtebCht-s53WxFA
提取码：1234

### 使用方法

1. 从百度网盘下载图块集文件
2. 将图片文件放入 `frontend/public/assets/` 目录
3. 修改 `frontend/src/components/PixelAgent.jsx` 使用图块集

### 图块集结构

官方图块集包含以下元素（需要从下载的文件中查看）：
- 墙壁/地板 tiles
- 人物 sprites（多个动作帧）
- 家具元素
- 装饰物

### 当前状态

当前版本使用 CSS 绘制的简化像素小人，如需更精美的效果请添加图块集。

## 替换步骤

1. 下载图块集到本地
2. 上传到项目：`frontend/public/assets/tileset.png`
3. 修改 PixelAgent 组件使用图片 sprites
