export default function downloadImage(imageUrl, imageName, afterHandle = () => {}) {
  // 使用 fetch API 发起 GET 请求
  fetch(imageUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.blob() // 将响应体转换为 Blob
    })
    .then((blob) => {
      // 使用 URL.createObjectURL 创建一个指向 blob 的 URL
      const url = URL.createObjectURL(blob)
      // 创建一个 a 标签并设置 href 属性为 blob URL
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      // 设置下载的文件名
      a.download = imageName
      document.body.appendChild(a)
      a.click() // 触发下载
      document.body.removeChild(a)
      // 在完成下载后释放这个对象 URL
      window.URL.revokeObjectURL(url)

      afterHandle()
    })
    .catch((e) => {
      console.error('Image download failed:', e)
    })
}
