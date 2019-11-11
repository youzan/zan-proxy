import * as api from '@gui/renderer/api';
import { HostFileStore, PluginStore, RuleFileStore, WorkspaceStore } from '@gui/renderer/store';
import { Button, Checkbox, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import throttle from 'lodash/throttle';
import { inject, observer } from 'mobx-react';
import * as React from 'react';

import style from './style.m.scss';

const formItemLayout = {
  colon: false,
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

interface IProps {
  workspaceStore: WorkspaceStore;
  hostFileStore: HostFileStore;
  ruleFileStore: RuleFileStore;
  pluginStore: PluginStore;
}

@inject(stores => stores)
@observer
class WorkspaceEditor extends React.Component<IProps> {
  /**
   * 当前工作区
   */
  private get workspace() {
    return this.props.workspaceStore.currentWorkspace;
  }

  /**
   * 是否是新建的工作区
   */
  private get isNew() {
    return !this.workspace.key;
  }

  /**
   * 保存当前工作区
   * @returns
   */
  private saveWorkspace = throttle(async () => {
    // 保存时若没有填写名称，则弹出命名框
    if (!this.workspace.name) {
      return message.error('请输入工作区名称');
    }
    const { currentWorkspace, activatedWorkspace } = this.props.workspaceStore;
    try {
      const workspace = await api.saveWorkspace(currentWorkspace);
      this.props.workspaceStore.setCurrentWorkspace(workspace);
      message.success('保存成功');
      // 若保存的是当前已被激活的工作区配置，则需要重新启用（更新配置规则）
      if (activatedWorkspace && currentWorkspace && activatedWorkspace.key === currentWorkspace.key) {
        return api.activateWorkspace(currentWorkspace);
      }
    } catch (err) {
      message.error(err);
    }
  }, 1000);

  /**
   * 复制工作区
   *
   * @private
   * @memberof WorkspaceEditor
   */
  private copyWorkspace = throttle(() => {
    this.props.workspaceStore.copyWorkspace(this.props.workspaceStore.currentWorkspace);
    return this.saveWorkspace();
  }, 1000);

  /**
   * 导出工作区的配置文件
   * @returns
   */
  private exportWorkspace = throttle(async () => {
    await api.exportWorkspace(this.workspace);
    message.success('导出成功');
  }, 1000);

  /**
   * 打开转发规则编辑页
   *
   * @private
   * @memberof WorkspaceEditor
   */
  private toEditRules = () => {
    return api.showManager('/#/rule/list');
  };

  /**
   * 打开host编辑页
   *
   * @private
   * @memberof WorkspaceEditor
   */
  private toEditHosts = () => {
    return api.showManager('/#/host/list');
  };

  /**
   * 删除工作区
   * @returns
   */
  private removeWorkspace = () => {
    const { currentWorkspace } = this.props.workspaceStore;
    return Modal.confirm({
      title: '提示',
      content: '此操作将永久删除该环境, 是否继续?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      type: 'error',
      onOk: () => {
        api
          .deactivateWorkspace(currentWorkspace)
          .then(() => {
            return api.removeWorkspace(currentWorkspace.key);
          })
          .then(() => {
            // @ts-ignore
            this.props.workspaceStore.setCurrentWorkspace(null);
            message.success('删除成功');
          });
      },
    });
  };

  private changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.workspaceStore.setCurrentWorkspaceAttrs({
      name: e.target.value,
    });
  };

  private changeEnableHost = (e: CheckboxChangeEvent) => {
    this.props.workspaceStore.setCurrentWorkspaceAttrs({
      enableHost: e.target.checked,
    });
  };

  private changeHosts = hosts => {
    this.props.workspaceStore.setCurrentWorkspaceAttrs({ hosts });
  };

  private changeEnableRule = (e: CheckboxChangeEvent) => {
    this.props.workspaceStore.setCurrentWorkspaceAttrs({
      enableRule: e.target.checked,
    });
  };

  private changeRuleSet = ruleSet => {
    this.props.workspaceStore.setCurrentWorkspaceAttrs({ ruleSet });
  };

  private getPopupContainer() {
    return document.getElementById('workspace-editor-content') as HTMLElement;
  }

  /**
   * 渲染操作按钮组
   */
  private renderOperationBtns() {
    const isNew = this.isNew;

    return (
      <Button.Group>
        <Button type="primary" icon="save" onClick={this.saveWorkspace}>
          保存
        </Button>
        {!isNew && (
          <Button type="primary" icon="copy" onClick={this.copyWorkspace}>
            复制
          </Button>
        )}
        {!isNew && (
          <Button type="primary" icon="export" onClick={this.exportWorkspace}>
            导出
          </Button>
        )}
        {!isNew && (
          <Button icon="delete" type="danger" onClick={this.removeWorkspace}>
            删除
          </Button>
        )}
      </Button.Group>
    );
  }

  public render() {
    const { hostFiles } = this.props.hostFileStore;
    const { ruleFiles } = this.props.ruleFileStore;
    const { editorComponents } = this.props.pluginStore;
    const workspace = this.workspace;

    if (!workspace) {
      return null;
    }

    return (
      <div id="workspace-editor" className={style.workspaceEditor}>
        <div className={style.header}>
          <h1 className={style.title}>{workspace.name}</h1>
          {this.renderOperationBtns()}
        </div>
        <Form id="workspace-editor-content" className={style.content} layout="horizontal">
          <div className="editor-field">
            <Row>
              <Col span={4}>
                <h3 className="editor-field-title">名称设置</h3>
              </Col>
            </Row>
            <Form.Item label="名称" {...formItemLayout}>
              <Input value={workspace.name} onChange={this.changeName} placeholder="请输入预设名称" />
            </Form.Item>
          </div>
          <div className="editor-field">
            <Row>
              <Col span={4}>
                <h3 className="editor-field-title">Host 设置</h3>
              </Col>
            </Row>
            <Form.Item label="启用 Host" {...formItemLayout}>
              <Checkbox checked={workspace.enableHost} onChange={this.changeEnableHost} />
            </Form.Item>
            {workspace.enableHost && (
              <Form.Item label="选择 Host" {...formItemLayout}>
                <Select
                  value={workspace.hosts}
                  onChange={this.changeHosts}
                  mode="multiple"
                  placeholder="请选择要启用的Host"
                  getPopupContainer={this.getPopupContainer}
                >
                  {hostFiles.map(host => (
                    <Select.Option key={host.name} value={host.name}>
                      {host.name}
                    </Select.Option>
                  ))}
                </Select>
                <span className="form-extra">
                  <a className="link-btn" target="_blank" onClick={this.toEditHosts}>
                    前往编辑
                  </a>
                </span>
              </Form.Item>
            )}
          </div>
          <div className="editor-field">
            <Row>
              <Col span={4}>
                <h3 className="editor-field-title">转发设置</h3>
              </Col>
            </Row>
            <Form.Item label="启用转发" {...formItemLayout}>
              <Checkbox checked={workspace.enableRule} onChange={this.changeEnableRule} />
            </Form.Item>
            {workspace.enableRule && (
              <Form.Item label="转发规则集" {...formItemLayout}>
                <Select
                  value={workspace.ruleSet}
                  onChange={this.changeRuleSet}
                  mode="multiple"
                  placeholder="请选择要启用的转发规则"
                  getPopupContainer={this.getPopupContainer}
                >
                  {ruleFiles.map(rule => (
                    <Select.Option key={rule.name} value={rule.name}>
                      {rule.name}
                    </Select.Option>
                  ))}
                </Select>
                <span className="form-extra">
                  <a className="link-btn" target="_blank" onClick={this.toEditRules}>
                    前往编辑
                  </a>
                </span>
              </Form.Item>
            )}
          </div>
          {/* 渲染插件提供的组件 */}
          {editorComponents.length > 0 && <hr className="editor-field-divider" />}
          {editorComponents.map(Component => (
            <Component key={Component.displayName} />
          ))}
        </Form>
      </div>
    );
  }
}

export default WorkspaceEditor as React.ComponentClass<{}>;
