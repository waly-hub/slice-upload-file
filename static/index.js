const uploader = document.getElementById('uploader')

function read (file) {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = function () {
      resolve(reader.result)
    }
    reader.onerror = reject

    reader.readAsBinaryString(file)
  })
}

uploader.addEventListener('change', async (event) => {
  const { files } = event.target
  const [file] = files
  if (!file) {
    return
  }
  const content = await read(file)
  const formData = new FormData()
  const hash = CryptoJS.SHA1(content)
  formData.append('hash', hash)
  const { size, name, type } = file
  const chunkList = createChunks(file, formData.get('hash'))
})

// 分片
function createChunks (file, hash) {
  let uploaded = 0
  let index = 0
  const chunkSize = 1024 * 1024
  const chunkList = []
  while (uploaded < file.size) {
    chunkList.push({
      start: uploaded,
      chunk: file.slice(uploaded, uploaded + chunkSize),
      hash,
      index
    })
    uploaded += chunkSize
    index++
  }
  return chunkList
}