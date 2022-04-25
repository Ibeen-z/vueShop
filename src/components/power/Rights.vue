<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="序号" width="50px">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
            <template slot-scope="scoped">
                 <el-tag v-if="scoped.row.level === '0'">一级</el-tag>
                <el-tag type="success" v-else-if="scoped.row.level === '1'">二级</el-tag>
                <el-tag type="warning" v-else>三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: [],
    };
  },
  created() {
    this.getrightsList();
  },
  methods: {
    async getrightsList() {
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status !== 200)
        return this.$message.error("获取权限列表失败!");
      // this.$message.success('获取权限列表成功')
      this.rightsList = res.data;
      console.log(res);
    },
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  font-size: 12px;
}
.el-card {
  margin-top: 15px;
}
</style>