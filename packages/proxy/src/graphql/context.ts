import { Service, Inject } from 'typedi'

import {
  HostServiceToken,
  HostService,
  RuleServiceToken,
  RuleService,
  MockServiceToken,
  MockService,
  ProfileConfigServiceToken,
  ProfileConfigService
} from 'lib-zan-proxy/lib/service'

@Service()
export class GraphQLContext {
  @Inject(HostServiceToken) hostService: HostService
  @Inject(RuleServiceToken) ruleService: RuleService
  @Inject(MockServiceToken) mockDataService: MockService
  @Inject(ProfileConfigServiceToken) profileConfigService: ProfileConfigService
}
