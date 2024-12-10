import { ProgressEvent, Request } from 'superagent'

export interface JSONError {
  detail: string
  status: number
  title: string
}

export interface JsonErrorResponse {
  errors: Array<JSONError>
}

export interface JsonResponse {
  data: Record<string, any>[] | null
  meta?: { count?: number; page?: number; pageSize?: number } & Record<
    string,
    any
  >
}

export type onProgress = (event: ProgressEvent) => void

export type Post = (
  endpoint: string,
  params?: Record<string, any>,
  transformers?: Transformer[],
  onProgress?: onProgress,
  file?: any,
  fileField?: string,
) => Promise<{ data: JsonResponse | null; error: JsonErrorResponse | null }>

export type Read = (
  endpoint: string,
  transformers?: Transformer[],
  onProgress?: onProgress,
) => Promise<{ data: JsonResponse | null; error: JsonErrorResponse | null }>

export type Remove = (
  endpoint: string,
  transformers?: Transformer[],
) => Promise<{ data: JsonResponse | null; error: JsonErrorResponse | null }>

export type Transformer = (request: Request) => Request

export type Update = (
  endpoint: string,
  params: Record<string, any>,
  transformers?: Transformer[],
  onProgress?: onProgress,
) => Promise<{ data: JsonResponse | null; error: JsonErrorResponse | null }>
