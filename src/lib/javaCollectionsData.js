export const CATEGORIES = [
  { id: 'all', name: 'All Structures' },
  { id: 'lists', name: 'Lists & Arrays' },
  { id: 'maps-sets', name: 'Maps & Sets' },
  { id: 'strings', name: 'Strings & Builders' },
  { id: 'stacks-queues', name: 'Stacks, Queues & Heaps' },
  { id: 'trees', name: 'Trees & Sorted Maps' },
  { id: 'utilities', name: 'Arrays & Collections Utilities' },
];

export const JAVA_COLLECTIONS_DATA = [
  {
    id: 'native-array',
    name: 'Native Array (Type[])',
    category: 'lists',
    tagline: 'Fixed-size contiguous memory block supporting instant O(1) index access',
    package: 'Primitive / Object Array',
    interface: 'Type[]',
    overallComplexity: 'Access: O(1) | Modify: O(1) | Search: O(n) | Resizing: N/A',
    description:
      'Native arrays are fixed-length, contiguous memory blocks created with a specific capacity. Elements are indexed from 0 to length - 1. Offers the fastest memory access performance in Java.',
    matrix: {
      internal: 'Contiguous Array',
      add: 'arr[i] = val',
      get: 'arr[index]',
      delete: 'N/A (Fixed capacity)',
      search: 'Loop O(n)',
      isEmpty: 'arr.length == 0',
      size: 'arr.length',
      duplicatesAndNulls: 'Duplicates: Yes | Nulls: Yes',
      complexity: 'Access O(1), Fixed Capacity'
    },
    operations: [
      {
        method: 'arr[index] = value',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Assigns value to specified array index.',
        example: 'nums[0] = 42;',
      },
      {
        method: 'arr[index]',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Accesses element at specified index. Throws ArrayIndexOutOfBoundsException if out of bounds.',
        example: 'int first = nums[0];',
      },
      {
        method: 'arr.length',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Public final property returning total fixed length of array.',
        example: 'int n = nums.length;',
      },
      {
        method: 'new int[rows][cols]',
        timeComplexity: 'O(r * c)',
        spaceComplexity: 'O(r * c)',
        description: 'Allocates multi-dimensional 2D array grid.',
        example: 'int[][] grid = new int[3][4];',
      },
      {
        method: 'arr.clone()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Creates shallow copy of array with new memory allocation.',
        example: 'int[] copy = nums.clone();',
      },
    ],
    codeSnippet: `public class NativeArrayExample {
    public static void main(String[] args) {
        // 1. Declaration & Direct Initialization
        int[] nums = {10, 20, 30, 40, 50};
        
        // 2. O(1) Instant index read & write
        nums[2] = 99; // Modifies 30 -> 99
        System.out.println("Element at 2: " + nums[2]);
        
        // 3. Iterating Array
        int sum = 0;
        for (int n : nums) {
            sum += n;
        }
        
        // 4. 2D Array Matrix initialization
        int[][] matrix = new int[2][3];
        matrix[0][1] = 5;
    }
}`,
    pitfalls: [
      'Fixed Size: Array length cannot be modified after allocation. Use `ArrayList` if dynamic resizing is needed.',
      'OutOfBounds Risk: Accessing index < 0 or >= arr.length throws `ArrayIndexOutOfBoundsException`.',
      'Note length vs length(): Native arrays use `arr.length` property (no parentheses), while String uses `str.length()`.',
    ],
  },
  {
    id: 'immutable-string',
    name: 'String (Immutable)',
    category: 'strings',
    tagline: 'Immutable sequence of UTF-16 characters stored in String Pool',
    package: 'java.lang.String',
    interface: 'CharSequence, Comparable<String>',
    overallComplexity: 'Access: O(1) | Concat (+): O(n) | Search: O(n)',
    description:
      'Java Strings are immutable sequences of characters. Once created, a String object content cannot be changed. Any string modification creates a new String instance in heap/String Pool memory.',
    matrix: {
      internal: 'UTF-[#] Char Pool',
      add: 'str1 + str2',
      get: 'charAt(index)',
      delete: 'replace()',
      search: 'contains()',
      isEmpty: 'isEmpty()',
      size: 'length()',
      duplicatesAndNulls: 'Chars duplicate: Yes | Null: NPE',
      complexity: 'Immutable, Concat O(n)'
    },
    operations: [
      {
        method: 'length()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns number of UTF-16 code units in string.',
        example: 'int len = str.length();',
      },
      {
        method: 'charAt(int index)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns char at specified index (0 to length-1).',
        example: 'char c = str.charAt(0);',
      },
      {
        method: 'substring(int beginIndex, int endIndex)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns substring starting at beginIndex (inclusive) up to endIndex (exclusive).',
        example: 'String sub = str.substring(0, 5);',
      },
      {
        method: 'equals(Object obj)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Compares characters of two strings for value equality.',
        example: 'if (s1.equals(s2)) { ... }',
      },
      {
        method: 'indexOf(String str)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns index of first occurrence of substring, or -1 if not found.',
        example: 'int idx = str.indexOf("cat");',
      },
      {
        method: 'toCharArray()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts String into newly allocated char[] array.',
        example: 'char[] chars = str.toCharArray();',
      },
      {
        method: 'split(String regex)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Splits string around matches of given regular expression.',
        example: 'String[] words = str.split(" ");',
      },
      {
        method: 'isEmpty() / isBlank()',
        timeComplexity: 'O(1) / O(n)',
        spaceComplexity: 'O(1)',
        description: 'isEmpty() checks length == 0; isBlank() checks if empty or whitespace only.',
        example: 'boolean empty = str.isEmpty();',
      },
    ],
    codeSnippet: `public class StringExample {
    public static void main(String[] args) {
        String s = "Hello World";
        
        // 1. Access & Substring
        char first = s.charAt(0); // 'H'
        String world = s.substring(6, 11); // "World"
        
        // 2. Character array conversion pattern for DSA
        char[] arr = s.toCharArray();
        java.util.Arrays.sort(arr); // Sorted characters
        String sortedStr = new String(arr);
        
        // 3. Always use equals() for content comparison, NEVER ==
        String a = new String("test");
        String b = new String("test");
        System.out.println("equals(): " + a.equals(b)); // true
        System.out.println("==: " + (a == b));           // false (different objects)
    }
}`,
    pitfalls: [
      'String Immutability Penalty: Concatenating strings in a loop (`s += i`) creates a new String each iteration, resulting in O(n^2) time. Use `StringBuilder` for loop concatenation.',
      'Reference equality trap: Never use `==` to compare string contents. `==` checks if both references point to exact same heap address, whereas `equals()` compares character values.',
    ],
  },
  {
    id: 'arraylist',
    name: 'ArrayList',
    category: 'lists',
    tagline: 'Dynamic resizable array supporting fast random access O(1)',
    package: 'java.util.ArrayList',
    interface: 'List<T>',
    overallComplexity: 'Access: O(1) | Add: O(1) amortized | Search: O(n)',
    description:
      'ArrayList is an ordered collection backed by a dynamically growing internal array. Resizes by 1.5x when full. Ideal when you need frequent random element access by index.',
    matrix: {
      internal: 'Dynamic Array (1.5x grow)',
      add: 'add(element)',
      get: 'get(index)',
      delete: 'remove(index)',
      search: 'contains(element)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Duplicates: Yes | Nulls: Yes',
      complexity: 'Access O(1), Add O(1) amortized'
    },
    operations: [
      {
        method: 'add(E element)',
        timeComplexity: 'O(1) amortized',
        spaceComplexity: 'O(1)',
        description: 'Appends element to the end of the list.',
        example: 'list.add("Java");',
      },
      {
        method: 'add(int index, E element)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Inserts element at specified index, shifting right elements.',
        example: 'list.add(0, "First");',
      },
      {
        method: 'get(int index)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns element at index. Throws IndexOutOfBoundsException if invalid.',
        example: 'String item = list.get(2);',
      },
      {
        method: 'set(int index, E element)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Replaces element at index with specified value, returns previous element.',
        example: 'list.set(1, "Updated");',
      },
      {
        method: 'remove(int index)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes element at specified index and shifts subsequent elements left.',
        example: 'list.remove(0);',
      },
      {
        method: 'remove(Object obj)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes first occurrence of element if present. Returns boolean.',
        example: 'list.remove("Java");',
      },
      {
        method: 'contains(Object obj)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if list contains specified element (uses equals()).',
        example: 'boolean exists = list.contains("Python");',
      },
      {
        method: 'size()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns number of elements in the list.',
        example: 'int count = list.size();',
      },
      {
        method: 'isEmpty()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if list contains no elements.',
        example: 'if (list.isEmpty()) { ... }',
      },
      {
        method: 'clear()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes all elements from the list, resetting size to 0.',
        example: 'list.clear();',
      },
      {
        method: 'indexOf(Object obj)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns first index of element, or -1 if not found.',
        example: 'int idx = list.indexOf("Data");',
      },
    ],
    codeSnippet: `import java.util.ArrayList;
import java.util.List;

public class ArrayListExample {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        
        // 1. Add operations
        list.add("Apple");
        list.add("Banana");
        list.add(1, "Cherry"); // Inserts at index 1 -> ["Apple", "Cherry", "Banana"]
        
        // 2. Get & Set
        String item = list.get(0); // "Apple"
        list.set(2, "Blueberry");  // Replaces "Banana" with "Blueberry"
        
        // 3. Remove operations
        list.remove(1);        // Removes "Cherry"
        list.remove("Apple");  // Removes "Apple"
        
        // 4. Utility methods
        System.out.println("Size: " + list.size());
        System.out.println("Contains Blueberry? " + list.contains("Blueberry"));
    }
}`,
    pitfalls: [
      'Resizing penalty: When capacity is exceeded, array creates a new array of 1.5x capacity and copies all items.',
      'Primitives require Wrapper Classes: Use `ArrayList<Integer>` instead of `ArrayList<int>`.',
      'Index removal vs Object removal: `list.remove(1)` removes index 1, while `list.remove(Integer.valueOf(1))` removes value 1.',
    ],
  },
  {
    id: 'hashmap',
    name: 'HashMap',
    category: 'maps-sets',
    tagline: 'Key-Value hashtable with fast O(1) average lookup & insertion',
    package: 'java.util.HashMap',
    interface: 'Map<K, V>',
    overallComplexity: 'Put: O(1) avg | Get: O(1) avg | Remove: O(1) avg',
    description:
      'HashMap stores key-value pairs using a hash table. It permits null keys and null values. Java 8+ converts buckets with >8 collisions into Red-Black Trees (O(log n) worst case).',
    matrix: {
      internal: 'Hash Table + Buckets',
      add: 'put(key, value)',
      get: 'get(key)',
      delete: 'remove(key)',
      search: 'containsKey(key)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Keys Unique | 1 Null Key Allowed',
      complexity: 'Put & Get O(1) avg'
    },
    operations: [
      {
        method: 'put(K key, V value)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Associates key with value. Returns previous value associated with key, or null.',
        example: 'map.put("Alice", 95);',
      },
      {
        method: 'get(K key)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Returns value mapped to key, or null if key does not exist.',
        example: 'Integer score = map.get("Alice");',
      },
      {
        method: 'getOrDefault(K key, V defaultValue)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Returns mapped value if present; otherwise returns specified defaultValue.',
        example: 'int score = map.getOrDefault("Bob", 0);',
      },
      {
        method: 'containsKey(Object key)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Returns true if map contains entry for specified key.',
        example: 'if (map.containsKey("Alice")) { ... }',
      },
      {
        method: 'containsValue(Object value)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if map maps one or more keys to specified value.',
        example: 'boolean hasScore = map.containsValue(100);',
      },
      {
        method: 'putIfAbsent(K key, V value)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Puts key-value pair only if key is not already mapped or mapped to null.',
        example: 'map.putIfAbsent("Bob", 80);',
      },
      {
        method: 'remove(Object key)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Removes mapping for key if present. Returns value or null.',
        example: 'map.remove("Alice");',
      },
      {
        method: 'keySet()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns Set view of all keys contained in map.',
        example: 'Set<String> keys = map.keySet();',
      },
      {
        method: 'values()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns Collection view of all values contained in map.',
        example: 'Collection<Integer> vals = map.values();',
      },
      {
        method: 'entrySet()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns Set view of key-value mappings (Map.Entry<K, V>).',
        example: 'for (Map.Entry<String, Integer> e : map.entrySet()) { ... }',
      },
    ],
    codeSnippet: `import java.util.HashMap;
import java.util.Map;

public class HashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        
        // 1. Frequency counting pattern
        String[] words = {"apple", "banana", "apple", "cherry", "banana", "apple"};
        for (String w : words) {
            map.put(w, map.getOrDefault(w, 0) + 1);
        }
        
        // 2. Checking key & accessing
        if (map.containsKey("apple")) {
            System.out.println("Apple count: " + map.get("apple")); // 3
        }
        
        // 3. Iterating entrySet
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }
    }
}`,
    pitfalls: [
      'Unordered entries: HashMap does NOT preserve insertion order. Use `LinkedHashMap` if order matters.',
      'Mutable keys: Avoid using mutable objects as HashMap keys. If hashCode changes after insertion, element becomes unretrievable.',
      'Always override `hashCode()` along with `equals()` when creating custom key classes.',
    ],
  },
  {
    id: 'hashset',
    name: 'HashSet',
    category: 'maps-sets',
    tagline: 'Collection of unique elements backed by an internal HashMap',
    package: 'java.util.HashSet',
    interface: 'Set<T>',
    overallComplexity: 'Add: O(1) avg | Contains: O(1) avg | Remove: O(1) avg',
    description:
      'HashSet implements the Set interface using a HashMap internally. It contains no duplicates and permits at most one null element.',
    matrix: {
      internal: 'Internal HashMap Keys',
      add: 'add(element)',
      get: 'contains(element)',
      delete: 'remove(element)',
      search: 'contains(element)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Duplicates: No | 1 Null Allowed',
      complexity: 'Add & Contains O(1) avg'
    },
    operations: [
      {
        method: 'add(E element)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Adds element if not already present. Returns true if set changed.',
        example: 'boolean added = set.add(10);',
      },
      {
        method: 'remove(Object obj)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Removes element if present. Returns true if removed.',
        example: 'set.remove(10);',
      },
      {
        method: 'contains(Object obj)',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Returns true if set contains specified element.',
        example: 'if (set.contains(5)) { ... }',
      },
      {
        method: 'size()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns number of elements in set.',
        example: 'int sz = set.size();',
      },
      {
        method: 'isEmpty()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if set contains no elements.',
        example: 'set.isEmpty();',
      },
      {
        method: 'clear()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes all elements from set.',
        example: 'set.clear();',
      },
    ],
    codeSnippet: `import java.util.HashSet;
import java.util.Set;

public class HashSetExample {
    public static void main(String[] args) {
        Set<Integer> set = new HashSet<>();
        
        // 1. Adding elements (duplicates are ignored)
        set.add(10);
        set.add(20);
        set.add(10); // Returns false, size remains 2
        
        // 2. O(1) Duplicate check pattern
        int[] nums = {1, 2, 3, 1};
        Set<Integer> seen = new HashSet<>();
        for (int n : nums) {
            if (!seen.add(n)) {
                System.out.println("Duplicate found: " + n);
            }
        }
    }
}`,
    pitfalls: [
      'No order guarantee: Elements in HashSet are not sorted or ordered by insertion time.',
      'Requires proper `hashCode()` and `equals()` implementation for custom objects to check uniqueness.',
    ],
  },
  {
    id: 'stringbuilder',
    name: 'StringBuilder',
    category: 'strings',
    tagline: 'Mutable sequence of characters for efficient string manipulation',
    package: 'java.lang.StringBuilder',
    interface: 'CharSequence',
    overallComplexity: 'Append: O(1) amortized | Delete: O(n) | Reverse: O(n)',
    description:
      'StringBuilder provides a mutable character array. Unlike Java `String` which creates new objects on concatenation (O(n^2) in loops), StringBuilder modifies in-place in O(1) amortized time.',
    matrix: {
      internal: 'Mutable Dynamic Char Array',
      add: 'append(str)',
      get: 'charAt(index)',
      delete: 'delete(start, end)',
      search: 'indexOf(str)',
      isEmpty: 'length() == 0',
      size: 'length()',
      duplicatesAndNulls: 'Chars duplicate: Yes | Appends "null"',
      complexity: 'Append O(1) amortized'
    },
    operations: [
      {
        method: 'append(String str)',
        timeComplexity: 'O(1) amortized',
        spaceComplexity: 'O(1)',
        description: 'Appends string representation to current buffer.',
        example: 'sb.append("Hello ").append("World");',
      },
      {
        method: 'insert(int offset, String str)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Inserts string at specified offset index.',
        example: 'sb.insert(5, ",");',
      },
      {
        method: 'delete(int start, int end)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes characters from start index (inclusive) to end index (exclusive).',
        example: 'sb.delete(0, 5);',
      },
      {
        method: 'deleteCharAt(int index)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes character at specified index.',
        example: 'sb.deleteCharAt(sb.length() - 1);',
      },
      {
        method: 'replace(int start, int end, String str)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Replaces characters in range with new string.',
        example: 'sb.replace(0, 5, "Hi");',
      },
      {
        method: 'reverse()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Reverses character sequence in place.',
        example: 'sb.reverse();',
      },
      {
        method: 'charAt(int index)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns char at specified index.',
        example: 'char c = sb.charAt(0);',
      },
      {
        method: 'setCharAt(int index, char ch)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Replaces character at index with specified char.',
        example: 'sb.setCharAt(0, \'A\');',
      },
      {
        method: 'toString()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts buffer into immutable String object.',
        example: 'String result = sb.toString();',
      },
    ],
    codeSnippet: `public class StringBuilderExample {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        
        // 1. Efficient concatenation in loop O(n) instead of String + O(n^2)
        for (int i = 0; i < 5; i++) {
            sb.append(i).append(" ");
        }
        
        // 2. Reversing & modifying
        String original = "racecar";
        String rev = new StringBuilder(original).reverse().toString();
        System.out.println("Is Palindrome? " + original.equals(rev));
    }
}`,
    pitfalls: [
      'Not Thread-Safe: StringBuilder is unsynchronized for speed. Use `StringBuffer` if thread safety across multiple threads is required.',
      '`sb.equals(sb2)` checks reference equality, not content equality. Use `sb.toString().equals(sb2.toString())`.',
    ],
  },
  {
    id: 'linkedlist',
    name: 'LinkedList / Deque',
    category: 'lists',
    tagline: 'Doubly-linked list implementation of List and Deque interfaces',
    package: 'java.util.LinkedList',
    interface: 'List<T>, Deque<T>',
    overallComplexity: 'Head/Tail Insert: O(1) | Search: O(n) | Index Access: O(n)',
    description:
      'LinkedList stores nodes with pointers to prev and next nodes. Allows O(1) insertion/deletion at endpoints. Serves as Stack, Queue, or Deque.',
    matrix: {
      internal: 'Doubly-Linked Nodes',
      add: 'addFirst(element)',
      get: 'getFirst()',
      delete: 'removeFirst()',
      search: 'contains(element)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Duplicates: Yes | Nulls: Yes',
      complexity: 'Endpoints O(1), Access O(n)'
    },
    operations: [
      {
        method: 'addFirst(E e) / offerFirst(E e)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Inserts element at beginning of list.',
        example: 'list.addFirst("Head");',
      },
      {
        method: 'addLast(E e) / offerLast(E e)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Appends element to end of list.',
        example: 'list.addLast("Tail");',
      },
      {
        method: 'getFirst() / peekFirst()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns first element without removing.',
        example: 'String head = list.getFirst();',
      },
      {
        method: 'removeFirst() / pollFirst()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Retrieves and removes first element.',
        example: 'String first = list.pollFirst();',
      },
      {
        method: 'removeLast() / pollLast()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Retrieves and removes last element.',
        example: 'String last = list.pollLast();',
      },
    ],
    codeSnippet: `import java.util.LinkedList;
import java.util.Deque;

public class LinkedListExample {
    public static void main(String[] args) {
        Deque<Integer> deque = new LinkedList<>();
        
        // Double-ended Queue operations
        deque.addFirst(10);
        deque.addLast(20);
        deque.addFirst(5); // Queue: [5, 10, 20]
        
        System.out.println("Head: " + deque.peekFirst()); // 5
        System.out.println("Removed Head: " + deque.pollFirst()); // 5
    }
}`,
    pitfalls: [
      'High Memory Overhead: Each node allocates separate memory for item, prev reference, and next reference.',
      'Cache Unfriendly: Nodes are scattered in heap memory, leading to cache misses compared to contiguous `ArrayList`.',
    ],
  },
  {
    id: 'arraydeque',
    name: 'Stack & ArrayDeque',
    category: 'stacks-queues',
    tagline: 'Resizable array implementation of Deque. Preferred replacement for java.util.Stack',
    package: 'java.util.ArrayDeque',
    interface: 'Deque<T>',
    overallComplexity: 'Push: O(1) amortized | Pop: O(1) | Peek: O(1)',
    description:
      'ArrayDeque uses a circular array to implement LIFO (Stack) and FIFO (Queue) operations. Faster than legacy Stack class and LinkedList due to contiguous memory allocation.',
    matrix: {
      internal: 'Circular Array Buffer',
      add: 'push(element)',
      get: 'peek()',
      delete: 'pop()',
      search: 'contains(element)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Duplicates: Yes | Nulls: No (NPE)',
      complexity: 'Push & Pop O(1)'
    },
    operations: [
      {
        method: 'push(E element)',
        timeComplexity: 'O(1) amortized',
        spaceComplexity: 'O(1)',
        description: 'Pushes element onto stack (top of stack).',
        example: 'stack.push(100);',
      },
      {
        method: 'pop()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Pops and returns top element of stack. Throws NoSuchElementException if empty.',
        example: 'int val = stack.pop();',
      },
      {
        method: 'peek()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns top element of stack without removing. Returns null if empty.',
        example: 'Integer top = stack.peek();',
      },
      {
        method: 'poll()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Retrieves and removes head of queue (FIFO mode).',
        example: 'Integer head = queue.poll();',
      },
      {
        method: 'offer(E element)',
        timeComplexity: 'O(1) amortized',
        spaceComplexity: 'O(1)',
        description: 'Inserts element at tail of queue (FIFO mode).',
        example: 'queue.offer(50);',
      },
    ],
    codeSnippet: `import java.util.ArrayDeque;
import java.util.Deque;

public class StackDequeExample {
    public static void main(String[] args) {
        // Preferred LIFO Stack in Java
        Deque<Integer> stack = new ArrayDeque<>();
        
        stack.push(1);
        stack.push(2);
        stack.push(3);
        
        while (!stack.isEmpty()) {
            System.out.println(stack.pop()); // Prints 3, 2, 1
        }
    }
}`,
    pitfalls: [
      'Do not use legacy `java.util.Stack`: It extends Vector and adds method synchronization overhead.',
      'ArrayDeque does NOT permit null elements (throws NullPointerException).',
    ],
  },
  {
    id: 'priorityqueue',
    name: 'PriorityQueue (Heap)',
    category: 'stacks-queues',
    tagline: 'Min-Heap or Max-Heap providing fast O(1) min/max retrieval',
    package: 'java.util.PriorityQueue',
    interface: 'Queue<T>',
    overallComplexity: 'Peek: O(1) | Poll (extract): O(log n) | Offer (insert): O(log n)',
    description:
      'PriorityQueue is an unbounded priority queue based on a binary min-heap by default. Elements are ordered according to natural ordering or a supplied Comparator.',
    matrix: {
      internal: 'Binary Min-Heap Array',
      add: 'offer(element)',
      get: 'peek()',
      delete: 'poll()',
      search: 'contains(element)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Duplicates: Yes | Nulls: No (NPE)',
      complexity: 'Peek O(1), Poll O(log n)'
    },
    operations: [
      {
        method: 'offer(E e) / add(E e)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Inserts element into priority queue maintaining heap invariant.',
        example: 'pq.offer(15);',
      },
      {
        method: 'poll()',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Retrieves and removes highest priority element (min or max).',
        example: 'int minVal = pq.poll();',
      },
      {
        method: 'peek()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns highest priority element without removing.',
        example: 'int top = pq.peek();',
      },
      {
        method: 'PriorityQueue<>(Comparator)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Creates heap with custom sorting order (e.g. Max-Heap).',
        example: 'PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);',
      },
    ],
    codeSnippet: `import java.util.PriorityQueue;

public class PriorityQueueExample {
    public static void main(String[] args) {
        // 1. Min-Heap (Default)
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        minHeap.offer(30);
        minHeap.offer(10);
        minHeap.offer(20);
        System.out.println("Min: " + minHeap.poll()); // 10
        
        // 2. Max-Heap pattern
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
        maxHeap.offer(30);
        maxHeap.offer(10);
        maxHeap.offer(20);
        System.out.println("Max: " + maxHeap.poll()); // 30
    }
}`,
    pitfalls: [
      'Iteration does NOT guarantee sorted order: Printing `pq` directly shows array structure, not sorted output.',
      'Modifying objects inside PriorityQueue breaks heap ordering unless removed and re-added.',
    ],
  },
  {
    id: 'treemap',
    name: 'TreeMap & TreeSet',
    category: 'trees',
    tagline: 'Self-balancing Red-Black Tree implementation for sorted keys/elements',
    package: 'java.util.TreeMap / TreeSet',
    interface: 'NavigableMap<K, V>, NavigableSet<T>',
    overallComplexity: 'Search: O(log n) | Insert: O(log n) | Delete: O(log n)',
    description:
      'TreeMap and TreeSet are backed by a self-balancing Red-Black binary search tree. Keys/elements are kept sorted and support range operations like floorKey(), ceilingKey(), and subMap().',
    matrix: {
      internal: 'Red-Black Tree',
      add: 'put(key, value)',
      get: 'get(key)',
      delete: 'remove(key)',
      search: 'containsKey(key)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Keys Unique | Null Keys Disallowed',
      complexity: 'All operations O(log n)'
    },
    operations: [
      {
        method: 'firstKey() / lastKey()',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Returns lowest or highest key currently in map.',
        example: 'K minKey = treeMap.firstKey();',
      },
      {
        method: 'floorKey(K key)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Returns greatest key less than or equal to given key, or null.',
        example: 'Integer floor = treeMap.floorKey(15);',
      },
      {
        method: 'ceilingKey(K key)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Returns least key greater than or equal to given key, or null.',
        example: 'Integer ceil = treeMap.ceilingKey(15);',
      },
      {
        method: 'subMap(fromKey, toKey)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Returns view of portion of map ranging from fromKey to toKey.',
        example: 'SortedMap<Integer, String> range = treeMap.subMap(10, 50);',
      },
    ],
    codeSnippet: `import java.util.TreeMap;

public class TreeMapExample {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Ten");
        map.put(30, "Thirty");
        map.put(20, "Twenty");
        
        System.out.println("First Key (Min): " + map.firstKey()); // 10
        System.out.println("Floor of 25: " + map.floorKey(25));   // 20
        System.out.println("Ceiling of 15: " + map.ceilingKey(15)); // 20
    }
}`,
    pitfalls: [
      'Higher constant overhead compared to HashMap O(1) due to O(log n) tree balancing.',
      'Keys must implement `Comparable` or provide a `Comparator`, otherwise ClassCastException is thrown.',
    ],
  },
  {
    id: 'arrays-util',
    name: 'Arrays Utility Class',
    category: 'utilities',
    tagline: 'Static helper methods for manipulating Java primitive & object arrays',
    package: 'java.util.Arrays',
    interface: 'Static Utility Class',
    overallComplexity: 'Sort: O(n log n) | Binary Search: O(log n) | Fill: O(n)',
    description:
      'java.util.Arrays contains static methods to sort, search, fill, copy, compare, and convert native arrays.',
    matrix: {
      internal: 'Timsort & Quicksort Algorithms',
      add: 'Arrays.copyOf()',
      get: 'Arrays.binarySearch()',
      delete: 'N/A (Fixed capacity)',
      search: 'Arrays.binarySearch()',
      isEmpty: 'arr.length == 0',
      size: 'arr.length',
      duplicatesAndNulls: 'Depends on Array Type',
      complexity: 'Access O(1), Sort O(n log n)'
    },
    operations: [
      {
        method: 'Arrays.sort(T[] a)',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n) / O(1)',
        description: 'Sorts array into ascending order (Dual-Pivot Quicksort for primitives, Timsort for objects).',
        example: 'Arrays.sort(arr);',
      },
      {
        method: 'Arrays.binarySearch(a, key)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Searches sorted array for key. Returns index if found, or -(insertion point) - 1.',
        example: 'int idx = Arrays.binarySearch(sortedArr, 42);',
      },
      {
        method: 'Arrays.fill(a, val)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Assigns specified value to each element of array.',
        example: 'Arrays.fill(dp, -1);',
      },
      {
        method: 'Arrays.copyOf(original, newLength)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Copies array, truncating or padding with zeros/nulls to new length.',
        example: 'int[] copy = Arrays.copyOf(arr, arr.length * 2);',
      },
      {
        method: 'Arrays.asList(T... a)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns fixed-size List backed by specified array.',
        example: 'List<String> list = Arrays.asList("A", "B", "C");',
      },
    ],
    codeSnippet: `import java.util.Arrays;

public class ArraysUtilExample {
    public static void main(String[] args) {
        int[] dp = new int[5];
        // 1. Fill DP array with default values
        Arrays.fill(dp, -1); // [-1, -1, -1, -1, -1]
        
        // 2. Sort & Binary Search
        int[] nums = {40, 10, 20, 30};
        Arrays.sort(nums); // [10, 20, 30, 40]
        int index = Arrays.binarySearch(nums, 20); // 1
        System.out.println("Found 20 at index: " + index);
    }
}`,
    pitfalls: [
      '`Arrays.asList()` returns a fixed-size list! Calling `list.add()` or `list.remove()` throws UnsupportedOperationException.',
      'Remember to pass a SORTED array to `Arrays.binarySearch()`, otherwise behavior is undefined.',
    ],
  },
  {
    id: 'collections-util',
    name: 'Collections Utility Class',
    category: 'utilities',
    tagline: 'Static helper algorithms operating on Collection objects',
    package: 'java.util.Collections',
    interface: 'Static Utility Class',
    overallComplexity: 'Sort: O(n log n) | Reverse: O(n) | Min/Max: O(n)',
    description:
      'java.util.Collections provides polymorphic algorithms that operate on Collection data structures (List, Set, Map).',
    matrix: {
      internal: 'Static Polymorphic Algorithms',
      add: 'Collections.addAll()',
      get: 'Collections.max()',
      delete: 'N/A (Operates on List)',
      search: 'Collections.binarySearch()',
      isEmpty: 'coll.isEmpty()',
      size: 'coll.size()',
      duplicatesAndNulls: 'Depends on Collection',
      complexity: 'Sort O(n log n), Min/Max O(n)'
    },
    operations: [
      {
        method: 'Collections.sort(List<T> list)',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        description: 'Sorts specified list into ascending order using Timsort.',
        example: 'Collections.sort(list);',
      },
      {
        method: 'Collections.reverse(List<?> list)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Reverses the order of elements in specified list.',
        example: 'Collections.reverse(list);',
      },
      {
        method: 'Collections.swap(list, i, j)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Swaps elements at specified positions in list.',
        example: 'Collections.swap(list, 0, list.size() - 1);',
      },
      {
        method: 'Collections.frequency(coll, obj)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns count of elements in collection equal to specified object.',
        example: 'int freq = Collections.frequency(list, "apple");',
      },
      {
        method: 'Collections.max(coll) / min(coll)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns maximum or minimum element according to natural ordering.',
        example: 'int maxVal = Collections.max(numbers);',
      },
    ],
    codeSnippet: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CollectionsUtilExample {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(5, 2, 8, 1, 9));
        
        // 1. Min / Max
        System.out.println("Max: " + Collections.max(list)); // 9
        
        // 2. Sort & Reverse
        Collections.sort(list);    // [1, 2, 5, 8, 9]
        Collections.reverse(list); // [9, 8, 5, 2, 1]
        
        // 3. Swap
        Collections.swap(list, 0, 1); // Swaps 9 and 8
    }
}`,
    pitfalls: [
      '`Collections.sort()` requires a mutable list. Calling it on `List.of()` or `Arrays.asList()` may throw UnsupportedOperationException.',
    ],
  },
];
