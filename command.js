require("dotenv").config({ path: ".env" });
const ethers = require("ethers");
const { Telegraf } = require("telegraf");

const GalaxyChefABI = require("./GalaxyChef.json");
const GalaxyTokenABI = require("./GalaxyToken.json");

let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

const addressStaking = process.env.GALAXYCHEF;
const addressToken = process.env.GALAXY_TOKEN;

const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
// const provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
wallet = wallet.connect(provider);

const contractStaking = new ethers.Contract(addressStaking, GalaxyChefABI, wallet);
const contractToken = new ethers.Contract(addressToken, GalaxyTokenABI, wallet);

const recipient = process.env.RECIPIENT;
let gasPrice = ethers.utils.parseUnits("6", "gwei");

const bot = new Telegraf(process.env.COMMAND_BOT_TOKEN);

bot.command('/harvest', async (ctx) => {
  console.log('Start harvest')
  try {
    await contractStaking.deposit(
      parseInt(process.env.POOL_STAKE),
      0,
      '0x0000000000000000000000000000000000000000'
    );

    balanceOf = await contractToken.balanceOf(wallet.address);
    console.log(wallet.address, ':', balanceOf.toString())

    await contractToken.transfer(recipient, balanceOf, { gasPrice: gasPrice })

    balanceOf = await contractToken.balanceOf(wallet.address);
    console.log(wallet.address, ':', balanceOf.toString())

    balanceOf = await contractToken.balanceOf(recipient);
    console.log(recipient, ':', balanceOf.toString())

    ctx.reply(`🔔 Success 🔔`)
  } catch (error) {
    ctx.reply(`🔔 Faillllll 🔔`)
  }
})


module.exports = bot;
// bot.launch();