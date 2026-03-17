#!/usr/bin/env python3
"""
环境设置脚本
安装所需依赖并创建目录结构
"""

import subprocess
import sys
from pathlib import Path

def install_dependencies():
    """安装 Python 依赖"""
    dependencies = [
        "opencv-python",  # 视频处理
        "Pillow",        # 图片处理
        "numpy"          # 数值计算
    ]
    
    print("📦 安装 Python 依赖...")
    for dep in dependencies:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"✅ {dep}")
        except subprocess.CalledProcessError:
            print(f"❌ {dep} 安装失败")
            return False
    
    return True

def create_directories():
    """创建项目目录结构"""
    directories = [
        "raw-videos",
        "processed-images", 
        "optimized-images",
        "data",
        "src/assets/images"
    ]
    
    print("\n📁 创建目录结构...")
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ {dir_path}/")
    
    return True

def create_readme():
    """创建使用说明"""
    readme_content = """# 守望先锋地图题库生成工具

## 使用流程

### 1. 录制地图视频
1. 打开守望先锋游戏
2. 创建自定义游戏，选择目标地图
3. 使用自由视角模式飞行录制整个地图
4. 将录制的视频文件放入 `raw-videos/` 目录
5. 视频文件命名格式：`地图英文名.mp4` (例如: `dorado.mp4`)

### 2. 处理视频提取帧
```bash
python tools/video-processor.py --frames 50
```

### 3. 优化图片
```bash
python tools/image-optimizer.py --quality 85
```

### 4. 查看生成的题库
生成的题库数据在 `data/maps.json` 文件中。

## 目录结构
```
├── raw-videos/          # 原始录制视频
├── processed-images/    # 提取的原始帧
├── optimized-images/    # 优化后的图片
├── data/               # 生成的题库数据
└── tools/              # 处理工具
```

## 地图命名规范
| 中文名 | 英文名 | 文件名 |
|--------|--------|--------|
| 多拉多 | Dorado | dorado.mp4 |
| 花村 | Hanamura | hanamura.mp4 |
| 好莱坞 | Hollywood | hollywood.mp4 |
| 国王大道 | King's Row | kings_row.mp4 |
| 阿努比斯神殿 | Temple of Anubis | temple_of_anubis.mp4 |

## 录制建议
- 分辨率：1920x1080 或更高
- 帧率：30fps 或 60fps
- 时长：2-5分钟（覆盖整个地图）
- 关闭游戏 UI (Alt+Z)
- 飞行速度适中，确保画面清晰
"""
    
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    print("✅ README.md")

def main():
    print("🎮 守望先锋地图题库生成工具 - 环境设置")
    print("=" * 60)
    
    # 安装依赖
    if not install_dependencies():
        print("❌ 依赖安装失败")
        return
    
    # 创建目录
    if not create_directories():
        print("❌ 目录创建失败")
        return
    
    # 创建说明文档
    create_readme()
    
    print("\n🎉 环境设置完成!")
    print("\n📋 下一步:")
    print("1. 将录制的地图视频放入 raw-videos/ 目录")
    print("2. 运行: python tools/video-processor.py")
    print("3. 运行: python tools/image-optimizer.py")
    print("4. 查看生成的题库: data/maps.json")

if __name__ == "__main__":
    main()