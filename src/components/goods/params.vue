<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意:只能为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品的级联选择框 -->
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="paramsDialogVisible = true"
            >添加参数</el-button
          >
          <el-table :data="manyTableList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="paramsDialogVisible = true"
            >添加属性</el-button
          >
          <el-table :data="onlyTableList" border stripe>
            <!-- 展开行 -->
           <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + paramsDialogTitle"
      :visible.sync="paramsDialogVisible"
      width="40%"
      @close="addFormClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="90px"
      >
        <el-form-item :label="paramsDialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParam">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="'修改' + paramsDialogTitle"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogVisbleClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="90px"
      >
        <el-form-item :label="paramsDialogTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      //级联选择框双向绑定的数据（选中的信息）
      selectKeys: [],
      // 级联选择框props的指定配置项
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
        expandTrigger: "hover",
      },
      // 页签默认选中参数
      activeName: "many",
      //动态参数的数据
      manyTableList: [],
      //静态属性的数据
      onlyTableList: [],
      paramsDialogVisible: false,
      // 添加表单
      addForm: {
        attr_name: "",
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "此项为必填项", trigger: "blur" },
        ],
      },
      // 控制修改对话框的显示隐藏
      editDialogVisible: false,
      // 修改表单
      editForm: {},
      //修改表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) return this.$message.error("请求失败!");
      this.cateList = res.data;
    },
    handleChange() {
      this.getParamsList();
    },
    //tab页签点击激活函数
    handleClick() {
      this.getParamsList();
    },
    //获取参数列表数据
    async getParamsList() {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = [];
        this.manyTableList = [];
        this.onlyTableList = [];
        return;
      }

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败!");
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false; //控制按钮和输入框的切换
        item.inputValue = ""; //绑定输入框的值
      });
      console.log(res.data);
      if (this.activeName === "many") {
        this.manyTableList = res.data;
      } else {
        this.onlyTableList = res.data;
      }
    },
    // 添加表单
    addParam() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (res.meta.status !== 201)
          return this.$message.error("添加参数失败!");
        this.paramsDialogVisible = false;
        this.getParamsList();
        this.$message.success("添加参数成功!");
      });
    },
    // 监听添加对话框的关闭事件
    addFormClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 修改框的展示隐藏
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          param: { attr_sel: this.activeName },
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数信息失败!");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 修改表单
    editParam() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (res.meta.status !== 200)
          return this.$message.error("修改参数失败!");

        this.getParamsList();
        this.editDialogVisible = false;
        this.$message.success("修改参数成功!");
      });
    },
    // 修改对话框关闭的表单重置函数
    editDialogVisbleClose() {
      this.$refs.editFormRef.resetFields();
    },
    //删除参数
    deleteParams(attr_id) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attr_id}`
          );
          if (res.meta.status != 200) return this.$message.error("删除失败!");
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.getParamsList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //输入框失去焦点或按下enter的处理函数
    async handleInputConfirm(row) {
      row.inputVisible = false;
      //判断输入的值是否为空，为空则return
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      //不为的后续操：添加
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //发起请求保存操作
      this.saveAttrVals(row);
    },
    //输入框的显示
    showInput(row) {
      row.inputVisible = true;
      //文本框自动获取焦点
      //$nextTick：当页面上的元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //tag标签的删除
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
    //对attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("添加参数项失败!");
      this.$message.success("添加参数项成功!");
    },
  },
  computed: {
    // 判断是否选中三级分类，决定添加按钮是否禁用
    isBtnDisable() {
      if (this.selectKeys.length !== 3) {
        return true;
      } else {
        return false;
      }
    },
    cateId() {
      if (this.selectKeys.length == 3) {
        return this.selectKeys[2];
      }
      return null;
    },
    paramsDialogTitle() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
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
  margin: 15px 0;
}
.el-cascader {
  margin-left: 5px;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin-left: 10px;
}
.input-new-tag {
  margin-left: 10px;
  width: 90px;
}
.button-new-tag {
  margin-left: 10px;
}
</style>