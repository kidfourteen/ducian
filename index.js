require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const delay = require("delay");

// import ABI
const GalaxyChefABI = require("./GalaxyChef.json");
const GalaxyTokenABI = require("./GalaxyToken.json");

// connect wallet
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
// const provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
wallet = wallet.connect(provider);

// GalaxyChef
const addressStaking = process.env.GALAXYCHEF;
const contractStaking = new ethers.Contract(addressStaking, GalaxyChefABI, wallet);

// GalaxyToken
const addressToken = process.env.GALAXY_TOKEN;
const contractToken = new ethers.Contract(addressToken, GalaxyTokenABI, wallet);

const recipient = process.env.RECIPIENT;
let gasPrice = ethers.utils.parseUnits("5.5", "gwei");

async function main() {
  const balanceOf = await contractToken.balanceOf(wallet.address);
  console.log(wallet.address, ':', balanceOf.toString());

  const nonce = await provider.getTransactionCount(wallet.address);
  console.log('nonce', nonce);

  const pendingReward = await contractStaking.pendingReward(
    process.env.POOL_STAKE,
    wallet.address
  );
  console.log('Số tiền nhận được khi harvest', pendingReward.toString());

  const totalGFT = BigInt(pendingReward) + BigInt(balanceOf);
  console.log('totalGFT', totalGFT.toString());

  const harvest = contractStaking.deposit(
    parseInt(process.env.POOL_STAKE), // Pool muốn harvest
    0,
    '0x0000000000000000000000000000000000000000',
    { nonce: nonce }
  );
  console.log('Đã harvest');
  const transfer = contractToken.transfer(recipient, totalGFT,
    {
      gasPrice: gasPrice,
      nonce: nonce + 1,
      gasLimit: 100000,
      gasPrice: gasPrice
    }
  );
  console.log(await Promise.all([harvest, transfer]), "Chuyển tiền thành công");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
