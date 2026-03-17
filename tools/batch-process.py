#!/usr/bin/env python3
"""
批量处理脚本
一键完成从视频到优化图片的全流程
"""

import argparse
import json
from pathlib import Path
import time

# 导入其他工具模块
from video_processor import MapVideoProcessor
from image_optimizer import ImageOptimizer

class BatchProcessor:
    def __init__(self, config: dict = None):
        self.config = config or {
            "frames_per_video": 50,
            "image_quality": 85,
            "target_width": 1280,
            "target_height": 720,
            "raw_videos_dir": "raw-videos",
            "processed_images_dir": "processed-images", 
            "optimized_images_dir": "optimized-images",
            "output_data_dir": "data"
        }
    
    def process_all(self) -> bool:
        """
        执行完整的处理流程
        
        Returns:
            是否成功
        """
        start_time = time.time()
        
        print("🚀 开始批量处理...")
        print("=" * 60)
        
        # 步骤 1: 处理视频
        print("\n📹 步骤 1/3: 处理视频文件")
        print("-" * 30)
        
        video_processor = MapVideoProcessor(
            self.config["raw_videos_dir"],
            self.config["processed_images_dir"]
        )
        
        extraction_results = video_processor.process_all_videos(
            self.config["frames_per_video"]
        )
        
        if not extraction_results:
            print("❌ 视频处理失败，终止流程")
            return False
        
        print(f"✅ 视频处理完成: {len(extraction_results)} 个地图")
        
        # 步骤 2: 优化图片
        print("\n🖼️  步骤 2/3: 优化图片")
        print("-" * 30)
        
        image_optimizer = ImageOptimizer(
            self.config["processed_images_dir"],
            self.config["optimized_images_dir"]
        )
        
        optimization_results = image_optimizer.optimize_all_maps()
        
        if not optimization_results:
            print("❌ 图片优化失败，终止流程")
            return False
        
        print(f"✅ 图片优化完成: {len(optimization_results)} 个地图")
        
        # 步骤 3: 生成最终数据
        print("\n📊 步骤 3/3: 生成题库数据")
        print("-" * 30)
        
        # 更新路径为优化后的图片
        final_metadata = video_processor.generate_metadata(optimization_results)
        
        # 更新图片路径
        for map_data in final_metadata["maps"]:
            map_id = map_data["id"]
            if map_id in optimization_results:
                for i, screenshot in enumerate(map_data["screenshots"]):
                    if i < len(optimization_results[map_id]):
                        screenshot["url"] = f"/images/{optimization_results[map_id][i]}"
        
        # 保存最终数据
        data_dir = Path(self.config["output_data_dir"])
        data_dir.mkdir(exist_ok=True)
        
        with open(data_dir / "maps.json", "w", encoding="utf-8") as f:
            json.dump(final_metadata, f, ensure_ascii=False, indent=2)
        
        # 生成处理报告
        self.generate_report(final_metadata, start_time)
        
        print("✅ 题库数据生成完成")
        
        elapsed_time = time.time() - start_time
        print(f"\n🎉 全部处理完成! 耗时: {elapsed_time:.1f} 秒")
        
        return True
    
    def generate_report(self, metadata: dict, start_time: float):
        """
        生成处理报告
        
        Args:
            metadata: 题库元数据
            start_time: 开始时间
        """
        report = {
            "processedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
            "processingTime": f"{time.time() - start_time:.1f}s",
            "configuration": self.config,
            "results": {
                "totalMaps": metadata["totalMaps"],
                "totalScreenshots": metadata["totalScreenshots"],
                "mapsProcessed": [
                    {
                        "id": map_data["id"],
                        "name": map_data["name"],
                        "screenshotCount": len(map_data["screenshots"])
                    }
                    for map_data in metadata["maps"]
                ]
            }
        }
        
        with open("processing-report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"📄 处理报告: processing-report.json")
    
    def validate_setup(self) -> bool:
        """
        验证环境设置
        
        Returns:
            是否通过验证
        """
        print("🔍 验证环境设置...")
        
        # 检查视频目录
        videos_dir = Path(self.config["raw_videos_dir"])
        if not videos_dir.exists():
            print(f"❌ 视频目录不存在: {videos_dir}")
            return False
        
        # 检查视频文件
        video_files = list(videos_dir.glob("*.mp4")) + list(videos_dir.glob("*.avi"))
        if not video_files:
            print(f"❌ 未找到视频文件: {videos_dir}")
            print("   请将录制的地图视频放入该目录")
            return False
        
        print(f"✅ 找到 {len(video_files)} 个视频文件:")
        for video_file in video_files:
            file_size = video_file.stat().st_size / (1024 * 1024)  # MB
            print(f"   - {video_file.name} ({file_size:.1f} MB)")
        
        # 检查 Python 依赖
        try:
            import cv2
            import PIL
            print("✅ Python 依赖检查通过")
        except ImportError as e:
            print(f"❌ 缺少依赖: {e}")
            print("   请运行: python tools/setup.py")
            return False
        
        return True

def main():
    parser = argparse.ArgumentParser(description="批量处理工具")
    parser.add_argument("--config", help="配置文件路径")
    parser.add_argument("--frames", type=int, default=50, help="每个视频提取的帧数")
    parser.add_argument("--quality", type=int, default=85, help="图片质量")
    parser.add_argument("--skip-validation", action="store_true", help="跳过环境验证")
    
    args = parser.parse_args()
    
    # 加载配置
    config = None
    if args.config and Path(args.config).exists():
        with open(args.config, "r", encoding="utf-8") as f:
            config = json.load(f)
    
    # 使用命令行参数覆盖配置
    if config is None:
        config = {}
    
    config.update({
        "frames_per_video": args.frames,
        "image_quality": args.quality
    })
    
    print("🎮 守望先锋地图题库 - 批量处理工具")
    print("=" * 60)
    
    # 创建处理器
    processor = BatchProcessor(config)
    
    # 验证环境
    if not args.skip_validation and not processor.validate_setup():
        print("\n❌ 环境验证失败，请检查设置")
        return
    
    # 执行处理
    success = processor.process_all()
    
    if success:
        print("\n🎯 处理成功! 可以开始开发游戏了")
        print("\n📋 生成的文件:")
        print("   - data/maps.json (题库数据)")
        print("   - optimized-images/ (优化后的图片)")
        print("   - processing-report.json (处理报告)")
    else:
        print("\n❌ 处理失败，请检查错误信息")

if __name__ == "__main__":
    main()