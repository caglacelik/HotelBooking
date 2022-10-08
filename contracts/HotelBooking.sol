// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract HotelBooking {
    
     struct Room { 
         uint number; 
         uint price;
         bool available;
         }

    address payable public immutable owner;

    constructor () {
        owner = payable(msg.sender);
    }

         Room[] public rooms;
         mapping(address => Room) public books;

        event Log(string message, address indexed sender, uint price);

        function createRoom(uint _num, uint _price) external OnlyOwner {
            rooms.push(Room(_num, _price, true));
        }

        function changeAvail(uint _index, bool _avail) internal {
            rooms[_index].available = _avail; 
        }

        function book(uint _index) external payable Cost(_index) Avail(_index) {
            (bool sent, ) = owner.call{value: msg.value}("");
            require(sent, "Fail");
            changeAvail(_index, false);
            books[msg.sender] = rooms[_index];

            emit Log("book", msg.sender, msg.value);
        }

        function complete(uint _index) external {
            require(books[msg.sender].number == rooms[_index].number, "Not your book");
            delete books[msg.sender];
            changeAvail(_index, true);
        } 

        modifier OnlyOwner {
            require(msg.sender == owner, "Not an owner");
            _;
        }

        modifier Cost(uint _index) {
            require(msg.value == rooms[_index].price, "Invalid value");
            _;
        }

        modifier Avail(uint _index) {
            require(rooms[_index].available == true, "Room is full");
            _;
        }
}



    





    

