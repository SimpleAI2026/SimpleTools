export interface HttpStatus {
  code: number
  en: string
  zh: string
}

/** Status codes from RFC 9110 and common extensions; descriptions written for this project. */
export const STATUSES: HttpStatus[] = [
  [100, 'Continue', '继续，客户端应继续发送请求体'], [101, 'Switching Protocols', '切换协议（如升级到 WebSocket）'], [102, 'Processing', '处理中（WebDAV）'], [103, 'Early Hints', '提前提示，可预加载资源'],
  [200, 'OK', '请求成功'], [201, 'Created', '已创建新资源'], [202, 'Accepted', '已接受，将异步处理'], [203, 'Non-Authoritative Information', '非权威信息（经代理修改）'], [204, 'No Content', '成功但无响应体'], [205, 'Reset Content', '成功，客户端应重置视图'], [206, 'Partial Content', '部分内容（范围请求）'], [207, 'Multi-Status', '多状态（WebDAV）'],
  [300, 'Multiple Choices', '多种选择'], [301, 'Moved Permanently', '永久重定向'], [302, 'Found', '临时重定向'], [303, 'See Other', '参见其他资源（用 GET 获取）'], [304, 'Not Modified', '未修改，可使用缓存'], [307, 'Temporary Redirect', '临时重定向（保持方法）'], [308, 'Permanent Redirect', '永久重定向（保持方法）'],
  [400, 'Bad Request', '请求格式错误'], [401, 'Unauthorized', '未认证'], [402, 'Payment Required', '需要付款（保留）'], [403, 'Forbidden', '已认证但无权限'], [404, 'Not Found', '资源不存在'], [405, 'Method Not Allowed', '不允许该请求方法'], [406, 'Not Acceptable', '无法满足 Accept 要求'], [407, 'Proxy Authentication Required', '需要代理认证'], [408, 'Request Timeout', '请求超时'], [409, 'Conflict', '与资源当前状态冲突'], [410, 'Gone', '资源已永久删除'], [411, 'Length Required', '需要 Content-Length'], [412, 'Precondition Failed', '前置条件失败'], [413, 'Content Too Large', '请求体过大'], [414, 'URI Too Long', 'URI 过长'], [415, 'Unsupported Media Type', '不支持的媒体类型'], [416, 'Range Not Satisfiable', '范围无法满足'], [417, 'Expectation Failed', 'Expect 头无法满足'], [418, "I'm a teapot", '我是茶壶（RFC 2324 彩蛋）'], [421, 'Misdirected Request', '请求被发送到错误的服务器'], [422, 'Unprocessable Content', '语义错误，无法处理'], [423, 'Locked', '资源被锁定（WebDAV）'], [425, 'Too Early', '请求过早（重放风险）'], [426, 'Upgrade Required', '需要升级协议'], [428, 'Precondition Required', '需要前置条件'], [429, 'Too Many Requests', '请求过多（限流）'], [431, 'Request Header Fields Too Large', '请求头过大'], [451, 'Unavailable For Legal Reasons', '因法律原因不可用'],
  [500, 'Internal Server Error', '服务器内部错误'], [501, 'Not Implemented', '服务器不支持该功能'], [502, 'Bad Gateway', '网关收到无效响应'], [503, 'Service Unavailable', '服务暂不可用'], [504, 'Gateway Timeout', '网关超时'], [505, 'HTTP Version Not Supported', '不支持的 HTTP 版本'], [507, 'Insufficient Storage', '存储空间不足（WebDAV）'], [508, 'Loop Detected', '检测到循环（WebDAV）'], [511, 'Network Authentication Required', '需要网络认证（如强制门户）'],
].map(([code, en, zh]) => ({ code: code as number, en: en as string, zh: zh as string }))

export function statusClass(code: number): '1xx' | '2xx' | '3xx' | '4xx' | '5xx' {
  return `${Math.floor(code / 100)}xx` as '1xx'
}

export function searchStatuses(q: string, list: HttpStatus[] = STATUSES): HttpStatus[] {
  const s = q.trim().toLowerCase()
  if (!s) return list
  if (/^[1-5]xx$/.test(s)) return list.filter((x) => statusClass(x.code) === s)
  return list.filter((x) => String(x.code).startsWith(s) || x.en.toLowerCase().includes(s) || x.zh.includes(s))
}
