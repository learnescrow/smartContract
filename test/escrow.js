const { expect } = require("chai");

describe("Escrow", function () {
  let Escrow, escrow, buyer, seller;

  beforeEach(async function () {
    [buyer, seller] = await ethers.getSigners();
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.connect(buyer).deploy(seller.address);
    
  });

  it("should set buyer and seller addresses", async function () {
    expect(await escrow.buyer()).to.equal(buyer.address);
    expect(await escrow.seller()).to.equal(seller.address);
  });

  it("should allow buyer to fund escrow", async function () {
    await escrow.connect(buyer).fund({ value: ethers.parseEther("1") });
    expect(await escrow.isFunded()).to.equal(true);
    expect(await escrow.amount()).to.equal(ethers.parseEther("1"));
  });

  it("should not allow non-buyer to fund", async function () {
    await expect(
      escrow.connect(seller).fund({ value: ethers.parseEther("1") })
    ).to.be.revertedWith("Only buyer can fund");
  });

  it("should release funds to seller", async function () {
    await escrow.connect(buyer).fund({ value: ethers.parseEther("1") });
    await escrow.connect(buyer).releaseFunds();
    expect(await escrow.isReleased()).to.equal(true);
  });

  it("should allow seller to refund", async function () {
    await escrow.connect(buyer).fund({ value: ethers.parseEther("1") });
    await escrow.connect(seller).refund();
    expect(await escrow.isFunded()).to.equal(false);
  });
});
