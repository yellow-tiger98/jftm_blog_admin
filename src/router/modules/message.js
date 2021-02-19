import Layout from '@/layout'

const msgManagerRouter = {
  path: '/msgManager',
  component: Layout,
  redirect: 'noRedirect',
  name: 'MsgManager',
  meta: {
    title: '消息管理',
    icon: 'documentation'
  },
  children: [
    {
      path: 'comment',
      component: () => import('@/views/msgManager/comment/commentList'),
      name: 'Comment',
      meta: { title: '评论管理' }
    },
    {
      path: 'advise',
      component: () => import('@/views/msgManager/advise/adviseList'),
      name: 'Advise',
      meta: { title: '通知管理' }
    }
  ]
}

export default msgManagerRouter
