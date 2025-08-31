// packages/backend/ActionParser.js

function parseAction(command) {
    const lowerCaseCommand = command.toLowerCase();

    // Check for user's personal balance
    if (lowerCaseCommand.includes('my balance')) {
        return { "intent": "CHECK_USER_ETH_BALANCE", "parameters": {} };
    }

    // Check for "deposit" intent and extract the amount
    if (lowerCaseCommand.includes('deposit')) {
        const amountMatch = lowerCaseCommand.match(/(\d+(\.\d+)?)/);
        const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
        if (amount > 0) {
            return { "intent": "DEPOSIT", "parameters": { "amount": amount, "token": "ETH" } };
        }
    }

    // If no specific command is found, return null
    return null;
}

module.exports = { parseAction };