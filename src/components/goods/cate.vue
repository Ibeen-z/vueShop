<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col
          ><el-button type="primary" @click="showAddCateDialog">
            添加分类
          </el-button></el-col
        >
      </el-row>
      <!-- Treetable表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="序号"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-error"
            style="color: red"
            v-if="scope.row.cat_deleted"
          ></i>
          <i class="el-icon-success" style="color: green" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            type="success"
            >二级</el-tag
          >
          <el-tag
            size="mini"
            v-else-if="scope.row.cat_level === 2"
            type="warning"
            >三级</el-tag
          >
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialogVisble(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
             @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addCateFormClose"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="90px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->

    <el-dialog title="修改分类" :visible.sync="editDialogVisble" width="40%">
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateFormRef"
        label-width="90px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="editCate"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //请求参数
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品列表数组
      cateList: [],
      //商品总条数
      total: 0,
      //tree-table列定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      //控制对话框的显示
      addCateDialogVisible: false,
      //添加分类表单对象
      addCateForm: {
        //分类名称
        cat_name: "",
        //父级分类id，默认为0
        cat_pid: 0,
        //分类等级（0为一级，1为二级，2为三级）
        cat_level: 0,
      },
      //校验规则
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //父级分类列表
      parentCateList: [],
      selectKeys: [],
      // props的指定配置项
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
        expandTrigger: "hover",
      },
      // 修改对话框的显示与隐藏
      editDialogVisble: false,
      editCateForm: {
          cat_name:''
      },
      editCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryinfo,
      });
      if (res.meta.status !== 200) return this.$message.error("请求失败!");
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryinfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pageNum的改变
    handleCurrentChange(newNum) {
      //获取父级分类列表
      this.queryinfo.pagenum = newNum;
      this.getCateList();
    },
    // 添加分类
    showAddCateDialog() {
      this.addCateDialogVisible = true;
      this.getParentCate();
    },
    //获取父级分类的id列表
    async getParentCate() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) return this.$message.error("请求失败!");
      this.parentCateList = res.data;
    },
    //监听选择项的变化
    parentCateChange() {
      if (this.selectKeys.length > 0) {
        //   父级分类的id
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        //   分类等级赋值
        this.addCateForm.cat_level = this.selectKeys.length;
        return;
      } else {
        //   重置父级分类id和等级
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error("请求失败!");
        this.$message.success("添加成功!");

        this.addCateDialogVisible = false;

        this.getCateList();
      });
    },
    // 表单重置
    addCateFormClose() {
      this.$refs.addCateRef.resetFields();
      this.selectKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 监听修改对话框以及请求数据
    async showEditDialogVisble(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status != 200)
        return this.$message.error("获取用户信息失败!");
      this.editCateForm = res.data;
      this.editDialogVisble = true;
    },
    editCate(){
        this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        );
        if (res.meta.status != 200)
          return this.$message.error("更新用户信息失败!");
        this.editDialogVisble = false;
        this.getCateList();
        this.$message.success("更新用户信息成功!");
      });
    },
    deleteCate(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("categories/" + id);
          if (res.meta.status != 200) return this.$message.error("删除失败!");
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.getCateList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
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
.tree-table {
  margin-top: 15px;
  border-radius: 4px;
}
.el-pagination {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>