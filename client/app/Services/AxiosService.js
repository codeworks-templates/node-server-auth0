import { baseURL } from '../env.js'

export const api = axios.create({
  baseURL: baseURL,
  timeout: 8000,
  withCredentials: true
})
