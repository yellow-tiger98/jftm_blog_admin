<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="标题" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.type" placeholder="分类" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in blogTypeOptions" :key="item.typeId" :label="item.typeNa" :value="item.typeId" />
      </el-select>
      <el-select v-model="listQuery.signList" placeholder="标签" multiple clearable class="filter-item" style="width: 180px">
        <el-option v-for="item in blogSignOptions" :key="item.signId" :label="item.signNa" :value="item.signId" />
      </el-select>
      <el-button v-waves class="filter-item" type="success" style="margin-left: 10px;" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="warning" icon="el-icon-edit" @click="resetForm">
        重置
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="标题" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column label="作者" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column label="分类" align="center" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="标签" align="center" width="150">
        <template slot-scope="{row}">
          <el-tag v-for="name in row.signListName" :key="name">
            {{ name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createDate | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='1'" size="mini" type="success" @click="handleModifyStatus(row,'1')">
            上架
          </el-button>
          <el-button v-if="row.status!='2'&&row.status!='0'" size="mini" @click="handleModifyStatus(row,'2')">
            下架
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog v-if="dialogFormVisible" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :fullscreen="true">
      <!-- 嵌入发布文章页面 -->
      <DocAdd :is-edit="is_edit" :uid="uid" />
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, loadTypeList, loadSignList, updateStatus, deleteBlog } from '@/api/article'
import DocAdd from './docAdd'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // 导入分页插件

export default {
  name: 'DocList',
  components: { Pagination, DocAdd },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    },
    statusNameFilter(status) {
      const statusMap = {
        0: '草稿',
        1: '已上架',
        2: '已下架'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      is_edit: false,
      uid: null,
      tableKey: 0,
      editSign: false,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        type: undefined,
        signList: undefined
      },
      blogTypeOptions: [],
      blogSignOptions: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑博文',
        create: '发布博文'
      },
      rules: {

      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.loadTypeList()
    this.loadSignList()
  },
  methods: {
    // 查询方法
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response.data.records)
        this.list = response.data.records
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 更新文章状态
    handleModifyStatus(row, status) {
      const temp = Object.assign({}, row)
      temp.status = status
      updateStatus(temp).then(response => {
        const data = response
        console.log(data)
        if (data.code === '500' && status === '1') {
          this.$message({
            message: '上架成功',
            type: 'success'
          })
        }
        if (data.code === '500' && status === '2') {
          this.$message({
            message: '下架成功',
            type: 'success'
          })
        }
      })
      row.status = status
    },
    // 新增按钮点击事件
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.is_edit = false
    },
    // 编辑按钮点击事件
    handleUpdate(row) {
      this.is_edit = true
      this.uid = row.uid
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    // 删除按钮点击事件
    handleDelete(row, index) {
      this.$confirm('确定删除此篇博文？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBlog(row).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        })
      })
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
    // 重置表单
    resetForm() {
      this.listQuery.title = undefined
      this.listQuery.type = undefined
      this.listQuery.signList = undefined
      this.listQuery.page = 1
      this.listQuery.limit = 20
      this.handleFilter()
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
