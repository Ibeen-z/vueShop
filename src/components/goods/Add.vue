<template>
  <div>
    <!-- 面包屑视图 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示的文案 -->
      <el-alert
        title="添加商品"
        type="info"
        show-icon
        center
        :closable="false"
      ></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 侧边导航栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateprops"
                @change="handleChange"
                expand-trigger="hover"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item2"
                  v-for="(item2, i2) in item.attr_vals"
                  :key="i2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action:上传图片的url地址 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addbtn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewDialog" width="40%">
      <img :src="previewImg" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "loadsh";
export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      cateList: [],
      cateprops: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      //上传图片地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      //图片上传请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewImg: "",
      previewDialog: false,
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
    //级联选择器变化
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // tab侧边栏切换，离开之前的钩子函数
    beforeTabLeave(activeName, oldActiveName) {
      //activeName,oldActiveName: 即将进入的页面name 和 离开的页面name
      // console.log(activeName,oldActiveName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        console.log(this.oldActiveName, this.addForm.goods_cat.length);
        this.$message.error("请选择商品分类!");
        return false;
      }
    },
    // tab标签点击事件
    async tabClick() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        // const{data:res}
        if (res.meta.status !== 200)
          return this.$message.error("请求参数失败!");
        console.log(res);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        // const{data:res}
        if (res.meta.status !== 200)
          return this.$message.error("请求参数失败!");
        console.log(res);
        this.onlyTableData = res.data;
      }
    },
    //图片预览处理操作
    handlePreview(file) {
      this.previewDialog = true;
      this.previewImg = file.response.data.url;
    },
    //图片删除处理操作
    handleRemove(file) {
      //1.获取要删除的临时路径
      const filePath = file.response.data.tmp_path;
      //2.找到对应的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      //3.splice方法删除图片对应的pic
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm.pics);
    },
    //图片上传成功的处理函数
    handleSuccess(response) {
      const pictures = { pic: response.data.tmp_path };
      this.addForm.pics.push(pictures);
      console.log(this.addForm);
    },
    //添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error("请填写必填项！");
        //添加之前对goods_cat的操作
        const form = _.cloneDeep(this.addForm);
        this.addForm.goods_cat = form.goods_cat.join(",");
        //处理动态态参数和静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form);
        //发起请求
        const { data: res } = await this.$http.post('goods', this.addForm)
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error("添加失败!");
        this.$message.success("添加成功!");
        this.$router.push('/goods')
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  font-size: 12px;
  margin-bottom: 15px;
}
.el-step__title {
  font-size: 13px;
}
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-upload {
  width: 150px;
}
.previewImg {
  width: 100%;
}
.addbtn {
  // margin-top:15px;
  margin: 10px auto;
}
</style>