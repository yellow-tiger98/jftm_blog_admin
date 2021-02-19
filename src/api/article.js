import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/blog/query/page',
    method: 'post',
    data
  })
}

export function fetchArticle(blogUid) {
  return request({
    url: '/blog/query/unique',
    method: 'get',
    params: { blogUid }
  })
}

export function createArticle(data) {
  return request({
    url: '/blog/add',
    method: 'post',
    data
  })
}

export function updateStatus(data) {
  return request({
    url: '/blog/update',
    method: 'put',
    data
  })
}

export function deleteBlog(data) {
  return request({
    url: '/blog/delete',
    method: 'delete',
    data
  })
}

export function loadTypeList() {
  return request({
    url: '/blogType/query/page',
    method: 'post'
  })
}

export function loadSignList() {
  return request({
    url: '/blogSign/query/page',
    method: 'post'
  })
}

export function uploadCover(data) {
  return request({
    url: '/picture/upload',
    method: 'post',
    data
  })
}
