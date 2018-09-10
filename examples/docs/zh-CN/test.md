<script>
  module.exports = {
    data() {
      return {
        test: 123,
        tableData: [
          {
            date: '2016-05-02',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄'
          }, {
            date: '2016-05-04',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1517 弄'
          }, {
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }, {
            date: '2016-05-03',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1516 弄'
          }
        ]
      }
    }
  }
</script>

:::demo
```html
<template>
  <el-table :data="tableData" border height="200">
    <el-table-column prop="date" label="日期" width="180"></el-table-column>
    <el-table-column prop="name" label="姓名" fixed="right" width="180"></el-table-column>
    <el-table-column prop="address" min-width="200" label="地址" ></el-table-column>
  </el-table>
</template>
```
:::