export const CATEGORIES = [
  { id: 'all', name: 'All Structures' },
  { id: 'lists', name: 'Lists & Arrays' },
  { id: 'maps-sets', name: 'Maps & Sets' },
  { id: 'strings', name: 'Strings & Character Helpers' },
  { id: 'stacks-queues', name: 'Stacks, Queues & Heaps' },
  { id: 'trees', name: 'Trees & Sorted Maps' },
  { id: 'utilities', name: 'Arrays & Conversions Utilities' },
  { id: 'advanced', name: 'Math, Bits, Streams & Comparators' },
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
      'Java Strings are immutable sequences of characters. Content cannot be altered after creation. Any string modification creates a new String instance in heap/String Pool memory.',
    matrix: {
      internal: 'UTF-16 Char Pool',
      add: 'str1 + str2 / concat()',
      get: 'charAt(index)',
      delete: 'replace()',
      search: 'contains() / indexOf()',
      isEmpty: 'isEmpty() / isBlank()',
      size: 'length()',
      duplicatesAndNulls: 'Chars duplicate: Yes | Null: NPE',
      complexity: 'Immutable, Concat O(n)'
    },
    operations: [
      // Conversion
      {
        method: 's.toCharArray()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts String into newly allocated primitive char[] array.',
        example: 'char[] chars = s.toCharArray();',
      },
      {
        method: 's.toString()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns the string object itself (rarely needed).',
        example: 'String self = s.toString();',
      },
      {
        method: 'String.valueOf(x)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Static helper converting int, char, boolean, or objects to String.',
        example: 'String str = String.valueOf(42);',
      },
      {
        method: 'Integer.parseInt(s)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Parses string as signed decimal int (also Double.parseDouble, Long.parseLong).',
        example: 'int val = Integer.parseInt("123");',
      },
      // Extracting parts
      {
        method: 's.charAt(i)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns character at specified index i (0 to length-1).',
        example: 'char c = s.charAt(0);',
      },
      {
        method: 's.substring(i)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns new substring starting from index i to the end of string.',
        example: 'String sub = s.substring(3);',
      },
      {
        method: 's.substring(i, j)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns substring starting at index i (inclusive) to j (exclusive).',
        example: 'String sub = s.substring(1, 4);',
      },
      {
        method: 's.split(",")',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Splits string into String[] array by given regex delimiter.',
        example: 'String[] words = s.split(",");',
      },
      // Searching
      {
        method: "s.indexOf('a')",
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns first index of char or substring, or -1 if absent.',
        example: 'int idx = s.indexOf(\'a\');',
      },
      {
        method: "s.lastIndexOf('a')",
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns last index of char or substring, or -1 if absent.',
        example: 'int lastIdx = s.lastIndexOf(\'a\');',
      },
      {
        method: 's.contains("ab")',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if string contains specified sequence of char values.',
        example: 'boolean has = s.contains("ab");',
      },
      {
        method: 's.startsWith("ab")',
        timeComplexity: 'O(k)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if string begins with specified prefix.',
        example: 'boolean prefix = s.startsWith("ab");',
      },
      {
        method: 's.endsWith("ab")',
        timeComplexity: 'O(k)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if string ends with specified suffix.',
        example: 'boolean suffix = s.endsWith("ab");',
      },
      // Comparing
      {
        method: 's.equals(t)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Compares characters for content equality. NEVER use == for String content!',
        example: 'boolean isSame = s.equals(t);',
      },
      {
        method: 's.equalsIgnoreCase(t)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Compares two strings for content equality ignoring case.',
        example: 'boolean same = s.equalsIgnoreCase(t);',
      },
      {
        method: 's.compareTo(t)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Lexicographically compares two strings (returns negative/0/positive).',
        example: 'int diff = s.compareTo(t);',
      },
      // Modifying
      {
        method: 's.toUpperCase()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns NEW string converted to uppercase.',
        example: 'String upper = s.toUpperCase();',
      },
      {
        method: 's.toLowerCase()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns NEW string converted to lowercase.',
        example: 'String lower = s.toLowerCase();',
      },
      {
        method: 's.trim()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Removes leading and trailing whitespace characters.',
        example: 'String clean = s.trim();',
      },
      {
        method: "s.replace('a', 'b')",
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: "Replaces all occurrences of target char/string with replacement.",
        example: "String rep = s.replace('a', 'b');",
      },
      {
        method: 's.concat(t)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Concatenates string t to end of s (same as s + t).',
        example: 'String full = s.concat(t);',
      },
      // Info
      {
        method: 's.length()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns total length of string in UTF-16 code units.',
        example: 'int len = s.length();',
      },
      {
        method: 's.isEmpty()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if s.length() == 0.',
        example: 'boolean empty = s.isEmpty();',
      },
      {
        method: 's.isBlank()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if empty or contains only whitespace.',
        example: 'boolean blank = s.isBlank();',
      },
    ],
    codeSnippet: `public class StringMasteryExample {
    public static void main(String[] args) {
        String s = " Hello World ";
        
        // 1. Info & Modifying (Returns NEW string)
        System.out.println("Trimmed: '" + s.trim() + "'"); // "Hello World"
        System.out.println("Upper: " + s.toUpperCase());
        System.out.println("Replaced: " + s.replace('o', '0'));
        
        // 2. Extracting & Searching
        String str = "java,python,cpp";
        String[] languages = str.split(","); // ["java", "python", "cpp"]
        System.out.println("Contains 'py'? " + str.contains("py")); // true
        System.out.println("First index 'a': " + str.indexOf('a')); // 1
        System.out.println("Last index 'a': " + str.lastIndexOf('a')); // 3
        
        // 3. Comparing (ALWAYS use equals, NEVER ==)
        String a = new String("code");
        String b = "code";
        System.out.println("equals(): " + a.equals(b)); // true
        System.out.println("compareTo(): " + a.compareTo(b)); // 0
        
        // 4. Conversion & Parsing
        char[] chars = str.toCharArray();
        int val = Integer.parseInt("456");
        String valStr = String.valueOf(val);
    }
}`,
    pitfalls: [
      'String Immutability Penalty: Concatenating strings in a loop (`s += i`) creates a new String each iteration, resulting in O(n^2) time. Use `StringBuilder` for loop concatenation.',
      'Reference equality trap: Never use `==` to compare string contents. `==` checks if both references point to exact same heap address, whereas `equals()` compares character values.',
      'Note length vs length(): String uses `s.length()`, while native array uses `arr.length` (no parentheses).',
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
      'StringBuilder provides a mutable character array. Repeated += in a loop is O(n^2) for Strings. StringBuilder appends in O(1) amortized time, essential for DSA string building.',
    matrix: {
      internal: 'Mutable Dynamic Char Array',
      add: 'append(x) / insert(i, x)',
      get: 'charAt(i)',
      delete: 'deleteCharAt(i) / delete(start, end)',
      search: 'indexOf(str)',
      isEmpty: 'length() == 0',
      size: 'length()',
      duplicatesAndNulls: 'Chars duplicate: Yes | Appends "null"',
      complexity: 'Append O(1) amortized'
    },
    operations: [
      {
        method: 'new StringBuilder()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Constructs empty string builder with default initial capacity of 16.',
        example: 'StringBuilder sb = new StringBuilder();',
      },
      {
        method: 'sb.append(x)',
        timeComplexity: 'O(1) amortized',
        spaceComplexity: 'O(1)',
        description: 'Appends primitive, char, String, or object to buffer.',
        example: 'sb.append("Hello").append(\' \').append(42);',
      },
      {
        method: 'sb.reverse()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Reverses character sequence in place within buffer.',
        example: 'sb.reverse();',
      },
      {
        method: 'sb.deleteCharAt(i)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes character at specified index i.',
        example: 'sb.deleteCharAt(2);',
      },
      {
        method: 'sb.insert(i, x)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Inserts string, char, or primitive x at index i.',
        example: 'sb.insert(0, "Start: ");',
      },
      {
        method: 'sb.setCharAt(i, c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Replaces character at index i with specified char c.',
        example: 'sb.setCharAt(0, \'A\');',
      },
      {
        method: 'sb.charAt(i)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns char at specified index i.',
        example: 'char c = sb.charAt(0);',
      },
      {
        method: 'sb.delete(start, end)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Removes characters from start index (inclusive) to end index (exclusive).',
        example: 'sb.delete(0, 5);',
      },
      {
        method: 'sb.replace(start, end, str)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Replaces characters in range with new string.',
        example: 'sb.replace(0, 5, "Hi");',
      },
      {
        method: 'sb.toString()',
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
        
        // 2. In-place character modification & insertion
        sb.setCharAt(0, 'A');   // Sets first char
        sb.insert(1, "-");      // Inserts hyphen at index 1
        sb.deleteCharAt(1);     // Removes hyphen
        
        // 3. Reversing & converting to String
        sb.reverse();
        String result = sb.toString();
        System.out.println("Result: " + result);
    }
}`,
    pitfalls: [
      'Not Thread-Safe: StringBuilder is unsynchronized for speed. Use `StringBuffer` if thread safety across multiple threads is required.',
      '`sb.equals(sb2)` checks reference equality, not content equality. Use `sb.toString().equals(sb2.toString())`.',
    ],
  },
  {
    id: 'character-util',
    name: 'Character Class Helpers',
    category: 'strings',
    tagline: 'Static utility methods from java.lang.Character for char inspections and conversions',
    package: 'java.lang.Character',
    interface: 'Static Helper Class',
    overallComplexity: 'All checks & conversions: O(1) time and space',
    description:
      'The Character class wraps primitive char and provides essential static methods for character type validation, case checks, and case conversions heavily used in DSA string problems.',
    matrix: {
      internal: 'Unicode Character Table',
      add: 'N/A',
      get: 'Character.toLowerCase(c)',
      delete: 'N/A',
      search: 'Character.isLetterOrDigit(c)',
      isEmpty: 'N/A',
      size: '1 Char / 16-bit',
      duplicatesAndNulls: 'Primitive char',
      complexity: 'All operations O(1)'
    },
    operations: [
      {
        method: 'Character.isDigit(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Checks if specified character is a numeric digit (\'0\'-\'9\').',
        example: 'boolean isNum = Character.isDigit(\'7\'); // true',
      },
      {
        method: 'Character.isLetter(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Checks if specified character is an alphabetic letter.',
        example: 'boolean isAlpha = Character.isLetter(\'a\'); // true',
      },
      {
        method: 'Character.isLetterOrDigit(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Checks if character is alphanumeric (useful for palindrome filtering).',
        example: 'boolean valid = Character.isLetterOrDigit(\'9\'); // true',
      },
      {
        method: 'Character.isUpperCase(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Checks if character is an uppercase letter.',
        example: 'boolean isUpper = Character.isUpperCase(\'A\'); // true',
      },
      {
        method: 'Character.isLowerCase(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Checks if character is a lowercase letter.',
        example: 'boolean isLower = Character.isLowerCase(\'a\'); // true',
      },
      {
        method: 'Character.toUpperCase(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Converts character to uppercase equivalent.',
        example: 'char upper = Character.toUpperCase(\'a\'); // \'A\'',
      },
      {
        method: 'Character.toLowerCase(c)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Converts character to lowercase equivalent.',
        example: 'char lower = Character.toLowerCase(\'A\'); // \'a\'',
      },
      {
        method: "c - '0' / (char)(digit + '0')",
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Fast primitive ASCII conversion between digit char and integer value.',
        example: "int val = '5' - '0'; // 5",
      },
    ],
    codeSnippet: `public class CharacterExample {
    public static void main(String[] args) {
        char c = 'A';
        
        // 1. Validation checks
        System.out.println("Is Letter? " + Character.isLetter(c));       // true
        System.out.println("Is Digit? " + Character.isDigit(c));        // false
        System.out.println("Is Upper? " + Character.isUpperCase(c));    // true
        
        // 2. Case Conversion
        char lower = Character.toLowerCase(c); // 'a'
        
        // 3. Valid Palindrome filtering pattern
        String s = "A man, a plan, a canal: Panama";
        StringBuilder clean = new StringBuilder();
        for (char ch : s.toCharArray()) {
            if (Character.isLetterOrDigit(ch)) {
                clean.append(Character.toLowerCase(ch));
            }
        }
        System.out.println("Cleaned: " + clean.toString());
    }
}`,
    pitfalls: [
      '`Character.toUpperCase()` takes primitive `char` and returns primitive `char`. Do not confuse with String `.toUpperCase()`.',
      'Non-alphanumeric chars like space (\' \') or punctuation return false for `isLetterOrDigit()`.',
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
      'java.util.Arrays (import java.util.Arrays;) contains static utility methods to sort, search, fill, copy, compare, print, and convert native arrays.',
    matrix: {
      internal: 'Timsort & Dual-Pivot Quicksort',
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
        method: 'Arrays.sort(arr)',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n) / O(1)',
        description: 'Sorts array into ascending order in place.',
        example: 'Arrays.sort(nums);',
      },
      {
        method: 'Arrays.sort(arr, i, j)',
        timeComplexity: 'O(k log k)',
        spaceComplexity: 'O(k)',
        description: 'Sorts array slice only from index i (inclusive) to j (exclusive).',
        example: 'Arrays.sort(nums, 1, 4);',
      },
      {
        method: 'Arrays.sort(arr, Collections.reverseOrder())',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        description: 'Sorts array in descending order. ONLY works for Object[] (e.g. Integer[]), NOT primitive int[]/char[].',
        example: 'Arrays.sort(boxedArr, Collections.reverseOrder());',
      },
      {
        method: 'Arrays.binarySearch(arr, key)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        description: 'Searches sorted array for key. Array MUST be sorted first; returns index or negative insertion point.',
        example: 'int idx = Arrays.binarySearch(sortedArr, 20);',
      },
      {
        method: 'Arrays.fill(arr, val)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Sets every element in array to specified value (e.g. 0 or -1 for DP tables).',
        example: 'Arrays.fill(dp, -1);',
      },
      {
        method: 'Arrays.copyOf(arr, newLength)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns new array copy, truncated or padded with 0/null to newLength.',
        example: 'int[] expanded = Arrays.copyOf(arr, arr.length * 2);',
      },
      {
        method: 'Arrays.copyOfRange(arr, i, j)',
        timeComplexity: 'O(k)',
        spaceComplexity: 'O(k)',
        description: 'Returns new array containing elements from index i (inclusive) to j (exclusive).',
        example: 'int[] slice = Arrays.copyOfRange(arr, 1, 4);',
      },
      {
        method: 'Arrays.equals(arr1, arr2)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Returns true if both arrays are same length and contain matching elements at each index.',
        example: 'boolean same = Arrays.equals(a, b);',
      },
      {
        method: 'Arrays.toString(arr)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Returns formatted string e.g. "[1, 2, 3]". Use this instead of arr.toString()!',
        example: 'System.out.println(Arrays.toString(arr));',
      },
      {
        method: 'Arrays.deepToString(arr2D)',
        timeComplexity: 'O(n*m)',
        spaceComplexity: 'O(n*m)',
        description: 'Returns formatted string representation for 2D / multi-dimensional arrays.',
        example: 'System.out.println(Arrays.deepToString(grid));',
      },
      {
        method: 'List<Integer> list = Arrays.asList(1, 2, 3)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns fixed-size List backed by array.',
        example: 'List<Integer> list = Arrays.asList(1, 2, 3);',
      },
      {
        method: 'arr.length',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Array length field (no parentheses!). Note: String uses s.length(), array uses arr.length.',
        example: 'int len = arr.length;',
      },
    ],
    codeSnippet: `import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ArraysUtilExample {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};
        
        // 1. Fill DP table
        Arrays.fill(arr, 0); // [0, 0, 0, 0, 0]
        
        // 2. Copy & Range Slices
        int[] nums = {40, 10, 20, 30, 50};
        int[] sub = Arrays.copyOfRange(nums, 1, 4); // [10, 20, 30]
        
        // 3. Sorting & Binary Search
        Arrays.sort(nums); // [10, 20, 30, 40, 50]
        int index = Arrays.binarySearch(nums, 30); // returns 2
        
        // 4. Printing 1D & 2D Arrays
        System.out.println("1D Array: " + Arrays.toString(nums));
        int[][] grid = {{1, 2}, {3, 4}};
        System.out.println("2D Grid: " + Arrays.deepToString(grid));
        
        // 5. Descending Sort (Object array required)
        Integer[] boxed = {5, 2, 8, 1};
        Arrays.sort(boxed, Collections.reverseOrder()); // [8, 5, 2, 1]
    }
}`,
    pitfalls: [
      '`Arrays.asList()` returns a fixed-size list! Calling `list.add()` or `list.remove()` throws UnsupportedOperationException.',
      'Remember to pass a SORTED array to `Arrays.binarySearch()`, otherwise behavior is undefined.',
      'Native array length uses `arr.length` (field without parentheses), while String uses `s.length()` (method call).',
    ],
  },
  {
    id: 'array-conversions',
    name: 'Type & Array Conversions',
    category: 'utilities',
    tagline: 'Master cheat-sheet for converting between Primitives, Arrays, Lists, Strings, & Primitive Wrappers',
    package: 'java.util.* / java.lang.*',
    interface: 'Conversion Reference',
    overallComplexity: 'Direct Casts: O(1) | Array/List Copies & Streams: O(n)',
    description:
      'Complete reference for converting Java data types, arrays, object wrappers, lists, strings, and character sequences. Crucial for DSA coding interviews.',
    matrix: {
      internal: 'Streams & System Copy',
      add: 'Arrays.stream()',
      get: 'toArray() / parseX()',
      delete: 'N/A',
      search: 'N/A',
      isEmpty: 'N/A',
      size: 'O(n) Copy',
      duplicatesAndNulls: 'Preserves Data',
      complexity: 'Stream / Loop O(n)'
    },
    operations: [
      {
        method: 'Primitive int[] → List<Integer>',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Boxes primitive int[] stream into a List<Integer>.',
        example: 'List<Integer> list = Arrays.stream(arr).boxed().collect(Collectors.toList());',
      },
      {
        method: 'List<Integer> → Primitive int[]',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Unboxes List<Integer> to primitive int[] array via IntStream.',
        example: 'int[] arr = list.stream().mapToInt(Integer::intValue).toArray();',
      },
      {
        method: 'Object[] T[] → List<T>',
        timeComplexity: 'O(1) / O(n)',
        spaceComplexity: 'O(1) / O(n)',
        description: 'Arrays.asList(arr) returns fixed-size list. new ArrayList<>(Arrays.asList(arr)) creates mutable list.',
        example: 'List<String> list = new ArrayList<>(Arrays.asList(strArr));',
      },
      {
        method: 'List<T> → Object[] T[]',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts List of objects into array. Pass typed array instance e.g. new String[0].',
        example: 'String[] arr = list.toArray(new String[0]);',
      },
      {
        method: 'Primitive int[] → Boxed Integer[]',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts primitive int array to Object Integer array (required for custom Comparators).',
        example: 'Integer[] boxed = Arrays.stream(arr).boxed().toArray(Integer[]::new);',
      },
      {
        method: 'Boxed Integer[] → Primitive int[]',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts boxed Integer[] array back to primitive int[] array.',
        example: 'int[] arr = Arrays.stream(boxed).mapToInt(Integer::intValue).toArray();',
      },
      {
        method: 'String → char[] & char[] → String',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Converts string to char array and back.',
        example: 'char[] c = s.toCharArray(); String orig = new String(c);',
      },
      {
        method: 'String[] → String & String → String[]',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Joins String array into single string, or splits String by delimiter into String[].',
        example: 'String str = String.join(",", arr); String[] parts = str.split(",");',
      },
      {
        method: 'String → int / double & Any → String',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1) / O(n)',
        description: 'Parses numbers from String or converts any value/object to String.',
        example: 'int n = Integer.parseInt(s); String str = String.valueOf(val);',
      },
      {
        method: 'char ↔ int Digit Conversion',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Converts single digit char to integer value and back.',
        example: "int digit = c - '0'; char ch = (char)(digit + '0');",
      },
    ],
    codeSnippet: `import java.util.*;
import java.util.stream.Collectors;

public class ConversionMasterExample {
    public static void main(String[] args) {
        // 1. Primitive int[] <-> List<Integer>
        int[] primitiveArr = {3, 1, 4, 1, 5};
        List<Integer> list = Arrays.stream(primitiveArr).boxed().collect(Collectors.toList());
        int[] backToPrimitive = list.stream().mapToInt(Integer::intValue).toArray();
        
        // 2. Sorting primitive array in descending order (Box first!)
        Integer[] boxed = Arrays.stream(primitiveArr).boxed().toArray(Integer[]::new);
        Arrays.sort(boxed, Collections.reverseOrder()); // [5, 4, 3, 1, 1]
        
        // 3. String <-> char[]
        String s = "code";
        char[] chars = s.toCharArray();
        String rebuilt = new String(chars);
        
        // 4. String <-> String[]
        String commaSeparated = "apple,banana,cherry";
        String[] fruits = commaSeparated.split(",");
        String joined = String.join(" | ", fruits);
        
        // 5. String <-> Primitive Int
        int num = Integer.parseInt("123");
        String numStr = String.valueOf(num);
    }
}`,
    pitfalls: [
      '`Arrays.sort(arr, Collections.reverseOrder())` DOES NOT work on primitive `int[]` or `char[]`! You MUST box `int[]` to `Integer[]` first.',
      '`Arrays.asList(primitiveArr)` on `int[]` returns `List<int[]>` with 1 element instead of `List<Integer>`! Use `Arrays.stream(intArr).boxed()`.',
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
  {
    id: 'linkedhashmap-set',
    name: 'LinkedHashMap & LinkedHashSet',
    category: 'maps-sets',
    tagline: 'Hash table with doubly-linked list preserving insertion or access order (LRU Cache)',
    package: 'java.util.LinkedHashMap / LinkedHashSet',
    interface: 'Map<K, V>, Set<T>',
    overallComplexity: 'Put: O(1) avg | Get: O(1) avg | Remove: O(1) avg',
    description:
      'LinkedHashMap maintains a doubly-linked list running through all entries, preserving insertion order or access order. Ideal for LRU (Least Recently Used) cache implementation.',
    matrix: {
      internal: 'HashMap + Doubly-Linked List',
      add: 'put(key, val)',
      get: 'get(key)',
      delete: 'remove(key)',
      search: 'containsKey(key)',
      isEmpty: 'isEmpty()',
      size: 'size()',
      duplicatesAndNulls: 'Unique Keys | 1 Null Key',
      complexity: 'Put & Get O(1) avg'
    },
    operations: [
      {
        method: 'LinkedHashMap(cap, loadFactor, accessOrder)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Constructs map with ordering mode: false for insertion-order, true for access-order (LRU).',
        example: 'Map<K, V> lru = new LinkedHashMap<>(16, 0.75f, true);',
      },
      {
        method: 'removeEldestEntry(Map.Entry eldest)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Protected method overridden to automatically evict oldest entry when size exceeds capacity.',
        example: 'protected boolean removeEldestEntry(Map.Entry eldest) { return size() > CAPACITY; }',
      },
      {
        method: 'LinkedHashSet<T>()',
        timeComplexity: 'O(1) avg',
        spaceComplexity: 'O(1)',
        description: 'Set implementation preserving element insertion order.',
        example: 'Set<String> set = new LinkedHashSet<>();',
      },
    ],
    codeSnippet: `import java.util.LinkedHashMap;
import java.util.Map;

// 1. Instant LRU Cache using LinkedHashMap
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // true = access order
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity; // Automatically evicts LRU item
    }
}

public class LinkedMapExample {
    public static void main(String[] args) {
        LRUCache<Integer, String> cache = new LRUCache<>(2);
        cache.put(1, "One");
        cache.put(2, "Two");
        cache.get(1);      // Access 1 (makes 2 eldest)
        cache.put(3, "Three"); // Evicts 2!

        System.out.println(cache); // {1=One, 3=Three}
    }
}`,
    pitfalls: [
      'Overriding `removeEldestEntry` requires extending `LinkedHashMap` rather than using reference assignment.',
      'Access-order `LinkedHashMap` modifies structural order on `get()`, so iterating while calling `get()` throws ConcurrentModificationException.',
    ],
  },
  {
    id: 'math-bit-util',
    name: 'Math & Bitwise Utilities',
    category: 'advanced',
    tagline: 'Essential methods from java.lang.Math and Integer bitwise manipulation for algorithms',
    package: 'java.lang.Math / java.lang.Integer',
    interface: 'Static Utilities',
    overallComplexity: 'All Math & Bit operations: O(1) time and space',
    description:
      'Provides high-performance math calculations, bounds checking, logarithmic functions, and bitwise binary operations essential for competitive programming.',
    matrix: {
      internal: 'CPU Primitive Instructions',
      add: '1 << n',
      get: 'Integer.bitCount(n)',
      delete: 'n & (n - 1)',
      search: 'Integer.highestOneBit(n)',
      isEmpty: 'n == 0',
      size: '32-bit / 64-bit',
      duplicatesAndNulls: 'Primitive integers',
      complexity: 'All operations O(1)'
    },
    operations: [
      {
        method: 'Math.max(a, b) / Math.min(a, b)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns the greater or smaller of two numbers (works for int, long, float, double).',
        example: 'int maxVal = Math.max(x, y);',
      },
      {
        method: 'Math.abs(x)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns absolute value of a primitive number.',
        example: 'int diff = Math.abs(a - b);',
      },
      {
        method: 'Math.pow(base, exp) / Math.sqrt(x)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Calculates power (returns double) or square root of a number.',
        example: 'double root = Math.sqrt(16.0); // 4.0',
      },
      {
        method: 'Math.floor() / Math.ceil() / Math.round()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Rounds down (floor), rounds up (ceil), or rounds to nearest integer.',
        example: 'int rounded = (int) Math.ceil(5.2); // 6',
      },
      {
        method: 'Integer.bitCount(int n)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns number of set 1-bits (Hamming Weight / popcount) in binary representation.',
        example: 'int setBits = Integer.bitCount(7); // 3 (binary 111)',
      },
      {
        method: 'n & (n - 1)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Bitwise trick: Clears lowest set bit of n. Used to check power of 2: (n & (n - 1)) == 0.',
        example: 'boolean isPowerOf2 = n > 0 && (n & (n - 1)) == 0;',
      },
      {
        method: 'n & 1 / 1 << k',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'n & 1 checks if odd/even. 1 << k computes 2^k using bitwise left shift.',
        example: 'int bitMask = 1 << 3; // 8',
      },
      {
        method: 'Integer.highestOneBit(n)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns int value with single 1-bit at position of highest set bit in n.',
        example: 'int highBit = Integer.highestOneBit(10); // 8 (1000 in binary)',
      },
      {
        method: 'Integer.numberOfLeadingZeros(n)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns count of zero bits before highest 1-bit in 32-bit int.',
        example: 'int zeros = Integer.numberOfLeadingZeros(8); // 28',
      },
      {
        method: 'Integer.toBinaryString(n)',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(log n)',
        description: 'Converts integer into binary string representation.',
        example: 'String bin = Integer.toBinaryString(5); // "101"',
      },
    ],
    codeSnippet: `public class MathAndBitsExample {
    public static void main(String[] args) {
        // 1. Math bounds & rounding
        int maxVal = Math.max(15, 42);
        int dist = Math.abs(-10);
        
        // 2. Bitwise tricks
        int n = 12; // Binary: 1100
        System.out.println("Set Bits (Popcount): " + Integer.bitCount(n)); // 2
        System.out.println("Is Power of 2? " + (n > 0 && (n & (n - 1)) == 0)); // false
        
        // 3. Binary representation
        System.out.println("Binary string of 12: " + Integer.toBinaryString(n)); // "1100"
        
        // 4. Bit masking (Check k-th bit)
        int k = 2;
        boolean isKthSet = (n & (1 << k)) != 0; // Checks 3rd bit from right
        System.out.println("Is bit 2 set? " + isKthSet); // true
    }
}`,
    pitfalls: [
      '`Math.abs(Integer.MIN_VALUE)` remains `Integer.MIN_VALUE` due to 32-bit integer overflow! Cast to long first: `Math.abs((long) val)`.',
      '`1 << 31` creates negative integer due to signed overflow. Use `1L << 31` for 64-bit long shifts.',
    ],
  },
  {
    id: 'streams-util',
    name: 'Streams & Collectors API',
    category: 'advanced',
    tagline: 'Functional stream operations for filtering, mapping, grouping, and reducing collections',
    package: 'java.util.stream.*',
    interface: 'Stream<T>, IntStream, Collectors',
    overallComplexity: 'Stream Pipelines: O(n) | Sorting in stream: O(n log n)',
    description:
      'Java 8+ Streams allow declarative data processing pipelines over collections and arrays, supporting filtering, mapping, grouping by, frequency counting, and statistics.',
    matrix: {
      internal: 'Lazy Terminal Processing Pipeline',
      add: 'Stream.of() / list.stream()',
      get: 'collect() / findFirst()',
      delete: 'filter()',
      search: 'anyMatch() / findFirst()',
      isEmpty: 'count() == 0',
      size: 'count()',
      duplicatesAndNulls: 'distinct() removes duplicates',
      complexity: 'Pipeline O(n)'
    },
    operations: [
      {
        method: 'filter(Predicate p)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Intermediate stream operation retaining elements matching condition.',
        example: 'list.stream().filter(x -> x % 2 == 0)...',
      },
      {
        method: 'map(Function f)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Transforms each element in stream into another value.',
        example: 'list.stream().map(String::toUpperCase)...',
      },
      {
        method: 'Collectors.toList() / toSet()',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Collects stream elements into List or Set.',
        example: 'List<String> out = stream.collect(Collectors.toList());',
      },
      {
        method: 'Collectors.groupingBy(classifier)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Groups stream elements into Map<K, List<V>> by key classifier function.',
        example: 'Map<Integer, List<String>> byLen = words.stream().collect(Collectors.groupingBy(String::length));',
      },
      {
        method: 'Collectors.counting() / frequency',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Used with groupingBy to compute element frequencies into Map<T, Long>.',
        example: 'Map<String, Long> freq = list.stream().collect(Collectors.groupingBy(w -> w, Collectors.counting()));',
      },
      {
        method: 'Collectors.joining(delimiter)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Joins stream of Strings with specified delimiter.',
        example: 'String csv = stream.collect(Collectors.joining(","));',
      },
      {
        method: 'IntStream.range(start, end)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Generates sequential IntStream from start (inclusive) to end (exclusive).',
        example: 'int sum = IntStream.range(0, 10).sum();',
      },
    ],
    codeSnippet: `import java.util.*;
import java.util.stream.*;

public class StreamsMasteryExample {
    public static void main(String[] args) {
        List<String> words = List.of("apple", "banana", "apple", "cherry", "banana", "apple");

        // 1. Frequency Map with groupingBy & counting
        Map<String, Long> freqMap = words.stream()
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        System.out.println("Frequencies: " + freqMap);

        // 2. Filter & Map pipeline
        List<Integer> wordLengths = words.stream()
            .distinct()
            .map(String::length)
            .collect(Collectors.toList());
        System.out.println("Unique lengths: " + wordLengths);

        // 3. Primitive IntStream Stats
        int sum = IntStream.of(10, 20, 30, 40).sum();
        int max = IntStream.of(10, 20, 30, 40).max().orElse(0);
    }
}`,
    pitfalls: [
      'Streams cannot be reused after terminal operation (`collect`, `sum`, `forEach`). Calling operation on consumed stream throws IllegalStateException.',
      'Streams add minor abstraction overhead for small iterations compared to traditional `for` loops.',
    ],
  },
  {
    id: 'comparators-pairs',
    name: 'Comparators, Pairs & Custom Sorting',
    category: 'advanced',
    tagline: 'Custom sorting logic, multi-field Comparators, and Tuple/Pair structures for competitive programming',
    package: 'java.util.Comparator / java.util.Map.Entry',
    interface: 'Comparator<T>, Map.Entry<K, V>',
    overallComplexity: 'Compare: O(1) | Sort with Comparator: O(n log n)',
    description:
      'Mastering custom Comparators and Pair structures is vital for sorting 2D arrays (intervals), custom class objects, PriorityQueues, and multi-key maps in Java DSA problems.',
    matrix: {
      internal: 'Binary Comparators',
      add: 'Comparator.comparing()',
      get: 'entry.getKey() / entry.getValue()',
      delete: 'N/A',
      search: 'N/A',
      isEmpty: 'N/A',
      size: '2 Elements',
      duplicatesAndNulls: 'Supported',
      complexity: 'Compare O(1), Sort O(n log n)'
    },
    operations: [
      {
        method: '(a, b) -> Integer.compare(a[0], b[0])',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Lambda comparator for 2D array sorting (e.g. interval starting points).',
        example: 'Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));',
      },
      {
        method: 'Comparator.comparing(keyExtractor)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Creates comparator extracting sort key from object method reference.',
        example: 'list.sort(Comparator.comparing(String::length));',
      },
      {
        method: 'comp1.thenComparing(comp2)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Chains secondary comparator to resolve ties when primary comparison is equal.',
        example: 'list.sort(Comparator.comparing(Person::getAge).thenComparing(Person::getName));',
      },
      {
        method: 'Comparator.reverseOrder()',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Returns comparator that imposes reverse of natural ordering.',
        example: 'PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());',
      },
      {
        method: 'new AbstractMap.SimpleEntry<>(k, v)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Java built-in Pair class representing key-value entry.',
        example: 'Map.Entry<Integer, String> pair = new AbstractMap.SimpleEntry<>(1, "One");',
      },
      {
        method: 'record Pair<K, V>(K key, V value)',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        description: 'Java 14+ compact record pattern for immutable pairs/tuples in competitive coding.',
        example: 'record Pair(int row, int col) {}',
      },
    ],
    codeSnippet: `import java.util.*;

public class ComparatorMasteryExample {
    // Java 14+ Record for BFS/DFS state tuple
    record State(int node, int dist) {}

    public static void main(String[] args) {
        // 1. Sorting 2D Intervals by start time, then end time
        int[][] intervals = {{1, 4}, {1, 2}, {3, 5}, {2, 6}};
        Arrays.sort(intervals, (a, b) -> {
            if (a[0] != b[0]) return Integer.compare(a[0], b[0]);
            return Integer.compare(a[1], b[1]);
        });
        System.out.println("Sorted Intervals: " + Arrays.deepToString(intervals));

        // 2. PriorityQueue with State record (Min-Heap by distance)
        PriorityQueue<State> pq = new PriorityQueue<>(Comparator.comparingInt(State::dist));
        pq.offer(new State(0, 10));
        pq.offer(new State(1, 5));
        System.out.println("Closest Node: " + pq.poll().node()); // Node 1 (dist 5)
    }
}`,
    pitfalls: [
      'Do NOT use subtraction `(a, b) -> a - b` for integer comparison! It causes INTEGER OVERFLOW when comparing large positive and negative numbers (e.g. `Integer.MIN_VALUE`). ALWAYS use `Integer.compare(a, b)`.',
    ],
  },
];
