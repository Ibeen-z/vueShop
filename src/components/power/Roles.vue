<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="addRolesDialogVisible = true"
        >添加用户</el-button
      >
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand" width="50px">
          <template slot-scope="scoped">
            <!-- 一级权限 -->
            <el-row
              v-for="(item1, i1) in scoped.row.children"
              :key="item1.id"
              :class="[
                'rowmargin',
                'ycenter',
                'bdbottom',
                i1 === 0 ? 'bdtop' : '',
              ]"
            >
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scoped.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'ycenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scoped.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scoped.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50px"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialogVisible(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="40%"
      @close="addRolesFromClose"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色信息对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editRolesDialogVisible"
      width="40%"
      @close="editRolesDialogClose"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" 
    :visible.sync="setDialogVisible" 
    width="40%" 
    @close="cleanDefalutkeys"
    >
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        :default-checked-keys="defaultkeys"
        :props="treeProps"
        default-expand-all
        ref = "treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary"
          @click="allotRights"
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
      rolesList: [],
      addRolesDialogVisible: false,
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      addRolesFormRules: {
        roleName: [
          { required: true, message: "此项为必填项", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "此项为必填项", trigger: "blur" },
        ],
      },
      editRolesDialogVisible: false,
      editRolesForm: {},
      editRolesFormRules: {
        roleName: [
          { required: true, message: "此项为必填项", trigger: "blur" },
        ],
        roleDesc: [{ required: false, trigger: "blur" }],
      },
      setDialogVisible: false,
      rightsList: {},
      //树形控件属性绑定对象
      treeProps: {
        children: "children",
        label: "authName",
      },
      //默认选中的节点id值
      defaultkeys: [],
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败!");
      this.rolesList = res.data;
    },
    addRoles() {
      //添加用户的请求
      this.$refs.addRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        if (res.meta.status != 201) return this.$message.error("添加失败");
        this.$message.success("添加用户成功!");
        this.addRolesDialogVisible = false;
        this.getRolesList();
      });
    },
    //添加角色提示框关闭的表单重置事件
    addRolesFromClose() {
      this.$refs.addRolesFormRef.resetFields();
    },
    editRolesDialogClose() {
      this.$refs.editRolesFormRef.resetFields();
    },
    async showEditDialogVisible(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status != 200)
        return this.$message.error("获取角色信息失败!");
      this.editRolesForm = res.data;
      this.editRolesDialogVisible = true;
    },
    // 修改角色信息
    editRolesInfo() {
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );
        if (res.meta.status != 200)
          return this.$message.error("更新用户信息失败!");
        this.editRolesDialogVisible = false;
        this.getRolesList();
        this.$message.success("更新用户信息成功!");
      });
    },
    // 删除角色
    deleteRoles(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("roles/" + id);
          if (res.meta.status != 200) return this.$message.error("删除失败!");
          this.$message({
            type: "success",
            message: "删除成功!",
          });

          this.getRolesList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //删除角色权限
    removeRightById(role, rightId) {
      this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          );
          if (res.meta.status != 200) return this.$message.error("删除失败!");
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          role.children = res.data;
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 分配角色权限提示框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200)
        return this.$message.error("获取权限列表失败!");
      this.rightsList = res.data;
      this.getLeafList(role, this.defaultkeys);
      this.setDialogVisible = true;
    },
    getLeafList(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeafList(item, arr));
    },
    // 清空defaultkeys数组
    cleanDefalutkeys(){
      this.defaultkeys = []
    },
    // 分配权限
    async allotRights(){
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ]
      const idStr = arr.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.getRolesList()
      this.setDialogVisible = false
      this.$message.success('分配权限成功')

    }
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

.el-table {
  margin-top: 15px;
}

.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.ycenter {
  display: flex;
  align-items: center;
}
.rowmargin {
  margin: 0 30px;
}
</style>