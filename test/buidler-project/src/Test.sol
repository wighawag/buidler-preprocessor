// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "@nomiclabs/buidler/console.sol";

contract Test {
    function say(string calldata message) external view {
        console.log(message);
    }
}
