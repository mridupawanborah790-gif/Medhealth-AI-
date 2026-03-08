
const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success.",
    "The journey of a thousand miles begins with a single step.",
    "Believe you can and you're halfway there.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret to getting ahead is getting started.",
    "Strive for progress, not perfection.",
    "It's going to be a journey. It's not a sprint to get in shape.",
    "Your health is an investment, not an expense."
];

export const getRandomQuote = (): string => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
};
