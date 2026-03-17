#!/usr/bin/env python3
"""
批量处理地图视频脚本
"""
import os
import subprocess
from pathlib import Path

def process_map(map_name, video_file):
    """处理单个地图"""
    print(f"\n🗺️ 正在处理: {map_name}")
    
    video_path = f"地图视频/Desktop/{map_name}/{video_file}"
    output_path = f"static/maps/{map_name}"
    
    cmd = [
        "python", "tools/process-final.py",
        "--video", video_path,
        "--output", output_path,
        "--frames", "30",
        "--name", map_name
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        if result.returncode == 0:
            print(f"✅ {map_name} 处理成功")
            return True
        else:
            print(f"❌ {map_name} 处理失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {map_name} 处理异常: {e}")
        return False

# 待处理的地图列表
maps_to_process = [
    ("艾兴瓦尔德", "微信视频2026-03-15_204350_546.mp4"),
    ("巴黎", "微信视频2026-03-15_204350_546.mp4"),
    ("暴雪世界", "微信视频2026-03-15_204350_546.mp4"),
    ("春节釜山寺院", "微信视频2026-03-15_204350_546.mp4"),
    ("斗兽场", "微信视频2026-03-15_204350_546.mp4"),
]

if __name__ == "__main__":
    print("🎮 批量处理地图视频")
    print("=" * 50)
    
    success_count = 0
    total_count = len(maps_to_process)
    
    for map_name, video_file in maps_to_process:
        if process_map(map_name, video_file):
            success_count += 1
    
    print(f"\n🎉 处理完成: {success_count}/{total_count} 个地图成功")