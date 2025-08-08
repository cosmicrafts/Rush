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
    event ChaosEvent(uint8 shipId, string chaosFactor, uint256 turn);
    
    // Structs
    struct Ship {
        uint8 id;
        string name;
        uint16 initialSpeed;
        uint8 acceleration;
        string chaosFactor;
        uint8 chaosChance;
    }
    
    struct RaceShip {
        uint8 id;
        uint16 currentSpeed;
        uint256 distance;
        uint8 finalTurn;
        bool finished;
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
        uint256 startTime;
        uint256 endTime;
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
    uint256 public constant RACE_DURATION = 5 minutes; // Time for betting phase
    
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
        
        Race storage race = races[currentRaceId];
        require(!race.finished, "Race already finished");
        require(block.timestamp < race.startTime + RACE_DURATION, "Betting period ended");
        
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
    
    // Start a new race (can be called by anyone after betting period)
    function startNewRace() external {
        Race storage currentRace = races[currentRaceId];
        
        // Check if current race is ready to start
        if (currentRaceId > 0) {
            require(currentRace.totalBets > 0, "No bets placed");
            require(!currentRace.finished, "Current race not finished");
            require(block.timestamp >= currentRace.startTime + RACE_DURATION, "Betting period not ended");
            
            // Auto-finish current race if not already finished
            if (!currentRace.finished) {
                _finishRace(currentRaceId);
            }
        }
        
        // Start new race
        currentRaceId++;
        Race storage newRace = races[currentRaceId];
        newRace.id = currentRaceId;
        newRace.winner = 0;
        newRace.totalBets = 0;
        newRace.totalPrize = 0;
        newRace.finished = false;
        newRace.startTime = block.timestamp;
        newRace.endTime = 0;
        
        emit RaceStarted(currentRaceId);
    }
    
    // Finish race with on-chain simulation
    function _finishRace(uint256 raceId) internal {
        Race storage race = races[raceId];
        require(!race.finished, "Race already finished");
        require(race.totalBets > 0, "No bets in current race");
        
        // Run on-chain race simulation
        uint8 winner = _simulateRace(raceId);
        
        race.winner = winner;
        race.finished = true;
        race.endTime = block.timestamp;
        
        // Calculate total prize (minus house fee)
        uint256 houseFeeAmount = (race.totalBets * houseFee) / 100;
        race.totalPrize = race.totalBets - houseFeeAmount;
        
        emit RaceFinished(raceId, winner, race.totalPrize);
    }
    
    // On-chain race simulation
    function _simulateRace(uint256 raceId) internal returns (uint8) {
        RaceShip[8] memory raceShips;
        
        // Initialize race ships
        for (uint8 i = 1; i <= 8; i++) {
            Ship memory ship = ships[i];
            raceShips[i-1] = RaceShip({
                id: ship.id,
                currentSpeed: ship.initialSpeed,
                distance: 0,
                finalTurn: 0,
                finished: false
            });
        }
        
        // Run 10 turns
        for (uint8 turn = 1; turn <= RACE_TURNS; turn++) {
            // Sort ships by distance for ranking
            _sortShipsByDistance(raceShips);
            
            for (uint8 i = 0; i < 8; i++) {
                if (raceShips[i].finished) continue;
                
                RaceShip memory ship = raceShips[i];
                Ship memory shipData = ships[ship.id];
                
                uint16 turnAcceleration = shipData.acceleration;
                uint16 turnSpeed = ship.currentSpeed;
                
                // Check for chaos factor
                if (_shouldTriggerChaos(shipData.chaosChance, raceId, turn, ship.id)) {
                    (turnSpeed, turnAcceleration) = _applyChaosFactor(
                        shipData.chaosFactor,
                        turnSpeed,
                        turnAcceleration,
                        ship.distance,
                        turn,
                        raceShips
                    );
                    
                    // Handle Slipstreamer effect (needs ranking info)
                    if (keccak256(bytes(shipData.chaosFactor)) == keccak256(bytes("Slipstreamer"))) {
                        // Find current rank of this ship
                        uint8 currentRank = 0;
                        for (uint8 j = 0; j < 8; j++) {
                            if (raceShips[j].id == ship.id) {
                                currentRank = j + 1;
                                break;
                            }
                        }
                        // If not in 1st or 2nd place, get speed boost
                        if (currentRank > 2) {
                            turnSpeed += 50;
                        }
                    }
                    
                    emit ChaosEvent(ship.id, shipData.chaosFactor, turn);
                }
                
                // Apply speed and acceleration
                raceShips[i].currentSpeed += turnAcceleration;
                uint256 moveAmount = turnSpeed;
                
                // Check for Graviton Brake effect (being slowed by leader)
                if (_isBeingBraked(ship.id, raceShips, raceId, turn)) {
                    moveAmount = moveAmount / 2;
                }
                
                // Handle Quantum Tunneling teleport
                if (keccak256(bytes(shipData.chaosFactor)) == keccak256(bytes("Quantum Tunneling")) && 
                    _shouldTriggerChaos(shipData.chaosChance, raceId, turn, ship.id)) {
                    raceShips[i].distance += TRACK_DISTANCE / 4; // Teleport 25% of track
                } else {
                    raceShips[i].distance += moveAmount;
                }
                
                // Check if ship finished
                if (raceShips[i].distance >= TRACK_DISTANCE && !raceShips[i].finished) {
                    raceShips[i].distance = TRACK_DISTANCE;
                    raceShips[i].finalTurn = turn;
                    raceShips[i].finished = true;
                }
            }
        }
        
        // Determine winner
        return _determineWinner(raceShips);
    }
    
    // Sort ships by distance (bubble sort for simplicity)
    function _sortShipsByDistance(RaceShip[8] memory ships) internal pure {
        for (uint8 i = 0; i < 7; i++) {
            for (uint8 j = 0; j < 7 - i; j++) {
                if (ships[j].distance < ships[j + 1].distance) {
                    RaceShip memory temp = ships[j];
                    ships[j] = ships[j + 1];
                    ships[j + 1] = temp;
                }
            }
        }
    }
    
    // Check if chaos factor should trigger
    function _shouldTriggerChaos(uint8 chance, uint256 raceId, uint8 turn, uint8 shipId) internal view returns (bool) {
        bytes32 seed = keccak256(abi.encodePacked(raceId, turn, shipId, blockhash(block.number - 1)));
        uint256 random = uint256(seed) % 100;
        return random < chance;
    }
    
    // Apply chaos factor effects
    function _applyChaosFactor(
        string memory chaosFactor,
        uint16 speed,
        uint16 acceleration,
        uint256 distance,
        uint8 turn,
        RaceShip[8] memory ships
    ) internal pure returns (uint16 newSpeed, uint16 newAcceleration) {
        newSpeed = speed;
        newAcceleration = acceleration;
        
        if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Overdrive"))) {
            newSpeed *= 2;
        } else if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Unstable Engine"))) {
            newAcceleration *= 3;
        } else if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Slipstreamer"))) {
            // Check if ship is not in 1st or 2nd place
            // This will be handled in the main simulation loop where we have access to current rankings
        } else if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Quantum Tunneling"))) {
            // Teleport 25% of track distance - this will be applied directly to distance
            // We'll handle this in the main simulation loop
        } else if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Last Stand Protocol"))) {
            if (turn >= RACE_TURNS - 3) {
                newSpeed *= 4;
            }
        } else if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Micro-warp Engine"))) {
            newAcceleration *= 2;
        } else if (keccak256(bytes(chaosFactor)) == keccak256(bytes("Rogue AI"))) {
            // Random effect based on ship ID and turn
            uint8 effect = uint8(uint256(keccak256(abi.encodePacked(ships[0].id, turn))) % 4);
            if (effect == 0) newSpeed *= 2;
            else if (effect == 1) newSpeed /= 2;
            else if (effect == 2) newAcceleration *= 2;
            else newAcceleration = 0;
        }
        // Graviton Brake is handled separately in _isBeingBraked
    }
    
    // Check if ship is being slowed by Graviton Brake
    function _isBeingBraked(uint8 shipId, RaceShip[8] memory raceShips, uint256 raceId, uint8 turn) internal view returns (bool) {
        // Check if leader has Graviton Brake and triggers it
        if (raceShips[0].id == shipId) return false; // Leader cannot be braked
        
        Ship memory leaderShip = ships[raceShips[0].id];
        if (keccak256(bytes(leaderShip.chaosFactor)) != keccak256(bytes("Graviton Brake"))) return false;
        
        if (_shouldTriggerChaos(leaderShip.chaosChance, raceId, turn, raceShips[0].id)) {
            // Check if this ship is in 2nd place
            return raceShips[1].id == shipId;
        }
        
        return false;
    }
    
    // Determine winner from race results
    function _determineWinner(RaceShip[8] memory ships) internal pure returns (uint8) {
        // First, check for ships that finished
        uint8 bestFinisher = 0;
        uint8 bestTurn = 255;
        
        for (uint8 i = 0; i < 8; i++) {
            if (ships[i].finished && ships[i].finalTurn < bestTurn) {
                bestTurn = ships[i].finalTurn;
                bestFinisher = ships[i].id;
            }
        }
        
        if (bestFinisher != 0) {
            return bestFinisher;
        }
        
        // If no ships finished, return the one with highest distance
        uint8 bestShip = ships[0].id;
        uint256 bestDistance = ships[0].distance;
        
        for (uint8 i = 1; i < 8; i++) {
            if (ships[i].distance > bestDistance) {
                bestDistance = ships[i].distance;
                bestShip = ships[i].id;
            }
        }
        
        return bestShip;
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
        bool finished,
        uint256 startTime,
        uint256 endTime
    ) {
        Race storage race = races[raceId];
        return (race.winner, race.totalBets, race.totalPrize, race.finished, race.startTime, race.endTime);
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
    
    function getCurrentRaceStatus() external view returns (
        uint256 raceId,
        uint256 totalBets,
        bool finished,
        uint256 timeRemaining
    ) {
        Race storage race = races[currentRaceId];
        uint256 timeRemaining = 0;
        
        if (!race.finished && race.startTime > 0) {
            if (block.timestamp < race.startTime + RACE_DURATION) {
                timeRemaining = race.startTime + RACE_DURATION - block.timestamp;
            }
        }
        
        return (currentRaceId, race.totalBets, race.finished, timeRemaining);
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