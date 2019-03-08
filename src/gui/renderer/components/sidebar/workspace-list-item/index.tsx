import * as React from 'react';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Switch, Icon } from 'antd';

import style from './style.m.scss';

interface IProps {
  workspace: ZanProxyMac.IWorkspace;
  selected: boolean;
  loading: boolean;
  onSelect: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}

const DragHandle = SortableHandle(() => <Icon className={style.dragIcon} type="menu" />);

class WorkspaceListItem extends React.PureComponent<IProps> {
  private onSelect = () => {
    this.props.onSelect();
  };

  private onSwitchToggle = checked => {
    if (checked) {
      this.props.onActivate();
    } else {
      this.props.onDeactivate();
    }
  };

  private stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  public render() {
    const { workspace, selected, loading } = this.props;
    const cls = `${style.workspaceItem} ${selected ? style.selected : ''}`;
    return (
      <li className={cls} onClick={this.onSelect}>
        <DragHandle />
        <p className={style.name}>{workspace.name}</p>
        <span onClick={this.stopPropagation}>
          <Switch
            className={workspace.checked ? style.checkedSwitch : ''}
            loading={loading}
            checked={workspace.checked}
            onChange={this.onSwitchToggle}
            size="small"
          />
        </span>
      </li>
    );
  }
}

export default SortableElement(WorkspaceListItem);
