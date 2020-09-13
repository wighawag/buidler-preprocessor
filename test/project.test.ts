import {expect} from 'chai';
import {useEnvironment} from './helpers';
import fs from 'fs';

describe('Buidler compile task', function () {
  useEnvironment(__dirname + '/buidler-project');

  it('It should not preprocess Test.sol', async function () {
    await this.env.run('compile', {force: true});
    const solcInput = JSON.parse(fs.readFileSync('cache/solc-input.json').toString());
    expect(solcInput.sources['src/Test.sol'].content).to.equal(fs.readFileSync('src/Test.sol').toString());
  });
});

describe('Buidler compile task on other', function () {
  useEnvironment(__dirname + '/buidler-project', 'other');
  it('It should preprocess Test.sol on rinkeby', async function () {
    await this.env.run('compile', {force: true});
    const solcInput = JSON.parse(fs.readFileSync('cache/solc-input.json').toString());
    expect(solcInput.sources['src/Test.sol'].content).to.not.equal(fs.readFileSync('src/Test.sol').toString());
  });
});
