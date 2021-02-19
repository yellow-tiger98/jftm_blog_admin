<template>
  <el-form ref="updateForm" :rules="updateRules" :model="updateForm">
    <el-form-item label="用户名：">
      <el-input disabled v-model.trim="user.name" />
    </el-form-item>
    <el-form-item label="旧密码" prop="oldPwd">
      <el-input  ref="password" name="oldPwd" v-model="updateForm.oldPwd" type="password"/>
    </el-form-item>
    <el-form-item label="新密码" prop="newPwd">
      <el-input  ref="password" name="newPwd" v-model="updateForm.newPwd" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="warning" @click="resetPwd">更改密码</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { resetPwd } from '@/api/user'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: ''
        }
      }
    }
  },
  data() {
    return {
      updateForm: {
        oldPwd: '',
        newPwd: ''
      },
      updateRules: {
        oldPwd: [{ required: true , message:"旧密码不能为空"}],
        newPwd: [{ required: true , message:"新密码不能为空" }]
      }
    }
  },
  methods: {
    resetPwd() {
      this.$refs.updateForm.validate(valid => {
        if(valid){
          const oldPwd = this.updateForm.oldPwd.trim()
          const newPwd = this.updateForm.newPwd.trim()
          var params = new URLSearchParams()
          params.append('oldPwd', oldPwd)
          params.append('newPwd', newPwd)
          resetPwd(params).then(response => {
            const data = response
            console.log(data)
            if (data.code === '500'){
              this.$message({
                message: '修改成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.updateForm.oldPwd = ''
              this.updateForm.newPwd = ''
            }
          })
        }
      })
      
    }
  }
}
</script>
