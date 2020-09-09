const {getList,getDetail,newBlog,updateBlog,deleteBlog} = require('./controller/blog')
const {SuccessModel,ErrorModel} = require('./model/resModel')


const handleBlogRouter = (req,res) => {
    const method = req.method
    const id = req.query.id
    const loginCheck = (req) =>{
        if(req.session.username){
   
         }
            return Promise.resolve(
                new ErrorModel("尚未登录")
            )
    
    }
    if(method=="GET"&&req.path=='/api/blog/list'){
        const author = req.query.author
        const keyword = req.query.keyword
        const result = getList(author,keyword)
        return result.then(listData=>{
            return new SuccessModel(listData)
        })
        
    }
    if(method=="GET"&&req.path=='/api/blog/detail'){
            const result = getDetail(id)
            return result.then(detailData=>{
                return  new SuccessModel(detailData)
            })
            
    }
    if(method=="POST"&&req.path=='/api/blog/new'){
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            return loginCheckResult
        }
        req.body.author = req.session.username
        const result = newBlog(req.body)

        return result.then(data=>{

            return new SuccessModel(data)
        })
         
    }
    if(method=="POST"&&req.path=='/api/blog/update'){
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            return loginCheckResult
        }
        req.body.author = req.session.username
        const result = updateBlog(id,req.body)
        return result.then(data=>{
            if(data){
                return  new SuccessModel()
              }else{
                  return new ErrorModel('更新失败')
              }
        })

    }
    if(method=="POST"&&req.path=='/api/blog/delete'){
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            return loginCheckResult
        }
        req.body.author = req.session.username
        const result = deleteBlog(id,req.body.author )
        return result.then(data=>{
            if(data){
                return  new SuccessModel()
              }else{
                  return new ErrorModel('删除失败')
              }
        })

    }
}

module.exports = handleBlogRouter