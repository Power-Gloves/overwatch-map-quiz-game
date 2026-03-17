#!/usr/bin/env node

/**
 * 题库数据验证脚本
 * 验证maps.json文件的数据格式和完整性
 */

const fs = require('fs')
const path = require('path')

// 配置
const CONFIG = {
  MIN_SCREENSHOTS: 30,
  MAX_SCREENSHOTS: 40,
  REQUIRED_MAP_FIELDS: ['id', 'name', 'nameEn', 'type', 'description', 'screenshots'],
  REQUIRED_SCREENSHOT_FIELDS: ['filename', 'url'],
  VALID_MAP_TYPES: ['control', 'assault', 'escort', 'hybrid'],
  MAPS_DATA_PATH: path.join(__dirname, '../src/assets/data/maps.json'),
  STATIC_MAPS_PATH: path.join(__dirname, '../static/maps')
}

// 验证结果
const results = {
  errors: [],
  warnings: [],
  info: [],
  stats: {
    totalMaps: 0,
    totalScreenshots: 0,
    mapsByType: {},
    screenshotsByMap: {}
  }
}

/**
 * 主验证函数
 */
function validateMapsData() {
  console.log('🔍 开始验证题库数据...\n')
  
  try {
    // 1. 检查文件是否存在
    if (!fs.existsSync(CONFIG.MAPS_DATA_PATH)) {
      results.errors.push(`❌ 题库文件不存在: ${CONFIG.MAPS_DATA_PATH}`)
      return false
    }
    
    // 2. 读取和解析JSON
    const rawData = fs.readFileSync(CONFIG.MAPS_DATA_PATH, 'utf8')
    let mapsData
    
    try {
      mapsData = JSON.parse(rawData)
    } catch (parseError) {
      results.errors.push(`❌ JSON格式错误: ${parseError.message}`)
      return false
    }
    
    // 3. 验证根级别结构
    validateRootStructure(mapsData)
    
    // 4. 验证每个地图
    if (mapsData.maps && Array.isArray(mapsData.maps)) {
      mapsData.maps.forEach((map, index) => {
        validateMap(map, index)
      })
    } else {
      results.errors.push('❌ maps字段必须是数组')
    }
    
    // 5. 验证文件系统
    validateFileSystem()
    
    // 6. 生成统计信息
    generateStats(mapsData)
    
    return results.errors.length === 0
    
  } catch (error) {
    results.errors.push(`❌ 验证过程出错: ${error.message}`)
    return false
  }
}

/**
 * 验证根级别结构
 */
function validateRootStructure(data) {
  if (!data.version) {
    results.warnings.push('⚠️  缺少version字段')
  }
  
  if (!data.lastUpdated) {
    results.warnings.push('⚠️  缺少lastUpdated字段')
  }
  
  if (!data.maps) {
    results.errors.push('❌ 缺少maps字段')
  }
}

/**
 * 验证单个地图数据
 */
function validateMap(map, index) {
  const mapPrefix = `地图[${index}]`
  
  // 检查必需字段
  CONFIG.REQUIRED_MAP_FIELDS.forEach(field => {
    if (!map[field]) {
      results.errors.push(`❌ ${mapPrefix} 缺少必需字段: ${field}`)
    }
  })
  
  // 验证地图类型
  if (map.type && !CONFIG.VALID_MAP_TYPES.includes(map.type)) {
    results.errors.push(`❌ ${mapPrefix} 无效的地图类型: ${map.type}`)
  }
  
  // 验证ID格式
  if (map.id && !/^[a-z0-9_]+$/.test(map.id)) {
    results.errors.push(`❌ ${mapPrefix} ID格式无效: ${map.id} (只能包含小写字母、数字和下划线)`)
  }
  
  // 验证截图数组
  if (map.screenshots) {
    validateScreenshots(map.screenshots, mapPrefix, map.name)
  }
  
  // 检查重复ID
  const duplicateMap = results.stats.screenshotsByMap[map.id]
  if (duplicateMap) {
    results.errors.push(`❌ ${mapPrefix} 重复的地图ID: ${map.id}`)
  } else if (map.id) {
    results.stats.screenshotsByMap[map.id] = map.name
  }
}

/**
 * 验证截图数据
 */
function validateScreenshots(screenshots, mapPrefix, mapName) {
  if (!Array.isArray(screenshots)) {
    results.errors.push(`❌ ${mapPrefix} screenshots必须是数组`)
    return
  }
  
  const screenshotCount = screenshots.length
  
  // 检查截图数量
  if (screenshotCount < CONFIG.MIN_SCREENSHOTS) {
    results.errors.push(`❌ ${mapPrefix} 截图数量不足: ${screenshotCount} < ${CONFIG.MIN_SCREENSHOTS}`)
  } else if (screenshotCount > CONFIG.MAX_SCREENSHOTS) {
    results.warnings.push(`⚠️  ${mapPrefix} 截图数量过多: ${screenshotCount} > ${CONFIG.MAX_SCREENSHOTS}`)
  } else {
    results.info.push(`✅ ${mapPrefix} 截图数量正常: ${screenshotCount}`)
  }
  
  // 验证每个截图
  screenshots.forEach((screenshot, index) => {
    validateScreenshot(screenshot, `${mapPrefix}截图[${index}]`, mapName)
  })
}

/**
 * 验证单个截图数据
 */
function validateScreenshot(screenshot, screenshotPrefix, mapName) {
  // 检查必需字段
  CONFIG.REQUIRED_SCREENSHOT_FIELDS.forEach(field => {
    if (!screenshot[field]) {
      results.errors.push(`❌ ${screenshotPrefix} 缺少必需字段: ${field}`)
    }
  })
  
  // 验证URL格式
  if (screenshot.url) {
    if (!screenshot.url.startsWith('/static/maps/')) {
      results.errors.push(`❌ ${screenshotPrefix} URL格式错误: ${screenshot.url}`)
    }
    
    // 检查URL中的地图名称是否匹配
    if (mapName && !screenshot.url.includes(mapName)) {
      results.warnings.push(`⚠️  ${screenshotPrefix} URL中的地图名称可能不匹配: ${screenshot.url}`)
    }
  }
  
  // 验证文件名格式
  if (screenshot.filename) {
    if (!screenshot.filename.endsWith('.jpg')) {
      results.warnings.push(`⚠️  ${screenshotPrefix} 建议使用.jpg格式: ${screenshot.filename}`)
    }
    
    // 检查文件名中的地图名称
    if (mapName && !screenshot.filename.includes(mapName)) {
      results.warnings.push(`⚠️  ${screenshotPrefix} 文件名中的地图名称可能不匹配: ${screenshot.filename}`)
    }
  }
}

/**
 * 验证文件系统
 */
function validateFileSystem() {
  if (!fs.existsSync(CONFIG.STATIC_MAPS_PATH)) {
    results.errors.push(`❌ 静态文件目录不存在: ${CONFIG.STATIC_MAPS_PATH}`)
    return
  }
  
  try {
    const mapDirs = fs.readdirSync(CONFIG.STATIC_MAPS_PATH)
    results.info.push(`📁 发现 ${mapDirs.length} 个地图目录`)
    
    mapDirs.forEach(dir => {
      const dirPath = path.join(CONFIG.STATIC_MAPS_PATH, dir)
      if (fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath)
        const imageFiles = files.filter(file => file.endsWith('.jpg'))
        results.info.push(`📁 ${dir}: ${imageFiles.length} 个图片文件`)
      }
    })
  } catch (error) {
    results.warnings.push(`⚠️  读取静态文件目录失败: ${error.message}`)
  }
}

/**
 * 生成统计信息
 */
function generateStats(data) {
  if (!data.maps) return
  
  results.stats.totalMaps = data.maps.length
  
  data.maps.forEach(map => {
    // 统计截图数量
    if (map.screenshots) {
      results.stats.totalScreenshots += map.screenshots.length
    }
    
    // 按类型统计
    if (map.type) {
      results.stats.mapsByType[map.type] = (results.stats.mapsByType[map.type] || 0) + 1
    }
  })
}

/**
 * 打印验证结果
 */
function printResults() {
  console.log('📊 验证结果统计:')
  console.log(`   总地图数: ${results.stats.totalMaps}`)
  console.log(`   总截图数: ${results.stats.totalScreenshots}`)
  console.log(`   平均每地图截图数: ${(results.stats.totalScreenshots / results.stats.totalMaps).toFixed(1)}`)
  
  console.log('\n📈 地图类型分布:')
  Object.entries(results.stats.mapsByType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} 个`)
  })
  
  if (results.info.length > 0) {
    console.log('\n✅ 信息:')
    results.info.forEach(info => console.log(`   ${info}`))
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:')
    results.warnings.forEach(warning => console.log(`   ${warning}`))
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ 错误:')
    results.errors.forEach(error => console.log(`   ${error}`))
  }
  
  console.log(`\n🎯 验证${results.errors.length === 0 ? '通过' : '失败'}!`)
  
  if (results.errors.length === 0) {
    console.log('✨ 题库数据格式正确，可以正常使用！')
  } else {
    console.log('🔧 请修复上述错误后重新验证。')
  }
}

// 执行验证
if (require.main === module) {
  const isValid = validateMapsData()
  printResults()
  process.exit(isValid ? 0 : 1)
}

module.exports = { validateMapsData, results }