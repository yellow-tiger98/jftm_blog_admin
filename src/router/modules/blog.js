import Layout from '@/layout'

const blogManagerRouter = {
  path: '/blogManager',
  component: Layout,
  redirect: 'noRedirect',
  name: 'BlogManager',
  meta: {
    title: '博客管理',
    icon: 'documentation'
  },
  children: [
    {
      path: 'documents',
      component: () => import('@/views/blogManager/documents/docList'),
      name: 'Ducuments',
      meta: { title: '文章管理' }
    },
    {
      path: 'docType',
      component: () => import('@/views/blogManager/docType/typeList'),
      name: 'DocType',
      meta: { title: '分类管理' }
    },
    {
      path: 'docSign',
      component: () => import('@//views/blogManager/docSign/signList'),
      name: 'DocSign',
      meta: { title: '标签管理' }
    }
  ]
}

export default blogManagerRouter
