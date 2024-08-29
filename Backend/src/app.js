import express from "express"
import cors from"cors"
import cookieParser from "cookie-parser"

const app= express()
app.use(cors({
    origin:['http://localhost:5173','http://127.0.0.1:3000','https://quiz-for-children.onrender.com'],
    credentials:true
}))
app.use(express.json({
    limit:"1000kb"
}))
app.use(express.urlencoded({
    extended:true,limit:"1000kb"
}))
app.use(express.static("public"))

//This is for accesstoken and  refresh token to stay in req
app.use(cookieParser())
//For routing to the user routes
import userRouter from "./routes/user.routes.js"
import quesRouter from "./routes/ques.routes.js"
app.use("/api/v1/users",userRouter)//For user
app.use("/api/v1/question",quesRouter)
export default app