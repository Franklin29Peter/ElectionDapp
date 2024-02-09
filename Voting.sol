pragma solidity ^0.6.4;

contract Voting {
    mapping (bytes32 => uint256) public votesReceived;
    mapping (address => bool) public hasVoted;

    bytes32[] public candidateList;
    uint256 public votingEndTime;

    constructor(bytes32[] memory candidateNames, uint256 durationMinutes) public {
        // candidateNames will be provided while deployment
        candidateList = candidateNames;
        // Set the voting end time based on the provided duration
        votingEndTime = now + (durationMinutes * 1 minutes);
    }

    modifier onlyBeforeVotingEnd() {
        require(now < votingEndTime, "Voting has ended");
        _;
    }

    function totalVotesFor(bytes32 candidate) view public returns (uint256) {
        require(validCandidate(candidate));
        return votesReceived[candidate];
    }

    function voteForCandidate(bytes32 candidate) public onlyBeforeVotingEnd {
        require(validCandidate(candidate));
        require(!hasVoted[msg.sender], "You have already voted");

        votesReceived[candidate] += 1;
        hasVoted[msg.sender] = true;
    }

    function validCandidate(bytes32 candidate) view public returns (bool) {
        for (uint i = 0; i < candidateList.length; i++) {
            if (candidateList[i] == candidate) {
                return true;
            }
        }
        return false;
    }

    function hasVotingEnded() public view returns (bool) {
        return now >= votingEndTime;
    }

    // Add a function to announce the winner or perform any other actions after voting ends
    function announceWinner() public view returns (bytes32 winner) {
        require(hasVotingEnded(), "Voting is still ongoing");
        
        // Logic to determine the winner based on the votes received
        // For simplicity, let's assume the candidate with the most votes wins
        uint256 maxVotes = 0;
        for (uint i = 0; i < candidateList.length; i++) {
            if (votesReceived[candidateList[i]] > maxVotes) {
                maxVotes = votesReceived[candidateList[i]];
                winner = candidateList[i];
            }
        }

        return winner;
    }
}