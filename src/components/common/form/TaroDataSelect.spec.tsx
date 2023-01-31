import React from 'react';
import { fireEvent } from '@testing-library/react';
import { Form } from 'antd';
import { createStore } from 'easy-peasy';
import { Status } from 'shared/types';
import appModel from 'store/models/app';
import bitcoindModel from 'store/models/bitcoind';
import designerModel from 'store/models/designer';
import lightningModel from 'store/models/lightning';
import modalsModel from 'store/models/modals';
import networkModel from 'store/models/network';
import taroModel from 'store/models/taro';
import { initChartFromNetwork } from 'utils/chart';
import { defaultRepoState } from 'utils/constants';
import { createNetwork } from 'utils/network';
import {
  defaultTaroBalance,
  injections,
  renderWithProviders,
  testManagedImages,
  testRepoState,
} from 'utils/tests';
import TaroDataSelect from './TaroDataSelect';

describe('TaroNodeSelect', () => {
  const rootModel = {
    app: appModel,
    network: networkModel,
    lightning: lightningModel,
    bitcoind: bitcoindModel,
    designer: designerModel,
    taro: taroModel,
    modals: modalsModel,
  };
  const store = createStore(rootModel, { injections });
  const network = createNetwork({
    id: 1,
    name: 'my-test',
    lndNodes: 0,
    clightningNodes: 0,
    eclairNodes: 0,
    bitcoindNodes: 1,
    status: Status.Started,
    repoState: defaultRepoState,
    managedImages: testManagedImages,
    customImages: [],
  });
  store.getState().network.networks.push(network);

  store.getActions().network.addNode({
    id: network.id,
    type: 'LND',
    version: testRepoState.images.LND.latest,
  });
  store.getActions().network.addNode({
    id: network.id,
    type: 'LND',
    version: testRepoState.images.LND.latest,
  });
  store.getActions().network.addNode({
    id: network.id,
    type: 'tarod',
    version: testRepoState.images.tarod.latest,
  });
  store.getActions().network.addNode({
    id: network.id,
    type: 'tarod',
    version: testRepoState.images.tarod.latest,
  });

  const chart = initChartFromNetwork(store.getState().network.networks[0]);
  store.getActions().designer.setChart({ id: network.id, chart });
  store.getActions().designer.setActiveId(network.id);
  store.getActions().designer.syncChart(store.getState().network.networks[0]);
  const initialState = {
    taro: {
      nodes: {
        'alice-taro': {
          balances: [],
          assets: [],
        },
        'bob-taro': {
          balances: [defaultTaroBalance({ name: 'bobs-test-asset' })],
          assets: [],
        },
      },
    },
    network: {
      networks: [store.getState().network.networks[0]],
    },
    designer: {
      activeId: network.id,
      allCharts: {
        [network.id]: chart,
      },
    },
  };

  const renderComponent = () => {
    const TestForm = () => {
      const [form] = Form.useForm();
      return (
        <Form
          name={'TaroNodeSelect'}
          form={form}
          initialValues={{ taronode: 'alice-taro' }}
        >
          <TaroDataSelect
            name="taronode"
            label={'Select Taro Node'}
            taroNetworkNodes={store.getState().network.networks[0].nodes.taro}
            selectBalances={true}
          />
        </Form>
      );
    };
    const cmp = <TestForm />;
    const result = renderWithProviders(cmp, { initialState, wrapForm: true });
    return {
      ...result,
      network,
    };
  };

  it('should display the label and input', () => {
    const { getByText } = renderComponent();
    expect(getByText('Select Taro Node')).toBeInTheDocument();
    expect(getByText('alice-taro')).toBeInTheDocument();
  });
  it('should select and display bob-taro ', () => {
    const { getByLabelText, getAllByText } = renderComponent();
    fireEvent.mouseDown(getByLabelText('Select Taro Node'));
    fireEvent.click(getAllByText('bob-taro')[0]);
    expect(getAllByText('bob-taro')[0]).toBeInTheDocument();
    expect(getAllByText('bobs-test-asset-1')[0]).toBeInTheDocument();
  });
});