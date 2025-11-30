/**
 * Calculate score for a test attempt
 */
export function calculateScore(
    questions: Array<{ id: string; correct_answer: string; points: number }>,
    answers: Record<string, string>
): { score: number; totalPoints: number; percentage: number; passed: boolean; passingScore: number } {
    let earnedPoints = 0
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

    questions.forEach((question) => {
        const userAnswer = answers[question.id]
        if (userAnswer && userAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()) {
            earnedPoints += question.points
        }
    })

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    return {
        score: earnedPoints,
        totalPoints,
        percentage,
        passed: false, // Will be determined by comparing with test's passing_score
        passingScore: 70 // Default, should be passed from test data
    }
}
