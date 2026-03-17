# 🎮 守望先锋地图题库生成 - 快速开始

## 📋 准备工作

### 1. 环境设置
```bash
# 运行环境设置脚本
python tools/setup.py
```

### 2. 录制地图视频
1. **打开守望先锋游戏**
2. **创建自定义游戏**
   - 选择目标地图
   - 设置为观战模式
3. **录制设置**
   - 关闭游戏 UI (按 Alt+Z)
   - 使用自由视角模式
   - 分辨率：1920x1080 或更高
   - 时长：2-5分钟
4. **飞行录制**
   - 覆盖整个地图的主要区域
   - 飞行速度适中，确保画面清晰
   - 重点关注有特色的建筑和场景

### 3. 视频文件命名
将录制的视频按以下格式命名并放入 `raw-videos/` 目录：

| 地图中文名 | 英文名 | 文件名 |
|-----------|--------|--------|
| 多拉多 | Dorado | `dorado.mp4` |
| 花村 | Hanamura | `hanamura.mp4` |
| 好莱坞 | Hollywood | `hollywood.mp4` |
| 国王大道 | King's Row | `kings_row.mp4` |
| 阿努比斯神殿 | Temple of Anubis | `temple_of_anubis.mp4` |
| 艾兴瓦尔德 | Eichenwalde | `eichenwalde.mp4` |
| 漓江塔 | Lijiang Tower | `lijiang_tower.mp4` |
| 尼泊尔 | Nepal | `nepal.mp4` |
| 努巴尼 | Numbani | `numbani.mp4` |
| 沃斯卡娅工业区 | Volskaya Industries | `volskaya.mp4` |

## 🚀 一键生成题库

### 方法一：批量处理（推荐）
```bash
# 一键完成所有处理步骤
python tools/batch-process.py --frames 50 --quality 85
```

### 方法二：分步处理
```bash
# 步骤 1: 从视频提取帧
python tools/video-processor.py --frames 50

# 步骤 2: 优化图片
python tools/image-optimizer.py --quality 85
```

## 📊 处理结果

处理完成后，你将得到：

```
├── data/
│   └── maps.json              # 📄 题库数据文件
├── optimized-images/          # 🖼️ 优化后的图片
│   ├── dorado/
│   │   ├── frame_001.webp
│   │   ├── frame_002.webp
│   │   └── ...
│   └── ...
├── processing-report.json     # 📋 处理报告
└── image-quality-report.json  # 📈 图片质量报告
```

## 🎯 题库数据格式

生成的 `data/maps.json` 文件结构：

```json
{
  "version": "1.0.0",
  "totalMaps": 10,
  "totalScreenshots": 500,
  "maps": [
    {
      "id": "dorado",
      "name": "多拉多",
      "nameEn": "Dorado", 
      "type": "escort",
      "screenshots": [
        {
          "id": "dorado_001",
          "url": "/images/dorado/frame_001.webp",
          "description": "Frame 1",
          "difficulty": "medium"
        }
      ]
    }
  ]
}
```

## ⚙️ 自定义配置

### 调整提取帧数
```bash
# 每个视频提取 30 帧
python tools/batch-process.py --frames 30
```

### 调整图片质量
```bash
# 使用更高的图片质量
python tools/batch-process.py --quality 95
```

### 自定义尺寸
```bash
# 生成 1920x1080 的图片
python tools/image-optimizer.py --width 1920 --height 1080
```

## 🔧 故障排除

### 常见问题

**1. 找不到视频文件**
- 确保视频文件在 `raw-videos/` 目录中
- 检查文件格式（支持 .mp4 和 .avi）
- 确认文件名符合命名规范

**2. 视频处理失败**
- 检查视频文件是否损坏
- 确保安装了 opencv-python: `pip install opencv-python`
- 尝试转换视频格式为 MP4

**3. 图片优化失败**
- 确保安装了 Pillow: `pip install Pillow`
- 检查磁盘空间是否充足
- 确认输入目录中有图片文件

**4. 内存不足**
- 减少每次处理的帧数: `--frames 30`
- 降低图片质量: `--quality 70`
- 分批处理地图

### 重新处理

如果需要重新处理某个地图：

```bash
# 删除对应的输出目录
rm -rf processed-images/dorado optimized-images/dorado

# 重新运行处理
python tools/batch-process.py
```

## 📱 集成到项目

处理完成后，将生成的文件集成到你的 uni-app 项目：

1. **复制图片文件**
   ```bash
   cp -r optimized-images/* src/assets/images/
   ```

2. **复制题库数据**
   ```bash
   cp data/maps.json src/data/
   ```

3. **在项目中使用**
   ```javascript
   import mapsData from '@/data/maps.json'
   
   // 创建题库
   const questionPool = new QuestionPool({ maps: mapsData.maps })
   ```

## 🎉 完成！

现在你有了完整的守望先锋地图题库，可以开始开发你的 NFT 风格滑卡游戏了！

每个地图有 50 张精心提取的截图，总共数百张高质量的游戏素材，足够制作一个丰富有趣的地图识别游戏。