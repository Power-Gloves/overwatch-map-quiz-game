#!/usr/bin/env python3
"""
自动生成maps.json配置文件
"""
import json
import os
from pathlib import Path

def generate_screenshots_list(map_name, count=30):
    """生成截图列表"""
    screenshots = []
    for i in range(1, count + 1):
        filename = f"{map_name}_{i:03d}.jpg"
        url = f"/static/maps/{map_name}/{filename}"
        screenshots.append({
            "filename": filename,
            "url": url
        })
    return screenshots

def get_map_type(map_name):
    """根据地图名称推断地图类型"""
    control_maps = ["墓园", "阿育陀耶", "漓江塔", "漓江塔庭院", "漓江塔夜市", "伊里奥斯-废墟"]
    escort_maps = ["黑森林", "好莱坞", "国王大道"]
    assault_maps = ["生态监测站-南极洲", "阿努比斯神殿", "阿努比斯王座"]
    hybrid_maps = ["城堡", "艾兴瓦尔德", "巴黎", "暴雪世界"]
    
    if map_name in control_maps:
        return "control"
    elif map_name in escort_maps:
        return "escort"
    elif map_name in assault_maps:
        return "assault"
    elif map_name in hybrid_maps:
        return "hybrid"
    else:
        return "control"  # 默认类型

def get_map_description(map_name):
    """获取地图描述"""
    descriptions = {
        "墓园": "阴森恐怖的墓地环境",
        "阿育陀耶": "泰国古都的寺庙建筑群", 
        "城堡": "欧洲中世纪风格的古堡",
        "黑森林": "德国黑森林地区的神秘森林",
        "漓江塔": "中国桂林的现代化高塔建筑",
        "漓江塔庭院": "漓江塔的传统庭院区域",
        "漓江塔夜市": "漓江塔的繁华夜市街区",
        "生态监测站-南极洲": "南极洲的科研监测站",
        "伊里奥斯-废墟": "希腊海岛上的古代废墟",
        "阿努比斯神殿": "埃及风格的古代神殿",
        "阿努比斯王座": "阿努比斯神殿的王座大厅",
        "埃斯佩兰萨": "葡萄牙风格的海滨城市",
        "艾兴瓦尔德": "德国中世纪城堡要塞",
        "巴黎": "法国巴黎的经典街区",
        "暴雪世界": "暴雪游戏主题乐园",
        "春节釜山寺院": "韩国釜山的传统寺院",
        "斗兽场": "古罗马风格的竞技场",
        "国王大道": "英国伦敦的经典街道",
        "好莱坞": "美国好莱坞电影片场"
    }
    return descriptions.get(map_name, f"{map_name}地图")

def get_english_name(map_name):
    """获取英文地图名"""
    english_names = {
        "墓园": "Cemetery",
        "阿育陀耶": "Ayutthaya",
        "城堡": "Castle", 
        "黑森林": "Black Forest",
        "漓江塔": "Lijiang Tower",
        "漓江塔庭院": "Lijiang Garden",
        "漓江塔夜市": "Lijiang Night Market",
        "生态监测站-南极洲": "Eco Point: Antarctica",
        "伊里奥斯-废墟": "Ilios: Ruins",
        "阿努比斯神殿": "Temple of Anubis",
        "阿努比斯王座": "Anubis Throne",
        "埃斯佩兰萨": "Esperança",
        "艾兴瓦尔德": "Eichenwalde", 
        "巴黎": "Paris",
        "暴雪世界": "Blizzard World",
        "春节釜山寺院": "Busan CNY",
        "斗兽场": "Colosseo",
        "国王大道": "King's Row",
        "好莱坞": "Hollywood"
    }
    return english_names.get(map_name, map_name)

def generate_map_id(map_name):
    """生成地图ID"""
    id_mapping = {
        "墓园": "cemetery",
        "阿育陀耶": "ayutthaya",
        "城堡": "castle",
        "黑森林": "black_forest", 
        "漓江塔": "lijiang_tower",
        "漓江塔庭院": "lijiang_garden",
        "漓江塔夜市": "lijiang_night_market",
        "生态监测站-南极洲": "eco_point_antarctica",
        "伊里奥斯-废墟": "ilios_ruins",
        "阿努比斯神殿": "temple_of_anubis",
        "阿努比斯王座": "anubis_throne",
        "埃斯佩兰萨": "esperanca",
        "艾兴瓦尔德": "eichenwalde",
        "巴黎": "paris",
        "暴雪世界": "blizzard_world",
        "春节釜山寺院": "busan_cny",
        "斗兽场": "colosseo", 
        "国王大道": "kings_row",
        "好莱坞": "hollywood"
    }
    return id_mapping.get(map_name, map_name.lower().replace("-", "_"))

def main():
    # 扫描static/maps目录获取所有地图
    maps_dir = Path("static/maps")
    if not maps_dir.exists():
        print("❌ static/maps 目录不存在")
        return
    
    map_folders = [f.name for f in maps_dir.iterdir() if f.is_dir()]
    map_folders.sort()
    
    print(f"🗺️ 发现 {len(map_folders)} 个地图:")
    for i, map_name in enumerate(map_folders, 1):
        print(f"   {i:2d}. {map_name}")
    
    # 生成配置
    maps_config = {
        "version": "2.0.0",
        "lastUpdated": "2026-03-15",
        "totalMaps": len(map_folders),
        "totalScreenshots": len(map_folders) * 30,
        "maps": []
    }
    
    for map_name in map_folders:
        map_data = {
            "id": generate_map_id(map_name),
            "name": map_name,
            "nameEn": get_english_name(map_name),
            "type": get_map_type(map_name),
            "description": get_map_description(map_name),
            "screenshots": generate_screenshots_list(map_name)
        }
        maps_config["maps"].append(map_data)
    
    # 保存配置文件
    output_file = "src/assets/data/maps.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(maps_config, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 配置文件已生成: {output_file}")
    print(f"📊 统计信息:")
    print(f"   总地图数: {maps_config['totalMaps']}")
    print(f"   总截图数: {maps_config['totalScreenshots']}")
    
    # 按类型统计
    type_count = {}
    for map_data in maps_config["maps"]:
        map_type = map_data["type"]
        type_count[map_type] = type_count.get(map_type, 0) + 1
    
    print(f"   地图类型分布:")
    for map_type, count in type_count.items():
        print(f"     {map_type}: {count} 个")

if __name__ == "__main__":
    main()