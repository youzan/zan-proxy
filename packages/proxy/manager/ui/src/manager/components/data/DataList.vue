<template>
  <div>
    <div class="main-content__title">自定义数据文件列表</div>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="6" :offset="18" class="addhost-btn-wrap">
        <el-button size="small" @click='$dc.requestAddDataFile()'>新增数据文件</el-button>
      </el-col>
    </el-row>
    <el-table border align='center' :data="$dc.dataList">
      <el-table-column prop="name" label="名字" align="center" width="300" :sortable="true">
      </el-table-column>
      <el-table-column prop="contenttype" label="类型" align="center">
      </el-table-column>
      <el-table-column label="操作" :width="136" align="center" :context="_self">
        <template scope='scope'>
          <el-button type="info" icon='edit' size="mini"
                     @click='$dc.requestEditDataFile(scope.row)'>
          </el-button>
          <el-button type="danger" icon='delete' size="mini"
                     @click='$dc.deleteDataFile(scope.row, scope.$index )'>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  import _ from 'lodash'


  export default {
    name: 'datalist',
  }

</script>
<style>
  .addhost-btn-wrap {
    text-align: right;
  }
</style>
