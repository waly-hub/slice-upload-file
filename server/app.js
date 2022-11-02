const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')


const app = express()

// 注册中间件
app.use(express.json())
app.use(express.urlencoded({ urlencoded: true }))
app.use(cors())
app.use(fileUpload())

const PORT = 3000

app.post('/api/upload', (req, res) => {
  res.status(200).json({ msg: '开搞！！' })
})

app.listen(PORT, () => {
  console.log('server is listening at http://localhost:3000')
})