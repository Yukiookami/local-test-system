// mock.js

// 引入mockjs
const Mock = require('mockjs')
// 获取 mock.Random 对象
// const Random = Mock.Random


// 题目接口
/**
 * 模糊搜索
 * 
 * @param {*} keyWord 搜索关键字
 * @returns {Array} 结果数组
 */
function fuzzySearch (keyWord, arr) {
  return arr.filter(ele => {
    return Object.keys(ele).some(key => {
      return String(ele[key]).toLowerCase().includes(keyWord)
    })
  })
}

/**
 * @description 添加题目
 * @param {Array} topicList 整理出来的最终题目(数组内为对象)
 * @param {String} isCover 是否覆盖
 */
const addTopic = topicList => {
  // 本地题目数组
  let locArr = JSON.parse(localStorage.getItem('topicArr')) || []
  let req = JSON.parse(topicList.body).topicList
  let isCover = JSON.parse(topicList.body).isCover
  
  if (isCover) {
    locArr = req
  } else {
    req.forEach(ele => {
      locArr.push(ele)
    })
  }

  // 当年年份
  const date = new Date
  let year = date.getYear()
  let month = date.getMonth()
  let day = date.getDay()
  let hour = date.getHours();
  let min = date.getMinutes();

  // 添加编号
  locArr.forEach((ele, index) => {
    ele.number = `N${year}${month}${day}${hour}${min}${index}` 
  })
  localStorage.setItem('topicArr', JSON.stringify(locArr))

  return {
    successCode: 200
  }
}

/**
 * @description 获取题目列表 
 * @returns {Array} 题目数组
 */
const getTopic = () => {
  // 本地题目数组
  let locArr = localStorage.getItem('topicArr') || []
  
  if (locArr) {
    return JSON.parse(locArr)
  } else {
    return {
      msg: '题库为空'
    }
  }
}

/**
 * @description 模糊搜索题目
 * @param {String} keyword 关键字
 * @returns {Array} 返还符合条件的题目
 */
const seachTopic = keyword => {
  // 本地题目数组
  let locArr = localStorage.getItem('topicArr') || []
  return fuzzySearch(keyword, locArr)
} 

/**
 * @description 删除试题
 * @param {Number} number 
 */
const deleteTopic = number => {
  let locArr = JSON.parse(localStorage.getItem('topicArr')) || []

  let deleteIndex = locArr.findIndex(ele => {
    return ele.number === JSON.parse(number.body).number
  })

  locArr.splice(deleteIndex, 1)

  localStorage.setItem('topicArr', JSON.stringify(locArr))
  return {
    successCode: 200
  }
}

/**
 * @description 删除所有题目
 */
const deleteAllTopic = () => {
  let locArr = JSON.parse(localStorage.getItem('topicArr')) || []
  
  locArr.splice(0)

  localStorage.setItem('topicArr', JSON.stringify(locArr))
  return {
    successCode: 200
  }
}

/**
 * @description 修改题目
 * @param {*} req 
 */
const modifyTopic = req => {
  let getData = JSON.parse(req.body)
  let locArr = JSON.parse(localStorage.getItem('topicArr'))
  let index = getData.number

  locArr[locArr.findIndex(ele => {
    ele.number === index
  })] = getData

  return {
    successCode: 200
  }
}
// 题目接口end

// 试卷接口
/**
 * @description 添加试卷规则
 * @param {String} type 类型
 * @param {String} point 分值占比
 */
const addRule = (req) => {
  let postRuleObj = JSON.parse(req.body)
  console.log(postRuleObj)

  // 本地规则数组
  let locRuleArr = JSON.parse(localStorage.getItem('ruleArr')) || []
  locRuleArr.push(postRuleObj)

  const date = new Date
  let year = date.getYear()
  let month = date.getMonth()
  let day = date.getDay()
  let hour = date.getHours();
  let min = date.getMinutes();

  // 添加编号
  locRuleArr.forEach((ele, index) => {
    ele.number = `N${year}${month}${day}${hour}${min}${index}` 
  })

  localStorage.setItem('ruleArr', JSON.stringify(locRuleArr))

  return {
    successCode: 200
  }
}

/**
 * @description 获取试题生成规则
 * @returns 试卷规则 
 */
const getRule = () => {
  // 本地题目数组
  let locRuleArr = localStorage.getItem('ruleArr') || []
  
  if (locRuleArr) {
    return JSON.parse(locRuleArr)
  } else {
    return {
      msg: '规则为空'
    }
  }
}

/**
 * @description 删除规则
 * @param {Number} number 
 */
const deleteRule = number => {
  let locRuleArr = JSON.parse(localStorage.getItem('ruleArr')) || []

  let deleteIndex = locRuleArr.findIndex(ele => {
    return ele.number === JSON.parse(number.body).number
  })

  locRuleArr.splice(deleteIndex, 1)

  localStorage.setItem('ruleArr', JSON.stringify(locRuleArr))
  return {
    successCode: 200
  }
}

/**
 * @description 更改规则顺序
 * @param {*} req 
 */
const changeRule = req => {
  let changeFlag = JSON.parse(req.body).changeFlag
  let changeItem = JSON.parse(req.body).number
  let locRuleArr = JSON.parse(localStorage.getItem('ruleArr')) || []

  let ruleIndex = locRuleArr.findIndex(ele => {
    return ele.number === changeItem
  })

  if(changeFlag === 'up') {
    if (ruleIndex === 0) {
      console.log(1)
      return {
        successCode: 100,
        msg: '已经是顶端'
      }
    } else {
      [locRuleArr[ruleIndex - 1], locRuleArr[ruleIndex]] = [locRuleArr[ruleIndex], locRuleArr[ruleIndex - 1]]
      localStorage.setItem('ruleArr', JSON.stringify(locRuleArr))
      return {
        successCode: 200
      }
    }
  } else {
    if (ruleIndex === locRuleArr.length - 1) {
      return {
        successCode: 100,
        msg: '已经是低端'
      }
    } else {
      [locRuleArr[ruleIndex], locRuleArr[ruleIndex + 1]] = [locRuleArr[ruleIndex + 1], locRuleArr[ruleIndex]]
      localStorage.setItem('ruleArr', JSON.stringify(locRuleArr))
      return {
        successCode: 200
      }
    }
  }
}

/**
 * @description 生成试题
 * @param {Number} point 总分 
 */
const buildTest = req => {
  let point = JSON.parse(req.body).point
  // 本地规则数组
  let locRuleArr = JSON.parse(localStorage.getItem('ruleArr')) || []
  // 获得的题目
  let getTopicArr = []

  locRuleArr.forEach(ele => {
    let pre = ele.pointPer / 100

    getTopicArr.push(buildTopic(Math.floor(point * pre), ele.type))
  })

  return getTopicArr
}

/**
 * @description 随机生成题目
 * @param {Number} allpoint 类型题目总分
 * @param {String} type 类型
 * @returns {Array} 返回题目数组
 */
const buildTopic = (allpoint, type) => {
  // 获取本地题目数组
  let locArr = JSON.parse(localStorage.getItem('topicArr'))
  // 筛选出当前类型题目数组
  let nowTypeArr = locArr.filter(ele => {
    if (ele.type === type) {
      return ele
    }
  })
  // 当前类型题目数量
  let length = nowTypeArr.length
  // 当前题目总分
  let nowPoint = 0
  // 随机出来的题号
  let randomTopicIndex = []
  // 随机生成的题
  let randomTopic = []

  // 判断当前类型题目是否能够组成该大题
  // 题库内题总分
  let nowTypePoint = nowTypeArr.reduce((prev, cur) => {
    return prev + +cur.point 
  }, 0)

  if (nowPoint > nowTypePoint) {
    return `题库中${type}类型题目不足`
  } else {
    while (nowPoint < allpoint) {
      let pointIndex = getRandom(0, length)
      
      let check = randomTopicIndex.some(ele => {
        return ele === pointIndex
      })

      if (check) {
        continue
      } else {
        randomTopicIndex.push(pointIndex)
        randomTopic.push(nowTypeArr[pointIndex])
        nowPoint += +nowTypeArr[pointIndex].point
      }
    }

    return randomTopic
  }
}

/**
 * @description 获取随机整数
 * @param {Number} min 下限
 * @param {Number} max 上限
 * @returns {Number}
 */
const getRandom = (m,n) => {
  return Math.floor(Math.random()*(m - n) + n)
}


// 请求路径

// 题目
// 添加题目
Mock.mock('/mock/addTopic', addTopic)
// 获得题目
Mock.mock('/mock/getTopic', getTopic)
// 模糊搜索题目
Mock.mock('/mock/seachTopic', seachTopic)
// 删除题目
Mock.mock('/mock/deleteTopic', deleteTopic)
// 删除所有题目
Mock.mock('/mock/deleteAllTopic', deleteAllTopic)
// 修改题目
Mock.mock('/mock/modifyTopic', modifyTopic)

// 试卷

// 添加规则
Mock.mock('/mock/addRule', addRule)
// 获得规则
Mock.mock('/mock/getRule', getRule)
// 删除规则
Mock.mock('/mock/deleteRule', deleteRule)
// 改变规则顺序
Mock.mock('/mock/changeRule', changeRule)
// 生成试卷
Mock.mock('/mock/buildTest', buildTest)