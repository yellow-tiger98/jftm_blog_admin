<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          保存
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <!-- 模式 新增或编辑 -->
          <el-input v-show="false" v-model="postForm.mode" />
          <!-- 操纵 发布或保存 -->
          <el-input v-show="false" v-model="postForm.opr" />
          <el-input v-show="false" v-model="postForm.uid" />

          <el-col :span="24">

            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                标题
              </MDinput>
            </el-form-item>

          <el-form-item style="margin-bottom: 40px;" label-width="60px" label="摘要:" prop="summary">
            <el-input v-model="postForm.summary" :rows="1" type="textarea" class="article-textarea" autosize placeholder="请输入摘要" />
          </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="分类:" class="postInfo-container-item" prop="type">
                    <el-select v-model="postForm.type" placeholder="选择分类">
                      <el-option v-for="item in blogTypeOptions" :key="item.typeId" :label="item.typeNa" :value="item.typeId" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="120px" label="标签:" class="postInfo-container-item" prop="signList">
                    <el-select v-model="postForm.signList" placeholder="选择标签" multiple>
                      <el-option v-for="item in blogSignOptions" :key="item.signId" :label="item.signNa" :value="item.signId" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <!-- <el-form-item label-width="90px" label="推荐度:" class="postInfo-container-item">
                    <el-rate
                      v-model="postForm.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="display:inline-block"
                    />
                  </el-form-item> -->
                  <el-input v-show="false" v-model="postForm.cover" />
                  <el-form-item  prop="cover" label="封面图:">
                      <el-upload  
                        class="avatar-uploader"
                        :action="uploadPictureHost"
                        :show-file-list="false"
                        :on-success="handleAvatarSuccess"
                        :before-upload="beforeCoverUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                      </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <!-- <Tinymce ref="editor" v-model="postForm.content" :height="400" /> -->
          <!-- <markdown-editor ref="markdownEditor" v-model="postForm.content" :options="{hideModeSwitch:true,previewStyle:'tab'}" height="400px" /> -->
          <CKEditor ref="editor" :content="postForm.content" @contentChange="contentChange" :height="360"></CKEditor>
        </el-form-item>

      </div>
    </el-form>
  </div>
</template>

<script>
// import Tinymce from '@/components/Tinymce'
import { loadTypeList, loadSignList, uploadCover} from '@/api/article'
import MarkdownEditor from '@/components/MarkdownEditor'
import CKEditor from '@/components/CKEditor'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchArticle, createArticle } from '@/api/article'
import { searchUser } from '@/api/remote-search'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  summary: '',
  type: '', // 类别
  signList: '', // 标签
  uid: undefined,
  importance: 3
}

export default {
  name: 'DocAdd',
  components: { MarkdownEditor, MDinput, Sticky, CKEditor },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    uid: {
      type: String,
      default: ''
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        // this.$message({
        //   message: '必传项',
        //   type: 'error'
        // })
        callback(new Error('必传项'))
      } else {
        callback()
      }
    }

    return {
      uploadPictureHost: process.env.VUE_APP_BASE_API + "/picture/upload",
      imageUrl: '',
      editSign: false,
      postForm: Object.assign({}, defaultForm),
      blogTypeOptions: [],
      blogSignOptions: [],
      loading: false,
      userListOptions: [],
      rules: {
        title: [{ validator: validateRequire }],
        summary: [{ validator: validateRequire }],
        // content: [{ validator: validateRequire }],
        type: [{ validator: validateRequire }],
        signList: [{ validator: validateRequire }]
      },
      tempRoute: {}
    }
  },
  computed: {
    displayTime: {
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created() {
    // 初始化当前页面
    this.resetCurrentPage()
    if (this.isEdit) {
      console.log('编辑')
      // 为uid隐藏表单赋值
      this.postForm.uid = this.uid
      const id = this.uid
      this.fetchData(id)
    } else {
      console.log('新增')
      this.postForm.mode = 'add'
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  mounted() {
    this.loadTypeList()
    this.loadSignList()
  },
  methods: {
    // 编辑模式加载数据
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data
        this.imageUrl = this.postForm.cover
        setTimeout(() => {
          this.$refs.editor.setData(this.postForm.content);
        }, 200)
      //   this.$nextTick(() => {
      //   //DOM现在更新了
      //   this.$refs.editor.setData(this.postForm.content);//设置富文本内容
      // });
        this.postForm.mode = 'edit'
      }).catch(err => {
        console.log(err)
      })
    },

    // 上传文章
    submitForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 执行新增方法
          this.postForm.opr = 'publish'
          createArticle(this.postForm).then(response => {
            if (response.code === '500') {
              this.$notify({
                title: '成功',
                message: '发布文章成功',
                type: 'success',
                duration: 2000
              })
              this.postForm.status = 'published'
              this.loading = false
            } else {
              console.log("123131")
              this.loading = false
            }
          }).catch(err => {
            console.log(err)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    // 保存文章为草稿
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.postForm.opr = 'save'
      createArticle(this.postForm).then(response => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
        this.postForm.status = 'draft'
        this.loading = false
        this.$ruter.push({ path: '/blogManager/documents' })
      }).catch(err => {
        console.log(err)
      })
    },
    // 清空当前表单
    resetCurrentPage() {
      this.postForm.status = 'draft' // 草稿
      this.postForm.title = '' // 文章题目
      this.postForm.summary = '' // 文章摘要
      this.postForm.content = '' // 文章内容
      this.postForm.signList = '' // 文章类别
      this.postForm.title = '' // 文章标签
      this.postForm.uid = undefined
      this.postForm.importance = 0
    },
    // 加载文章分类列表
    loadTypeList() {
      loadTypeList().then(response => {
        const data = response.data
        this.blogTypeOptions = data.records
      })
    },
    // 加载文章标签列表
    loadSignList() {
      loadSignList().then(response => {
        const data = response.data
        this.blogSignOptions = data.records
      })
    },
    getRemoteUserList(query) {
      searchUser(query).then(response => {
        if (!response.data.items) return
        this.userListOptions = response.data.items.map(v => v.name)
      })
    },
    // 封面上传action
    uploadCover(param){
      const formData = new FormData()
      formData.append('file', param.file)
       uploadCover(file).then(response => {
        this.$notify({
                title: '成功',
                message: '封面上传成功',
                type: 'success',
                duration: 2000
        })
      })
    },
    // 封面上传成功后回显
    handleAvatarSuccess(res, file) {
        // this.imageUrl = URL.createObjectURL(file.raw);
        this.imageUrl =  process.env.VUE_APP_BASE_API + "/picture/getImage/"+res.data.fileName;
        this.postForm.cover = process.env.VUE_APP_BASE_API + "/picture/getImage/"+res.data.fileName;
    },
    // 封面上传前校验 限制图片格式为 png和jpg 大小在10m以内
    beforeCoverUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isPng = file.type === 'image/png';
        const isLt10M = file.size / 1024 /1024  < 10;

        if (!isJPG && !isPng) {
          this.$message.error('上传头像图片只能是 JPG或PNG 格式!');
        }
        if (!isLt10M) {
          this.$message.error('上传头像图片大小不能超过 10MB!');
        }
        return isJPG || isPng && isLt10M;
      },
    // 内容改变，触发监听
    contentChange: function() {
      var that = this;
      that.postForm.content = that.$refs.editor.getData(); //获取CKEditor中的内容
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}

 .avatar-uploader{
    width: 195px;
    height: 105px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 195px;
    height: 105px;
    line-height: 105px;
    text-align: center;
  }
  .avatar {
    width: 195px;
    height: 105px;
    display: block;
  }
</style>
