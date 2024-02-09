web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
var account;
var authenticatedUser;
var votingEndTime;

web3.eth.getAccounts().then((f) => {
    account = f[0];
});

abi = [{"inputs":[{"internalType":"bytes32[]","name":"candidateNames","type":"bytes32[]"},{"internalType":"uint256","name":"durationMinutes","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"announceWinner","outputs":[{"internalType":"bytes32","name":"winner","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"candidateList","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasVotingEnded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"votingEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

contract = new web3.eth.Contract(abi, "0xb8D40217580270fd4ef3143e92b224912726523c");

candidates = {"Franklin": 'candidate-1', "Peter": 'candidate-2', "Ricky": 'candidate-3'};

function authenticateUser() {
    authenticatedUser = $("#userAddress").val();
    $("#loginSection").hide();
    $("#votingSection").show();
    startCountdownTimer();
}

function startCountdownTimer() {
    const now = Math.floor(Date.now() / 1000);
    const votingDuration = 10 * 60; // 10 min
    votingEndTime = now + votingDuration;

    $("#countdownTimer").show();

    const timerInterval = setInterval(function () {
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = votingEndTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            announceWinner();
        } else {
            const formattedTime = formatTime(remainingTime);
            $("#timer").text(formattedTime);
        }
    }, 1000);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(value) {
    return value < 10 ? `0${value}` : value;
}

async function voteForCandidate() {
    const currentTime = Math.floor(Date.now() / 1000);
    const candidateName = $("#candidate").val();

    if (currentTime < votingEndTime) {
        try {
            const gasEstimate = await contract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).estimateGas({ from: authenticatedUser });
            
            const transactionReceipt = await contract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({
                from: authenticatedUser,
                gas: gasEstimate + 10000,  // Add a buffer to the estimated gas
                gasPrice: web3.utils.toWei('20', 'gwei')
            });

            console.log('Transaction Receipt:', transactionReceipt);
            updateVoteCount(candidateName);
            $("#confirmationMessage").show();
        } catch (error) {
            console.error('Error:', error.message);
        }
    } else {
        console.log("Voting period has ended.");
    }
}

function updateVoteCount(candidateName) {
    let div_id = candidates[candidateName];
    contract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call().then((f) => {
        console.log(`Total votes for ${candidateName}: ${f}`);
    });
}

async function announceWinner() {
    // Add logic to determine the winner based on the votes received
    // For simplicity, let's assume the candidate with the most votes wins
    let winner;
    let maxVotes = 0;

    for (let candidate in candidates) {
        const votes = await contract.methods.totalVotesFor(web3.utils.asciiToHex(candidate)).call();
        console.log(`${candidate} has ${votes} votes.`);

        if (votes > maxVotes) {
            maxVotes = votes;
            winner = candidate;
        }
    }

    setTimeout(function () {
        console.log(`The winner is: ${winner} with ${maxVotes} votes!`);
    }, 3000); // Wait for 3 seconds to ensure all votes are processed
}

$(document).ready(function () {
    candidateNames = Object.keys(candidates);

    for (var i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i];
        updateVoteCount(name);
    }
});