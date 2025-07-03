/*
  # Learning Hub Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `password` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `courses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `link` (text)
      - `platform` (text)
      - `category` (text)
      - `difficulty` (text)
      - `priority` (text)
      - `status` (text)
      - `tags` (jsonb)
      - `notes` (text)
      - `progress` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `content` (text)
      - `course_id` (uuid, foreign key, optional)
      - `category` (text)
      - `tags` (jsonb)
      - `attachments` (jsonb)
      - `position` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `url` (text)
      - `description` (text)
      - `category` (text)
      - `course_id` (uuid, foreign key, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `datetime` (timestamp)
      - `description` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `study_groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `visibility` (text)
      - `owner_id` (uuid, foreign key)
      - `tags` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `group_members`
      - `group_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `platforms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `category` (text)
      - `icon` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `user_platform_favorites`
      - `user_id` (uuid, foreign key)
      - `platform_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for study groups and messages
*/

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  link text,
  platform text DEFAULT '',
  category text DEFAULT '',
  difficulty text DEFAULT 'Beginner',
  priority text DEFAULT 'Medium',
  status text DEFAULT 'To Start',
  tags jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  category text DEFAULT 'general',
  tags jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  datetime timestamptz NOT NULL,
  description text DEFAULT '',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create study_groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('coding', 'professional', 'learning', 'documentation', 'ai_tools')),
  icon text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_platform_favorites table
CREATE TABLE IF NOT EXISTS user_platform_favorites (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, platform_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_platform_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Create policies for courses table
CREATE POLICY "Users can manage own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for notes table
CREATE POLICY "Users can manage own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for bookmarks table
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for reminders table
CREATE POLICY "Users can manage own reminders"
  ON reminders
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for study_groups table
CREATE POLICY "Users can read public groups"
  ON study_groups
  FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create groups"
  ON study_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Group owners can update their groups"
  ON study_groups
  FOR UPDATE
  TO authenticated
  USING (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Group owners can delete their groups"
  ON study_groups
  FOR DELETE
  TO authenticated
  USING (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for group_members table
CREATE POLICY "Users can view group memberships"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM study_groups 
      WHERE visibility = 'public' 
      OR owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can leave groups"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for messages table
CREATE POLICY "Group members can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Group members can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Create policies for platforms table
CREATE POLICY "Anyone can read platforms"
  ON platforms
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_platform_favorites table
CREATE POLICY "Users can manage own favorites"
  ON user_platform_favorites
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_datetime ON reminders(datetime);
CREATE INDEX IF NOT EXISTS idx_study_groups_visibility ON study_groups(visibility);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_platforms_category ON platforms(category);

-- Insert default platforms
INSERT INTO platforms (name, url, category, icon, description) VALUES
-- Coding Platforms
('LeetCode', 'https://leetcode.com', 'coding', 'fas fa-code', 'Practice coding problems and algorithms'),
('CodeChef', 'https://codechef.com', 'coding', 'fas fa-utensils', 'Competitive programming platform'),
('Codeforces', 'https://codeforces.com', 'coding', 'fas fa-trophy', 'Programming contests and practice'),
('GeeksforGeeks', 'https://geeksforgeeks.org', 'coding', 'fas fa-laptop-code', 'Programming tutorials and practice'),
('HackerRank', 'https://hackerrank.com', 'coding', 'fas fa-user-ninja', 'Coding challenges and skill assessment'),
('AtCoder', 'https://atcoder.jp', 'coding', 'fas fa-medal', 'Japanese competitive programming platform'),

-- Professional Networks
('LinkedIn', 'https://linkedin.com', 'professional', 'fab fa-linkedin', 'Professional networking platform'),
('GitHub', 'https://github.com', 'professional', 'fab fa-github', 'Code hosting and collaboration'),
('Kaggle', 'https://kaggle.com', 'professional', 'fas fa-chart-line', 'Data science competitions'),
('ResearchGate', 'https://researchgate.net', 'professional', 'fas fa-graduation-cap', 'Academic research network'),

-- Learning Platforms
('Udemy', 'https://udemy.com', 'learning', 'fas fa-play-circle', 'Online course marketplace'),
('Coursera', 'https://coursera.org', 'learning', 'fas fa-university', 'University-level online courses'),
('edX', 'https://edx.org', 'learning', 'fas fa-book-open', 'Free online courses from top universities'),
('Khan Academy', 'https://khanacademy.org', 'learning', 'fas fa-chalkboard-teacher', 'Free educational content'),
('MIT OpenCourseWare', 'https://ocw.mit.edu', 'learning', 'fas fa-atom', 'Free MIT course materials'),

-- Documentation & AI Tools
('Stack Overflow', 'https://stackoverflow.com', 'documentation', 'fab fa-stack-overflow', 'Programming Q&A community'),
('W3Schools', 'https://w3schools.com', 'documentation', 'fas fa-globe', 'Web development tutorials'),
('MDN Web Docs', 'https://developer.mozilla.org', 'documentation', 'fab fa-firefox', 'Web technology documentation'),
('ChatGPT', 'https://chat.openai.com', 'ai_tools', 'fas fa-robot', 'AI-powered conversational assistant'),
('Google Bard', 'https://bard.google.com', 'ai_tools', 'fas fa-brain', 'Google AI chatbot')
ON CONFLICT DO NOTHING;

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();