import InterviewQuestion from "../models/InterviewQuestion.js";

// Start Mock Test - Get 10 Random Questions
export const startInterview = async (req, res) => {
    try {
        const questions = await InterviewQuestion.aggregate([
            {
                $match: {
                    active: true
                }
            },
            {
                $sample: {
                    size: 10
                }
            },
            {
                $project: {
                    question: 1,
                    category: 1,
                    options: 1,
                    difficulty: 1
                }
            }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({
                message: "No interview questions available.",
                status: 0
            });
        }

        if (questions.length < 10) {
            return res.status(200).json({
                message: `Only ${questions.length} questions are currently available.`,
                status: 1,
                data: questions
            });
        }

        return res.status(200).json({
            message: "Interview questions fetched successfully.",
            status: 1,
            data: questions
        });
    } catch (error) {
        console.error("Start Interview Error:", error);

        return res.status(500).json({
            message: "Failed to start interview test.",
            status: 0,
            error: error.message
        });
    }
};


// Submit Mock Test Answers and Calculate Result
export const submitInterview = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                message: "Please submit your answers.",
                status: 0
            });
        }

        const questionIds = answers.map((item) => item.questionId);

        if (
            answers.some(
                (item) =>
                    !item.questionId ||
                    !Number.isInteger(item.selectedAnswer) ||
                    item.selectedAnswer < 0 ||
                    item.selectedAnswer > 3
            )
        ) {
            return res.status(400).json({
                message: "Every answer must contain a questionId and a valid option index (0-3).",
                status: 0
            });
        }

        if (new Set(questionIds.map(String)).size !== questionIds.length) {
            return res.status(400).json({
                message: "Duplicate question answers are not allowed.",
                status: 0
            });
        }

        const validIds = questionIds.every((id) =>
            /^[0-9a-fA-F]{24}$/.test(String(id))
        );

        if (!validIds) {
            return res.status(400).json({
                message: "Invalid question ID.",
                status: 0
            });
        }

        const questions = await InterviewQuestion.find({
            _id: { $in: questionIds },
            active: true
        });

        if (questions.length !== answers.length) {
            return res.status(400).json({
                message: "Some questions are invalid or no longer active.",
                status: 0
            });
        }

        const questionMap = new Map(
            questions.map((question) => [
                question._id.toString(),
                question
            ])
        );

        let correctCount = 0;

        const review = answers.map((answer) => {
            const question = questionMap.get(
                String(answer.questionId)
            );

            const isCorrect =
                answer.selectedAnswer === question.correctAnswer;

            if (isCorrect) {
                correctCount++;
            }

            return {
                questionId: question._id,
                question: question.question,
                category: question.category,
                options: question.options,
                selectedAnswer: answer.selectedAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            };
        });

        const totalQuestions = questions.length;
        const wrongCount = totalQuestions - correctCount;
        const percentage = Number(
            ((correctCount / totalQuestions) * 100).toFixed(2)
        );

        return res.status(200).json({
            message: "Interview test evaluated successfully.",
            status: 1,
            data: {
                totalQuestions,
                correctCount,
                wrongCount,
                percentage,
                review
            }
        });
    } catch (error) {
        console.error("Submit Interview Error:", error);

        return res.status(500).json({
            message: "Failed to evaluate interview test.",
            status: 0,
            error: error.message
        });
    }
};