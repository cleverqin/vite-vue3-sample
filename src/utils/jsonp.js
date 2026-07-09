/**
 * JSONP封装函数
 * @param {string} url - 请求的URL
 * @param {string} callbackName - 回调函数名称
 * @param {Function} successCallback - 成功回调函数
 * @param {Function} errorCallback - 失败回调函数
 */
export function jsonp(url, params = {}) {
  return new Promise((resolve, reject) => {
    // 创建一个全局的回调函数
    const cbName = 'cb' + Math.random().toString(16).split('.')[1].substring(0, 16)
    // 判断查询字符串最后一位是否为 ? 或者是 &
    let queryString = url.includes('?') ? '&' : '?'
    // 遍历传进来的 data 实参赋值给查询字符串
    for (const k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) {
        queryString += `${k}=${encodeURIComponent(params[k])}&`
      }
    }
    // 查询字符串加上回调函数
    queryString += `callback=${cbName}`
    window[cbName] = function (data) {
      // 删除全局的回调函数
      delete window[cbName]
      // 移除动态创建的<script>标签
      document.body.removeChild(script)
      // 调用成功回调函数
      resolve(data)
    }
    // 创建一个<script>标签
    const script = document.createElement('script')
    script.src = url + queryString
    // 将<script>标签添加到DOM中
    document.body.appendChild(script)
    // 监听<script>标签的加载错误事件
    script.onerror = function (e) {
      // 移除动态创建的<script>标签
      document.body.removeChild(script)
      // 调用失败回调函数
      reject(e)
    }
  })
}
