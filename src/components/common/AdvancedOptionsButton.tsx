import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { usePrefixedTranslation } from 'hooks';
import { AnyNode, LndNode } from 'shared/types';
import { useStoreActions } from 'store';
import { applySeedBackupFlag, getDefaultCommand } from 'utils/network';

interface Props {
  node: AnyNode;
  type?: 'button' | 'menu';
}

const AdvancedOptionsButton: React.FC<Props> = ({ node, type }) => {
  const { l } = usePrefixedTranslation('cmps.common.AdvancedOptionsButton');
  const { showAdvancedOptions } = useStoreActions(s => s.modals);
  const handleClick = () => {
    let defaultCmd = getDefaultCommand(node.implementation, node.version);
    // apply --noseedbackup flag based on node's seed backup setting
    // Note: revisit if an effectiveCommand helper is introduced in a future branch
    if (node.implementation === 'LND') {
      defaultCmd = applySeedBackupFlag(defaultCmd, (node as LndNode).hasSeedBackup);
    }
    showAdvancedOptions({
      nodeName: node.name,
      command: node.docker.command,
      defaultCommand: defaultCmd,
    });
  };

  // render a menu item inside of the NodeContextMenu
  if (type === 'menu') {
    return (
      <div onClick={handleClick}>
        <SettingOutlined />
        <span>{l('menu')}</span>
      </div>
    );
  }

  return (
    <Form.Item label={l('title')} colon={false}>
      <Button icon={<SettingOutlined />} block onClick={handleClick}>
        {l('btn')}
      </Button>
    </Form.Item>
  );
};

export default AdvancedOptionsButton;
