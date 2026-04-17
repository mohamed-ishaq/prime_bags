/**
 * Utility functions for user input validation
 */

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isStrongPassword = (password) => {
    // Password should be at least 6 characters
    // Example rule: you can expand this to require numbers, upper case, etc.
    return password && password.length >= 6;
};

const formatCurrency = (amount) => {
    return Number(amount).toFixed(2);
};

module.exports = {
    isValidEmail,
    isStrongPassword,
    formatCurrency
};
