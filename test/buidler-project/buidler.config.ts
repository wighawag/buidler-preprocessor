import {BuidlerConfig} from '@nomiclabs/buidler/config';

// Loading Plugin
import {loadPluginFile} from '@nomiclabs/buidler/plugins-testing';
loadPluginFile(__dirname + '/../../src/index');
import {removeConsoleLog} from '../../src/index';
import {BuidlerRuntimeEnvironment} from '@nomiclabs/buidler/types';

const config: BuidlerConfig = {
  solc: {
    version: '0.7.1',
    optimizer: {
      enabled: true,
      runs: 2000,
    },
  },
  networks: {
    other: {
      url: 'http://localhost:8545',
    },
  },
  paths: {
    sources: 'src',
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (bre: BuidlerRuntimeEnvironment) => bre.network.name !== 'buidlerevm' && bre.network.name !== 'localhost'
    ),
  },
};

export default config;
