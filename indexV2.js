require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const delay = require("delay");

// import ABI
const GalaxyStakingABI = require("./GalaxyStaking.json");
const GalaxyTokenABI = require("./GalaxyToken.json");

// connect wallet
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY); // Ví bị hack
let wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY_1); // Ví chuyển BNB

const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
wallet = wallet.connect(provider);
wallet1 = wallet1.connect(provider);

// GalaxyChef
const addressStaking = process.env.GALAXYSTAKING;
const contractStaking = new ethers.Contract(addressStaking, GalaxyStakingABI, wallet);

// GalaxyToken
const addressToken = process.env.GLF_TOKEN;
const contractToken = new ethers.Contract(addressToken, GalaxyTokenABI, wallet);

const recipient = process.env.RECIPIENT;
let gasPrice = ethers.utils.parseUnits("5.5", "gwei");

async function multiTransaction() {
  try {
    const balanceOf = await contractToken.balanceOf(wallet.address);
    console.log(wallet.address, ':', balanceOf.toString());

    const nonce = await provider.getTransactionCount(wallet.address);
    console.log('nonce', nonce);

    // Calculate Total Reward of All Pool
    // const userIds = await contractStaking.getUserIds("0x92f32ddce02aa6d9a5aba0a9c09d70e97dd23843");
    // console.log(userIds);
    // let pendingRewards = [];
    // for (let i = 0; i < userIds.length; i++) {
    //   pendingRewards.push(contractStaking.getPendingReward(userIds[i]));
    // }
    // const allReward = await Promise.all(pendingRewards);
    // const sum = allReward.reduce((partialSum, a) => BigInt(partialSum) + BigInt(a), 0);
    // console.log('Số tiền nhận được khi harvest', sum.toString());

    // const totalGLF = BigInt(sum) + BigInt(balanceOf);
    // console.log('totalGLF', totalGLF.toString());

    // Calculate reward at specific pool
    const rewardStaking = await contractStaking.getPendingReward(process.env.GLF_POOL_STAKE);
    const totalGLF = BigInt(rewardStaking) + BigInt(balanceOf);
    console.log('totalGLF', totalGLF.toString());

    // estimate BNB for Gas
    // const estimateHarvestFee = await contractStaking.estimateGas.harvests(userIds);
    const estimateHarvestFee = await contractStaking.estimateGas.harvest(
      process.env.GLF_POOL_STAKE
    );
    const estimateTransferFee = await contractToken.estimateGas.transfer(recipient, 0);
    // const totalEstimateGas = estimateHarvestFee.add(estimateTransferFee * 2);
    // const totalFee = gasPrice.mul(totalEstimateGas);

    //send BNB
    const requireBNB = ethers.utils.parseUnits("0.0009", "ether");
    const sendBNB = await wallet1.sendTransaction({
      to: wallet.address,
      value: requireBNB,
    });
    await sendBNB.wait();

    // claim GLP reward at All Pool
    // const harvest = contractStaking.harvests(
    //   userIds,
    //   {
    //     nonce: nonce,
    //     gasPrice: gasPrice
    //   }
    // );

    // claim GLP reward at specific Pool
    const harvest = contractStaking.harvest(
      process.env.GLF_POOL_STAKE,
      {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: estimateHarvestFee,
      }
    );

    // transfer GLP
    const transfer = contractToken.transfer(recipient, totalGLF,
      {
        nonce: nonce + 1,
        gasPrice: gasPrice,
        gasLimit: estimateTransferFee,
      }
    );
    console.log(await Promise.all([harvest, transfer]), "Chuyển tiền thành công");

  } catch (error) {
    console.log("---ERROR---", error);
  }
}

async function main() {
  while (true) {
    await multiTransaction();
    await delay(1000 * 60 * 20);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
