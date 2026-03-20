/*
axios封装的设计遵循几个核心原则：

🎯 渐进式增强 - 可以像原生 Axios 一样简单使用，也可以启用高级功能
🔒 类型安全 - 完整的 TypeScript 支持，编译时发现问题
🧩 灵活扩展 - 支持多实例、自定义拦截器、业务定制
⚡ 性能优先 - 自动去重、智能重试、内存管理
📖 文档友好 - 丰富的示例和注释，上手即用

我们都知道 Axios 是 JavaScript 世界里最受欢迎的 HTTP 客户端，但在实际项目中，我们总是需要：

🔄 统一的错误处理 - 不想在每个请求里写重复的 try-catch
🚫 请求取消机制 - 用户快速切换页面时取消无用请求
🔁 自动重试功能 - 网络不稳定时自动重试
🎨 TypeScript 完美支持 - 类型安全，IDE 智能提示
🏗️ 多实例管理 - 不同 API 服务需要不同配置

*/

import { webSocketService } from '@/socket/socket'
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method,
  type AxiosError,
} from 'axios'
import { stringify } from 'qs'

// 基础变量配置
const defaultConfig = {
  baseURL: 'http://localhost:3001',
  apiPrefix: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json,charset=UTF-8',
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
}

// 响应数据基础结构
export interface BaseResponse {
  code: number
  message?: string
}
// 去除与BaseResponse冲突的字段
type OmitBaseResponse<T> = Omit<T, keyof BaseResponse>
// 响应数据类型定义 - 避免属性冲突，确保BaseResponse的属性不被覆盖
export type ResponseData<T = any> = BaseResponse & OmitBaseResponse<T>

// 响应数据验证函数类型
export type ResponseValidator<T = any> = (response: ResponseData<T>) => boolean

// 重试配置
export interface RetryConfig {
  retries?: number // 最大重试次数，默认3次
  delay?: number // 重试延迟时间，默认1000ms
  condition?: (error: AxiosError) => boolean // 重试条件，默认仅当code非200时重试
}

// 默认重试配置
const defaultRetryConfig: RetryConfig = {
  retries: 3,
  delay: 1000,
  condition: (error) => error.response?.status !== 200,
}

// 拦截器配置类型
interface InterceptorConfig {
  requestInterceptor?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> // 请求拦截器，默认不做处理

  requestErrorInterceptor?: (error: AxiosError) => AxiosError | Promise<AxiosError> // 请求错误拦截器，默认不做处理
  responseInterceptor?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse> // 响应拦截器，默认不做处理
  responseErrorInterceptor?: (error: AxiosError) => AxiosError | Promise<AxiosError> // 响应错误拦截器，默认不做处理
}

// 请求唯一键
type RequestKey = string | symbol

const baseURL = 'http://localhost:3001'
const apiPrefix = ''
const timeout = 10000

const axiosInstance = axios.create({
  timeout,
  baseURL: baseURL + apiPrefix,
})

// axiosInstance.interceptors.request.use(
//   (config) => {
//     config.headers['Authorization'] = `Bearer ${webSocketService.getToken()}`
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

export default axiosInstance
