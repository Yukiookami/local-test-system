<template>
  <div class="add-test-sec">
    <div class="add-test-updata-sec">
      <!-- 上传试题 -->
      <div class="add-test-updata-header">
        <!-- 上传按钮 -->
        <div class="updata-button">
          <!-- 上传word文档 -->
          <input ref="fileUpload"  accept=".docx"
          class="add-button-cant-see" type="file" value="" @change="getHTML">
          <Button class="add-button-can-see" type="primary">添加试题(doxc)</Button>
          <!-- 上传word文档end -->
          <!-- 上传xlsx文档 -->
          <input ref="fileUploadXlsx"  accept=".xlsx"
          class="add-button-cant-see add-xlsx" type="file" value="" @change="readExcel">
          <Button class="add-button-can-see add-xlsx" type="primary">添加试题(xlsx)</Button>
          <!-- 上传xlsx文档end -->
          <!-- 是否覆盖上传 -->
           <Checkbox class="add-button-cover-check" 
           v-model="isCover">覆盖上传</Checkbox>
        </div>

        <!-- 搜索框 -->
        <div class="updata-search-input">
          <Button class="delete-button" @click="deleteAllTopic" type="error">全部删除</Button>
          <Input v-model="keyWord" search placeholder="请输入关键词搜索" />
        </div>
      </div>

      <Table border max-height="425" :columns="columns" :data="data"></Table>
    </div>
  </div>
</template>

<script>
  import mammoth from 'mammoth'
  import XLSX from "xlsx";

  export default {
    data () {
      return {
        // 表头
        columns: [
          {
            title: '试题编号',
            align: 'center',
            key: 'number'
          },
          {
            title: '题目',
            align: 'center',
            key: 'topic'
          },
          {
            title: '类型',
            align: 'center',
            key: 'type'
          },
          {
            title: '选项',
            align: 'center',
            key: 'options'
          },
          {
            title: '答案',
            align: 'center',
            key: 'answer'
          },
          {
            title: '分值',
            align: 'center',
            key: 'point'
          },
          {
            title: '操作',
            key: 'type',
            align: 'center',
            render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '是否删除',
                      content: '确认删除内容吗，删除后将无法找回',
                      closable: true,
                      cancelText: '取消',
                      onOk: () => {
                        this.$http.post(`/mock/deleteTopic`, {
                          number: params.row.number
                        })
                          .then(res => {
                            if (res.data.successCode === 200) {
                              this.getTopic()
                              this.$Message.success('删除成功')
                            } else {
                              this.$Message.error('删除失败请重试')
                            }
                          })
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }}
        ],
        // 表格数据
        data: [],
        // 表格原本数据
        oldData: [],
        // 模糊搜索关键词
        keyWord: '',
        // word转化为HTML的结果
        htmlChange: '',
        // 提取列出来后的数组
        rowList: [],
        // 将列继续分离后的数组
        itemList: [],
        // 是否覆盖上传
        isCover: false
      }
    },
    created () {
      this.getTopic()
    },
    watch: {
      keyWord (val) {
        this.goToSearch(val)
      }
    },
    methods: {
      // 后端请求
      /**
       * @description 模糊搜索
       * @param {String} keyWrod 关键词
       * @returns 搜索结果
       */
      goToSearch (keyWord) {
        this.data = this.fuzzySearch(keyWord, this.oldData)
      },
      /**
       * @description 添加题目
       * @param topicList 提取好后的题目数组
       */
      postTopic () {
        this.$http.post('/mock/addTopic', {
          topicList: this.itemList,
          isCover: this.isCover
        }).then(res => {
          if (res.data.successCode === 200) {
            this.$Message.success('添加成功')
            this.$refs.fileUpload.value = ''
            this.$refs.fileUploadXlsx.value = ''
            this.itemList = []
            this.getTopic()
          } else {
            this.$Message.error('添加失败请重试')
          }
        }) 
      },
      /**
       * @description 获取所有题目
       * @returns 返回题目数组
       */
      getTopic () {
        this.$http.get('/mock/getTopic').then(res => {
          this.oldData = this.data = res.data
        })
      },
      /**
       * @description 删除所有题目
       */
      deleteAllTopic () {
        this.$Modal.confirm({
        title: '是否删除',
        content: '确认删除内容吗，删除后将无法找回',
        closable: true,
        cancelText: '取消',
        onOk: () => {
          this.$http.get(`/mock/deleteAllTopic`)
            .then(res => {
              if (res.data.successCode === 200) {
                this.getTopic()
                this.$Message.success('删除成功')
              } else {
                this.$Message.error('删除失败请重试')
              }
            })
        }
      })
      },
      // 后端请求end

      // 转化word文档
      /**
       * @description 将arrayBuffer转化为HTML
       * @param {Object} e 文件传输html对象
       */
      getHTML (e) {
        this.getBuffer(e, (arrayBuffer) => {
          mammoth.convertToHtml({ arrayBuffer }).then ((res) => {
            this.htmlChange = res.value
            // 提取行列
            this.getTable(res.value)
          })
        })
      },
      /**
       * @description 将文件转化为arrayBuffer
       * @param {Object} e 文件传输html对象
       * @param {Function} callback 回调函数
       */
      getBuffer (e, callback) {
        const reader = new FileReader()
        const file = e.target.files[0]

        reader.onload = (ele) => {
          const arrayBuffer = ele.target["result"];
          callback(arrayBuffer);
        };

        reader.readAsArrayBuffer(file)
      },
      /**
       * @description 获取最终剔除html标签数据，并转化为对象
       * @param {String} word 获得的HTML文本
       */
      getTable (word) {
        // 获取行
        const getRow = new RegExp('<tr>(.*?)</tr>', 'g')
        // 获取单个元素
        const getItem = new RegExp('<td>(.*?)</td>', 'g')
        // 移除html标签
        const deletePandTd = new RegExp('<[^>]*>', 'g')
        
        this.rowList = word.match(getRow)

        this.rowList.forEach(ele => {
          let item = ele.match(getItem)

          let newArr = item.map(itemEle => {
            return itemEle.replace(deletePandTd, '')
          })

          let testObj = {
            // 题目
            topic: String,
            // 类型
            type: String,
            // 选项
            options: String,
            // 答案
            answer: String,
            // 分值
            point: Number
          }

          let testObjIndex = 0
          for (let objEle in testObj) {
            testObj[objEle] = newArr[testObjIndex++]
          }

          this.itemList.push(testObj)
        })

        this.postTopic(this.itemList)
      },
      // 转化word文档end

      // 转化xlsx表格
      /**
       * @description 把xlsx表格转化成数组
       * @param {Object} 
       */
      readExcel(e) {
      // 读取表格文件
      let that = this;
      const files = e.target.files;
      if (files.length <= 0) {
        return false;
      } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$message({
          message: "上传格式不正确，请上传xls或者xlsx格式",
          type: "warning"
        });
        return false;
      } else {
        // 更新获取文件名
        that.upload_file = files[0].name
      }

      const fileReader = new FileReader()
      fileReader.onload = ev => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
          })
          const wsname = workbook.SheetNames[0] //取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]) //生成json表格内容
          that.itemList = [];
          // 从解析出来的数据中提取相应的数据
          ws.forEach(item => {
            that.itemList.push({
              topic: item['题目'],
              type: item['类型'],
              options: item['选项'],
              answer: item['答案'],
              point: item['分值']
            })
          });
          // 给后端发请求
          this.postTopic()
        } catch (e) {
          return false
        }
      };
      fileReader.readAsBinaryString(files[0])
    },
      // 转化xlsx表格end

      // 功能代码
      /**
       * 模糊搜索
       * 
       * @param {*} keyWord 搜索关键字
       * @returns {Array} 结果数组
       */
      fuzzySearch (keyWord, arr) {
        return arr.filter(ele => {
          return Object.keys(ele).some(key => {
            if (key !== 'point' || key !== 'number') {
              return String(ele[key]).toLowerCase().includes(keyWord)
            }
          })
        })
      }
      // 功能代码end
    }
  }
</script>

<style lang="scss" scoped>
// 总样式
.add-test-sec {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 10vw;
  width: 90vw;
  min-height: 100vh;
  z-index: 999;

  // 上传区域
  .add-test-updata-sec {
    position: relative;
    width: 69vw;
    min-height: calc(70vw / 1.73);
    padding: 4vw;
    background: rgba(255, 255, 255, .3);
    border-radius: 60px;

    // 头部搜索和按钮
    .add-test-updata-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5vw;
      width: 100%;

      // 上传按钮
      .updata-button {
        position: relative;
        display: flex;
        align-items: center;
  
        .add-button-cant-see {
          position: absolute;
          outline: none;
          vertical-align: middle;
          overflow: hidden;
          width: 120px;
          font-size: 5px;
          cursor: pointer;
          // left: 0;
        }
  
        .add-button-can-see {
          position: absolute;
          // left: 0;
          // opacity: 0;
          pointer-events: none;
        }

        .add-xlsx {
          left: 150px;
        }

        .add-button-cover-check {
          position: absolute;
          width: 100px;
          color: #fff;
          left: 280px;
        }
      }
    } 
  }

  // 搜索框
  .updata-search-input {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .delete-button {
      margin-right: 20px;
    }
  }
}
</style>