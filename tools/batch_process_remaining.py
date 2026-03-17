#!/usr/bin/env python3
"""
批量处理剩余地图视频
"""
import os
import subprocess
from pathlib import Path

def get_video_file(map_folder):
    """获取地图文件夹中的视频文件"""
    folder_path = Path(f"地图视频/Desktop/{map_folder}")
    if not folder_path.exists():
        return None
    
    # 查找视频文件
    video_files = list(folder_path.glob("*.mp4"))
    if video_files:
        return video_files[0].name
    return None

def process_map(map_name):
    """处理单个地图"""
    print(f"\n🗺️ 正在处理: {map_name}")
    
    # 获取视频文件名
    video_file = get_video_file(map_name)
    if not video_file:
        print(f"❌ 未找到视频文件: {map_name}")
        return False
    
    video_path = f"地图视频/Desktop/{map_name}/{video_file}"
    output_path = f"static/maps/{map_name}"
    
    # 检查是否已经处理过
    if Path(output_path).exists():
        print(f"⏭️ 已处理过，跳过: {map_name}")
        return True
    
    cmd = [
        "python", "tools/process-final.py",
        "--video", video_path,
        "--output", output_path,
        "--name", map_name
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=False, text=True, encoding='utf-8')
        if result.returncode == 0:
            print(f"✅ {map_name} 处理成功")
            return True
        else:
            print(f"❌ {map_name} 处理失败")
            return False
    except Exception as e:
        print(f"❌ {map_name} 处理异常: {e}")
        return False

# 剩余待处理的地图列表
remaining_maps = [
    "绿洲城中心",
    "尼泊尔-圣所", 
    "尼泊尔-圣坛",
    "努巴尼",
    "帕拉伊苏",
    "萨摩亚",
    "圣诞节花村",
    "沃斯卡娅工业区",
    "新皇后街",
    "伊里奥斯-灯塔",
    "伊里奥斯-深井",
    "月球基地",
    "中城"
]

if __name__ == "__main__":
    print("🎮 批量处理剩余地图视频")
    print("=" * 50)
    
    success_count = 0
    total_count = len(remaining_maps)
    
    for map_name in remaining_maps:
        if process_map(map_name):
            success_count += 1
    
    print(f"\n🎉 处理完成: {success_count}/{total_count} 个地图成功")
    print(f"📊 总进度: 已处理 {success_count + 21} 个地图")  # 21是之前已处理的数量