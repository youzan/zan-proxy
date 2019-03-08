import * as React from 'react';
import { Layout, Input, Button, message, Icon } from 'antd';
import { cloneDeep } from 'lodash';
import { observer, inject } from 'mobx-react';
import { SortableContainer } from 'react-sortable-hoc';

import * as api from '@gui/renderer/api';
import { Stores, WorkspaceStore } from '@gui/renderer/store';
import WorkspaceListItem from './workspace-list-item';

import style from './style.m.scss';

const { Sider } = Layout;

interface IProps {
  workspaceStore: WorkspaceStore;
}

interface IState {
  keyword: string;
  loading: boolean;
  loadingKey: string;
}

const SortableList = SortableContainer<{
  items: ZanProxyMac.IWorkspace[];
  currentWorkspace: ZanProxyMac.IWorkspace;
  loading: boolean;
  loadingKey: string;
  selectWorkspace: (ws: ZanProxyMac.IWorkspace) => void;
  activateWorkspace: (ws: ZanProxyMac.IWorkspace) => void;
  deactivateWorkspace: (ws: ZanProxyMac.IWorkspace) => void;
}>(props => {
  const {
    items,
    selectWorkspace,
    activateWorkspace,
    deactivateWorkspace,
    currentWorkspace,
    loading,
    loadingKey,
  } = props;
  return (
    <ul className={style.workspaceList}>
      {items.map((ws, index) => {
        return (
          <WorkspaceListItem
            index={index}
            key={ws.key}
            workspace={ws}
            loading={loading && (ws.checked || loadingKey === ws.key)}
            selected={ws.key === (currentWorkspace && currentWorkspace.key)}
            onSelect={() => selectWorkspace(ws)}
            onActivate={() => activateWorkspace(ws)}
            onDeactivate={() => deactivateWorkspace(ws)}
          />
        );
      })}
    </ul>
  );
});

@inject<Stores, {}, {}, {}>(({ workspaceStore }) => ({ workspaceStore }))
@observer
class SideBar extends React.Component<IProps, IState> {
  public state: IState = {
    keyword: '',
    loading: false,
    loadingKey: '',
  };

  /**
   * 通过关键字过滤符合条件的工作区
   */
  private get filteredWorkspaces() {
    const keyword = this.state.keyword.toLowerCase();
    if (!keyword) {
      return this.props.workspaceStore.workspaces;
    }
    return this.props.workspaceStore.workspaces.filter(w => w.name.toLowerCase().includes(keyword));
  }

  private changeKeyword = e => {
    this.setState({
      keyword: e.target.value,
    });
  };

  private onSortEnd = ({ oldIndex, newIndex }) => {
    return api.sortWorkspaces(oldIndex, newIndex);
  };

  private setLoading(loading: boolean, loadingKey: string = '') {
    this.setState({
      loading,
      loadingKey,
    });
  }

  private importWorkspace = () => {
    api.importWorkspace();
  };

  private selectWorkspace = (ws: ZanProxyMac.IWorkspace) => {
    this.props.workspaceStore.setCurrentWorkspace(cloneDeep(ws));
  };

  private createWorkspace = async () => {
    const newWs = await api.createWorkspace();
    this.props.workspaceStore.setCurrentWorkspace(newWs);
  };

  private activateWorkspace = (ws: ZanProxyMac.IWorkspace) => {
    this.setLoading(true, ws.key);
    api
      .activateWorkspace(ws)
      .catch(err => {
        message.error(err);
      })
      .finally(() => {
        this.setLoading(false);
      });
  };

  private deactivateWorkspace = (ws: ZanProxyMac.IWorkspace) => {
    this.setLoading(true, ws.key);
    api.deactivateWorkspace(ws).finally(() => {
      this.setLoading(false);
    });
  };

  public render() {
    const {
      workspaceStore: { currentWorkspace },
    } = this.props;
    const { keyword, loading, loadingKey } = this.state;
    const filteredWorkspaces = this.filteredWorkspaces;
    return (
      <Sider theme="light" className={style.sidebar} width={240}>
        <div className={style.searchBox}>
          <Input
            prefix={<Icon type="search" className={style.searchIcon} />}
            placeholder="请输入过滤词"
            value={keyword}
            onChange={this.changeKeyword}
          />
        </div>
        <SortableList
          onSortEnd={this.onSortEnd}
          useDragHandle
          items={filteredWorkspaces}
          loading={loading}
          loadingKey={loadingKey}
          currentWorkspace={currentWorkspace}
          selectWorkspace={this.selectWorkspace}
          activateWorkspace={this.activateWorkspace}
          deactivateWorkspace={this.deactivateWorkspace}
        />
        <div className={style.actions}>
          <Button.Group>
            <Button type="primary" icon="plus" onClick={this.createWorkspace}>
              新建
            </Button>
            <Button type="primary" icon="cloud-upload" onClick={this.importWorkspace}>
              导入
            </Button>
          </Button.Group>
        </div>
      </Sider>
    );
  }
}

export default SideBar as React.ComponentClass<{}>;
