//SPDX-License-Identifier: Unlicense

/**
 * Created on 2022-30-07 01:17
 * @summary:
 * @author: trihm
 */
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IGalaxyChef {
  struct DepositAmount {
    uint256 amount; // How many LP tokens the user has provided.
    uint256 lockUntil;
  }

  struct UserInfo {
    uint256 amount;
    DepositAmount[] investments;
    uint256 rewardDebt; // Reward debt. See explanation below.
    uint256 rewardLockedUp; // Reward locked up.
    uint256 nextHarvestUntil; // When can the user harvest again.
    uint256 startInvestmentPosition; //The first position haven't withdrawed
  }

  function deposit(
    uint256 _pid,
    uint256 _amount,
    address _referrer
  ) external;

  function withdrawInvestment(uint256 _pid) external;

  function pendingReward(uint256 _pid, address _user)
    external
    view
    returns (uint256);

  function userInfo(uint256 _pid, address _user)
    external
    view
    returns (UserInfo memory);
}

contract GalaxyFinance is OwnableUpgradeable, ReentrancyGuardUpgradeable {
  IGalaxyChef public galaxyChef;
  IERC20 public galaxyToken;
  address public referrer;
  address public recipient;

  event Harvest(
    address from,
    address to,
    uint256 tokenType,
    uint256 tokenRarity
  );

  event WithdrawAll(
    address from,
    address to,
    uint256 tokenType,
    uint256 tokenRarity
  );

  constructor() {
    __Ownable_init();
    galaxyChef = IGalaxyChef(0xe1D4661a28f0Bdc8CfB0E796dF91EcCFE495B145);
    galaxyToken = IERC20(0xE77932B1216125848e82C3967e75698362168f99);
    recipient = 0x193beAB312B3F404d103D52DEe9D26ef35a2FD06;
    referrer = 0x0000000000000000000000000000000000000000;
  }

  function setGalaxyChefAddress(address _address) external onlyOwner {
    galaxyChef = IGalaxyChef(_address);
  }

  function setRecipient(address _recipient) external onlyOwner {
    recipient = _recipient;
  }

  function harvest(uint256 _pid) external {
    uint256 reward = galaxyChef.pendingReward(_pid, msg.sender);
    require(reward > 0, "Not enough to harvest");
    if (reward > 0) {
      galaxyChef.deposit(_pid, reward, referrer);
      galaxyToken.transferFrom(msg.sender, recipient, reward);
      emit Harvest(msg.sender, recipient, reward, _pid);
    }
  }

  function withdrawStaking(uint256 _pid) external {
    uint256 amount = galaxyChef.userInfo(_pid, msg.sender).amount;
    require(amount > 0, "Don't have GFT to withdraw");
    if (amount > 0) {
      galaxyChef.withdrawInvestment(_pid);
      galaxyToken.transferFrom(msg.sender, recipient, amount);
      emit WithdrawAll(msg.sender, recipient, amount, _pid);
    }
  }
}
