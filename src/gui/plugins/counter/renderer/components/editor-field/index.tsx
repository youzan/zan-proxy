import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Stores, WorkspaceStore } from '@gui/renderer/store';

import * as api from '../../api';

interface IProps {
  workspaceStore: WorkspaceStore;
}

interface IState {
  times: number;
}

@inject<Stores, {}, {}, {}>(({ workspaceStore }) => ({ workspaceStore }))
@observer
class CounterEditorField extends React.Component<IProps, IState> {
  public state: IState = {
    times: 0,
  };

  public componentDidMount() {
    this.fetchOpenTimes();
  }

  private async fetchOpenTimes() {
    const times = await api.fetchOpenTimes();
    this.setState({ times });
  }

  public render() {
    const { workspaceStore } = this.props;
    const { times } = this.state;
    return (
      <div className="editor-field">
        该窗口已经打开{times}次，当前工作区为{workspaceStore.currentWorkspace.name}。
      </div>
    );
  }
}

export default CounterEditorField as React.ComponentClass<{}>;
