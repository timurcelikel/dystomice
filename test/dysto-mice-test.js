const { expect } = require("chai");
const { ethers } = require("hardhat");
let DysToken;
let DystoMice;
let dys;
let mice;
let accounts;
let contractOwnerAddress;
let tokenContractAddress;
let account1;

 beforeEach(async function () {
   
    DysToken = await ethers.getContractFactory("DysToken");
    dys = await DysToken.deploy();

    // Get the ContractFactory and Signers here.
    DystoMice = await ethers.getContractFactory("DystoMice");

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been mined.
    mice = await DystoMice.deploy(
      "DystoMice", 
      "DYSTOMICE", 
      "ipfs://QmXHaUaMwr7hPsKZvLkZhKznvjqx1pZphAEo85BzzgyWPs/", 
      dys.address);

      accounts = await ethers.getSigners();
      contractOwnerAddress = mice.address;
      tokenContractAddress = dys.address;
      account1 = accounts[0];
});

describe("DystoMice Test Initial Total Supply", function () {
 
  it("should return mice total supply", async function () {
    
    expect(await mice.totalSupply()).to.equal(30);
  });
});

describe("DystoMice Test Increase Total Supply", function () {
 
  it("should increase total supply", async function () {
  
    await mice.setStart(true);

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }
    
    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);

    expect(await mice.connect(account1).totalSupply()).to.equal(8000);
  });
});

describe("DystoMice Test Mint With Token", function () {
  // Transfer uses the contract address to send tokens from and not the sender for some reason.
  // TransferFrom uses the sender and also requires token spend approval
  it("should mint a mouse with token", async function () {
  
    // List all account addresses
    //accounts.forEach(element => console.log(element.address));

    //await dys.mint(account1.address);
    await dys.mint(contractOwnerAddress); // Mints 10000000000000000000000 or 10,000 DysToken

    /* Debug
    console.log("Contract owner address:", contractOwnerAddress);
    console.log("Token contract owner address:", tokenContractAddress);
    console.log("account1 address:", account1.address);

    console.log("DysToken owned by contract owner: ", await dys.balanceOf(contractOwnerAddress));
    console.log("DysToken owned by token contract: ", await dys.balanceOf(tokenContractAddress));
    console.log("DysToken owned by account1: ", await dys.balanceOf(account1.address));
    */

    await mice.setStart(true);

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }

    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);

    // Approve amount for connected account to recipient - only needed for transferFrom()
    dys.connect(account1).approve(contractOwnerAddress, "10000000000000000000000");

    await mice.connect(account1).mintMiceWithToken("5000000000000000000000"); // 5,000 DysToken

    expect(await mice.totalMiceMinted()).to.equal(31);
  });
});

describe("DystoMice Test Mint With Token No Balance", function () {
  it("should revert with not enough token", async function () {
  
    // No token no mouse
    //await dys.mint(contractOwnerAddress); 
    await mice.setStart(true);

    // Mint all mice (had to change totalCount to 30)
    for (let i = 0; i < 30; i++) {
      await mice.mintMice(1, { value: ethers.utils.parseEther(".02")});
    }

    // Can only increase total supply after initial mice are all minted
    await mice.increaseTotalSupply(8000);

    // Approve amount for connected account to recipient - only needed for transferFrom()
    dys.connect(account1).approve(contractOwnerAddress, "10000000000000000000000");
    
    await expect(mice.connect(account1).mintMiceWithToken("5000000000000000000000")).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });
});
  
describe("DystoMice Test Mint Total Supply Updated", function () {

  it("should mint a mouse", async function () {

    await mice.setStart(true);

    // Owner
    await mice.mintMice(1, { value: ethers.utils.parseEther("0.02")}); // msg.value = 0.02 eth

    expect(await mice.totalMiceMinted()).to.equal(1);
  });
});

describe("DystoMice Test Mint Started Non-Owner Not Allowed", function () {

  it("should fail with non-owner", async function () {

    // Non-Owner - I guess accounts[0] is always mapped to onlyOwner in test functions
    await expect(mice.connect(accounts[1]).setStart(true)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});

describe("DystoMice Test Incorrect Mint Amount", function () {

  it("should fail with value error", async function () {
    await mice.setStart(true);

    // Incorrect mint amount - even setting a higher ether amount will fail
    await expect(mice.mintMice(1, { value: ethers.utils.parseEther("0.05")})).to.be.revertedWith('value error');
  });
});