const HotelBooking = artifacts.require("HotelBooking");
let instance;

before(async () => {
  instance = await HotelBooking.deployed();
});

contract("HotelBooking", (accounts) => {
  it("New room should be reach from rooms array", async () => {
    await instance.createRoom(101, 1000);
    let room = await instance.rooms.call(0);

    assert.equal(room.number, 101);
    assert.equal(room.price, 1000);
  });

  it("Should be revert: Not an owner", async () => {
    try {
      await instance.createRoom(268, 3000, { from: accounts[1] });
    } catch (err) {
      assert(err);
    }
  });

  it("Owner should be account[0]", async () => {
    let owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  it("Should booking infos save correctly", async () => {
    await instance.createRoom(325, 6500);
    let room = await instance.rooms.call(1);

    await instance.book(1, {
      from: accounts[1],
      value: "6500",
    });
    let book = await instance.books.call(accounts[1]);

    assert.equal(book.number, 325);
    assert.equal(room.number, 325);
    assert.equal(Number(book.price), Number(room.price));
    assert.equal(book.available, false);
  });

  it("Should be revert: Not your book", async () => {
    await instance.createRoom(386, 7600);
    try {
      await instance.complete(2, accounts[1], { from: accounts[0] });
    } catch (err) {
      assert(err);
    }
  });

  it("Should be convert to room availability to true", async () => {
    await instance.createRoom(265, 3000);

    await instance.book(3, {
      from: accounts[1],
      value: "3000",
    });

    await instance.complete(3, {
      from: accounts[1],
    });

    let room = await instance.rooms.call(3);
    let book = await instance.books.call(accounts[1]);

    assert.equal(book.price, 0);
    assert.equal(room.available, true);
  });

  it("Should increase owner balance by room price", async () => {
    await instance.createRoom(502, 4500);
    let balance = await web3.eth.getBalance(accounts[0]);

    await instance.book(4, {
      from: accounts[3],
      value: "4500",
    });

    let newBalance = await web3.eth.getBalance(accounts[0]);

    assert.equal(Number(balance) + 4500, Number(newBalance));
    assert.ok(newBalance > balance);
  });
});
