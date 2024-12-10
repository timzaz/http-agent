import request, { Request, Response, ResponseError } from 'superagent'

import {
  JsonErrorResponse,
  JsonResponse,
  onProgress,
  Post,
  Read,
  Remove,
  Transformer,
  Update,
} from './interfaces'
import { getTransformers } from './utils'

/**
 * Creates a new resource
 * @param {string} endpoint The relatvie endpoint for the request
 * @param {Record<string, any>} params The registration data
 * @param {Transformer} transformers Request mutating functions
 * @param {onProgress} onProgress Function to react to request progress
 * @param {File} file The file object
 * @param {string} fileField The name of the file attribute
 */
export const post: Post = (
  endpoint: string,
  params?: Record<string, any>,
  transformers?: Transformer[],
  onProgress?: onProgress,
  file?: any,
  fileField = 'file',
) => {
  let req: Request = request.post(endpoint)
  const json = 'application/json'

  req = params ? req.send(params) : req

  req = file
    ? req.set('Accept', '*/*') // `superagent` will set the content type
    : req.set('Accept', json).set('Content-Type', json)

  req = file ? req.attach(fileField, file) : req

  req = onProgress ? req.on('progress', onProgress) : req

  if (transformers) {
    for (const transformer of transformers) {
      req = transformer(req)
    }
  }

  return fetch(req)
}

/**
 * Gets the resources that match the query
 * @param {string} endpoint The relatvie endpoint for the request
 * @param {Transformer} transformers Request mutating functions
 * @param {onProgress} onProgress Function to react to request progress
 */
export const read: Read = (
  endpoint: string,
  transformers?: Transformer[],
  onProgress?: onProgress,
) => {
  let req: Request = request
    .get(endpoint)
    .set('Accept', 'application/json')
    // In case we wanna pull files or other non-json types
    .set('Accept', '*/*')

  req = onProgress ? req.on('progress', onProgress) : req

  if (transformers) {
    for (const transformer of transformers) {
      req = transformer(req)
    }
  }

  return fetch(req)
}

/**
 * Deletes a resource
 * @param {string} endpoint The relatvie endpoint for the request
 * @param {Transformer} transformers Request mutating functions
 */
export const remove: Remove = (
  endpoint: string,
  transformers?: Transformer[],
) => {
  let req: Request = request.del(endpoint).set('Accept', 'application/json')

  if (transformers) {
    for (const transformer of transformers) {
      req = transformer(req)
    }
  }

  return fetch(req)
}

/**
 * Updates a resource's data
 * @param {string} endpoint The relatvie endpoint for the request
 * @param {Record<string, any>} params Values to be updated
 * @param {Transformer} transformers Request mutating functions
 * @param {onProgress} onProgress Function to react to request progress
 */
export const update: Update = (
  endpoint: string,
  params: Record<string, any>,
  transformers?: Transformer[],
  onProgress?: onProgress,
) => {
  let req: Request = request.patch(endpoint)
  const json = 'application/json'

  req = params ? req.send(params) : req
  req = req.set('Accept', json).set('Content-Type', json)
  req = onProgress ? req.on('progress', onProgress) : req

  if (transformers) {
    for (const transformer of transformers) {
      req = transformer(req)
    }
  }

  return fetch(req)
}

/**
 * Wrap all requests with global transformers and resolve responses
 * consistently
 * @param {object} request The request object
 */
async function fetch(
  request: Request,
): Promise<{ data: JsonResponse | null; error: JsonErrorResponse | null }> {
  let body: any
  let err: ResponseError | JsonErrorResponse
  let response: Response

  // request = request.withCredentials()
  // request = request.on('error', error => response = error)
  const transformers = getTransformers()
  transformers.forEach(transformer => (request = transformer(request)))

  if (typeof document !== 'undefined' && process.env.NODE_ENV === 'development') {
    const token: string | null = localStorage.getItem(
      window.ENV.API_TOKEN_NAME,
    )
    if (token) request = request.auth(token, { type: 'bearer' })
  }

  try {
    response = await request

    // Take a look at remote base and the request url to determine whether,
    // this could be a hardcore resource
    // Scope the body
    if (!response.body && !response.text) {
      body = response.text
    } else {
      // If `data` is in the body, we might likely be dealing with a
      // characterised jsonapi response
      // We return the body as is in the absence of the data attribute which
      // is an indicator of a characterised jsonapi response
      body = response.body
    }
  } catch (error: any) {
    err = error?.response?.body || error
  }

  return new Promise(resolve => {
    resolve({ data: body, error: err as JsonErrorResponse })
  })
}
