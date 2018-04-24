import { Token, ContainerInstance } from 'typedi'

export interface ContainerFactory {
  get(ip: string): ContainerInstance | undefined
  bind(ip: string, profile: string)
}

export const ContainerFactoryService = new Token<ContainerFactory>()
