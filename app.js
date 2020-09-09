const handleBlogRouter = require('./src/blog')
const handleUserRouter = require('./src/user')
let SESSION_DATA = {}
const getCookieExpires=()=>{
    const d = new Date()
    d.setTime(d.getTime()+(24*60*60*1000*7))
    return d.toGMTString()
}

const queryString = require('querystring')
const getPostData = (req) =>{
    const promise = new Promise((resolve,reject)=>{
        if(req.method!=="POST"){
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }

        let postData = ''
        req.on('data',chunk=>{
            postData+=chunk.toString()
        })
        req.on('end',()=>{
            if(!postData){
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}
const serverHandle = (req,res)=>{
res.setHeader('content-type','application/json')

const url = req.url
req.path = url.split('?')[0]
req.query = queryString.parse(url.split('?')[1])
// cookie解析
    req.cookie = {}

const cookieStr = req.headers.cookie||''

cookieStr.split(';').forEach(item=>{
    if(!cookieStr){
        return
    }

    const arr = item.split('=')
    
    const key = arr[0].trim()
    const val = arr[1].trim()
    req.cookie[key] = val
})
// 解析session
let needSessionCookie = false
let userId = req.cookie.userId
if(userId){
    if(!SESSION_DATA[userId]){
        SESSION_DATA[userId] = {}
    }
    req.session = SESSION_DATA[userId]
}else{
    needSessionCookie = true
    userId = `${Date.now()}_${Math.random()}`
    SESSION_DATA[userId] = {}
}

    req.session = SESSION_DATA[userId]
getPostData(req).then(postData => {
    req.body = postData
    // 博客接口处理
const blogResult = handleBlogRouter(req,res) 
if(blogResult){
    blogResult.then(blogData=>{
        if(needSessionCookie){
            res.setHeader('Set-Cookie',`userId=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }
        res.end(
            JSON.stringify(blogData)
        )
    })
    return
}
// 登录接口处理
const userResult = handleUserRouter(req,res) 
if(userResult){
    userResult.then(userData=>{
        res.setHeader('Set-Cookie',`userId=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        res.end(
            JSON.stringify(userData)
        )
    })
    return
}


const userData = handleUserRouter(req,res) 
if(userData){
    res.end(
        JSON.stringify(userData)
    )
    return
}
res.writeHeader(404,{'content-type':'text/plain'})
res.write('404 not fount/n')
res.end()
})

}

module.exports = serverHandle

