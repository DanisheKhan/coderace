-- CodeRace Supabase Schema and Seed Data

-- 1. UTILITY FUNCTIONS & TRIGGERS
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. CREATE TABLES

-- Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Triggers for Profiles
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Questions Table
create table if not exists public.questions (
  id bigint primary key generated always as identity,
  sr_no integer not null,
  phase text not null,
  topic text not null,
  subtopic text not null,
  problem_name text not null,
  link text,
  difficulty integer not null check (difficulty >= 1 and difficulty <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Progress Table
create table if not exists public.user_progress (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id bigint references public.questions(id) on delete cascade not null,
  status text not null default 'not_started' check (status in ('not_started', 'attempted', 'done')),
  revisit boolean not null default false,
  revisit_count integer not null default 0,
  solve_method text check (solve_method in ('gpt', 'copy', 'hint', 'solution') or solve_method is null),
  brute_force boolean not null default false,
  approach boolean not null default false,
  optimized boolean not null default false,
  notes text,
  solution_link text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_question unique (user_id, question_id)
);

-- Triggers for User Progress
drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
  before update on public.user_progress
  for each row
  execute function public.handle_updated_at();


-- 3. INDEXES FOR PERFORMANCE
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_question_id on public.user_progress(question_id);
create index if not exists idx_user_progress_status on public.user_progress(status);
create index if not exists idx_questions_phase on public.questions(phase);
create index if not exists idx_questions_topic on public.questions(topic);


-- 4. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.user_progress enable row level security;

-- Profiles Policies
drop policy if exists "Allow all authenticated users to view profiles" on public.profiles;
create policy "Allow all authenticated users to view profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Allow users to insert their own profile" on public.profiles;
create policy "Allow users to insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Allow users to update their own profile" on public.profiles;
create policy "Allow users to update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Questions Policies
drop policy if exists "Allow all authenticated users to view questions" on public.questions;
create policy "Allow all authenticated users to view questions"
  on public.questions for select
  to authenticated
  using (true);

-- User Progress Policies
drop policy if exists "Allow all authenticated users to view progress" on public.user_progress;
create policy "Allow all authenticated users to view progress"
  on public.user_progress for select
  to authenticated
  using (true);

drop policy if exists "Allow users to insert their own progress" on public.user_progress;
create policy "Allow users to insert their own progress"
  on public.user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Allow users to update their own progress" on public.user_progress;
create policy "Allow users to update their own progress"
  on public.user_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Allow users to delete their own progress" on public.user_progress;
create policy "Allow users to delete their own progress"
  on public.user_progress for delete
  to authenticated
  using (auth.uid() = user_id);


-- 5. REALTIME DATABASE REPLICATION
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Drop tables from publication individually using PL/pgSQL exception handlers (no drop if exists support)
    begin
      alter publication supabase_realtime drop table public.profiles;
    exception when others then
      -- do nothing if not in publication
    end;
    
    begin
      alter publication supabase_realtime drop table public.user_progress;
    exception when others then
      -- do nothing if not in publication
    end;

    -- Add them
    alter publication supabase_realtime add table public.profiles, public.user_progress;
  end if;
end;
$$;


-- 6. SEED DATA - QUESTIONS
TRUNCATE TABLE public.questions RESTART IDENTITY CASCADE;

INSERT INTO public.questions (sr_no, phase, topic, subtopic, problem_name, link, difficulty) VALUES
(1, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Array Basics', 'Find Element at a Given Index', 'https://www.geeksforgeeks.org/problems/c-array-print-an-element-set-25933/1', 1),
(2, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Array Basics', 'Min and Max in Array', 'https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1', 1),
(3, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Array Basics', 'Sum of Array', 'https://www.geeksforgeeks.org/problems/sum-of-array2326/1', 1),
(4, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Array Basics', 'Sum of Digits', 'https://www.geeksforgeeks.org/problems/sum-of-digits1742/1', 1),
(5, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Array Basics', 'Check If Array is Sorted', 'https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1', 1),
(6, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Array Basics', 'Alternates In Array', 'https://www.geeksforgeeks.org/problems/print-alternate-elements-of-an-array/0', 1),
(7, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Remove Duplicates from Array', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', 2),
(8, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Second Largest in Array', 'https://www.geeksforgeeks.org/problems/second-largest3735/1', 2),
(9, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Reverse an Array', 'https://www.geeksforgeeks.org/problems/reverse-an-array/1', 2),
(10, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Missing Number', 'https://leetcode.com/problems/missing-number/', 2),
(11, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Segregate 0s and 1s', 'https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1', 2),
(12, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Maximum Consecutive Ones', 'https://leetcode.com/problems/max-consecutive-ones/', 2),
(13, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Palindromic Array', 'https://www.geeksforgeeks.org/problems/palindromic-array-1587115620/1', 2),
(14, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Move Zeroes to End', 'https://leetcode.com/problems/move-zeroes/', 2),
(15, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Core Manipulations', 'Sort array with 0''s 1''s and 2''s (Dutch Flag)', 'https://leetcode.com/problems/sort-colors/', 2),
(16, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Equilibrium Point', 'https://www.geeksforgeeks.org/problems/equilibrium-point-1587115620/1', 3),
(17, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Reverse Integer', 'https://leetcode.com/problems/reverse-integer/', 3),
(18, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Leaders in Array', 'https://www.geeksforgeeks.org/problems/leaders-in-an-array-1587115620/1', 3),
(19, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Increasing Array', 'https://cses.fi/problemset/task/1094', 3),
(20, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Rearrange Array Elements by Sign', 'https://leetcode.com/problems/rearrange-array-elements-by-sign/', 3),
(21, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Rotate Array by One', 'https://www.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1', 3),
(22, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Intermediate Problems', 'Majority Element I (Boyer - Moore)', 'https://leetcode.com/problems/majority-element/', 3),
(23, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Rotate Array by K steps', 'https://leetcode.com/problems/rotate-array/', 4),
(24, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Wiggle Sort II', 'https://leetcode.com/problems/wiggle-sort-ii/', 4),
(25, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Majority Element II', 'https://leetcode.com/problems/majority-element-ii/', 4),
(26, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Best Time to Buy and Sell Stock', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 4),
(27, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Next Permutation', 'https://leetcode.com/problems/next-permutation/', 4),
(28, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Maximum Value Of Expression', 'https://www.geeksforgeeks.org/problems/maximum-value-of-expression2515/1', 4),
(29, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'First Missing Positive', 'https://leetcode.com/problems/first-missing-positive/', 5),
(30, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Kadane''s Algorithm', 'https://leetcode.com/problems/maximum-subarray/', 3),
(31, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Trapping Rain Water', 'https://leetcode.com/problems/trapping-rain-water/', 4),
(32, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Merge overlapping intervals', 'https://leetcode.com/problems/merge-intervals/', 3),
(33, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Arrays', 'Advanced Problems', 'Product of array except self', 'https://leetcode.com/problems/product-of-array-except-self/', 3),
(34, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Basics', 'Sum of elements in a matrix', 'https://www.geeksforgeeks.org/problems/sum-of-elements-in-a-matrix2000/1', 2),
(35, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Basics', 'Count Number Of Zeroes', 'https://www.geeksforgeeks.org/problems/count-zeros-in-a-sorted-matrix/1', 2),
(36, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Basics', 'Count Negative Numbers in a matrix', 'https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/', 2),
(37, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Basics', 'Matrix Diagonal Sum', 'https://leetcode.com/problems/matrix-diagonal-sum/', 2),
(38, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Operations', 'Addition of Two Square Matrix', 'https://www.geeksforgeeks.org/problems/addition-of-two-square-matrices4916/1', 3),
(39, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Operations', 'Multiply Matrices', 'https://www.geeksforgeeks.org/problems/multiply-matrices/1', 3),
(40, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Matrix Operations', 'Transpose Matrix', 'https://leetcode.com/problems/transpose-matrix/', 3),
(41, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Advanced Matrix', 'Spiral Matrix', 'https://leetcode.com/problems/spiral-matrix/', 4),
(42, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Advanced Matrix', 'ZigZag Matrix', 'https://www.geeksforgeeks.org/problems/print-matrix-in-zig-zag-fashion--122748/1', 4),
(43, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Advanced Matrix', 'Rotate Matrix (90°)', 'https://leetcode.com/problems/rotate-image/', 4),
(44, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Advanced Matrix', 'Determine Whether matrix can be obtained by rotation', 'https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/', 4),
(45, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', '2D Arrays', 'Advanced Matrix', 'Set Matrix Zeroes', 'https://leetcode.com/problems/set-matrix-zeroes/', 5),
(46, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Basic Maths', 'Number Theory Basics', 'Check if a number is Armstrong', 'https://www.geeksforgeeks.org/problems/armstrong-numbers2727/1', 1),
(47, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Basic Maths', 'Number Theory Basics', 'Print all Divisors of a Number', 'https://www.geeksforgeeks.org/problems/all-divisors-of-a-number/1', 1),
(48, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Basic Maths', 'Number Theory Basics', 'Check if a number is Prime', 'https://www.geeksforgeeks.org/problems/prime-number2314/1', 1),
(49, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Basic Maths', 'Number Theory Basics', 'GCD / HCF of 2 numbers', 'https://www.geeksforgeeks.org/problems/gcd-of-two-numbers3459/1', 1),
(50, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Basic Maths', 'Number Theory Basics', 'Prime Factorisation of a Number', 'https://www.geeksforgeeks.org/problems/largest-prime-factor2601/1', 2),
(51, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Basic Maths', 'Number Theory Basics', 'Count Primes in range L to R', 'https://www.geeksforgeeks.org/problems/count-primes-in-range1604/1', 3),
(52, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Maximum Occuring Character', 'https://www.geeksforgeeks.org/problems/maximum-occuring-character-1587115620/1', 1),
(53, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Remove Spaces', 'https://www.geeksforgeeks.org/problems/remove-spaces0128/1', 1),
(54, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Print first letter of every word in the string', 'https://www.geeksforgeeks.org/problems/print-first-letter-of-every-word-in-the-string3632/1', 2),
(55, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Remove Consecutive Characters', 'https://www.geeksforgeeks.org/problems/consecutive-elements2306/1', 2),
(56, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Valid Palindrome', 'https://leetcode.com/problems/valid-palindrome/', 2),
(57, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Valid Anagram', 'https://leetcode.com/problems/valid-anagram/', 2),
(58, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Fundamentals', 'Isomorphic Strings', 'https://leetcode.com/problems/isomorphic-strings/', 2),
(59, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Manipulation', 'Delete Characters To Make Fancy String', 'https://leetcode.com/problems/delete-characters-to-make-fancy-string/', 3),
(60, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Manipulation', 'Reverse Words in a String', 'https://leetcode.com/problems/reverse-words-in-a-string/', 3),
(61, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Manipulation', 'String to integer (atoi)', 'https://leetcode.com/problems/string-to-integer-atoi/', 3),
(62, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Manipulation', 'Roman to integer', 'https://leetcode.com/problems/roman-to-integer/', 3),
(63, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Manipulation', 'Rotate String', 'https://leetcode.com/problems/rotate-string/', 3),
(64, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'String Manipulation', 'Longest common prefix', 'https://leetcode.com/problems/longest-common-prefix/', 3),
(65, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'Advanced Problems', 'Longest palindromic substring', 'https://leetcode.com/problems/longest-palindromic-substring/', 4),
(66, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'Advanced Problems', 'Multiply Two Strings', 'https://www.geeksforgeeks.org/problems/multiply-two-strings/1', 4),
(67, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'Advanced Problems', 'Maximum Nesting Depth of the Parentheses', 'https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/', 4),
(68, 'PHASE 1 : FUNDAMENTALS & LINEAR DATA STRUCTURES', 'Strings', 'Advanced Problems', 'Beauty Of All substrings', 'https://leetcode.com/problems/sum-of-beauty-of-all-substrings/', 4),
(69, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Search X in sorted array', 'https://leetcode.com/problems/binary-search/', 2),
(70, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Lower Bound', 'https://www.geeksforgeeks.org/problems/implement-lower-bound/1', 2),
(71, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Upper Bound', 'https://www.geeksforgeeks.org/problems/implement-upper-bound/1', 2),
(72, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Search insert position', 'https://leetcode.com/problems/search-insert-position/', 2),
(73, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Floor In Sorted Array', 'https://www.geeksforgeeks.org/problems/floor-in-a-sorted-array-1587115620/1', 2),
(74, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Ceil In Sorted Array', 'https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1', 2),
(75, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Guess Number Higher or Lower API', 'https://leetcode.com/problems/guess-number-higher-or-lower/', 2),
(76, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'First 1 in a Sorted Binary Array', 'https://www.geeksforgeeks.org/problems/index-of-first-1-in-a-sorted-array-of-0s-and-1s4048/1', 2),
(77, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Kth Missing Positive Number', 'https://leetcode.com/problems/kth-missing-positive-number/', 2),
(78, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Basics', 'Find minimum in Rotated Sorted Array', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', 2),
(79, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Intermediate', 'First and last occurrence', 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', 3),
(80, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Intermediate', 'Search in rotated sorted array-I', 'https://leetcode.com/problems/search-in-rotated-sorted-array/', 3),
(81, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Intermediate', 'Search in rotated sorted array-II', 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/', 3),
(82, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Intermediate', 'Single element in a Sorted Array', 'https://leetcode.com/problems/single-element-in-a-sorted-array/', 3),
(83, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Intermediate', 'Find kth Rotation', 'https://www.geeksforgeeks.org/problems/rotation4723/1', 3),
(84, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 1D Array Intermediate', 'Find Peak Element', 'https://leetcode.com/problems/find-peak-element/', 3),
(85, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 2D Arrays', 'Count Negative Numbers in a Sorted Matrix', 'https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/', 2),
(86, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 2D Arrays', 'Find row with maximum 1''s', 'https://leetcode.com/problems/row-with-maximum-ones/', 2),
(87, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 2D Arrays', 'Search a 2D Matrix I', 'https://leetcode.com/problems/search-a-2d-matrix/', 2),
(88, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 2D Arrays', 'Search a 2D Matrix  II', 'https://leetcode.com/problems/search-a-2d-matrix-ii/', 3),
(89, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 2D Arrays', 'Find Peak Element - II', 'https://leetcode.com/problems/find-a-peak-element-ii/', 4),
(90, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on 2D Arrays', 'Median in a row-wise sorted Matrix', 'https://www.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1', 4),
(91, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Sqrt (x)', 'https://leetcode.com/problems/sqrtx/', 2),
(92, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Valid Perfect Square', 'https://leetcode.com/problems/valid-perfect-square/', 2),
(93, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Find Nth root of a number', 'https://www.geeksforgeeks.org/problems/find-nth-root-of-m5843/1', 3),
(94, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Koko eating bananas', 'https://leetcode.com/problems/koko-eating-bananas/', 3),
(95, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Find the Smallest Divisor Given a Threshold', 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/', 3),
(96, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Minimum Speed to Arrive on Time', 'https://leetcode.com/problems/minimum-speed-to-arrive-on-time/', 3),
(97, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Minimum days to make M bouquets', 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/', 3),
(98, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Capacity to Ship Packages Within D Days', 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', 3),
(99, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Book Allocation Problem', 'https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1', 3),
(100, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Split Array Largest Sum', 'https://leetcode.com/problems/split-array-largest-sum/', 4),
(101, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Painter''s Partition Problem', 'https://www.geeksforgeeks.org/problems/the-painters-partition-problem1535/1', 4),
(102, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'K-th element of two sorted Arrays', 'https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1', 4),
(103, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Aggressive Cows', 'https://www.geeksforgeeks.org/problems/aggressive-cows/0', 5),
(104, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Minimize Max Distance to Gas Station', 'https://www.geeksforgeeks.org/problems/minimize-max-distance-to-gas-station/1', 5),
(105, 'PHASE 2 : SEARCHING ALGORITHM', 'Binary Search', 'BS on Answer', 'Median of Two Sorted Arrays', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 5),
(106, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Introduction to Recursion', 'Print 1 to N without using loops', 'https://www.geeksforgeeks.org/problems/print-1-to-n-without-using-loops3621/1', 1),
(107, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Introduction to Recursion', 'Print N to 1 without loop', 'https://www.geeksforgeeks.org/problems/print-n-to-1-without-loop/1', 1),
(108, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Introduction to Recursion', 'Sum of first N numbers', 'https://www.geeksforgeeks.org/problems/sum-of-series2811/1', 1),
(109, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Introduction to Recursion', 'Factorial of a given number', 'https://www.geeksforgeeks.org/problems/factorial5739/1', 1),
(110, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Introduction to Recursion', 'Fibonacci Number', 'https://leetcode.com/problems/fibonacci-number/', 1),
(111, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Recursion on Arrays & Math', 'Reverse an array', 'https://www.geeksforgeeks.org/problems/reverse-an-array/1', 2),
(112, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Recursion on Arrays & Math', 'Pow(x, n)', 'https://leetcode.com/problems/powx-n/', 2),
(113, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Recursion on Arrays & Math', 'Count Good Numbers', 'https://leetcode.com/problems/count-good-numbers/', 2),
(114, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Recursion on Arrays & Math', 'Recursive Implementation of atoi()', 'https://www.geeksforgeeks.org/problems/implement-atoi/1', 3),
(115, 'PHASE 3 : ALGORITHMIC THINKING', 'Recursion', 'Recursion On strings', 'Generate Binary Strings Without Consecutive 1s', 'https://leetcode.com/problems/generate-binary-strings-without-adjacent-zeros/', 3),
(116, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Sorting Fundamentals', 'Linear Search', 'https://www.geeksforgeeks.org/problems/search-an-element-in-an-array-1587115621/1', 1),
(117, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Sorting Fundamentals', 'Sort An Array (Implement Merge / Quick Sort)', 'https://leetcode.com/problems/sort-an-array/', 2),
(118, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Sorting Fundamentals', 'Sort Array By Parity', 'https://leetcode.com/problems/sort-array-by-parity-ii/description/', 2),
(119, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Sorting Fundamentals', 'Maximum Gap', 'https://leetcode.com/problems/maximum-gap/description/', 3),
(120, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Custom Comparator Sorting', 'Sort Elements by Decreasing Frequency', 'https://www.geeksforgeeks.org/problems/sorting-elements-of-an-array-by-frequency-1587115621/1', 3),
(121, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Custom Comparator Sorting', 'Reorder Data In Log Files', 'https://leetcode.com/problems/reorder-data-in-log-files/description/', 4),
(122, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Advanced Sorting', 'Merge Intervals', 'https://leetcode.com/problems/merge-intervals/', 3),
(123, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Advanced Sorting', 'Count Inversions (Merge Sort)', 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', 5),
(124, 'PHASE 3 : ALGORITHMIC THINKING', 'Sorting', 'Advanced Sorting', 'Reverse Pairs (Merge Sort)', 'https://leetcode.com/problems/reverse-pairs/', 5),
(125, 'PHASE 4 : OBJECT ORIENTED CONCEPTS', 'OOPS', 'OOPS Fundamentals', 'Classes, Objects & Constructors', 'https://www.geeksforgeeks.org/c-plus-plus-gq/class-and-object-gq/', 1),
(126, 'PHASE 4 : OBJECT ORIENTED CONCEPTS', 'OOPS', 'OOPS Fundamentals', 'Inheritance & Polymorphism', 'https://www.geeksforgeeks.org/cpp-inheritance/', 2),
(127, 'PHASE 4 : OBJECT ORIENTED CONCEPTS', 'OOPS', 'OOPS Fundamentals', 'Encapsulation & Abstraction', 'https://www.geeksforgeeks.org/encapsulation-in-cpp/', 2),
(128, 'PHASE 4 : OBJECT ORIENTED CONCEPTS', 'OOPS', 'OOPS Fundamentals', 'Interfaces & Abstract Classes', 'https://www.geeksforgeeks.org/abstract-classes-in-c/', 3),
(129, 'PHASE 4 : OBJECT ORIENTED CONCEPTS', 'OOPS', 'Design Patterns', 'Singleton Pattern', 'https://leetcode.com/discuss/general-discussion/432092/singleton-design-pattern', 3),
(130, 'PHASE 4 : OBJECT ORIENTED CONCEPTS', 'OOPS', 'Design Patterns', 'Factory Pattern', 'https://www.geeksforgeeks.org/factory-method-for-designing-pattern/', 4),
(131, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Foundation', 'Array to Linked List', 'https://www.geeksforgeeks.org/problems/introduction-to-linked-list/1', 1),
(132, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Foundation', 'Count Nodes / Find Length of Linked List', 'https://www.geeksforgeeks.org/problems/count-nodes-of-linked-list/1', 1),
(133, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Foundation', 'Search in a Linked List', 'https://www.geeksforgeeks.org/problems/search-in-linked-list-1664434326/1', 1),
(134, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Insert Node at Head / Tail', 'https://www.hackerrank.com/challenges/insert-a-node-at-the-tail-of-a-linked-list/problem', 2),
(135, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Insert in Middle of Linked List', 'https://www.geeksforgeeks.org/problems/insert-in-middle-of-linked-list/1', 2),
(136, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Remove Linked List Elements (By Value)', 'https://leetcode.com/problems/remove-linked-list-elements/', 2),
(137, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Remove Duplicates from Sorted List', 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/', 2),
(138, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Delete Node in a Linked List (Given only node ref)', 'https://leetcode.com/problems/delete-node-in-a-linked-list/', 3),
(139, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Remove Duplicates from Unsorted List', 'https://leetcode.com/problems/remove-duplicates-from-an-unsorted-linked-list/', 3),
(140, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Insertion and Deletion', 'Delete the Middle Node of a Linked List', 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/', 3),
(141, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Middle of the Linked List', 'https://leetcode.com/problems/middle-of-the-linked-list/', 2),
(142, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Linked List Cycle', 'https://leetcode.com/problems/linked-list-cycle/', 2),
(143, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Intersection of Two Linked Lists', 'https://leetcode.com/problems/intersection-of-two-linked-lists/', 2),
(144, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Length of Loop in Linked List', 'https://www.geeksforgeeks.org/problems/find-length-of-loop/1', 3),
(145, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Linked List Cycle II (Find Starting Point)', 'https://leetcode.com/problems/linked-list-cycle-ii/', 3),
(146, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Remove Loop in Linked List', 'https://www.geeksforgeeks.org/problems/remove-loop-in-linked-list/1', 3),
(147, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Fast and Slow Pointer', 'Remove Nth Node From End of List', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', 3),
(148, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Reversals and Rotations', 'Reverse a Linked List (Iterative & Recursive)', 'https://leetcode.com/problems/reverse-linked-list/', 2),
(149, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Reversals and Rotations', 'Palindrome Linked List', 'https://leetcode.com/problems/palindrome-linked-list/', 2),
(150, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Reversals and Rotations', 'Swap Nodes in Pairs', 'https://leetcode.com/problems/swap-nodes-in-pairs/', 3),
(151, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Reversals and Rotations', 'Odd Even Linked List (By Index)', 'https://leetcode.com/problems/odd-even-linked-list/', 3),
(152, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Reversals and Rotations', 'Reorder List', 'https://leetcode.com/problems/reorder-list/', 4),
(153, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Reversals and Rotations', 'Rotate List', 'https://leetcode.com/problems/rotate-list/', 4),
(154, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Math in Linked List', 'Add One to a Number Represented by LL', 'https://www.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1', 3),
(155, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Math in Linked List', 'Add Two Numbers (Reverse Order)', 'https://leetcode.com/problems/add-two-numbers/', 3),
(156, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Math in Linked List', 'Add Two Numbers II (Forward Order)', 'https://leetcode.com/problems/add-two-numbers-ii/', 4),
(157, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Sorting, Merging & Segregating', 'Merge Two Sorted Lists', 'https://leetcode.com/problems/merge-two-sorted-lists/', 2),
(158, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Sorting, Merging & Segregating', 'Sort a Linked List of 0s, 1s, and 2s', 'https://www.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1', 3),
(159, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Sorting, Merging & Segregating', 'Segregate Even and Odd Nodes (By Value)', 'https://www.geeksforgeeks.org/problems/segregate-even-and-odd-nodes-in-a-linked-list5035/1', 3),
(160, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Sorting, Merging & Segregating', 'Partition List', 'https://leetcode.com/problems/partition-list/', 4),
(161, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Sorting, Merging & Segregating', 'Insertion Sort List', 'https://leetcode.com/problems/insertion-sort-list/', 4),
(162, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Sorting, Merging & Segregating', 'Sort List (Merge Sort on LL)', 'https://leetcode.com/problems/sort-list/', 5),
(163, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Array to Doubly Linked List', 'https://www.geeksforgeeks.org/problems/create-a-doubly-linked-list-from-a-given-array/1', 1),
(164, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Insert/Delete in a Doubly Linked List', 'https://www.geeksforgeeks.org/problems/insert-a-node-in-doubly-linked-list/1', 2),
(165, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Reverse a Doubly Linked List', 'https://www.geeksforgeeks.org/problems/reverse-a-doubly-linked-list/1', 2),
(166, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Remove Duplicates from Sorted DLL', 'https://www.geeksforgeeks.org/problems/remove-duplicates-from-a-sorted-doubly-linked-list/1', 2),
(167, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Insert in Sorted way in a Sorted DLL', 'https://www.geeksforgeeks.org/problems/insert-in-sorted-way-in-a-sorted-dll/1', 3),
(168, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Delete all occurrences of a key in DLL', 'https://www.geeksforgeeks.org/problems/delete-all-occurrences-of-a-given-key-in-a-doubly-linked-list/1', 3),
(169, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Doubly Linked Lists (DLL)', 'Find Pairs with Given Sum in a DLL', 'https://www.geeksforgeeks.org/problems/find-pairs-with-given-sum-in-doubly-linked-list/1', 3),
(170, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Advanced Problems', 'Copy List with Random Pointer (Clone LL)', 'https://leetcode.com/problems/copy-list-with-random-pointer/', 4),
(171, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Advanced Problems', 'Flattening a Linked List', 'https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1', 4),
(172, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Advanced Problems', 'Reverse Linked List in Groups of Size K', 'https://leetcode.com/problems/reverse-nodes-in-k-group/', 5),
(173, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Linkedlist', 'Advanced Problems', 'Reverse Alternate K Nodes', 'https://leetcode.com/problems/reverse-nodes-in-k-group/', 5),
(174, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Core Implementation', 'Implement Stack using Arrays', 'https://www.geeksforgeeks.org/problems/implement-stack-using-array/1', 1),
(175, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Core Implementation', 'Implement Stack using Linked List', 'https://www.geeksforgeeks.org/problems/implement-stack-using-linked-list/1', 1),
(176, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Parentheses & String Parsing', 'Valid Parentheses', 'https://leetcode.com/problems/valid-parentheses/', 2),
(177, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Parentheses & String Parsing', 'Remove Outermost Parentheses', 'https://leetcode.com/problems/remove-outermost-parentheses/', 2),
(178, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Parentheses & String Parsing', 'Remove All Adjacent Duplicates In String', 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/', 2),
(179, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Parentheses & String Parsing', 'Minimum Add to Make Parentheses Valid', 'https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/', 2),
(180, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Parentheses & String Parsing', 'Minimum Remove to Make Valid Parentheses', 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/', 3),
(181, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Parentheses & String Parsing', 'Evaluate Reverse Polish Notation', 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', 3),
(182, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Recursion Based Stack Problems', 'Sort a Stack Using Recursion', 'https://www.geeksforgeeks.org/problems/sort-a-stack/1', 3),
(183, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Recursion Based Stack Problems', 'Reverse a Stack (Using Recursion)', 'https://www.geeksforgeeks.org/problems/reverse-a-stack/1', 3),
(184, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Expression Conversions', 'Infix to Postfix Conversion', 'https://www.geeksforgeeks.org/problems/infix-to-postfix-1587115620/1', 2),
(185, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Expression Conversions', 'Prefix to Infix Conversion', 'https://www.geeksforgeeks.org/problems/prefix-to-infix-conversion/1', 2),
(186, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Expression Conversions', 'Postfix to Prefix Conversion', 'https://www.geeksforgeeks.org/problems/postfix-to-prefix-conversion/1', 2),
(187, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Expression Conversions', 'Infix to Prefix Conversion', 'https://www.geeksforgeeks.org/problems/infix-to-prefix-notation/1', 3),
(188, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Next Greater Element I', 'https://leetcode.com/problems/next-greater-element-i/', 2),
(189, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Next Smaller Element / Help Classmates', 'https://www.geeksforgeeks.org/problems/help-classmates--141631/1', 3),
(190, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Next Greater Element II (Circular Array)', 'https://leetcode.com/problems/next-greater-element-ii/', 3),
(191, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Stock Span Problem', 'https://leetcode.com/problems/online-stock-span/', 3),
(192, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Number of Greater Elements to the Right', 'https://www.geeksforgeeks.org/problems/number-of-nges-to-the-right/1', 3),
(193, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Asteroid Collision', 'https://leetcode.com/problems/asteroid-collision/', 3),
(194, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Remove K Digits', 'https://leetcode.com/problems/remove-k-digits/', 4),
(195, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'The Monotonic Stack Pattern', 'Remove Duplicate Letters', 'https://leetcode.com/problems/remove-duplicate-letters/', 4),
(196, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Advanced Monotonic Stack & Applications', 'Largest Rectangle in Histogram', 'https://leetcode.com/problems/largest-rectangle-in-histogram/', 4),
(197, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Advanced Monotonic Stack & Applications', 'Sum of Subarray Minimums', 'https://leetcode.com/problems/sum-of-subarray-minimums/', 4),
(198, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Advanced Monotonic Stack & Applications', 'Sum of Subarray Ranges', 'https://leetcode.com/problems/sum-of-subarray-ranges/', 4),
(199, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Advanced Monotonic Stack & Applications', 'Maximal Rectangle (2D Grid)', 'https://leetcode.com/problems/maximal-rectangle/', 5),
(200, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Classic Design Problems', 'Min Stack (Design a stack with O(1) getMin)', 'https://leetcode.com/problems/min-stack/', 3),
(201, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Stacks', 'Classic Design Problems', 'The Celebrity Problem (Elimination via Stack)', 'https://www.geeksforgeeks.org/problems/the-celebrity-problem/1', 3),
(202, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Implementation', 'Implement Queue using Arrays', 'https://www.geeksforgeeks.org/problems/implement-queue-using-array/1', 1),
(203, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Implementation', 'Implement Queue using Linked List', 'https://www.geeksforgeeks.org/problems/implement-queue-using-linked-list/1', 1),
(204, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Implementation', 'Implement Queue using Stacks', 'https://leetcode.com/problems/implement-queue-using-stacks/', 2),
(205, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Implementation', 'Implement Stack using Queues', 'https://leetcode.com/problems/implement-stack-using-queues/', 2),
(206, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Implementation', 'Reverse First K elements of Queue', 'https://www.geeksforgeeks.org/problems/reverse-first-k-elements-of-queue/1', 2),
(207, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Applications', 'Number of Students Unable to Eat Lunch', 'https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/', 2),
(208, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Queue Applications', 'First non-repeating character in a stream', 'https://leetcode.com/problems/first-unique-character-in-a-string/', 3),
(209, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Deque & Sliding Window Max', 'Sliding Window Maximum', 'https://leetcode.com/problems/sliding-window-maximum/', 4),
(210, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Deque & Sliding Window Max', 'Longest Continuous Subarray With Abs Diff ≤ Limit', 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/', 4),
(211, 'PHASE 5 : ADVANCED LINEAR DATA STRUCTURES', 'Queues', 'Deque & Sliding Window Max', 'Constrained Subsequence Sum', 'https://leetcode.com/problems/constrained-subsequence-sum/', 5),
(212, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Preorder Traversal (Recursive & Iterative)', 'https://leetcode.com/problems/binary-tree-preorder-traversal/', 3),
(213, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Inorder Traversal (Recursive & Iterative)', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', 3),
(214, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Postorder Traversal (Recursive & Iterative)', 'https://leetcode.com/problems/binary-tree-postorder-traversal/', 3),
(215, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Binary Tree Level Order Traversal', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 4),
(216, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Binary Tree Zigzag Level Order Traversal', 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', 4),
(217, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Left / Right View of Binary Tree', 'https://leetcode.com/problems/binary-tree-right-side-view/', 4),
(218, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Top / Bottom View of Binary Tree', 'https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1', 4),
(219, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Boundary Traversal of Binary Tree', 'https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1', 4),
(220, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Diagonal Traversal of Binary Tree', 'https://www.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1', 4),
(221, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Traversals & Views (Fundamentals)', 'Vertical Order Traversal of a Binary Tree', 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', 5),
(222, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Maximum Depth of Binary Tree', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 3),
(223, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Same Tree', 'https://leetcode.com/problems/same-tree/', 3),
(224, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Invert Binary Tree', 'https://leetcode.com/problems/invert-binary-tree/', 3),
(225, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Symmetric Tree', 'https://leetcode.com/problems/symmetric-tree/', 4),
(226, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Maximum Width of Binary Tree', 'https://leetcode.com/problems/maximum-width-of-binary-tree/', 4),
(227, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Count Complete Tree Nodes', 'https://leetcode.com/problems/count-complete-tree-nodes/', 4),
(228, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Diameter of Binary Tree', 'https://leetcode.com/problems/diameter-of-binary-tree/', 5),
(229, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Tree Properties & Dimensions', 'Balanced Binary Tree', 'https://leetcode.com/problems/balanced-binary-tree/', 5),
(230, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Path Sum I', 'https://leetcode.com/problems/path-sum/', 3),
(231, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Path Sum II', 'https://leetcode.com/problems/path-sum-ii/', 4),
(232, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Sum Root to Leaf Numbers', 'https://leetcode.com/problems/sum-root-to-leaf-numbers/', 4),
(233, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Maximum Difference Between Node and Ancestor', 'https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/', 4),
(234, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Lowest Common Ancestor of a Binary Tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', 5),
(235, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Binary Tree Maximum Path Sum', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', 5),
(236, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Paths, Sums & LCA', 'Path Sum III', 'https://leetcode.com/problems/path-sum-iii/', 5),
(237, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Graph-Like Traversals in Trees', 'Minimum time taken to burn the BT', 'https://www.geeksforgeeks.org/problems/burning-tree/1', 4),
(238, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Graph-Like Traversals in Trees', 'All Nodes Distance K in Binary Tree', 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/', 5),
(239, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Graph-Like Traversals in Trees', 'Step-By-Step Directions From a Binary Tree Node to Another', 'https://leetcode.com/problems/step-by-step-directions-from-a-binary-tree-node-to-another/', 5),
(240, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Structural Modifications & Construction', 'Merge Two Binary Trees', 'https://leetcode.com/problems/merge-two-binary-trees/', 3),
(241, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Structural Modifications & Construction', 'Children Sum Property in a Binary Tree', 'https://www.geeksforgeeks.org/problems/children-sum-parent/1', 3),
(242, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Structural Modifications & Construction', 'Construct Binary Tree from Preorder and Inorder Traversal', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', 5),
(243, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Structural Modifications & Construction', 'Construct Binary Tree from Inorder and Postorder Traversal', 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/', 4),
(244, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Structural Modifications & Construction', 'Flatten Binary Tree to Linked List', 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/', 4),
(245, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Trees', 'Structural Modifications & Construction', 'Serialize and Deserialize Binary Tree', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', 5),
(246, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Search in a Binary Search Tree', 'https://leetcode.com/problems/search-in-a-binary-search-tree/', 2),
(247, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Find Minimum/Maximum in BST', 'https://www.geeksforgeeks.org/problems/minimum-element-in-bst/1', 2),
(248, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Insert into a Binary Search Tree', 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', 3),
(249, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Floor and Ceil in a BST', 'https://www.geeksforgeeks.org/problems/implementing-ceil-in-bst/1', 3),
(250, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Inorder Successor in BST', 'https://www.geeksforgeeks.org/problems/inorder-successor-in-bst/1', 4),
(251, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Lowest Common Ancestor of a Binary Search Tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', 4),
(252, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Validate Binary Search Tree', 'https://leetcode.com/problems/validate-binary-search-tree/', 5),
(253, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Core Properties & Search', 'Kth Smallest Element in a BST', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', 5),
(254, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Standard Modifications & Deletions', 'Delete Node in a BST', 'https://leetcode.com/problems/delete-node-in-a-bst/', 4),
(255, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Standard Modifications & Deletions', 'Two Sum IV - Input is a BST', 'https://leetcode.com/problems/two-sum-iv-input-is-a-bst/', 5),
(256, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Construction & Advanced Operations', 'Convert Sorted Array to Binary Search Tree', 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', 3),
(257, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Construction & Advanced Operations', 'Construct BST from Preorder Traversal', 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', 4),
(258, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Construction & Advanced Operations', 'Balance a Binary Search Tree', 'https://leetcode.com/problems/balance-a-binary-search-tree/', 4),
(259, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Construction & Advanced Operations', 'Merge Two Balanced Binary Search Trees', 'https://www.geeksforgeeks.org/problems/merge-two-bst-s/1', 4),
(260, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Construction & Advanced Operations', 'Recover Binary Search Tree', 'https://leetcode.com/problems/recover-binary-search-tree/', 5),
(261, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Binary Search Trees', 'Construction & Advanced Operations', 'Largest BST in a Binary Tree', 'https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/', 5),
(262, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Implementation & String Search', 'Implement Trie (Prefix Tree)', 'https://leetcode.com/problems/implement-trie-prefix-tree/', 4),
(263, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Implementation & String Search', 'Design Add and Search Words Data Structure', 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', 4),
(264, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Implementation & String Search', 'Longest Word with All Prefixes', 'https://www.geeksforgeeks.org/problems/find-the-longest-string--170645/1', 4),
(265, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Implementation & String Search', 'Number of Distinct Substrings in a String', 'https://www.geeksforgeeks.org/problems/count-of-distinct-substrings/1', 4),
(266, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Implementation & String Search', 'Word Search II', 'https://leetcode.com/problems/word-search-ii/', 5),
(267, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Bitwise Tries (Advanced)', 'Maximum XOR of Two Numbers in an Array', 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', 5),
(268, 'PHASE 6 - HIERARCHIAL DATA STRUCTURES', 'Tries', 'Bitwise Tries (Advanced)', 'Maximum XOR With an Element From Array', 'https://leetcode.com/problems/maximum-xor-with-an-element-from-array/', 5),
(269, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Contains Duplicate', 'https://leetcode.com/problems/contains-duplicate/', 1),
(270, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Valid Anagram (Hashmap Approach)', 'https://leetcode.com/problems/valid-anagram/', 1),
(271, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Unique Number of Occurrences', 'https://leetcode.com/problems/unique-number-of-occurrences/', 1),
(272, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Find distinct elements / Find the Frequency', 'https://www.geeksforgeeks.org/problems/find-distinct-elements--130928/1', 1),
(273, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Two Sum', 'https://leetcode.com/problems/two-sum/', 2),
(274, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Intersection of Two Arrays', 'https://leetcode.com/problems/intersection-of-two-arrays/', 2),
(275, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Count Number of Pairs With Absolute Difference K', 'https://leetcode.com/problems/count-number-of-pairs-with-absolute-difference-k/', 2),
(276, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Hashmap Fundamentals', 'Design HashMap', 'https://leetcode.com/problems/design-hashmap/', 3),
(277, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Group Anagrams', 'https://leetcode.com/problems/group-anagrams/', 3),
(278, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Longest Consecutive Sequence', 'https://leetcode.com/problems/longest-consecutive-sequence/', 3),
(279, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Subarray Sum Equals K', 'https://leetcode.com/problems/subarray-sum-equals-k/', 3),
(280, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Contiguous Array / Largest subarray with 0 sum', 'https://leetcode.com/problems/contiguous-array/', 3),
(281, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Count subarrays with given XOR', 'https://www.geeksforgeeks.org/problems/count-subarray-with-given-xor/1', 3),
(282, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Subarray Sums Divisible by K', 'https://leetcode.com/problems/subarray-sums-divisible-by-k/', 3),
(283, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Intermediate Hashmap Problems', 'Continuous Subarray Sum', 'https://leetcode.com/problems/continuous-subarray-sum/', 3),
(284, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Advanced / Multi Concept', 'Maximum Size Subarray Sum Equals k', 'https://www.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1', 3),
(285, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Advanced / Multi Concept', 'Top K Frequent Elements', 'https://leetcode.com/problems/top-k-frequent-elements/', 3),
(286, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Advanced / Multi Concept', 'LRU Cache (Least Recently Used)', 'https://leetcode.com/problems/lru-cache/', 4),
(287, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Hashmaps', 'Advanced / Multi Concept', 'LFU Cache (Least Frequently Used)', 'https://leetcode.com/problems/lfu-cache/', 5),
(288, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Heap Fundamentals', 'Check if an array represents a min heap', 'https://www.geeksforgeeks.org/problems/does-array-represent-heap4345/1', 2),
(289, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Heap Fundamentals', 'Convert Min Heap to Max Heap', 'https://www.geeksforgeeks.org/problems/convert-min-heap-to-max-heap-1666385109/1', 2),
(290, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Heap Fundamentals', 'Implement Min/Max Heap', 'https://www.geeksforgeeks.org/problems/operations-on-binary-min-heap/1', 3),
(291, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'The Top-K Pattern', 'Last Stone Weight', 'https://leetcode.com/problems/last-stone-weight/', 3),
(292, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'The Top-K Pattern', 'Kth Largest Element in an Array', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 4),
(293, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'The Top-K Pattern', 'K Closest Points to Origin', 'https://leetcode.com/problems/k-closest-points-to-origin/', 4),
(294, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'The Top-K Pattern', 'Sort a K Sorted Array / Nearly Sorted Algorithm', 'https://www.geeksforgeeks.org/problems/nearly-sorted-1587115620/1', 4),
(295, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'The Top-K Pattern', 'Top K Frequent Elements (Heap Approach)', 'https://leetcode.com/problems/top-k-frequent-elements/', 4),
(296, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Merging & Combinations', 'Minimum Cost of Ropes', 'https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1', 4),
(297, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Merging & Combinations', 'Merge K Sorted Lists', 'https://leetcode.com/problems/merge-k-sorted-lists/', 5),
(298, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Merging & Combinations', 'Kth Smallest Element in a Sorted Matrix', 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/', 4),
(299, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Advanced / Two-Heaps / Scheduling', 'Task Scheduler', 'https://leetcode.com/problems/task-scheduler/', 5),
(300, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Advanced / Two-Heaps / Scheduling', 'Reorganize String', 'https://leetcode.com/problems/reorganize-string/', 5),
(301, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Advanced / Two-Heaps / Scheduling', 'Minimum Number of Refueling Stops', 'https://leetcode.com/problems/minimum-number-of-refueling-stops/', 5),
(302, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Heaps / Priority Queues', 'Advanced / Two-Heaps / Scheduling', 'Find Median from Data Stream', 'https://leetcode.com/problems/find-median-from-data-stream/', 5),
(303, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Running Sum of 1D Array', 'https://leetcode.com/problems/running-sum-of-1d-array/', 1),
(304, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Find the Highest Altitude', 'https://leetcode.com/problems/range-sum-query-immutable/', 2),
(305, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Find Pivot Index', 'https://leetcode.com/problems/find-pivot-index/', 2),
(306, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Range Sum Query - Immutable', 'https://leetcode.com/problems/range-sum-query-immutable/', 2),
(307, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Product of Array Except Self', 'https://leetcode.com/problems/product-of-array-except-self/', 3),
(308, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Corporate Flight Bookings', 'https://leetcode.com/problems/corporate-flight-bookings/', 4),
(309, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '1d Prefix Sum', 'Trapping Rain Water (Prefix Max / Min)', 'https://leetcode.com/problems/trapping-rain-water/', 4),
(310, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '2d Prefix Sum', 'Range Sum Query 2D - Immutable', 'https://leetcode.com/problems/range-sum-query-2d-immutable/', 3),
(311, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '2d Prefix Sum', 'Matrix Block Sum', 'https://leetcode.com/problems/matrix-block-sum/', 3),
(312, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Prefix Sum', '2d Prefix Sum', 'Maximum Sum of a 2D Subgrid of size K x K', 'https://www.geeksforgeeks.org/problems/coins-of-geekland--141631/1', 4),
(313, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Two Pointers Basics', 'Move Zeroes (Two Pointer Intution)', 'https://leetcode.com/problems/move-zeroes/', 1),
(314, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Two Pointers Basics', 'Valid Palindrome (Two Pointers)', 'https://leetcode.com/problems/valid-palindrome/', 1),
(315, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Two Pointers Basics', 'Two Sum II - Input Array Is Sorted', 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', 2),
(316, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Two Pointers Basics', 'Sort Colors (Dutch National Flag)', 'https://leetcode.com/problems/sort-colors/', 2),
(317, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Two Pointers Basics', 'Container With Most Water', 'https://leetcode.com/problems/container-with-most-water/', 3),
(318, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Two Pointers Basics', '3Sum', 'https://leetcode.com/problems/3sum/', 3),
(319, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Fixed Size Slding Window', 'Maximum Average Subarray I', 'https://leetcode.com/problems/maximum-average-subarray-i/', 2),
(320, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Fixed Size Slding Window', 'Max Sum Subarray of size K', 'https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k/', 2),
(321, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Fixed Size Slding Window', 'Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold', 'https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/', 2),
(322, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Fixed Size Slding Window', 'Minimum Consecutive Cards to Pick Up', 'https://leetcode.com/problems/minimum-consecutive-cards-to-pick-up/', 2),
(323, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Fixed Size Slding Window', 'Maximum Points You Can Obtain from Cards', 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/', 3),
(324, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Find All Anagrams in a String', 'https://leetcode.com/problems/find-all-anagrams-in-a-string/', 3),
(325, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Permutation in String', 'https://leetcode.com/problems/permutation-in-string/', 3),
(326, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Minimum Size Subarray Sum', 'https://leetcode.com/problems/minimum-size-subarray-sum/', 3),
(327, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Longest Substring Without Repeating Characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 3),
(328, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Longest Repeating Character Replacement', 'https://leetcode.com/problems/longest-repeating-character-replacement/', 3),
(329, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Max Consecutive Ones III', 'https://leetcode.com/problems/max-consecutive-ones-iii/', 3),
(330, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Fruit Into Baskets', 'https://leetcode.com/problems/fruit-into-baskets/', 3),
(331, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Maximum Erasure Value', 'https://leetcode.com/problems/maximum-erasure-value/', 3),
(332, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Variable Size Sliding Window', 'Number of Substrings Containing All Three Characters', 'https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/', 3),
(333, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Advanced Sliding Window / Counting / Atmost K', 'Binary Subarrays With Sum', 'https://leetcode.com/problems/binary-subarrays-with-sum/', 3),
(334, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Advanced Sliding Window / Counting / Atmost K', 'Count Number of Nice Subarrays', 'https://leetcode.com/problems/count-number-of-nice-subarrays/', 3),
(335, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Advanced Sliding Window / Counting / Atmost K', 'Subarrays with K Different Integers', 'https://leetcode.com/problems/subarrays-with-k-different-integers/', 4),
(336, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Advanced Sliding Window / Counting / Atmost K', 'Minimum Window Subsequence', 'https://leetcode.com/problems/minimum-window-subsequence/', 4),
(337, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Two Pointers & Sliding Window', 'Advanced Sliding Window / Counting / Atmost K', 'Minimum Window Substring', 'https://leetcode.com/problems/minimum-window-substring/', 5),
(338, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Basics & Properties', 'K-th Bit is Set or Not', 'https://www.geeksforgeeks.org/problems/check-whether-k-th-bit-is-set-or-not-1587115620/1', 1),
(339, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Basics & Properties', 'Check if a Number is Odd or Not', 'https://www.geeksforgeeks.org/problems/odd-or-even3618/1', 1),
(340, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Basics & Properties', 'Check If Number Power of 2 or Not', 'https://leetcode.com/problems/power-of-two/', 2),
(341, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Basics & Properties', 'Number Of Even and Odd Bits', 'https://leetcode.com/problems/number-of-even-and-odd-bits/', 2),
(342, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Basics & Properties', 'Minimum Bit Flips To Convert Number', 'https://leetcode.com/problems/minimum-bit-flips-to-convert-number/', 3),
(343, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'XOR Tricks', 'Swap Two Numbers (XOR Trick)', 'https://www.geeksforgeeks.org/problems/swap-two-numbers3844/1', 2),
(344, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'XOR Tricks', 'Single Number I', 'https://leetcode.com/problems/single-number/', 2),
(345, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'XOR Tricks', 'Is Binary Number Multiple of 3', 'https://www.geeksforgeeks.org/problems/is-binary-number-multiple-of-30654/1', 2),
(346, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'XOR Tricks', 'Find the repeating and missing number', 'https://leetcode.com/problems/find-missing-and-repeated-values/', 3),
(347, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'XOR Tricks', 'Single Number II', 'https://leetcode.com/problems/single-number-ii/', 4),
(348, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'XOR Tricks', 'Single Number III', 'https://leetcode.com/problems/single-number-iii/', 5),
(349, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Counting & Advanced', 'Count Set Bits From 1 to N', 'https://www.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1', 4),
(350, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Counting & Advanced', 'Bleak Numbers', 'https://www.geeksforgeeks.org/problems/bleak-numbers1552/1', 4),
(351, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Counting & Advanced', 'Minimum Xor Pair', 'https://www.geeksforgeeks.org/problems/minimum-xor-value-pair/1', 4),
(352, 'PHASE 7 : CORE DATA STRUCTURES AND TECHNIQUES', 'Bit Manipulation', 'Bit Counting & Advanced', 'Divide Two Integers (Bit Shifting)', 'https://leetcode.com/problems/divide-two-integers/', 4),
(353, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Basics & Array Manipulation', 'Assign Cookies', 'https://leetcode.com/problems/assign-cookies/', 1),
(354, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Basics & Array Manipulation', 'Lemonade Change', 'https://leetcode.com/problems/lemonade-change/', 2),
(355, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Basics & Array Manipulation', 'Maximize Sum of Array After K Negations', 'https://leetcode.com/problems/maximize-sum-of-array-after-k-negations/', 2),
(356, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Basics & Array Manipulation', 'Shortest Job First', 'https://www.geeksforgeeks.org/problems/shortest-job-first/1', 2),
(357, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Basics & Array Manipulation', 'Activity Selection / N Meetings in One Room', 'https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1', 2),
(358, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Merge Intervals (Greedy View)', 'https://leetcode.com/problems/merge-intervals/', 3),
(359, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Insert Interval', 'https://leetcode.com/problems/insert-interval/', 3),
(360, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Non-overlapping Intervals', 'https://leetcode.com/problems/non-overlapping-intervals/', 3),
(361, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Minimum Number of Arrows to Burst Balloons', 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', 3),
(362, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Job Sequencing Problem', 'https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1', 3),
(363, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Minimum Platforms required for a railway', 'https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1', 3),
(364, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Maximum Meetings in One Room', 'https://www.geeksforgeeks.org/problems/maximum-meetings-in-one-room/1', 3),
(365, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Intervals & Scheduling', 'Task Scheduler (Greedy Approach)', 'https://leetcode.com/problems/task-scheduler/', 3),
(366, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Array & Jump Greedy', 'Jump Game', 'https://leetcode.com/problems/jump-game/', 3),
(367, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Array & Jump Greedy', 'Valid Parenthesis String', 'https://leetcode.com/problems/valid-parenthesis-string/', 3),
(368, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Array & Jump Greedy', 'Gas Station', 'https://leetcode.com/problems/gas-station/', 3),
(369, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Array & Jump Greedy', 'Jump Game II', 'https://leetcode.com/problems/jump-game-ii/', 3),
(370, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Advanced Greedy', 'Minimize the Heights II', 'https://www.geeksforgeeks.org/problems/minimize-the-heights3351/1', 4),
(371, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Advanced Greedy', 'Candy', 'https://leetcode.com/problems/candy/', 4),
(372, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Advanced Greedy', 'Huffman Decoding / Coding', 'https://www.geeksforgeeks.org/problems/huffman-encoding3345/1', 4),
(373, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Advanced Greedy', 'Minimum Number of Taps to Open to Water a Garden', 'https://leetcode.com/problems/minimum-number-of-taps-to-open-to-water-a-garden/', 4),
(374, 'PHASE 8 : STANDARD ALGORITHMS', 'Greedy', 'Advanced Greedy', 'Course Schedule III', 'https://leetcode.com/problems/course-schedule-iii/', 5),
(375, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Graphs Fundamentals & Traversals', 'BFS of Graph', 'https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1', 1),
(376, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Graphs Fundamentals & Traversals', 'DFS of Graph', 'https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1', 1),
(377, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Graphs Fundamentals & Traversals', 'Find if Path Exists in Graph', 'https://leetcode.com/problems/find-if-path-exists-in-graph/', 2),
(378, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Graphs Fundamentals & Traversals', 'Number of Provinces', 'https://leetcode.com/problems/number-of-provinces/', 2),
(379, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Graphs Fundamentals & Traversals', 'Clone Graph', 'https://leetcode.com/problems/clone-graph/', 3),
(380, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Graphs Fundamentals & Traversals', 'Is Graph Bipartite?', 'https://leetcode.com/problems/is-graph-bipartite/', 3),
(381, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Flood Fill', 'https://leetcode.com/problems/flood-fill/', 2),
(382, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Max Area of Island', 'https://leetcode.com/problems/max-area-of-island/', 2),
(383, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Number of Islands', 'https://leetcode.com/problems/number-of-islands/', 3),
(384, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Rotting Oranges', 'https://leetcode.com/problems/rotting-oranges/', 3),
(385, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', '01 Matrix / Distance of nearest cell having 1', 'https://www.geeksforgeeks.org/problems/distance-of-nearest-cell-having-1-1587115620/1', 3),
(386, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Surrounded Regions', 'https://leetcode.com/problems/surrounded-regions/', 3),
(387, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Number of Enclaves', 'https://leetcode.com/problems/number-of-enclaves/', 3),
(388, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Shortest Path in Binary Matrix', 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', 3),
(389, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Swim in Rising Water', 'https://leetcode.com/problems/swim-in-rising-water/', 4),
(390, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Matrix / Grid BFS Problems', 'Making A Large Island', 'https://leetcode.com/problems/making-a-large-island/', 4),
(391, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Cycle Detection', 'Cycle Detection in Undirected Graph', 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1', 2),
(392, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Cycle Detection', 'Detect Cycle in a Directed Graph', 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', 3),
(393, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Cycle Detection', 'Find Eventual Safe States', 'https://leetcode.com/problems/find-eventual-safe-states/', 3),
(394, 'PHASE 8 : STANDARD ALGORITHMS', 'Graphs', 'Topological Sorting (Kahn''s Algorithm)', 'Topological Sort', 'https://www.geeksforgeeks.org/problems/topological-sort/1', 3);
