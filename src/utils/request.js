import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 配置axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 请求前缀，映射到配置的服务地址
  withCredentials: true, // 允许后端的cookie传递到前端，刷新token时必要
  timeout: 5000 // 请求超时时间
})

// 设置请求header为‘Authorization’
service.defaults.headers.common['Authorization'] = getToken()

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      // 让每个请求携带自定义的token
      config.headers.Authorization = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(

  /**
   * 处理响应结果
   */
  response => {
    const res = response.data

    // 500为请求正常
    if (res.code !== '500') {
      // 401表示token过期
      if (res.code === '401') {
        // to re-login
        MessageBox.confirm('token已过期，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      } else {
        Message({
          message: res.msg || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
        return response.data
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
