<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table class="tree-table" :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格（元）"
          prop="goods_price"
          width="150px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="95px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="200px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteGoods(scope.row.goods_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <el-dialog title="编辑" :visible.sync="editialogVisible" width="40%">
      <el-form ref="editRef" :model="editList" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="editList.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="editList.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="editList.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量">
          <el-input v-model="editList.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品介绍">
          <el-input v-model="editList.goods_introduce"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //请求列表
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //   商品列表
      goodsList: [],
      //   总页数
      total: 0,
      editialogVisible: false,
      editList: [],
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //请求数据列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) return this.$message.error("请求数据失败!");
      console.log(res.data);
      this.total = res.data.total;
      this.goodsList = res.data.goods;
    },
    //每页显示多少条数据的监听
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //监听页数的改变
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum;
      this.getGoodsList();
    },
    // 删除商品
    async deleteGoods(id) {
      console.log("object");
      const confirmResult = await this.$confirm(
        "该操作会永久删除该商品，是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") return this.$message.info("取消删除！");

      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除失败!");
      console.log(res);

      this.getGoodsList();
      this.$message.success("删除成功!");
    },
    addGoods() {
      this.$router.push("/goods/add");
    },
    async showEditDialog(row) {
      const { data: res } = await this.$http.get(`goods/${row.goods_id}`);
      if (res.meta.status !== 200) return this.$message.error("请求数据失败!");
      this.editList = res.data;
      this.editialogVisible = true;
    },
    async editGoods() {
      const queryGoodsList = {
        id: this.editList.goods_id,
        goods_name: this.editList.goods_name,
        goods_price: this.editList.goods_price,
        goods_number: this.editList.goods_number,
        goods_weight: this.editList.goods_weight,
        goods_introduce: this.editList.goods_introduce,
        goods_cat: "1,2,3",
        pics: this.editList.pics,
        attrs: this.editList.attrs,
      };
      const { data: res } = await this.$http.put(
        `goods/${queryGoodsList.id}`,
        queryGoodsList
      );
      if (res.meta.status !== 200) return this.$message.error("修改失败!");
      this.$message.success("修改成功!");
      this.getGoodsList();
      this.editialogVisible = false;
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
.el-row {
  margin-top: 15px;
}
.tree-table {
  margin-top: 15px;
  border-radius: 4px;
}
</style>