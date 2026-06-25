-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar TEXT,
    score INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    score INTEGER DEFAULT 10,
    description TEXT,
    constraints TEXT,
    examples TEXT,
    params VARCHAR(255),
    test_cases JSONB
);

-- Solved problems table (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS solved_problems (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
);

-- Submissions table (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    language VARCHAR(50),
    code TEXT,
    status VARCHAR(50) CHECK (status IN ('accepted', 'wrong_answer', 'pending')),
    score_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_solved_problems_user ON solved_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);

-- Insert sample problems (with conflict handling)
INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(1, 'Two Sum', 'easy', 10, 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 
 '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9', 
 'nums, target',
 '[{"input": "nums = [2,7,11,15], target = 9", "expected": "[0,1]"}, {"input": "nums = [3,2,4], target = 6", "expected": "[1,2]"}, {"input": "nums = [3,3], target = 6", "expected": "[0,1]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(2, 'Valid Parentheses', 'easy', 10, 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
 '1 <= s.length <= 10^4',
 's',
 '[{"input": "s = \"()\"", "expected": "true"}, {"input": "s = \"()[]{}\"", "expected": "true"}, {"input": "s = \"(]\"", "expected": "false"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(3, 'Merge Two Sorted Lists', 'easy', 10, 'Merge two sorted linked lists and return it as a sorted list.',
 'The number of nodes in both lists is in the range [0, 50].',
 'l1, l2',
 '[{"input": "l1 = [1,2,4], l2 = [1,3,4]", "expected": "[1,1,2,3,4,4]"}, {"input": "l1 = [], l2 = []", "expected": "[]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

-- Add more problems (10 Easy, 10 Medium, 10 Hard)
INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(4, 'Maximum Subarray', 'easy', 10, 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
 '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
 'nums',
 '[{"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "expected": "6"}, {"input": "nums = [1]", "expected": "1"}, {"input": "nums = [5,4,-1,7,8]", "expected": "23"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(5, 'Best Time to Buy and Sell Stock', 'easy', 10, 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.',
 '1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4',
 'prices',
 '[{"input": "prices = [7,1,5,3,6,4]", "expected": "5"}, {"input": "prices = [7,6,4,3,1]", "expected": "0"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(6, 'Valid Anagram', 'easy', 10, 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
 '1 <= s.length, t.length <= 5 * 10^4',
 's, t',
 '[{"input": "s = \"anagram\", t = \"nagaram\"", "expected": "true"}, {"input": "s = \"rat\", t = \"car\"", "expected": "false"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(7, 'Binary Search', 'easy', 10, 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
 '1 <= nums.length <= 10^4\n-10^4 <= nums[i], target <= 10^4',
 'nums, target',
 '[{"input": "nums = [-1,0,3,5,9,12], target = 9", "expected": "4"}, {"input": "nums = [-1,0,3,5,9,12], target = 2", "expected": "-1"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(8, 'Climbing Stairs', 'easy', 10, 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
 '1 <= n <= 45',
 'n',
 '[{"input": "n = 2", "expected": "2"}, {"input": "n = 3", "expected": "3"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(9, 'Invert Binary Tree', 'easy', 10, 'Given the root of a binary tree, invert the tree, and return its root.',
 'The number of nodes in the tree is in the range [0, 100].',
 'root',
 '[{"input": "root = [4,2,7,1,3,6,9]", "expected": "[4,7,2,9,6,3,1]"}, {"input": "root = [2,1,3]", "expected": "[2,3,1]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(10, 'Valid Palindrome', 'easy', 10, 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
 '1 <= s.length <= 2 * 10^5',
 's',
 '[{"input": "s = \"A man, a plan, a canal: Panama\"", "expected": "true"}, {"input": "s = \"race a car\"", "expected": "false"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(11, '3Sum', 'medium', 20, 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
 '3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5',
 'nums',
 '[{"input": "nums = [-1,0,1,2,-1,-4]", "expected": "[[-1,-1,2],[-1,0,1]]"}, {"input": "nums = []", "expected": "[]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(12, 'Container With Most Water', 'medium', 20, 'Given n non-negative integers where each represents a point at coordinate (i, ai). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
 'n == height.length\n2 <= n <= 10^5',
 'height',
 '[{"input": "height = [1,8,6,2,5,4,8,3,7]", "expected": "49"}, {"input": "height = [1,1]", "expected": "1"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(13, 'Longest Substring Without Repeating Characters', 'medium', 20, 'Given a string s, find the length of the longest substring without repeating characters.',
 '0 <= s.length <= 5 * 10^4',
 's',
 '[{"input": "s = \"abcabcbb\"", "expected": "3"}, {"input": "s = \"bbbbb\"", "expected": "1"}, {"input": "s = \"pwwkew\"", "expected": "3"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(14, 'Generate Parentheses', 'medium', 20, 'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
 '1 <= n <= 8',
 'n',
 '[{"input": "n = 3", "expected": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]"}, {"input": "n = 1", "expected": "[\"()\"]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(15, 'Search in Rotated Sorted Array', 'medium', 20, 'There is an integer array nums sorted in ascending order (with distinct values). Before being passed to your function, nums is possibly rotated at an unknown pivot index.',
 '1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4',
 'nums, target',
 '[{"input": "nums = [4,5,6,7,0,1,2], target = 0", "expected": "4"}, {"input": "nums = [4,5,6,7,0,1,2], target = 3", "expected": "-1"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(16, 'Combination Sum', 'medium', 20, 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.',
 '1 <= candidates.length <= 30\n2 <= candidates[i] <= 40',
 'candidates, target',
 '[{"input": "candidates = [2,3,6,7], target = 7", "expected": "[[2,2,3],[7]]"}, {"input": "candidates = [2,3,5], target = 8", "expected": "[[2,2,2,2],[2,3,3],[3,5]]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(17, 'Permutations', 'medium', 20, 'Given an array nums of distinct integers, return all the possible permutations.',
 '1 <= nums.length <= 6',
 'nums',
 '[{"input": "nums = [1,2,3]", "expected": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"}, {"input": "nums = [0,1]", "expected": "[[0,1],[1,0]]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(18, 'Rotate Image', 'medium', 20, 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).',
 'n == matrix.length == matrix[i].length\n1 <= n <= 20',
 'matrix',
 '[{"input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]", "expected": "[[7,4,1],[8,5,2],[9,6,3]]"}, {"input": "matrix = [[1,2],[3,4]]", "expected": "[[3,1],[4,2]]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(19, 'Group Anagrams', 'medium', 20, 'Given an array of strings strs, group the anagrams together.',
 '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100',
 'strs',
 '[{"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "expected": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}, {"input": "strs = [\"\"]", "expected": "[[\"\"]]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(20, 'Longest Palindromic Substring', 'medium', 20, 'Given a string s, return the longest palindromic substring in s.',
 '1 <= s.length <= 1000',
 's',
 '[{"input": "s = \"babad\"", "expected": "\"bab\""}, {"input": "s = \"cbbd\"", "expected": "\"bb\""}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(21, 'Word Search', 'medium', 20, 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.',
 'm == board.length\nn == board[i].length\n1 <= m, n <= 6',
 'board, word',
 '[{"input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"", "expected": "true"}, {"input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"SEE\"", "expected": "true"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(22, 'Longest Increasing Subsequence', 'medium', 20, 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
 '1 <= nums.length <= 2500\n-10^4 <= nums[i] <= 10^4',
 'nums',
 '[{"input": "nums = [10,9,2,5,3,7,101,18]", "expected": "4"}, {"input": "nums = [0,1,0,3,2,3]", "expected": "4"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(23, 'Coin Change', 'medium', 20, 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins.',
 '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
 'coins, amount',
 '[{"input": "coins = [1,2,5], amount = 11", "expected": "3"}, {"input": "coins = [2], amount = 3", "expected": "-1"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(24, 'Merge Intervals', 'medium', 20, 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
 '1 <= intervals.length <= 10^4\n0 <= starti <= endi <= 10^4',
 'intervals',
 '[{"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "expected": "[[1,6],[8,10],[15,18]]"}, {"input": "intervals = [[1,4],[4,5]]", "expected": "[[1,5]]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(25, 'Unique Paths', 'medium', 20, 'A robot is located at the top-left corner of a m x n grid. How many possible unique paths are there?',
 '1 <= m, n <= 100',
 'm, n',
 '[{"input": "m = 3, n = 7", "expected": "28"}, {"input": "m = 3, n = 2", "expected": "3"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(26, 'Jump Game', 'medium', 20, 'You are given an integer array nums. You are initially positioned at the array''s first index, and each element in the array represents your maximum jump length at that position.',
 '1 <= nums.length <= 10^4\n0 <= nums[i] <= 10^5',
 'nums',
 '[{"input": "nums = [2,3,1,1,4]", "expected": "true"}, {"input": "nums = [3,2,1,0,4]", "expected": "false"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(27, 'Maximum Product Subarray', 'medium', 20, 'Given an integer array nums, find the contiguous subarray within an array (containing at least one number) which has the largest product.',
 '1 <= nums.length <= 2 * 10^4\n-10 <= nums[i] <= 10',
 'nums',
 '[{"input": "nums = [2,3,-2,4]", "expected": "6"}, {"input": "nums = [-2,0,-1]", "expected": "0"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(28, 'Find Minimum in Rotated Sorted Array', 'medium', 20, 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Find the minimum element.',
 '1 <= nums.length <= 5000\n-5000 <= nums[i] <= 5000',
 'nums',
 '[{"input": "nums = [3,4,5,1,2]", "expected": "1"}, {"input": "nums = [4,5,6,7,0,1,2]", "expected": "0"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(29, 'Binary Tree Level Order Traversal', 'medium', 20, 'Given the root of a binary tree, return the level order traversal of its nodes'' values.',
 'The number of nodes in the tree is in the range [0, 2000].',
 'root',
 '[{"input": "root = [3,9,20,null,null,15,7]", "expected": "[[3],[9,20],[15,7]]"}, {"input": "root = [1]", "expected": "[[1]]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

INSERT INTO problems (id, title, difficulty, score, description, constraints, params, test_cases) VALUES
(30, 'Find First and Last Position of Element in Sorted Array', 'medium', 20, 'Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.',
 '0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9',
 'nums, target',
 '[{"input": "nums = [5,7,7,8,8,10], target = 8", "expected": "[3,4]"}, {"input": "nums = [5,7,7,8,8,10], target = 6", "expected": "[-1,-1]"}]')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    score = EXCLUDED.score,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    params = EXCLUDED.params,
    test_cases = EXCLUDED.test_cases;

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE solved_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Anyone can read problems" ON problems;
DROP POLICY IF EXISTS "Users can read their own solved problems" ON solved_problems;
DROP POLICY IF EXISTS "Users can insert their own solved problems" ON solved_problems;
DROP POLICY IF EXISTS "Users can read their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;

-- Create policies
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can read problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Users can read their own solved problems" ON solved_problems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own solved problems" ON solved_problems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);