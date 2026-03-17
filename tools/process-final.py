#!/usr/bin/env python3
"""
最终版视频处理工具
- 智能裁剪中心区域（左右-25%, 下-12.5%, 上不裁剪）
- 真正均匀分布抽帧
- 适合手机竖屏显示
"""

import cv2
import numpy as np
from pathlib import Path
import argparse

def extract_frames_final(video_path: str, output_dir: str, frame_count: int = None, map_name: str = None):
    """
    最终版帧提取函数
    如果 frame_count 为 None，则根据视频时长自动计算
    如果 map_name 为 None，则从视频文件名提取
    """
    video_path = Path(video_path)
    output_dir = Path(output_dir)
    
    # 检查视频文件
    if not video_path.exists():
        print(f"❌ 视频文件不存在: {video_path}")
        return False
    
    # 提取地图名称
    if map_name is None:
        # 从视频文件所在目录名或文件名提取
        map_name = video_path.parent.name
        if map_name in ['Desktop', 'videos', '地图视频']:
            # 如果目录名不合适，使用文件名
            map_name = video_path.stem
    
    print(f"🗺️  地图名称: {map_name}")
    
    # 创建输出目录
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"🎬 处理视频: {video_path.name}")
    print(f"📁 输出目录: {output_dir}")
    
    # 打开视频
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"❌ 无法打开视频: {video_path}")
        return False
    
    # 获取视频信息
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"📊 视频信息:")
    print(f"   原始分辨率: {width}x{height}")
    print(f"   总帧数: {total_frames}")
    print(f"   帧率: {fps:.2f} FPS")
    print(f"   时长: {duration:.2f} 秒")
    
    # 智能计算帧数（如果未指定）
    if frame_count is None:
        # 根据视频时长自动计算 - 更灵活的策略
        if duration <= 60:
            # 短视频：每1.5秒1帧，最少25帧
            calculated_frames = max(25, int(duration / 1.5))
        elif duration <= 120:
            # 中等视频：每2秒1帧，最少30帧
            calculated_frames = max(30, int(duration / 2.0))
        elif duration <= 180:
            # 长视频：每2.5秒1帧，最少40帧
            calculated_frames = max(40, int(duration / 2.5))
        else:
            # 超长视频：每3秒1帧，最少50帧，最多100帧
            calculated_frames = max(50, min(100, int(duration / 3.0)))
        
        frame_count = calculated_frames
        print(f"🤖 智能帧数计算:")
        print(f"   视频时长: {duration:.1f}秒")
        print(f"   计算策略: {'短视频(每1.5s)' if duration <= 60 else '中等(每2s)' if duration <= 120 else '长视频(每2.5s)' if duration <= 180 else '超长(每3s)'}")
        print(f"   建议帧数: {frame_count} 帧 (每 {duration/frame_count:.1f}秒 1帧)")
    else:
        print(f"🎯 使用指定帧数: {frame_count} 帧")
    
    # 计算裁剪区域 - 左右各25%，下12.5%，上不切
    left_crop = int(width * 0.25)     # 左边去25%
    right_crop = int(width * 0.25)    # 右边去25%
    top_crop = 0                      # 上边不裁剪
    bottom_crop = int(height * 0.125) # 下边去12.5%
    
    crop_x = left_crop
    crop_y = top_crop
    crop_width = width - left_crop - right_crop
    crop_height = height - top_crop - bottom_crop
    
    print(f"🔲 裁剪设置:")
    print(f"   裁剪区域: ({crop_x}, {crop_y}) -> {crop_width}x{crop_height}")
    print(f"   原始比例: {width/height:.2f}:1 (横屏)")
    print(f"   裁剪比例: {crop_width/crop_height:.2f}:1 (竖屏)")
    
    # 判断比例类型
    ratio = crop_width / crop_height
    if ratio < 0.6:
        ratio_desc = "竖屏 (适合手机)"
    elif ratio < 0.9:
        ratio_desc = "偏竖屏 (适合手机)"
    elif ratio < 1.1:
        ratio_desc = "正方形"
    else:
        ratio_desc = "偏横屏"
    print(f"   比例类型: {ratio_desc}")
    
    # 生成真正均匀分布的帧索引
    if total_frames <= frame_count:
        frame_indices = list(range(total_frames))
    else:
        # 确保覆盖整个视频时长
        frame_indices = []
        for i in range(frame_count):
            if i == frame_count - 1:
                # 最后一帧确保是视频末尾
                frame_indices.append(total_frames - 1)
            else:
                # 按比例分布
                index = int((i * (total_frames - 1)) / (frame_count - 1))
                frame_indices.append(index)
        
        # 去重并排序
        frame_indices = sorted(list(set(frame_indices)))
    
    actual_frame_count = len(frame_indices)
    
    print(f"🎯 抽帧策略:")
    print(f"   目标帧数: {frame_count}")
    print(f"   实际帧数: {actual_frame_count}")
    print(f"   帧索引范围: {frame_indices[0]} -> {frame_indices[-1]}")
    print(f"   时间覆盖: 0.0s -> {frame_indices[-1]/fps:.1f}s")
    
    # 显示几个关键时间点
    if len(frame_indices) >= 5:
        sample_indices = [frame_indices[0], frame_indices[len(frame_indices)//4], 
                         frame_indices[len(frame_indices)//2], frame_indices[3*len(frame_indices)//4], 
                         frame_indices[-1]]
        sample_times = [idx/fps for idx in sample_indices]
        print(f"   关键时间点: {sample_times[0]:.1f}s, {sample_times[1]:.1f}s, {sample_times[2]:.1f}s, {sample_times[3]:.1f}s, {sample_times[4]:.1f}s")
    
    print(f"\n🔄 开始处理...")
    print("-" * 60)
    
    extracted_count = 0
    
    for i, frame_index in enumerate(frame_indices):
        # 设置帧位置
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        
        # 读取帧
        ret, frame = cap.read()
        if not ret or frame is None:
            print(f"⚠️  跳过帧 {frame_index}")
            continue
        
        # 裁剪帧到中心区域
        cropped_frame = frame[crop_y:crop_y+crop_height, crop_x:crop_x+crop_width]
        
        # 检查裁剪后的帧
        if cropped_frame.size == 0:
            print(f"❌ 裁剪失败: frame {frame_index}")
            continue
        
        # 生成文件名 - 包含地图名称
        filename = f"{map_name}_{i+1:03d}.jpg"
        filepath = output_dir / filename
        
        # 计算时间戳
        timestamp = frame_index / fps
        
        try:
            # 编码并保存裁剪图
            success, encoded_img = cv2.imencode('.jpg', cropped_frame, [
                cv2.IMWRITE_JPEG_QUALITY, 95
            ])
            
            if success:
                with open(str(filepath), 'wb') as f:
                    f.write(encoded_img.tobytes())
                
                # 验证文件
                if filepath.exists() and filepath.stat().st_size > 0:
                    file_size = filepath.stat().st_size
                    extracted_count += 1
                    
                    # 每5个显示一次进度
                    if i % 5 == 0 or i < 5:
                        print(f"✅ {i+1:2d}/{actual_frame_count}: {filename} | 时间: {timestamp:5.1f}s | 大小: {file_size//1024:3d}KB")
                    elif i == actual_frame_count - 1:
                        print(f"✅ {i+1:2d}/{actual_frame_count}: {filename} | 时间: {timestamp:5.1f}s | 大小: {file_size//1024:3d}KB")
                        
                else:
                    print(f"❌ 文件创建失败: {filename}")
            else:
                print(f"❌ 编码失败: {filename}")
                
        except Exception as e:
            print(f"❌ 异常: {filename} - {e}")
    
    cap.release()
    
    print("-" * 60)
    print(f"🎉 处理完成!")
    print(f"📊 成功提取: {extracted_count}/{actual_frame_count} 张图片")
    
    # 显示最终统计
    if extracted_count > 0:
        image_files = list(output_dir.glob("*.jpg"))
        total_size = sum(f.stat().st_size for f in image_files)
        avg_size = total_size / len(image_files)
        
        print(f"\n📈 统计信息:")
        print(f"   总文件大小: {total_size//1024//1024}MB")
        print(f"   平均文件大小: {avg_size//1024:.0f}KB")
        print(f"   裁剪后尺寸: {crop_width}x{crop_height}")
        print(f"   宽高比: {crop_width/crop_height:.2f}:1 (适合手机竖屏)")
        
        # 显示前几个和最后几个文件
        print(f"\n📋 生成的文件:")
        sorted_files = sorted(image_files)
        for img_file in sorted_files[:3]:
            size_kb = img_file.stat().st_size // 1024
            print(f"   {img_file.name} ({size_kb}KB)")
        
        if len(sorted_files) > 6:
            print(f"   ... 中间 {len(sorted_files) - 6} 个文件 ...")
        
        for img_file in sorted_files[-3:]:
            if img_file not in sorted_files[:3]:
                size_kb = img_file.stat().st_size // 1024
                print(f"   {img_file.name} ({size_kb}KB)")
    
    return extracted_count > 0

def main():
    parser = argparse.ArgumentParser(description="最终版视频处理工具")
    parser.add_argument("--video", required=True, help="视频文件路径")
    parser.add_argument("--output", required=True, help="输出目录")
    parser.add_argument("--frames", type=int, default=None, help="提取帧数 (不指定则自动计算)")
    parser.add_argument("--name", default=None, help="地图名称 (不指定则自动提取)")
    
    args = parser.parse_args()
    
    print("🎮 守望先锋地图题库生成器 - 最终版")
    print("=" * 60)
    print("🔧 优化功能:")
    print("   ✅ 智能裁剪中心区域 (左右-25%, 下-12.5%, 上不裁剪)")
    print("   ✅ 自动计算最佳帧数 (根据视频时长)")
    print("   ✅ 适合手机竖屏显示 (竖屏比例)")
    print("   ✅ 文件名包含地图名称")
    print("   ✅ 高质量图片输出 (JPEG 95%质量)")
    print("=" * 60)
    
    success = extract_frames_final(args.video, args.output, args.frames, args.name)
    
    if success:
        print(f"\n✅ 处理成功!")
        print(f"📁 图片保存在: {args.output}")
        print(f"\n💡 提示:")
        print(f"   - 图片已优化为手机竖屏比例")
        print(f"   - 裁剪设置: 左右-25%, 下-12.5%, 上不裁剪")
        print(f"   - 帧分布覆盖了整个视频时长")
        print(f"   - 文件名包含地图名称，便于管理")
    else:
        print(f"\n❌ 处理失败!")

if __name__ == "__main__":
    main()