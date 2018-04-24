import { ContainerInstance, Inject, Container, Service } from "typedi";
import LRU from 'lru-cache'
import path from 'path'
// import { ContainerFactory, ContainerFactoryService, KVStorage, RootStorageToken, KVStorageToken } from "../abstracts";
import { ScopedKVService } from 'lib-zan-proxy/lib/impl';
import { Storage, RootStorageToken, KVStorageToken, ContainerFactory, ContainerFactoryService } from 'lib-zan-proxy/lib/service'

@Service({
  id: ContainerFactoryService,
  global: true
})
export class MultiUserContainerFactory implements ContainerFactory {
  map: LRU.Cache<string, ContainerInstance> = LRU({
    max: 100
  })

  @Inject(RootStorageToken) rootKVService: Storage

  get(ip: string): ContainerInstance | undefined {
    return this.map.get(ip)
  }

  bind(ip: string, profileName: string) {
    const container = Container.of(profileName)
    container.set(KVStorageToken, new ScopedKVService(this.rootKVService, path.resolve('/', profileName)))
    this.map.set(ip, container)
  }
}