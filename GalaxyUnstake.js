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
let gasPrice = ethers.utils.parseUnits("7", "gwei");

async function main() {
  let balanceOf = await contractToken.balanceOf(wallet.address);
  console.log(wallet.address, ':', balanceOf.toString())

  const userInfo = await contractStaking.userInfo(0, wallet.address);
  console.log('Số tiền đang staking', userInfo.amount.toString());

  const start = Date.now();

  const withdraw = await contractStaking.withdraw(
    parseInt(process.env.POOL_UNSTAKE), // Pool muốn harvest
    userInfo.amount,
    { gasPrice: gasPrice }
  );
  console.log('Đã unstake')
  await withdraw.wait();

  balanceOf = await contractToken.balanceOf(wallet.address);
  console.log('Số dư', balanceOf.toString())

  if (balanceOf > 0) {
    await contractToken.transfer(recipient, balanceOf, { gasPrice: gasPrice, nonce: withdraw.nonce + 1 })
    console.log('Chuyển tiền thành công', Date.now() - start)
  }
  else {
    console.log('Số dư Galaxy ko đủ để chuyển')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
