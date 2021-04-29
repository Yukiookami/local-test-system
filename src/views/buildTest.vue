<template>
  <div class="build-test-sec">
    <!-- 生成试题 -->
    <div class="build-test-topic-sec">
      <!-- 生成试题header -->
      <div class="build-test-topic-header">
        <div class="build-test-topic-point">
          <div class="build-test-show-point">
            <Input class="unselect" v-model="point" placeholder="总分" />
          </div>
          <Button class="build-test-topic-button unselect" @click="buildTest(point)" type="primary">生成试卷</Button>
          <Checkbox class="build-test-topic-show-answer" 
          v-model="showAnswer" border>隐藏答案</Checkbox>
        </div>

        <Button class="build-test-topic-button unselect" 
        @click="modal = true" type="primary">设置生成规则</Button>
      </div>

      <!-- 生成规则modal -->
      <Modal
        v-model="modal"
        title="更改试卷生成规则"
        width="80%">
        <div class="build-test-change-rule-header">
          <div class="build-text-change-rule-input-sec">
            <Input class="build-text-change-rule-input-type" v-model="type" placeholder="输入题目类型" />
            <InputNumber :max="100" :min="1"
            class="build-text-change-rule-input-point-per"
            placeholder="分值占比(百分比)" v-model="pointPer"></InputNumber>
          </div>
          <Button class="build-test-topic-button unselect"
          @click="addRule(type, pointPer)" type="primary">添加规则</Button>
        </div>
        
        <Table border :columns="columns" :data="data"></Table>
    </Modal>

      <!-- 生成试卷文本 -->
      <div class="build-test-results-sec">
        <div v-for="(item, index) in buildedTest" :key="index">
          <!-- 类型，分值 -->
          <div class="build-test-results-sec-point-box">
            <h2>{{item[0].type}}</h2>
            <span>(每小题分值：{{item[0].point}})</span>
          </div>
          <!-- 选项，答案 -->
          <div class="build-test-results-sec-topic-box" 
          v-for="(pointItem, pointIndex) in item" :key="pointIndex">
            <p>{{pointItem.topic}}</p>
            <div class="build-test-results-sec-answer-box">
              <span>{{pointItem.options}}</span>
              <span v-if="!showAnswer">(答案:{{pointItem.answer}})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        // 总分，默认100
        point: 100,
        // 试题文本框
        topic: '',
        // 生成的数组
        buildedTest: '',
        // 自适应文本高度
        autoObj: {
          minRows: 1,
          maxRows: 25
        },
        // 生成规则开关
        modal: false,
        // 题目类型
        type: '',
        // 题目分值占比（百分比）
        pointPer: 0,
        // 是否显示答案
        showAnswer: false,
        // 规则表格
        columns: [
          {
            title: '顺位',
            align: 'center',
            key: 'type',
            render: (h, params) => {
            return h('div', [
              h('icon', {
                props: {
                  type: 'ios-arrow-dropup',
                  size: '25'
                },
                on: {
                  click: () => {
                    this.$http.post(`/mock/changeRule`, {
                      number: params.row.number,
                      changeFlag: 'up'
                    }).then (res => {
                      if(res.data.successCode === 100) {
                        this.$Message.error(res.data.msg)
                      } else {
                        this.getRule()
                        this.$Message.success('替换成功')
                      }
                    })
                  }
                }
              }),
              h('icon', {
                props: {
                  type: 'ios-arrow-dropdown',
                  size: '25'
                },
                on: {
                  click: () => {
                    this.$http.post(`/mock/changeRule`, {
                      number: params.row.number,
                      changeFlag: 'down'
                    }).then (res => {
                      if(res.data.successCode === 100) {
                        this.$Message.error(res.data.msg)
                      } else {
                        this.getRule()
                        this.$Message.success('替换成功')
                      }
                    })
                  }
                }
              }),
            ])
          }},
          {
            title: '题目类型',
            align: 'center',
            key: 'type'
          },
          {
            title: '类型分值占比(百分比)',
            align: 'center',
            key: 'pointPer'
          },
          {
            title: '操作',
            align: 'center',
            key: 'type',
            render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '是否删除',
                      content: '确认删除内容吗，删除后将无法找回',
                      closable: true,
                      cancelText: '取消',
                      onOk: () => {
                        this.$http.post(`/mock/deleteRule`, {
                          number: params.row.number
                        })
                          .then(res => {
                            if (res.data.successCode === 200) {
                              this.getRule()
                              this.$Message.success('删除成功')
                            } else {
                              this.$Message.error('删除失败请重试')
                            }
                          })
                        }
                    })
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    
                  }
                }
              }, '修改')
            ])
          }}
        ],
        data: []
      }
    },
    created () {
      this.getRule()
    },
    methods : {
      /**
       * @description 生成试卷
       * @param {Number} point 总分
       */
      buildTest (point) {
        this.$http.post('/mock/buildTest', {
          point: point
        }).then(res => {
          this.buildedTest = res.data
          console.log(this.buildedTest)
        })
      },
       /**
       * @description 添加规则
       * @param {String} type 题目类型
       * @param {Number} pointPer 题目分值百分比
       */
      addRule (type, pointPer) {
        if(!type) {
          this.$Message.warning('请输入类型')
        } else if (!pointPer) {
          this.$Message.warning('分值百分比不能为0')
        } else {
          this.$http.post('/mock/addRule', {
            type: type,
            pointPer: pointPer
          }).then(res => {
            if (res.data.successCode === 200) {
              this.$Message.success('添加成功')
              this.type = ''
              this.pointPer = 0
              this.getRule()
            } else {
              this.$Message.error('添加失败请重试')
            }
          })
        }
      },
      /**
       * @description 获得规则
       */
      getRule () {
        this.$http.get('/mock/getRule').then (res => {
          this.data = res.data
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
// 总样式
.build-test-sec {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 10vw;
  width: 90vw;
  min-height: 100vh;
  z-index: 999;

  // 生成试题
  .build-test-topic-sec {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 69vw;
    min-height: calc(70vw / 1.73);
    padding: 4vw;
    background: rgba(255, 255, 255, .3);
    border-radius: 60px;

    // 生成试题头部
    .build-test-topic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      // 总分设置
      .build-test-topic-point {
        display: flex;
        justify-content: space-between;
        align-items: center;
        // width: 14%;

        .build-test-show-point {
          width: 50px;
        }

        .build-test-topic-button {
          margin: 0 15px;
        }

        .build-test-topic-show-answer {
          color: #FFF;
        }
      }
    }
  }

  // 生成试卷区域
  .build-test-results-sec {
    width: 100%;
    max-height: 30vw;
    padding: 20px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, .7);
    overflow: scroll;

    .build-test-results-sec-point-box {
      display: flex;
      align-items: center;
      width: 100%;

      h2 {
        margin-right: 10px;
      }
    }

    .build-test-results-sec-topic-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin: 10px 0;
      padding: 0 20px;
      width: 100%;

      p {
        font-size: 16px;
        font-weight: 500;
      }

      .build-test-results-sec-answer-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
    }
  }
}

// 更改生成规则模态框
.build-test-change-rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .build-text-change-rule-input-sec {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .build-text-change-rule-input-type {
      margin-right: 20px;
      width: 100px;
    }

    .build-text-change-rule-input-point-per {
      width: 120px;
    }
  }
}

// 内容不可选中，方便复制
.unselect {
  user-select: none;
}
</style>