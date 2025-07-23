// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RaceTrack is ReentrancyGuard, Ownable {
    
    // Events
    event BetPlaced(address indexed player, uint8 shipId, uint256 amount);
    event RaceStarted(uint256 raceId);
    event RaceFinished(uint256 raceId, uint8 winner, uint256 totalPrize);
    event WinningsClaimed(address indexed player, uint256 amount);
    
    // Structs
    struct Ship {
        uint8 id;
        string name;
        uint16 initialSpeed;
        uint8 acceleration;
        string chaosFactor;
        uint8 chaosChance;
    }
    
    struct Bet {
        address player;
        uint8 shipId;
        uint256 amount;
        bool claimed;
    }
    
    struct Race {
        uint256 id;
        uint8 winner;
        uint256 totalBets;
        uint256 totalPrize;
        bool finished;
        mapping(uint8 => uint256) shipBets;
        mapping(address => Bet[]) playerBets;
    }
    
    // State variables
    uint256 public currentRaceId = 0;
    uint256 public constant RACE_TURNS = 10;
    uint256 public constant TRACK_DISTANCE = 1000;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    uint256 public houseFee = 5; // 5% house fee
    
    mapping(uint256 => Race) public races;
    mapping(uint8 => Ship) public ships;
    
    // Constructor - Initialize ships
    constructor() Ownable(msg.sender) {
        _initializeShips();
    }
    
    function _initializeShips() internal {
        // Ship 1: The Comet
        ships[1] = Ship(1, "The Comet", 78, 11, "Overdrive", 10);
        
        // Ship 2: The Juggernaut  
        ships[2] = Ship(2, "The Juggernaut", 85, 9, "Unstable Engine", 25);
        
        // Ship 3: The Shadow
        ships[3] = Ship(3, "The Shadow", 82, 14, "Slipstreamer", 20);
        
        // Ship 4: The Phantom
        ships[4] = Ship(4, "The Phantom", 69, 8, "Quantum Tunneling", 8);
        
        // Ship 5: The Phoenix
        ships[5] = Ship(5, "The Phoenix", 90, 12, "Last Stand Protocol", 20);
        
        // Ship 6: The Vanguard
        ships[6] = Ship(6, "The Vanguard", 80, 10, "Micro-warp Engine", 65);
        
        // Ship 7: The Wildcard
        ships[7] = Ship(7, "The Wildcard", 80, 13, "Rogue AI", 20);
        
        // Ship 8: The Apex
        ships[8] = Ship(8, "The Apex", 95, 12, "Graviton Brake", 75);
    }
    
    // Place a bet on a ship
    function placeBet(uint8 shipId) external payable nonReentrant {
        require(shipId >= 1 && shipId <= 8, "Invalid ship ID");
        require(msg.value >= MIN_BET, "Bet too small");
        require(msg.value <= MAX_BET, "Bet too large");
        require(!races[currentRaceId].finished, "Race already finished");
        
        Race storage race = races[currentRaceId];
        
        // Add bet to race
        race.playerBets[msg.sender].push(Bet({
            player: msg.sender,
            shipId: shipId,
            amount: msg.value,
            claimed: false
        }));
        
        race.shipBets[shipId] += msg.value;
        race.totalBets += msg.value;
        
        emit BetPlaced(msg.sender, shipId, msg.value);
    }
    
    // Start a new race (only owner can call this)
    function startNewRace() external onlyOwner {
        require(races[currentRaceId].totalBets > 0, "No bets placed");
        require(!races[currentRaceId].finished, "Current race not finished");
        
        currentRaceId++;
        Race storage newRace = races[currentRaceId];
        newRace.id = currentRaceId;
        newRace.winner = 0;
        newRace.totalBets = 0;
        newRace.totalPrize = 0;
        newRace.finished = false;
        
        emit RaceStarted(currentRaceId);
    }
    
    // Simulate race and determine winner (only owner can call this)
    function finishRace(uint8 winner) external onlyOwner {
        require(winner >= 1 && winner <= 8, "Invalid winner");
        require(!races[currentRaceId].finished, "Race already finished");
        
        Race storage race = races[currentRaceId];
        require(race.totalBets > 0, "No bets in current race");
        
        race.winner = winner;
        race.finished = true;
        
        // Calculate total prize (minus house fee)
        uint256 houseFeeAmount = (race.totalBets * houseFee) / 100;
        race.totalPrize = race.totalBets - houseFeeAmount;
        
        emit RaceFinished(currentRaceId, winner, race.totalPrize);
    }
    
    // Claim winnings for a specific race
    function claimWinnings(uint256 raceId) external nonReentrant {
        Race storage race = races[raceId];
        require(race.finished, "Race not finished");
        
        Bet[] storage playerBets = race.playerBets[msg.sender];
        require(playerBets.length > 0, "No bets found");
        
        uint256 totalWinnings = 0;
        
        for (uint i = 0; i < playerBets.length; i++) {
            Bet storage bet = playerBets[i];
            if (!bet.claimed && bet.shipId == race.winner) {
                // Calculate winnings based on bet proportion
                uint256 shipTotalBets = race.shipBets[bet.shipId];
                uint256 winnings = (bet.amount * race.totalPrize) / shipTotalBets;
                totalWinnings += winnings;
                bet.claimed = true;
            }
        }
        
        require(totalWinnings > 0, "No winnings to claim");
        
        (bool success, ) = msg.sender.call{value: totalWinnings}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(msg.sender, totalWinnings);
    }
    
    // View functions
    function getRaceInfo(uint256 raceId) external view returns (
        uint8 winner,
        uint256 totalBets,
        uint256 totalPrize,
        bool finished
    ) {
        Race storage race = races[raceId];
        return (race.winner, race.totalBets, race.totalPrize, race.finished);
    }
    
    function getShipBets(uint256 raceId, uint8 shipId) external view returns (uint256) {
        return races[raceId].shipBets[shipId];
    }
    
    function getPlayerBets(uint256 raceId, address player) external view returns (Bet[] memory) {
        return races[raceId].playerBets[player];
    }
    
    function getShip(uint8 shipId) external view returns (Ship memory) {
        return ships[shipId];
    }
    
    // Owner functions
    function setHouseFee(uint256 newFee) external onlyOwner {
        require(newFee <= 10, "Fee too high");
        houseFee = newFee;
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
    
    // Receive function
    receive() external payable {
        revert("Direct deposits not allowed");
    }
} 