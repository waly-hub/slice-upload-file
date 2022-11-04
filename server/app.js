const express = require('express')
const cors = require('cors')
const STS = require('qcloud-cos-sts')

const app = express()

// 注册中间件
app.use(express.json())
app.use(express.urlencoded({ urlencoded: true }))
app.use(cors())

const PORT = 8888

// 配置参数
var config = {
  secretId: '你的secretId',
  secretKey: '你的secretKey',
  // proxy: process.env.Proxy,
  durationSeconds: 1800,
  bucket: '你的bucket',
  region: '你的region',
  // 允许操作（上传）的对象前缀，可以根据自己网站的用户登录态判断允许上传的目录，例子： user1/* 或者 * 或者a.jpg
  // 请注意当使用 * 时，可能存在安全风险，详情请参阅：https://cloud.tencent.com/document/product/436/40265
  allowPrefix: '_ALLOW_DIR_/*',
  // 密钥的权限列表
  allowActions: [
    // 所有 action 请看文档 https://cloud.tencent.com/document/product/436/31923
    // 简单上传
    'name/cos:PutObject',
    'name/cos:PostObject',
    // 分片上传
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload'
  ],
}

// 格式一：临时密钥接口
app.all('/sts', function (req, res, next) {
  // 获取临时密钥
  var shortBucketName = config.bucket.substr(0, config.bucket.lastIndexOf('-'))
  var appId = config.bucket.substr(1 + config.bucket.lastIndexOf('-'))
  var policy = {
    'version': '2.0',
    // 密钥能够使用的权限
    'statement': [{
      'action': [
        // 简单上传
        'name/cos:PutObject',
        'name/cos:PostObject',
        // 分片上传
        'name/cos:InitiateMultipartUpload',
        'name/cos:ListMultipartUploads',
        'name/cos:ListParts',
        'name/cos:UploadPart',
        'name/cos:CompleteMultipartUpload',
      ],
      'effect': 'allow',
      'principal': { 'qcs': ['*'] },
      // 可以操作的桶文件路径
      'resource': [
        'qcs::cos:' + config.region + ':uid/' + appId + ':prefix//' + appId + '/' + shortBucketName + '/' + '*',
      ],
    },
    ],
  }
  var startTime = Math.round(Date.now() / 1000)
  STS.getCredential({
    secretId: config.secretId,
    secretKey: config.secretKey,
    region: config.region,
    durationSeconds: config.durationSeconds,
    policy: policy,
  }, function (err, tempKeys) {
    if (tempKeys) tempKeys.startTime = startTime
    res.send(err || tempKeys)
  })
})

app.post('/sts', (req, res) => {
  res.status(200).json({ msg: '开搞！！' })
})

app.listen(PORT, () => {
  console.log(`server is listening at http://localhost:${PORT}`)
})