import Router from 'koa-router';
import { Container } from 'typedi';
import {
  ConfigController,
  HostController,
  HttpTrafficController,
  MockDataController,
  ProfileController,
  RuleController,
  UtilsController,
} from './controller';

export default function() {
  const router = new Router();
  Container.get(ConfigController).regist(router);
  Container.get(ProfileController).regist(router);
  Container.get(HostController).regist(router);
  Container.get(HttpTrafficController).regist(router);
  Container.get(MockDataController).regist(router);
  Container.get(RuleController).regist(router);
  Container.get(UtilsController).regist(router);
  return router.routes();
}
