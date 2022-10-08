// HotelBooking contract is tested with the below functions using Mocha

const HotelBooking = artifacts.require("HotelBooking");
let instance;

before(async () => {
  instance = await HotelBooking.deployed();
});

contract("HotelBooking", (accounts) => {
  // 1. Create a new Room
  // 2. Get the first element of the rooms array
  // 3. Assert their values are the same

  it("New room should be reach from rooms array", async () => {
    await instance.createRoom(101, 1000);
    let room = await instance.rooms.call(0);

    assert.equal(room.number, 101);
    assert.equal(room.price, 1000);
  });

  it("Should be revert: Not an owner", async () => {
    // 1. Try to create a new Room with the account who is not an owner
    // 2. Catch the error
    // 3. Assert the error

    try {
      await instance.createRoom(268, 3000, { from: accounts[1] });
    } catch (err) {
      assert(err);
    }
  });

  it("Owner should be account[0]", async () => {
    // 1. Get the owner from contract object
    // 2. Assert addresses of the owner and accounts[0] are same

    let owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  it("Should booking infos save correctly", async () => {
    // 1. Create a new Room
    // 2. Get the room infos of the rooms array
    // 3. Make a book with accounts[1] and a created room
    // 4. Call this book via accounts[1] address
    // 5. Compare the numbers & prices of the room and book objects
    // 6. Assert the room availability is false

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
    // 1. Create a new Room
    // 2. Try to call complete function with the book which is not own the caller
    // 3. Catch the error
    // 4. Assert the error

    await instance.createRoom(386, 7600);
    try {
      await instance.complete(2, accounts[1], { from: accounts[0] });
    } catch (err) {
      assert(err);
    }
  });

  it("Should be convert to room availability to true", async () => {
    // 1. Create a new Room
    // 2. Make a book with accounts[1] and a created room
    // 3. Complete the booking process with calling complete function
    // 4. Get the room and the book objects
    // 5. Assert room availability must be true
    // 6. Assert the book' props set to their default values

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
    // 1. Create a new Room
    // 2. Get the balance of the owner
    // 3. Make a book to this room
    // 4. Get the new balance of the owner
    // 5. Compare the balances via the room's price which is : 4500

    await instance.createRoom(502, 4500);
    let balance = await web3.eth.getBalance(accounts[0]);

    await instance.book(4, {
      from: accounts[3],
      value: "4500",
    });

    let newBalance = await web3.eth.getBalance(accounts[0]);

    assert.ok(newBalance > balance);
    assert.equal(Number(balance) + 4500, Number(newBalance));
  });
});
