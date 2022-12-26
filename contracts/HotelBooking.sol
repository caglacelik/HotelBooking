// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// This contract created for hotel owners and their customers to manage their booking operations

contract HotelBooking {

// Room struct which contains room informations like;
// number (uint) : room number
// price (uint): room price
// available (bool) : room's availability

     struct Room { 
         uint number; 
         uint price;
         bool available;
         }

// owner of the contract (address payable) : hotel owner
    address payable public immutable owner;

// DI with constructor
    constructor () {
        owner = payable(msg.sender);
    }

// Rooms array is created for holding room's infos
         Room[] public rooms;

// Mapping customer address to room represents the book itself
         mapping(address => Room) public books;

// Log event is created for logging changes on the chain
        event Log(string message, address indexed sender, uint price);


// createRoom (func) : This function is created for hotel owner to allow creating a room with the parameters which Room struct contains
// Every created room's availablity assigned to true that means it is empty
// Only owner of the hotel can create a room
        function createRoom(uint _num, uint _price) external OnlyOwner {
            rooms.push(Room(_num, _price, true));
        }

// changeAvail (func) : This function is created for changing room availability and marked as internal for internal usage
        function changeAvail(uint _index, bool _avail) internal {
            rooms[_index].available = _avail; 
        }

// book (func) : This function is created for customers to book a room with the given parameters
// _index : The index of the room in the rooms array

// Sends room price to the owner from the sender
// Changes the availability of the room
// Maps the customer address to the booked room
// Emits the Log event  
        function book(uint _index) external payable Cost(_index) Avail(_index) {
            (bool sent, ) = owner.call{value: msg.value}("");
            require(sent, "Fail");
            changeAvail(_index, false);
            books[msg.sender] = rooms[_index];

            emit Log("book", msg.sender, msg.value);
        }

// complete (func) : This function is created for completion of the booking process with the given parameters
// _index : Index of the room which is booked by the customer

// Changes the availablity of the room
        function complete(uint _index) external {
            require(books[msg.sender].number == rooms[_index].number, "Not your book");
            delete books[msg.sender];
            changeAvail(_index, true);
        } 

// OnlyOwner (modifier) : This modifier is created for checking the sender is owner 
        modifier OnlyOwner {
            require(msg.sender == owner, "Not an owner");
            _;
        }
// Cost (modifier) : This modifier is created for checking the room's price which is equal to value prop coming from the sender or not 
        modifier Cost(uint _index) {
            require(msg.value == rooms[_index].price, "Invalid value");
            _;
        }
// Avail (modifier) : This modifier is created for checking the room's availability 
        modifier Avail(uint _index) {
            require(rooms[_index].available == true, "Room is full");
            _;
        }
}



    





    

