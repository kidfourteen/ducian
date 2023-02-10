require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const delay = require("delay");

// connect wallet
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

const provider = ethers.getDefaultProvider('https://purple-dawn-pool.bsc.quiknode.pro/84d079f167a3fea70a6f75d21cabbde1bfde9a95/');
wallet = wallet.connect(provider);

const recipient = process.env.RECIPIENT;
const gasPrice = ethers.utils.parseUnits("20", "gwei");

//Check BNB
async function checkBalance() {
  while (true) {
    const balance = await provider.getBalance(wallet.address);
    console.log(balance.toString());
    if (balance > 0) {
      const estimateGas = await provider.estimateGas({
        to: recipient,
        value: balance
      });
      // const gasPrice = await provider.getGasPrice();
      const estimateTxFee = gasPrice.mul(estimateGas);
      const BN = balance.sub(estimateTxFee);
      if (BN > 0) {
        try {
          await wallet.sendTransaction({
            to: recipient,
            value: BN,
            gasPrice: gasPrice
          });
          console.log("success");
        } catch (error) {
          console.log("error", BN.toString());
        }
      }
    }
    await delay(20);
  }
}


const startBot = async () => {
  try {
    console.log("Start Bot");
    checkBalance();
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};

startBot();