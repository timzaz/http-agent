import { Transformer } from './interfaces'

export function addTransformer(transformer: Transformer): void {
  if (transformer.name) {
    const exists = transformers.some(t => t.name === transformer.name)
    if (exists) return
  }
  transformers.push(transformer)
}

/**
 * Derives the final url given the base and the endpoint
 * @param path The api path to hit
 * @returns The formatted url
 */
export function deriveUrl(path: string): string {
  return ['/api', path].join('')
}

export function getTransformers(): Transformer[] {
  return transformers
}

declare global {
  interface Window {
    ENV: { [key: string]: string }
  }
}

const transformers: Transformer[] = []
