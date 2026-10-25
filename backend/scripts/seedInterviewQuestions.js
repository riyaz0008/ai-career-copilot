import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import InterviewQuestion from "../models/InterviewQuestion.js";

const questions = [
    // TECHNICAL QUESTIONS
    {
        question: "Which keyword declares a block-scoped variable in JavaScript?",
        category: "Technical",
        options: ["var", "let", "define", "static"],
        correctAnswer: 1,
        explanation: "The let keyword declares a block-scoped variable.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which library is used to build React user interfaces?",
        category: "Technical",
        options: ["Express", "MongoDB", "React", "Node.js"],
        correctAnswer: 2,
        explanation: "React is a JavaScript library for building user interfaces.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which database is commonly used in the MERN stack?",
        category: "Technical",
        options: ["MongoDB", "Oracle Forms", "Redis only", "Excel"],
        correctAnswer: 0,
        explanation: "MongoDB is the database component of the MERN stack.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which HTTP method is commonly used to retrieve data?",
        category: "Technical",
        options: ["POST", "DELETE", "GET", "PATCH"],
        correctAnswer: 2,
        explanation: "GET is commonly used to retrieve a resource.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What does JSON.parse() do in JavaScript?",
        category: "Technical",
        options: [
            "Converts an object into a JSON string",
            "Parses a JSON string into a JavaScript value",
            "Deletes a JSON file",
            "Connects to MongoDB"
        ],
        correctAnswer: 1,
        explanation: "JSON.parse() converts valid JSON text into a JavaScript value.",
        difficulty: "Medium",
        active: true
    },

    // HR QUESTIONS
    {
        question: "What is the best approach when answering 'Tell me about yourself'?",
        category: "HR",
        options: [
            "Discuss unrelated personal details",
            "Give a concise summary of relevant education, skills and goals",
            "Only mention salary expectations",
            "Avoid answering the question"
        ],
        correctAnswer: 1,
        explanation: "A focused introduction should highlight relevant background, skills and career goals.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What should you do if you do not know an interview answer?",
        category: "HR",
        options: [
            "Invent an answer",
            "Blame the interviewer",
            "Be honest and explain how you would find the answer",
            "Leave the interview immediately"
        ],
        correctAnswer: 2,
        explanation: "Honesty and a clear problem-solving approach show professionalism.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "How should you respond to constructive feedback?",
        category: "HR",
        options: [
            "Ignore it",
            "Listen carefully and identify ways to improve",
            "Argue immediately",
            "Blame your teammates"
        ],
        correctAnswer: 1,
        explanation: "Accepting useful feedback demonstrates a willingness to learn.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is a good way to handle disagreement within a team?",
        category: "HR",
        options: [
            "Refuse to communicate",
            "Make the decision without discussion",
            "Listen to different views and discuss solutions respectfully",
            "Blame one teammate publicly"
        ],
        correctAnswer: 2,
        explanation: "Respectful communication helps teams resolve disagreements constructively.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "Why should you research a company before an interview?",
        category: "HR",
        options: [
            "To understand its work, role and values",
            "To avoid answering questions",
            "To memorize every employee's name",
            "To guarantee selection"
        ],
        correctAnswer: 0,
        explanation: "Company research helps you give relevant answers and ask informed questions.",
        difficulty: "Easy",
        active: true
    },

    // APTITUDE QUESTIONS
    {
        question: "A product costs 200 and its price increases to 250. What is the percentage increase?",
        category: "Aptitude",
        options: ["20%", "25%", "30%", "50%"],
        correctAnswer: 1,
        explanation: "Increase = 50. Percentage increase = (50 / 200) × 100 = 25%.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "If 5 workers complete a task in 10 days, how many worker-days are required?",
        category: "Aptitude",
        options: ["15", "25", "50", "100"],
        correctAnswer: 2,
        explanation: "Total worker-days = 5 × 10 = 50 worker-days.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Find the next number: 2, 4, 8, 16, __",
        category: "Aptitude",
        options: ["18", "24", "30", "32"],
        correctAnswer: 3,
        explanation: "Each number is multiplied by 2, so the next number is 32.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the average of 10, 20 and 30?",
        category: "Aptitude",
        options: ["15", "20", "25", "30"],
        correctAnswer: 1,
        explanation: "Average = (10 + 20 + 30) / 3 = 20.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "An item costs 500. What is its price after a 10% discount?",
        category: "Aptitude",
        options: ["450", "400", "475", "490"],
        correctAnswer: 0,
        explanation: "10% of 500 is 50, so the discounted price is 500 - 50 = 450.",
        difficulty: "Easy",
        active: true
    },

    // CODING QUESTIONS
    {
        question: "Which JavaScript method reverses the order of array elements?",
        category: "Coding",
        options: ["sort()", "reverse()", "shift()", "slice()"],
        correctAnswer: 1,
        explanation: "reverse() reverses an array in place.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What does the === operator check in JavaScript?",
        category: "Coding",
        options: [
            "Only whether values can be converted",
            "Only the variable names",
            "Strict equality of value and type",
            "Whether two variables are arrays"
        ],
        correctAnswer: 2,
        explanation: "Strict equality compares values without type coercion.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which data structure typically follows FIFO order?",
        category: "Coding",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correctAnswer: 1,
        explanation: "FIFO means First In, First Out, which is the usual queue behavior.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What does a return statement do inside a JavaScript function?",
        category: "Coding",
        options: [
            "Repeats the function forever",
            "Declares a new class",
            "Ends the function and can provide a value",
            "Always prints to the console"
        ],
        correctAnswer: 2,
        explanation: "return ends the function execution and optionally returns a value.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which loop is commonly used to iterate over array values in JavaScript?",
        category: "Coding",
        options: ["for...of", "try...catch", "switch...case", "class...extends"],
        correctAnswer: 0,
        explanation: "A for...of loop iterates over values from an iterable such as an array.",
        difficulty: "Easy",
        active: true
    },
        // ADDITIONAL TECHNICAL QUESTIONS (6-15)
    {
        question: "What does API stand for?",
        category: "Technical",
        options: [
            "Application Programming Interface",
            "Advanced Program Integration",
            "Application Process Internet",
            "Automated Programming Instruction"
        ],
        correctAnswer: 0,
        explanation: "API stands for Application Programming Interface, which allows software systems to communicate.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which Node.js module is commonly used to create an HTTP server?",
        category: "Technical",
        options: ["fs", "http", "path", "events"],
        correctAnswer: 1,
        explanation: "Node.js provides the built-in http module for creating HTTP servers.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which command installs a package using npm?",
        category: "Technical",
        options: ["npm start package", "npm install package", "node add package", "npm create package"],
        correctAnswer: 1,
        explanation: "The npm install command installs a package and its dependencies.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the primary purpose of MongoDB?",
        category: "Technical",
        options: [
            "Styling web pages",
            "Managing relational tables only",
            "Storing and querying document-oriented data",
            "Compiling JavaScript"
        ],
        correctAnswer: 2,
        explanation: "MongoDB is a document-oriented NoSQL database.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which React hook is used to manage state in a function component?",
        category: "Technical",
        options: ["useState", "useRoute", "useServer", "useClass"],
        correctAnswer: 0,
        explanation: "The useState hook adds state to React function components.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is middleware in Express.js?",
        category: "Technical",
        options: [
            "A database collection",
            "A function that can process requests and responses",
            "A CSS framework",
            "A React component only"
        ],
        correctAnswer: 1,
        explanation: "Express middleware can access the request, response, and next function.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "Which status code usually indicates a successful HTTP request?",
        category: "Technical",
        options: ["404", "500", "200", "403"],
        correctAnswer: 2,
        explanation: "HTTP 200 indicates that a request succeeded.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the purpose of a primary key in a relational database?",
        category: "Technical",
        options: [
            "To uniquely identify a row",
            "To style a database",
            "To encrypt every query",
            "To create a web page"
        ],
        correctAnswer: 0,
        explanation: "A primary key uniquely identifies each row in a relational table.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What does responsive web design help a website do?",
        category: "Technical",
        options: [
            "Run only on desktops",
            "Adapt its layout to different screen sizes",
            "Remove all images",
            "Replace the backend"
        ],
        correctAnswer: 1,
        explanation: "Responsive design adapts layouts to different devices and viewport sizes.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which Git command creates a copy of a remote repository locally?",
        category: "Technical",
        options: ["git push", "git merge", "git clone", "git status"],
        correctAnswer: 2,
        explanation: "git clone copies a repository into a local directory.",
        difficulty: "Easy",
        active: true
    },

    // ADDITIONAL HR QUESTIONS (6-15)
    {
        question: "What is a good response to the question 'What are your strengths?'",
        category: "HR",
        options: [
            "Say you have no strengths",
            "Give relevant strengths supported by examples",
            "List unrelated hobbies only",
            "Criticize other candidates"
        ],
        correctAnswer: 1,
        explanation: "Relevant strengths supported by examples make your answer more convincing.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "How should you explain a weakness in an interview?",
        category: "HR",
        options: [
            "Claim you have no weaknesses",
            "Choose a genuine development area and explain how you are improving",
            "Blame your previous manager",
            "Avoid the question completely"
        ],
        correctAnswer: 1,
        explanation: "A thoughtful answer shows self-awareness and willingness to improve.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What should you do if you have multiple deadlines?",
        category: "HR",
        options: [
            "Ignore all tasks",
            "Complete only the easiest task",
            "Prioritize by urgency and importance",
            "Wait until the deadlines pass"
        ],
        correctAnswer: 2,
        explanation: "Prioritizing tasks helps you manage time and meet important deadlines.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is an effective way to demonstrate teamwork?",
        category: "HR",
        options: [
            "Take credit for everyone's work",
            "Avoid sharing information",
            "Support teammates and communicate clearly",
            "Refuse to accept responsibilities"
        ],
        correctAnswer: 2,
        explanation: "Teamwork involves communication, cooperation, and shared responsibility.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Why is punctuality important at work?",
        category: "HR",
        options: [
            "It demonstrates reliability and respect for others' time",
            "It guarantees a promotion",
            "It removes the need for planning",
            "It replaces technical skills"
        ],
        correctAnswer: 0,
        explanation: "Punctuality helps demonstrate professionalism and reliability.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "How should you handle a mistake at work?",
        category: "HR",
        options: [
            "Hide it from everyone",
            "Blame a colleague",
            "Acknowledge it, communicate appropriately, and help fix it",
            "Repeat the same mistake"
        ],
        correctAnswer: 2,
        explanation: "Taking responsibility and helping resolve a mistake demonstrates accountability.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is a professional way to ask questions during an interview?",
        category: "HR",
        options: [
            "Interrupt every answer",
            "Ask relevant questions at an appropriate time",
            "Ask only about holidays",
            "Avoid listening to the interviewer"
        ],
        correctAnswer: 1,
        explanation: "Relevant questions demonstrate interest and preparation.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "How can you prepare for a behavioral interview question?",
        category: "HR",
        options: [
            "Prepare relevant examples using the STAR method",
            "Memorize unrelated definitions",
            "Avoid discussing experiences",
            "Give the same answer to every question"
        ],
        correctAnswer: 0,
        explanation: "STAR means Situation, Task, Action, and Result, a useful structure for behavioral answers.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "What should you do when working with a difficult teammate?",
        category: "HR",
        options: [
            "Stop communicating completely",
            "Discuss the issue respectfully and focus on solutions",
            "Publicly embarrass the teammate",
            "Refuse every shared task"
        ],
        correctAnswer: 1,
        explanation: "Respectful communication and a solution-focused approach can help resolve workplace conflict.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "What is a suitable way to discuss salary expectations?",
        category: "HR",
        options: [
            "Give an unreasonable figure without research",
            "Refuse to discuss compensation under any circumstances",
            "Research the role and share a reasonable, flexible range",
            "Ask the interviewer to decide your career"
        ],
        correctAnswer: 2,
        explanation: "Researching market rates helps you discuss compensation realistically and professionally.",
        difficulty: "Medium",
        active: true
    },

    // ADDITIONAL APTITUDE QUESTIONS (6-15)
    {
        question: "What is 15% of 200?",
        category: "Aptitude",
        options: ["15", "20", "30", "45"],
        correctAnswer: 2,
        explanation: "15% of 200 = (15 / 100) × 200 = 30.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "A car travels 120 km in 2 hours. What is its average speed?",
        category: "Aptitude",
        options: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
        correctAnswer: 2,
        explanation: "Average speed = distance / time = 120 / 2 = 60 km/h.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "If x + 7 = 15, what is the value of x?",
        category: "Aptitude",
        options: ["6", "7", "8", "9"],
        correctAnswer: 2,
        explanation: "Subtract 7 from both sides: x = 15 - 7 = 8.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Two numbers are in the ratio 2:3 and their sum is 25. What is the smaller number?",
        category: "Aptitude",
        options: ["5", "10", "12", "15"],
        correctAnswer: 1,
        explanation: "There are 5 total ratio parts. Each part is 25 / 5 = 5, so the smaller number is 2 × 5 = 10.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "A fair coin is tossed once. What is the probability of getting heads?",
        category: "Aptitude",
        options: ["0", "1/4", "1/2", "1"],
        correctAnswer: 2,
        explanation: "A fair coin has two equally likely outcomes, so the probability of heads is 1/2.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Find the next number: 3, 6, 11, 18, 27, __",
        category: "Aptitude",
        options: ["36", "38", "40", "42"],
        correctAnswer: 1,
        explanation: "The differences are 3, 5, 7, and 9. The next difference is 11, giving 27 + 11 = 38.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "A person buys an item for 400 and sells it for 500. What is the profit percentage?",
        category: "Aptitude",
        options: ["20%", "25%", "30%", "40%"],
        correctAnswer: 1,
        explanation: "Profit = 500 - 400 = 100. Profit percentage = (100 / 400) × 100 = 25%.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the simple interest on 1,000 at 5% per year for 2 years?",
        category: "Aptitude",
        options: ["50", "100", "150", "200"],
        correctAnswer: 1,
        explanation: "Simple interest = (Principal × Rate × Time) / 100 = (1000 × 5 × 2) / 100 = 100.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "If 8 machines produce 80 items in one hour, how many items do 4 similar machines produce in one hour?",
        category: "Aptitude",
        options: ["20", "30", "40", "60"],
        correctAnswer: 2,
        explanation: "Half the number of machines produces half the output: 80 / 2 = 40 items.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the median of 3, 7, 9, 11, 15?",
        category: "Aptitude",
        options: ["7", "9", "11", "15"],
        correctAnswer: 1,
        explanation: "The numbers are already ordered, and the middle value is 9.",
        difficulty: "Easy",
        active: true
    },

    // ADDITIONAL CODING QUESTIONS (6-15)
    {
        question: "Which JavaScript method adds an element to the end of an array?",
        category: "Coding",
        options: ["pop()", "push()", "shift()", "unshift()"],
        correctAnswer: 1,
        explanation: "push() adds one or more elements to the end of an array.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What does Array.isArray(value) check?",
        category: "Coding",
        options: [
            "Whether a value is a string",
            "Whether a value is an array",
            "Whether a value is null",
            "Whether a value is a function"
        ],
        correctAnswer: 1,
        explanation: "Array.isArray() returns true when the supplied value is an array.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which JavaScript method creates a new array by transforming each element?",
        category: "Coding",
        options: ["map()", "find()", "join()", "pop()"],
        correctAnswer: 0,
        explanation: "map() applies a callback to each element and returns a new array.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What does the filter() method return?",
        category: "Coding",
        options: [
            "Always a single number",
            "The original array with all elements deleted",
            "A new array containing elements that pass a test",
            "A string containing every element"
        ],
        correctAnswer: 2,
        explanation: "filter() returns a new array containing elements for which the callback returns a truthy value.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which JavaScript value represents the intentional absence of an object value?",
        category: "Coding",
        options: ["undefined", "null", "NaN", "false"],
        correctAnswer: 1,
        explanation: "null is commonly used to represent an intentional absence of a value.",
        difficulty: "Medium",
        active: true
    },
    {
        question: "What is the result of typeof 42 in JavaScript?",
        category: "Coding",
        options: ["integer", "float", "number", "numeric"],
        correctAnswer: 2,
        explanation: "JavaScript uses the number type for ordinary integer and floating-point numbers.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which data structure follows LIFO order?",
        category: "Coding",
        options: ["Queue", "Stack", "Linked list only", "Graph"],
        correctAnswer: 1,
        explanation: "LIFO means Last In, First Out, which is the typical behavior of a stack.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the purpose of try...catch in JavaScript?",
        category: "Coding",
        options: [
            "To repeat a loop",
            "To declare an array",
            "To handle exceptions",
            "To import CSS"
        ],
        correctAnswer: 2,
        explanation: "try...catch allows code to catch and handle exceptions.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "Which method converts a JavaScript object into a JSON string?",
        category: "Coding",
        options: [
            "JSON.parse()",
            "JSON.stringify()",
            "Object.convert()",
            "String.parse()"
        ],
        correctAnswer: 1,
        explanation: "JSON.stringify() serializes a JavaScript value into a JSON string.",
        difficulty: "Easy",
        active: true
    },
    {
        question: "What is the main purpose of a function parameter?",
        category: "Coding",
        options: [
            "To pass input into a function",
            "To style an HTML element",
            "To create a database automatically",
            "To stop the JavaScript engine"
        ],
        correctAnswer: 0,
        explanation: "Parameters allow functions to receive input values for processing.",
        difficulty: "Easy",
        active: true
    }
];

const seedInterviewQuestions = async () => {
    try {
        await connectDB();

        for (const question of questions) {
            await InterviewQuestion.updateOne(
                { question: question.question },
                { $setOnInsert: question },
                { upsert: true, runValidators: true }
            );
        }

        console.log(
            `Interview question seeding completed. Processed ${questions.length} questions.`
        );
    } catch (error) {
        console.error("Interview question seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedInterviewQuestions();