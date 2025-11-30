-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short_answer', 'coding')),
  question_text TEXT NOT NULL,
  options JSONB, -- For MCQ: {"a": "option1", "b": "option2", "c": "option3", "d": "option4"}
  correct_answer TEXT NOT NULL,
  explanation TEXT, -- Optional explanation for the solution
  points INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tests_position_id_idx ON tests(position_id);
CREATE INDEX IF NOT EXISTS tests_difficulty_idx ON tests(difficulty);
CREATE INDEX IF NOT EXISTS test_questions_test_id_idx ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS test_questions_order_idx ON test_questions(test_id, order_index);

-- Create updated_at trigger for tests
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for test_questions
CREATE TRIGGER update_test_questions_updated_at
  BEFORE UPDATE ON test_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests (admin only can modify, all can view active tests)
CREATE POLICY "Anyone can view active tests"
  ON tests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert tests"
  ON tests FOR INSERT
  WITH CHECK (true); -- Will add admin check in application layer

CREATE POLICY "Admins can update tests"
  ON tests FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete tests"
  ON tests FOR DELETE
  USING (true);

-- RLS Policies for test_questions
CREATE POLICY "Anyone can view questions of active tests"
  ON test_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_questions.test_id
    AND tests.is_active = true
  ));

CREATE POLICY "Admins can insert questions"
  ON test_questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update questions"
  ON test_questions FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete questions"
  ON test_questions FOR DELETE
  USING (true);
