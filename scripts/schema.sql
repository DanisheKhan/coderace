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
truncate table public.questions restart identity cascade;

insert into public.questions (sr_no, phase, topic, subtopic, problem_name, link, difficulty) values
-- Phase 1
(1, 'Phase 1: Basics & Arrays', 'Arrays', 'Basic Operations', 'Two Sum', 'https://leetcode.com/problems/two-sum/', 1),
(2, 'Phase 1: Basics & Arrays', 'Arrays', 'Basic Operations', 'Best Time to Buy and Sell Stock', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 1),
(3, 'Phase 1: Basics & Arrays', 'Arrays', 'Basic Operations', 'Majority Element', 'https://leetcode.com/problems/majority-element/', 2),
(4, 'Phase 1: Basics & Arrays', 'Arrays', 'Two Pointers', '3Sum', 'https://leetcode.com/problems/3sum/', 3),
(5, 'Phase 1: Basics & Arrays', 'Arrays', 'Subarrays', 'Maximum Subarray (Kadane''s)', 'https://leetcode.com/problems/maximum-subarray/', 2),
(6, 'Phase 1: Basics & Arrays', 'Arrays', 'Sorting/Searching', 'Sort Colors', 'https://leetcode.com/problems/sort-colors/', 2),
(7, 'Phase 1: Basics & Arrays', 'Arrays', 'Advanced', 'Next Permutation', 'https://leetcode.com/problems/next-permutation/', 3),
(8, 'Phase 1: Basics & Arrays', 'Strings', 'Basic Operations', 'Valid Anagram', 'https://leetcode.com/problems/valid-anagram/', 1),
(9, 'Phase 1: Basics & Arrays', 'Strings', 'Sliding Window', 'Longest Substring Without Repeating Characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 3),
(10, 'Phase 1: Basics & Arrays', 'Strings', 'Hashing', 'Group Anagrams', 'https://leetcode.com/problems/group-anagrams/', 3),

-- Phase 2
(11, 'Phase 2: Recursion & LinkedLists', 'Linked List', 'Singly Linked List', 'Reverse Linked List', 'https://leetcode.com/problems/reverse-linked-list/', 1),
(12, 'Phase 2: Recursion & LinkedLists', 'Linked List', 'Singly Linked List', 'Linked List Cycle', 'https://leetcode.com/problems/linked-list-cycle/', 1),
(13, 'Phase 2: Recursion & LinkedLists', 'Linked List', 'Singly Linked List', 'Merge Two Sorted Lists', 'https://leetcode.com/problems/merge-two-sorted-lists/', 1),
(14, 'Phase 2: Recursion & LinkedLists', 'Linked List', 'Two Pointers', 'Remove Nth Node From End of List', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', 2),
(15, 'Phase 2: Recursion & LinkedLists', 'Linked List', 'Advanced', 'Copy List with Random Pointer', 'https://leetcode.com/problems/copy-list-with-random-pointer/', 3),
(16, 'Phase 2: Recursion & LinkedLists', 'Recursion', 'Backtracking', 'Subsets', 'https://leetcode.com/problems/subsets/', 2),
(17, 'Phase 2: Recursion & LinkedLists', 'Recursion', 'Backtracking', 'Permutations', 'https://leetcode.com/problems/permutations/', 3),
(18, 'Phase 2: Recursion & LinkedLists', 'Recursion', 'Backtracking', 'N-Queens', 'https://leetcode.com/problems/n-queens/', 4),

-- Phase 3
(19, 'Phase 3: Trees & Graphs', 'Trees', 'Traversals', 'Binary Tree Inorder Traversal', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', 1),
(20, 'Phase 3: Trees & Graphs', 'Trees', 'Properties', 'Maximum Depth of Binary Tree', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 1),
(21, 'Phase 3: Trees & Graphs', 'Trees', 'Properties', 'Invert Binary Tree', 'https://leetcode.com/problems/invert-binary-tree/', 1),
(22, 'Phase 3: Trees & Graphs', 'Trees', 'Traversals', 'Binary Tree Level Order Traversal', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 2),
(23, 'Phase 3: Trees & Graphs', 'Trees', 'BST', 'Validate Binary Search Tree', 'https://leetcode.com/problems/validate-binary-search-tree/', 3),
(24, 'Phase 3: Trees & Graphs', 'Trees', 'BST', 'Lowest Common Ancestor of a BST', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', 2),
(25, 'Phase 3: Trees & Graphs', 'Graphs', 'Traversals', 'Number of Islands', 'https://leetcode.com/problems/number-of-islands/', 3),
(26, 'Phase 3: Trees & Graphs', 'Graphs', 'Traversals', 'Clone Graph', 'https://leetcode.com/problems/clone-graph/', 3),
(27, 'Phase 3: Trees & Graphs', 'Graphs', 'DFS/BFS', 'Course Schedule', 'https://leetcode.com/problems/course-schedule/', 3),

-- Phase 4
(28, 'Phase 4: Dynamic Programming & Greedy', 'DP', '1D DP', 'Climbing Stairs', 'https://leetcode.com/problems/climbing-stairs/', 1),
(29, 'Phase 4: Dynamic Programming & Greedy', 'DP', '1D DP', 'House Robber', 'https://leetcode.com/problems/house-robber/', 2),
(30, 'Phase 4: Dynamic Programming & Greedy', 'DP', 'Standard DP', 'Coin Change', 'https://leetcode.com/problems/coin-change/', 3),
(31, 'Phase 4: Dynamic Programming & Greedy', 'DP', 'Standard DP', 'Longest Increasing Subsequence', 'https://leetcode.com/problems/longest-increasing-subsequence/', 3),
(32, 'Phase 4: Dynamic Programming & Greedy', 'DP', 'Strings', 'Longest Common Subsequence', 'https://leetcode.com/problems/longest-common-subsequence/', 3),
(33, 'Phase 4: Dynamic Programming & Greedy', 'DP', 'Strings', 'Edit Distance', 'https://leetcode.com/problems/edit-distance/', 4),
(34, 'Phase 4: Dynamic Programming & Greedy', 'Greedy', 'Easy', 'Assign Cookies', 'https://leetcode.com/problems/assign-cookies/', 1),
(35, 'Phase 4: Dynamic Programming & Greedy', 'Greedy', 'Intervals', 'Merge Intervals', 'https://leetcode.com/problems/merge-intervals/', 3),
(36, 'Phase 4: Dynamic Programming & Greedy', 'Greedy', 'Standard', 'Jump Game', 'https://leetcode.com/problems/jump-game/', 3),

-- Phase 5
(37, 'Phase 5: Advanced & Misc', 'Heaps', 'Priority Queue', 'Kth Largest Element in an Array', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 3),
(38, 'Phase 5: Advanced & Misc', 'Heaps', 'Design', 'Find Median from Data Stream', 'https://leetcode.com/problems/find-median-from-data-stream/', 4),
(39, 'Phase 5: Advanced & Misc', 'Backtracking', 'Grid Search', 'Word Search', 'https://leetcode.com/problems/word-search/', 3),
(40, 'Phase 5: Advanced & Misc', 'Bit Manipulation', 'Basic Operations', 'Single Number', 'https://leetcode.com/problems/single-number/', 1),
(41, 'Phase 5: Advanced & Misc', 'Tries', 'Design', 'Implement Trie (Prefix Tree)', 'https://leetcode.com/problems/implement-trie-prefix-tree/', 3);
