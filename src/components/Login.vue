<template>
  <div class="login_container">
     <div class="login_box">
         <div class="avatar_box">
             <img src="../assets/logo.png" alt="">
         </div>
         <el-form ref="loginFormRef" :rules="loginRules" :model="loginForm" class="login_form" label-width="0px">
            <el-form-item prop="username">
                <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
            </el-form-item>
            <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>
     </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            loginForm:{
                username:'admin',
                password:'123456'
            },
            loginRules:{ //表单验证
                username:[{ required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }],
                password:[{ required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }]
            }
        }
    },
    methods:{
        resetForm(){
            this.$refs.loginFormRef.resetFields()
        },
        login(){
            this.$refs.loginFormRef.validate(async(valid)=>{
                if(valid){
                    const {data:res} = await this.$http.post('login',this.loginForm)
                    if(res.meta.status == 200){
                      this.$message({
                        message: '登录成功',
                        type: 'success'
                        });
                        window.sessionStorage.setItem('token',res.data.token)
                        this.$router.push("/home")
                    }else{
                     this.$message.error('登录失败!') 
                    }
                }else{
                    return 
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .avatar_box{
        padding: 10px;
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>
