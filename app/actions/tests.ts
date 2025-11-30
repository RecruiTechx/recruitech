"use server"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface TestData {
    position_id: string
    title: string
    description?: string
    difficulty: 'easy' | 'medium' | 'hard'
    duration_minutes: number
    passing_score: number
    is_active?: boolean
}

export interface QuestionData {
    test_id: string
    question_type: 'mcq' | 'short_answer' | 'coding'
    question_text: string
    options?: Record<string, string>
    correct_answer: string
    explanation?: string
    points: number
    order_index: number
}

// ============ ADMIN FUNCTIONS ============

export async function getAllTests() {
    try {
        const { data, error } = await supabaseAdmin
            .from('tests')
            .select(`
        *,
        position:positions(id, name, slug),
        test_questions(*)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tests:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getAllTests:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getTestsByPosition(positionId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('tests')
            .select(`
        *,
        test_questions(*)
      `)
            .eq('position_id', positionId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tests by position:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getTestsByPosition:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getTest(testId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('tests')
            .select(`
        *,
        position:positions(id, name, slug),
        test_questions(*)
      `)
            .eq('id', testId)
            .single()

        if (error) {
            console.error('Error fetching test:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getTest:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function createTest(testData: TestData) {
    try {
        const { data, error } = await supabaseAdmin
            .from('tests')
            .insert(testData)
            .select()
            .single()

        if (error) {
            console.error('Error creating test:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in createTest:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function updateTest(testId: string, testData: Partial<TestData>) {
    try {
        const { data, error } = await supabaseAdmin
            .from('tests')
            .update(testData)
            .eq('id', testId)
            .select()
            .single()

        if (error) {
            console.error('Error updating test:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in updateTest:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function deleteTest(testId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('tests')
            .delete()
            .eq('id', testId)

        if (error) {
            console.error('Error deleting test:', error)
            return { success: false, error: error.message }
        }

        return { success: true, message: 'Test deleted successfully' }
    } catch (error) {
        console.error('Error in deleteTest:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function addQuestion(questionData: QuestionData) {
    try {
        const { data, error } = await supabaseAdmin
            .from('test_questions')
            .insert(questionData)
            .select()
            .single()

        if (error) {
            console.error('Error adding question:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in addQuestion:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function updateQuestion(questionId: string, questionData: Partial<QuestionData>) {
    try {
        const { data, error } = await supabaseAdmin
            .from('test_questions')
            .update(questionData)
            .eq('id', questionId)
            .select()
            .single()

        if (error) {
            console.error('Error updating question:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in updateQuestion:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function deleteQuestion(questionId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('test_questions')
            .delete()
            .eq('id', questionId)

        if (error) {
            console.error('Error deleting question:', error)
            return { success: false, error: error.message }
        }

        return { success: true, message: 'Question deleted successfully' }
    } catch (error) {
        console.error('Error in deleteQuestion:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function reorderQuestions(questionUpdates: Array<{ id: string; order_index: number }>) {
    try {
        const updates = questionUpdates.map(({ id, order_index }) =>
            supabaseAdmin
                .from('test_questions')
                .update({ order_index })
                .eq('id', id)
        )

        await Promise.all(updates)

        return { success: true, message: 'Questions reordered successfully' }
    } catch (error) {
        console.error('Error in reorderQuestions:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// ============ APPLICANT FUNCTIONS ============

export async function getActiveTestForPosition(positionSlugOrId: string) {
    try {
        console.log('[DEBUG] getActiveTestForPosition called with:', positionSlugOrId)

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(positionSlugOrId)
        console.log('[DEBUG] Is UUID?', isUUID)

        let query = supabaseAdmin
            .from('tests')
            .select(`
        *,
        test_questions(*),
        position:positions(id, name, slug)
      `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)

        if (isUUID) {
            query = query.eq('position_id', positionSlugOrId)
        } else {
            const { data: positionData } = await supabaseAdmin
                .from('positions')
                .select('id')
                .eq('slug', positionSlugOrId)
                .single()

            console.log('[DEBUG] Position lookup result:', positionData)

            if (!positionData) {
                return { success: true, data: null }
            }

            query = query.eq('position_id', positionData.id)
        }

        const { data, error } = await query.single()

        console.log('[DEBUG] Test query result:', { data, error })
        console.log('[DEBUG] Questions in result:', data?.test_questions)

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: null }
            }
            console.error('Error fetching active test:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getActiveTestForPosition:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function submitTestAttempt(attemptData: {
    test_id: string
    application_id: string
    user_id: string
    answers: Record<string, string>
    score: number
    total_points: number
    percentage: number
    passed: boolean
    time_taken_seconds?: number
}) {
    try {
        const { data, error } = await supabaseAdmin
            .from('test_attempts')
            .insert(attemptData)
            .select()
            .single()

        if (error) {
            console.error('Error submitting test attempt:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in submitTestAttempt:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getTestAttemptsByUser(userId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('test_attempts')
            .select(`
        *,
        test:tests(title, difficulty, passing_score)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching test attempts:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getTestAttemptsByUser:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getTestAttempt(testId: string, applicationId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('test_attempts')
            .select(`
        *,
        test:tests(title, difficulty, passing_score, duration_minutes)
      `)
            .eq('test_id', testId)
            .eq('application_id', applicationId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: null }
            }
            console.error('Error fetching test attempt:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getTestAttempt:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getTestAttemptByApplicationId(applicationId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('test_attempts')
            .select(`
        *,
        test:tests(title, difficulty, passing_score, duration_minutes)
      `)
            .eq('application_id', applicationId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: null }
            }
            console.error('Error fetching test attempt by application:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getTestAttemptByApplicationId:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function resetTestAttempt(testId: string, applicationId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('test_attempts')
            .delete()
            .eq('test_id', testId)
            .eq('application_id', applicationId)

        if (error) {
            console.error('Error resetting test attempt:', error)
            return { success: false, error: error.message }
        }

        return { success: true, message: 'Test attempt reset successfully' }
    } catch (error) {
        console.error('Error in resetTestAttempt:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
