import { Token, ContainerInstance } from 'typedi'
import { IncomingMessage, ServerResponse } from 'http'

export interface Request extends IncomingMessage {
  body?: any
}

export interface Response extends ServerResponse {
  body?: any
}

export interface Context {
  req: Request
  res: Response
  [propName: string]: any
}

export interface ContainerFactory {
  get(ip: string): ContainerInstance | undefined
  bind(ip: string, profile: string)
}

export const ContainerFactoryService = new Token<ContainerFactory>('ContainerFactory')

