import * as React from 'react';
import { Layout } from 'antd';

import SideBar from './components/sidebar';
import WorkspaceEditor from './components/workspace-editor';

import style from './style.m.scss';

const { Content } = Layout;

export default class App extends React.Component<{}> {
  public render() {
    return (
      <Layout>
        <SideBar />
        <Content className={style.rightContent}>
          <WorkspaceEditor />
        </Content>
      </Layout>
    );
  }
}
