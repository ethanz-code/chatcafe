export function isWeixinBrowser() {
  // 获取用户代理字符串
  var userAgent = navigator.userAgent.toLowerCase()
  // 检查是否包含 "MicroMessenger" 字符串
  if (userAgent.indexOf('micromessenger') !== -1) {
    return true // 在微信环境中
  } else {
    return false // 不在微信环境中
  }
}

export function isAppleDevice() {
  // 获取用户代理字符串
  var userAgent = navigator.userAgent.toLowerCase()
  // 检查是否包含 "iPhone" 字符串
  if (userAgent.indexOf('iphone') !== -1) {
    return true // 是苹果手机
  } else {
    return false // 不是苹果手机
  }
}
