export const FULL_QUIZ_QUESTIONS = [
  {
    question: "What is difference between == and equals()?",
    options: [
      "Both compare values",
      "Both compare references",
      "== compares references, equals() compares values",
      "== compares values, equals() compares references"
    ],
    correctAnswer: 2,
    explanation: "== → 'Are these two things same box?'\nequals() → 'Do these two boxes contain the same stuff?'\n\n== checks if they're the exact same object in memory, equals() checks if they have the same content."
  },
  {
    question: "String is immutable means?",
    options: [
      "String value can change",
      "String object cannot change",
      "String reference cannot change",
      "String memory location cannot change"
    ],
    correctAnswer: 1,
    explanation: "You cannot change the same string object. When you 'change' it → Java creates a new string. Like a sealed envelope - you can't change what's inside, you have to make a new one."
  },
  {
    question: "Why String is immutable?",
    options: [
      "For security",
      "For thread safety",
      "For performance",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "One rule → many benefits. Like sealed milk packet 🥛 — safe, shared, fast. Immutable strings are secure (can't be modified), thread-safe (no locking needed), and allow optimizations like string pooling."
  },
  {
    question: "Output?\nString s1 = \"Java\";\nString s2 = \"Java\";\nSystem.out.println(s1 == s2);",
    options: [
      "true",
      "false",
      "Compile error",
      "Runtime error"
    ],
    correctAnswer: 0,
    explanation: "String literals go into String Pool. Same text → same object. Java is smart - if you create the same string literal, it just points to the existing one in the pool to save memory."
  },
  {
    question: "Output?\nString s1 = new String(\"Java\");\nString s2 = new String(\"Java\");\nSystem.out.println(s1 == s2);",
    options: [
      "true",
      "false",
      "Compile error",
      "Runtime error"
    ],
    correctAnswer: 1,
    explanation: "new = new box every time 📦\nDifferent boxes → == false.\nWhen you use 'new', Java always creates a new object in memory, even if the content is the same."
  },
  {
    question: "Can we overload main()?",
    options: [
      "No",
      "Yes",
      "Only once",
      "Only static"
    ],
    correctAnswer: 1,
    explanation: "Java calls only:\npublic static void main(String[] args)\nOthers are ignored. You can have multiple main methods with different parameters, but JVM only calls the specific one."
  },
  {
    question: "Can we override static methods?",
    options: [
      "Yes",
      "No",
      "Sometimes",
      "Only final"
    ],
    correctAnswer: 1,
    explanation: "Static = belongs to class, not object. No object → no overriding. Static methods are hidden, not overridden. Child class can have its own static method with the same name, but it's not polymorphism."
  },
  {
    question: "Difference between final, finally, finalize()?",
    options: [
      "All same",
      "All different",
      "final & finally same",
      "finally & finalize() same"
    ],
    correctAnswer: 1,
    explanation: "final → stop changing ✋\nfinally → always runs 🔁\nfinalize() → before garbage collection 🗑️\n\nThree completely different concepts with similar names!"
  },
  {
    question: "Which keyword prevents inheritance?",
    options: [
      "static",
      "private",
      "final",
      "protected"
    ],
    correctAnswer: 2,
    explanation: "final class = 'No kids allowed' 👶❌\n\nWhen a class is marked final, no other class can extend it. It's like saying 'This design is complete - no one can modify it.'"
  },
  {
    question: "Can constructor be final?",
    options: [
      "Yes",
      "No",
      "Only private",
      "Only static"
    ],
    correctAnswer: 1,
    explanation: "Constructors cannot be inherited → no need for final. Constructors are never inherited anyway, so making them final would be meaningless. Java doesn't allow it."
  },
  {
    question: "What is default value of instance variable?",
    options: [
      "garbage",
      "null",
      "0 / false / null",
      "Undefined"
    ],
    correctAnswer: 2,
    explanation: "Java is polite → it gives defaults.\n\nNumbers → 0\nboolean → false\nObjects → null\n\nJava automatically initializes instance variables, but not local variables."
  },
  {
    question: "What about local variables default value?",
    options: [
      "0",
      "null",
      "Depends",
      "No default"
    ],
    correctAnswer: 3,
    explanation: "Local variables = your responsibility 😤\n\nJava doesn't give default values to local variables. You must initialize them before use, or you'll get a compile error."
  },
  {
    question: "Which collection allows duplicates?",
    options: [
      "Set",
      "Map",
      "List",
      "None"
    ],
    correctAnswer: 2,
    explanation: "List = attendance register → names can repeat.\n\nLists allow duplicate elements, Sets don't, Maps have unique keys but duplicate values are allowed."
  },
  {
    question: "Which collection is unordered?",
    options: [
      "ArrayList",
      "LinkedList",
      "HashSet",
      "TreeSet"
    ],
    correctAnswer: 2,
    explanation: "HashSet = throw items in bucket 🪣\n\nHashSet doesn't maintain insertion order. ArrayList and LinkedList maintain order, TreeSet maintains sorted order."
  },
  {
    question: "HashMap allows?",
    options: [
      "Duplicate keys",
      "Duplicate values",
      "Null keys only",
      "No nulls"
    ],
    correctAnswer: 1,
    explanation: "Keys = unique 🔑\nValues = whatever 😎\n\nHashMap allows duplicate values but not duplicate keys. It allows one null key and multiple null values."
  },
  {
    question: "How many null keys in HashMap?",
    options: [
      "0",
      "1",
      "Many",
      "Depends on JVM"
    ],
    correctAnswer: 1,
    explanation: "Only one key can be null.\n\nHashMap allows exactly one null key. If you try to put another null key, it will replace the existing one."
  },
  {
    question: "Which is thread-safe?",
    options: [
      "ArrayList",
      "HashMap",
      "Vector",
      "HashSet"
    ],
    correctAnswer: 2,
    explanation: "Vector = old but safe 🧓🛡️\n\nVector is synchronized (thread-safe) but slower. ArrayList, HashMap, and HashSet are not thread-safe by default."
  },
  {
    question: "What is JVM?",
    options: [
      "Compiler",
      "OS",
      "Virtual machine",
      "Hardware"
    ],
    correctAnswer: 2,
    explanation: "JVM = middleman that runs Java code.\n\nJVM (Java Virtual Machine) is an abstract computing machine that enables your computer to run Java programs, making Java platform-independent."
  },
  {
    question: "What happens if exception not handled?",
    options: [
      "Program continues",
      "JVM ignores",
      "Program crashes",
      "Compiler fixes"
    ],
    correctAnswer: 2,
    explanation: "Unhandled problem → program stops 🚨\n\nWhen an exception is not caught and handled, JVM prints stack trace and terminates the program abruptly."
  },
  {
    question: "Can try exist without catch?",
    options: [
      "No",
      "Yes",
      "Only finally",
      "Only checked"
    ],
    correctAnswer: 1,
    explanation: "try {\n   // code\n} finally {\n   // always runs\n}\n\nYes! try can exist with finally but without catch. finally block always executes, whether exception occurs or not."
  },
  {
    question: "Output?\nSystem.out.println(10 + 20 + \"Java\");",
    options: [
      "Java30",
      "1020Java",
      "30Java",
      "Compile error"
    ],
    correctAnswer: 2,
    explanation: "Java reads left to right\n10 + 20 = 30 → then \"Java\" joins → 30Java"
  },
  {
    question: "Output?\nSystem.out.println(\"Java\" + 10 + 20);",
    options: [
      "Java30",
      "Java1020",
      "1020Java",
      "Compile error"
    ],
    correctAnswer: 1,
    explanation: "Once String comes → everything becomes String 🍜"
  },
  {
    question: "Output?\nint x = 10;\nSystem.out.println(x++);",
    options: [
      "11",
      "10",
      "9",
      "Compile error"
    ],
    correctAnswer: 1,
    explanation: "Post-increment = print first, increase later"
  },
  {
    question: "Output?\nint x = 10;\nSystem.out.println(++x);",
    options: [
      "10",
      "11",
      "9",
      "Compile error"
    ],
    correctAnswer: 1,
    explanation: "Pre-increment = increase first, print later"
  },
  {
    question: "Is Java 100% object-oriented?",
    options: [
      "Yes",
      "No",
      "Sometimes",
      "Depends on JVM"
    ],
    correctAnswer: 1,
    explanation: "Primitive types (int, double) are not objects."
  },
  {
    question: "Can interface have methods with body?",
    options: [
      "No",
      "Yes, from Java 8",
      "Only static",
      "Only private"
    ],
    correctAnswer: 1,
    explanation: "Java 8 added default methods."
  },
  {
    question: "Can interface have variables?",
    options: [
      "No",
      "Yes, any type",
      "Only final",
      "public static final only"
    ],
    correctAnswer: 3,
    explanation: "Interface variables = constants only"
  },
  {
    question: "Which one breaks encapsulation?",
    options: [
      "private variables",
      "public getters",
      "public variables",
      "setters"
    ],
    correctAnswer: 2,
    explanation: "Public variable = open underwear in public 😐"
  },
  {
    question: "Which is faster?",
    options: [
      "String",
      "StringBuffer",
      "StringBuilder",
      "All same"
    ],
    correctAnswer: 2,
    explanation: "String → slow\nStringBuffer → safe but slow\nStringBuilder → fast but unsafe"
  },
  {
    question: "Which is synchronized?",
    options: [
      "String",
      "StringBuilder",
      "StringBuffer",
      "None"
    ],
    correctAnswer: 2,
    explanation: "Synchronized = thread-safe 🛡️"
  },
  {
    question: "Can we create object without new?",
    options: [
      "No",
      "Yes",
      "Only reflection",
      "Only clone"
    ],
    correctAnswer: 1,
    explanation: "Ways:\nclone()\nreflection\ndeserialization"
  },
  {
    question: "What is marker interface?",
    options: [
      "Interface with methods",
      "Interface with variables",
      "Empty interface",
      "Abstract class"
    ],
    correctAnswer: 2,
    explanation: "Marker interface = tag only (example: Serializable)"
  },
  {
    question: "Can abstract class have constructor?",
    options: [
      "No",
      "Yes",
      "Only default",
      "Only private"
    ],
    correctAnswer: 1,
    explanation: "Constructor is for child object creation"
  },
  {
    question: "Can abstract method be static?",
    options: [
      "Yes",
      "No",
      "Sometimes",
      "Only public"
    ],
    correctAnswer: 1,
    explanation: "Abstract = needs override\nStatic = cannot override\n❌ conflict"
  },
  {
    question: "What happens if constructor throws exception?",
    options: [
      "Object created",
      "JVM ignores",
      "Object not created",
      "Partial object"
    ],
    correctAnswer: 2,
    explanation: "No constructor success = no object 🧱❌"
  },
  {
    question: "Can we overload constructor?",
    options: [
      "No",
      "Yes",
      "Only once",
      "Only private"
    ],
    correctAnswer: 1,
    explanation: "Different parameters = different constructors."
  },
  {
    question: "Difference: Array vs ArrayList?",
    options: [
      "Same",
      "Array is dynamic",
      "ArrayList is fixed",
      "Array is fixed, ArrayList is dynamic"
    ],
    correctAnswer: 3,
    explanation: "Array = rigid steel\nArrayList = rubber band"
  },
  {
    question: "What is transient keyword?",
    options: [
      "Temporary variable",
      "Skip serialization",
      "Final variable",
      "Static variable"
    ],
    correctAnswer: 1,
    explanation: "Transient = \"Don't save me\" 💾❌"
  },
  {
    question: "What is serialization?",
    options: [
      "Object to file",
      "File to object",
      "Object to byte stream",
      "Database storage"
    ],
    correctAnswer: 2,
    explanation: "Object → bytes → save/send 📦"
  },
  {
    question: "What happens if return inside finally?",
    options: [
      "Exception thrown",
      "Return from try",
      "Return from finally",
      "Compile error"
    ],
    correctAnswer: 2,
    explanation: "finally is boss 😎\nIt overrides everything."
  },
  {
    question: "🧠 41. Output?\nInteger a = 100;\nInteger b = 100;\nSystem.out.println(a == b);",
    options: [
      "A. true",
      "B. false",
      "C. Compile error",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nJava caches Integer values from -128 to 127.\nSame number → same object."
  },
  {
    question: "🧠 42. Output?\nInteger a = 200;\nInteger b = 200;\nSystem.out.println(a == b);",
    options: [
      "A. true",
      "B. false",
      "C. Compile error",
      "D. Runtime error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n200 is outside cache → new objects → different boxes 📦📦"
  },
  {
    question: "🧠 43. Output?\nSystem.out.println(10.0 / 0);",
    options: [
      "A. Infinity",
      "B. 0",
      "C. ArithmeticException",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nFloating point has Infinity, integers don't."
  },
  {
    question: "🧠 44. Output?\nSystem.out.println(10 % 0);",
    options: [
      "A. 0",
      "B. Infinity",
      "C. ArithmeticException",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nInteger divide by zero = 💥 crash."
  },
  {
    question: "🧠 45. Can this() and super() be together?",
    options: [
      "A. Yes",
      "B. No",
      "C. Only in static",
      "D. Only in abstract"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nOnly one constructor call allowed, and first line only."
  },
  {
    question: "🧠 46. Can constructor be static?",
    options: [
      "A. Yes",
      "B. No",
      "C. Only private",
      "D. Only default"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nConstructor = object creation\nStatic = class level\n❌ no match."
  },
  {
    question: "🧠 47. Which block runs first?",
    options: [
      "A. main()",
      "B. static block",
      "C. constructor",
      "D. instance block"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nClass loads → static runs first 🚀"
  },
  {
    question: "🧠 48. Order of execution?\nstatic → instance → constructor → main",
    options: [
      "A. static → instance → constructor → main",
      "B. main → static → constructor → instance",
      "C. static → main → constructor → instance",
      "D. main → constructor → static → instance"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nLoad class → create object → run main 🏃"
  },
  {
    question: "🧠 49. What is tight coupling?",
    options: [
      "A. Using interface",
      "B. Using inheritance",
      "C. Direct object creation",
      "D. Using abstraction"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nInterface = plug & play 🔌\nLoose coupling = easy changes."
  },
  {
    question: "🧠 50. Best way to achieve loose coupling?",
    options: [
      "A. new keyword",
      "B. inheritance",
      "C. interfaces",
      "D. static methods"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nInterface = freedom 🔌\nLoose coupling = easy maintenance."
  },
  {
    question: "🧠 51. Which keyword is used to prevent method overriding?",
    options: [
      "A. static",
      "B. final",
      "C. private",
      "D. abstract"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nfinal method = 'This recipe is locked, no remixing.' Child classes cannot override it."
  },
  {
    question: "🧠 52. Can we have multiple catch blocks for one try?",
    options: [
      "A. No",
      "B. Yes",
      "C. Only two",
      "D. Only for checked exceptions"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nOne try, many nets 🥅🥅 — catch blocks are checked top to bottom, most specific first."
  },
  {
    question: "🧠 53. What is the parent class of all exceptions?",
    options: [
      "A. Error",
      "B. Exception",
      "C. Throwable",
      "D. RuntimeException"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nThrowable is the grandparent 👴 — both Error and Exception extend it."
  },
  {
    question: "🧠 54. Difference between checked and unchecked exceptions?",
    options: [
      "A. Checked caught at compile time, unchecked at runtime",
      "B. Both same",
      "C. Unchecked needs try-catch always",
      "D. Checked extends RuntimeException"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nChecked = compiler nags you 📢 to handle it. Unchecked = compiler stays quiet, crashes at runtime instead."
  },
  {
    question: "🧠 55. Output?\nList<Integer> list = new ArrayList<>();\nlist.add(1); list.add(2); list.add(3);\nlist.remove(1);\nSystem.out.println(list);",
    options: [
      "A. [1, 2, 3]",
      "B. [1, 3]",
      "C. [2, 3]",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nremove(int) with an Integer literal removes by index, not value! Index 1 = the '2' → removed. Sneaky overload trap 🪤"
  },
  {
    question: "🧠 56. Which interface does HashMap implement for iteration order guarantees?",
    options: [
      "A. HashMap guarantees no order",
      "B. Map",
      "C. Collection",
      "D. Comparable"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nHashMap makes zero promises about order 🎲. Want order? Use LinkedHashMap or TreeMap."
  },
  {
    question: "🧠 57. What does the 'volatile' keyword do?",
    options: [
      "A. Makes variable constant",
      "B. Ensures visibility across threads",
      "C. Makes variable thread-local",
      "D. Prevents garbage collection"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nvolatile = 'everyone reads the latest update, no stale cached copies' 📡 across threads."
  },
  {
    question: "🧠 58. Can we instantiate an abstract class?",
    options: [
      "A. Yes",
      "B. No",
      "C. Only with new()",
      "D. Only if it has no methods"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nAbstract class = incomplete blueprint 📐. You need a finished house (subclass) to actually live in it."
  },
  {
    question: "🧠 59. What is method overloading based on?",
    options: [
      "A. Return type only",
      "B. Number/type of parameters",
      "C. Access modifier",
      "D. Method name only"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nSame name, different costume 🎭 — parameters must differ in number or type."
  },
  {
    question: "🧠 60. What is the size of an empty ArrayList's default capacity in Java?",
    options: [
      "A. 0",
      "B. 10",
      "C. 16",
      "D. Depends on JVM"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nDefault internal array capacity is 10, but size() shows 0 until you add elements."
  },
  {
    question: "🧠 61. Which loop is guaranteed to execute at least once?",
    options: [
      "A. for",
      "B. while",
      "C. do-while",
      "D. for-each"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\ndo-while checks the condition AFTER running the body once 🚪 — enter first, ask questions later."
  },
  {
    question: "🧠 62. What does 'this' keyword refer to?",
    options: [
      "A. Parent class object",
      "B. Current class object",
      "C. Static context",
      "D. Interface reference"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n'this' = pointing at yourself in the mirror 🪞, referring to the current instance."
  },
  {
    question: "🧠 63. Output?\nSystem.out.println(1 == 1.0);",
    options: [
      "A. true",
      "B. false",
      "C. Compile error",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nJava widens int to double before comparing → 1.0 == 1.0 → true."
  },
  {
    question: "🧠 64. Which collection maintains sorted order automatically?",
    options: [
      "A. HashSet",
      "B. TreeSet",
      "C. LinkedHashSet",
      "D. ArrayDeque"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nTreeSet = the organized friend 📚 who always keeps things sorted, backed by a Red-Black tree."
  },
  {
    question: "🧠 65. What happens when you divide two integers in Java, e.g. 7 / 2?",
    options: [
      "A. 3.5",
      "B. 3",
      "C. 4",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nInteger division truncates the decimal 🔪 — no rounding, just chops it off."
  },
  {
    question: "🧠 66. Can a class implement multiple interfaces?",
    options: [
      "A. No",
      "B. Yes",
      "C. Only two",
      "D. Only with abstract methods"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nJava has no multiple class inheritance, but interfaces? Stack as many as you want 🧩🧩🧩."
  },
  {
    question: "🧠 67. What is autoboxing?",
    options: [
      "A. Converting primitive to wrapper automatically",
      "B. Converting wrapper to primitive manually",
      "C. Boxing arrays",
      "D. Casting objects"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nint → Integer happens automatically 📦, Java quietly wraps it for you."
  },
  {
    question: "🧠 68. What is the output?\nStringBuilder sb = new StringBuilder(\"abc\");\nsb.reverse();\nSystem.out.println(sb);",
    options: [
      "A. abc",
      "B. cba",
      "C. Compile error",
      "D. null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nStringBuilder is mutable, so reverse() flips it in place → 'cba'."
  },
  {
    question: "🧠 69. Which access modifier is most restrictive?",
    options: [
      "A. public",
      "B. protected",
      "C. default",
      "D. private"
    ],
    correctAnswer: 3,
    explanation: "✅ Correct: D\n\n🫏 Explanation:\nprivate = 'only I can see this' 🔒 — visible only within the same class."
  },
  {
    question: "🧠 70. FINAL DONKEY SUMMARY PART 2 🫏",
    options: [
      "final method can't be overridden",
      "Throwable is the parent of all exceptions",
      "ArrayList default capacity is 10",
      "TreeSet keeps things sorted",
      "Integer division truncates",
      "Interfaces allow multiple inheritance",
      "private is most restrictive",
      "do-while runs at least once"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 ArrayList default capacity is 10"
  },
  {
    question: "🧠 71. What is the purpose of generics in Java?",
    options: [
      "A. Faster execution",
      "B. Type safety at compile time",
      "C. Less memory usage",
      "D. Multiple inheritance"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nGenerics = a labeled box 📦 that only accepts one type of item, catching mismatches before runtime."
  },
  {
    question: "🧠 72. Output?\nList<String> list = new ArrayList<>();\nlist.add(\"A\");\nlist.add(1, \"B\");\nSystem.out.println(list);",
    options: [
      "A. [A, B]",
      "B. [B, A]",
      "C. IndexOutOfBoundsException",
      "D. Compile error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nadd(index, element) inserts 'B' at position 1 → right after 'A' → [A, B]."
  },
  {
    question: "🧠 73. Which is true about enum in Java?",
    options: [
      "A. Enum can extend a class",
      "B. Enum values are implicitly public static final",
      "C. Enum cannot have methods",
      "D. Enum cannot implement interfaces"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nEach enum constant is a fixed, unchangeable object 🪨 — public static final under the hood."
  },
  {
    question: "🧠 74. What is the contract between equals() and hashCode()?",
    options: [
      "A. No relation",
      "B. Equal objects must have equal hashCodes",
      "C. hashCode must always be unique",
      "D. equals() calls hashCode() internally"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf two objects are 'equal', they MUST report the same hashCode 🔑 — break this and HashMap/HashSet behave weirdly."
  },
  {
    question: "🧠 75. What does the 'synchronized' keyword do?",
    options: [
      "A. Speeds up threads",
      "B. Allows only one thread to access a block at a time",
      "C. Makes variables final",
      "D. Prevents object creation"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nsynchronized = 'one person in the bathroom at a time' 🚪🔒 — other threads wait their turn."
  },
  {
    question: "🧠 76. Output?\nint x = 5;\nString result = (x > 3) ? \"big\" : \"small\";\nSystem.out.println(result);",
    options: [
      "A. big",
      "B. small",
      "C. true",
      "D. Compile error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nTernary operator = a one-line if-else 🎯. 5 > 3 is true → 'big'."
  },
  {
    question: "🧠 77. Can you have a method with variable number of arguments?",
    options: [
      "A. No",
      "B. Yes, using varargs (...)",
      "C. Only with arrays",
      "D. Only in interfaces"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nvoid greet(String... names) — varargs let you pass 0, 1, or a bunch of arguments like a buffet 🍽️."
  },
  {
    question: "🧠 78. What is a nested static class also called?",
    options: [
      "A. Inner class",
      "B. Static nested class",
      "C. Anonymous class",
      "D. Local class"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nA static nested class doesn't need an outer object to exist — it's independent, unlike a true inner class."
  },
  {
    question: "🧠 79. Output?\nfor (int i = 0; i < 3; i++) {\n  if (i == 1) continue;\n  System.out.print(i);\n}",
    options: [
      "A. 012",
      "B. 02",
      "C. 01",
      "D. 0"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ncontinue skips the rest of that iteration only ⏭️ — i=1 gets skipped, loop keeps going → 0, then 2."
  },
  {
    question: "🧠 80. What is a labeled break used for?",
    options: [
      "A. Breaking only the innermost loop",
      "B. Breaking out of a specific outer loop",
      "C. Breaking a switch statement",
      "D. Breaking a method"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nlabeled break = 'exit the whole building, not just this room' 🏢 — jumps out of the named outer loop directly."
  },
  {
    question: "🧠 81. Which of these is NOT a functional interface?",
    options: [
      "A. Runnable",
      "B. Comparator",
      "C. Collection",
      "D. Callable"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nCollection has many abstract methods, not just one. Functional interfaces need exactly one abstract method for lambdas to work."
  },
  {
    question: "🧠 82. Output?\nInteger a = null;\nint b = a;",
    options: [
      "A. b = 0",
      "B. NullPointerException",
      "C. Compile error",
      "D. b = null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nUnboxing null into a primitive tries to call a.intValue() on nothing 💥 → NPE, a classic autoboxing trap."
  },
  {
    question: "🧠 83. What is the diamond problem, and how does Java avoid it with interfaces?",
    options: [
      "A. Java doesn't allow multiple interface inheritance",
      "B. Default methods force explicit override on conflict",
      "C. Java picks the first interface automatically",
      "D. Java doesn't have this problem"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf two interfaces give conflicting default methods, Java refuses to guess 🤷 — you must override it yourself to resolve the clash."
  },
  {
    question: "🧠 84. Which collection is best for LIFO operations?",
    options: [
      "A. Queue",
      "B. Stack / Deque",
      "C. List",
      "D. Set"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nLIFO = Last In First Out, like a stack of plates 🍽️ — Stack or ArrayDeque handle this cleanly."
  },
  {
    question: "🧠 85. Output?\nSystem.out.println(Integer.parseInt(\"10\") + \"20\");",
    options: [
      "A. 1020",
      "B. 30",
      "C. Compile error",
      "D. NumberFormatException"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nparseInt(\"10\") gives int 10 first, then + \"20\" triggers String concatenation → \"1020\"."
  },
  {
    question: "🧠 86. What does the 'instanceof' operator check?",
    options: [
      "A. If two objects are equal",
      "B. If an object is an instance of a given type",
      "C. If a class is abstract",
      "D. If a variable is null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ninstanceof = 'are you actually a Dog, or just something pretending?' 🐕 — checks the real type at runtime."
  },
  {
    question: "🧠 87. Can a switch statement work with String in Java?",
    options: [
      "A. No, only int",
      "B. Yes, since Java 7",
      "C. Only with enums",
      "D. Only with char"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nJava 7 added String switch support — under the hood it uses hashCode() + equals() to match."
  },
  {
    question: "🧠 88. What happens to a thread when you call sleep()?",
    options: [
      "A. It dies permanently",
      "B. It pauses execution for a given time",
      "C. It releases all locks",
      "D. It starts a new thread"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nsleep() = 'taking a nap' 😴 for a set duration, but it does NOT release any locks it's holding."
  },
  {
    question: "🧠 89. What is the difference between ArrayList and LinkedList for insertion?",
    options: [
      "A. Both are equally fast everywhere",
      "B. ArrayList is faster for insert at start, LinkedList for random access",
      "C. LinkedList is faster for insert/delete at start, ArrayList for random access",
      "D. Neither supports insertion"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nLinkedList = chain of boxes 🔗, easy to snip and insert at the ends. ArrayList = numbered shelf 📚, instant lookup by index but costly shifting on insert."
  },
  {
    question: "🧠 90. FINAL DONKEY SUMMARY PART 3 🫏",
    options: [
      "Generics give compile-time type safety",
      "equals() and hashCode() must stay consistent",
      "Unboxing null throws NPE",
      "String switch works since Java 7",
      "LinkedList is better for insert/delete at ends",
      "synchronized allows one thread at a time",
      "Functional interfaces have exactly one abstract method",
      "sleep() pauses but doesn't release locks"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Unboxing null throws NullPointerException"
  }, {
    question: "What is difference between == and equals()?",
    options: [
      "Both compare values",
      "Both compare references",
      "== compares references, equals() compares values",
      "== compares values, equals() compares references"
    ],
    correctAnswer: 2,
    explanation: "== → 'Are these two things same box?'\nequals() → 'Do these two boxes contain the same stuff?'\n\n== checks if they're the exact same object in memory, equals() checks if they have the same content."
  },
  {
    question: "String is immutable means?",
    options: [
      "String value can change",
      "String object cannot change",
      "String reference cannot change",
      "String memory location cannot change"
    ],
    correctAnswer: 1,
    explanation: "You cannot change the same string object. When you 'change' it → Java creates a new string. Like a sealed envelope - you can't change what's inside, you have to make a new one."
  },
  {
    question: "Why String is immutable?",
    options: [
      "For security",
      "For thread safety",
      "For performance",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "One rule → many benefits. Like sealed milk packet 🥛 — safe, shared, fast. Immutable strings are secure (can't be modified), thread-safe (no locking needed), and allow optimizations like string pooling."
  },
  {
    question: "Output?\nString s1 = \"Java\";\nString s2 = \"Java\";\nSystem.out.println(s1 == s2);",
    options: [
      "true",
      "false",
      "Compile error",
      "Runtime error"
    ],
    correctAnswer: 0,
    explanation: "String literals go into String Pool. Same text → same object. Java is smart - if you create the same string literal, it just points to the existing one in the pool to save memory."
  },
  {
    question: "Output?\nString s1 = new String(\"Java\");\nString s2 = new String(\"Java\");\nSystem.out.println(s1 == s2);",
    options: [
      "true",
      "false",
      "Compile error",
      "Runtime error"
    ],
    correctAnswer: 1,
    explanation: "new = new box every time 📦\nDifferent boxes → == false.\nWhen you use 'new', Java always creates a new object in memory, even if the content is the same."
  },
  {
    question: "Can we overload main()?",
    options: [
      "No",
      "Yes",
      "Only once",
      "Only static"
    ],
    correctAnswer: 1,
    explanation: "Java calls only:\npublic static void main(String[] args)\nOthers are ignored. You can have multiple main methods with different parameters, but JVM only calls the specific one."
  },
  {
    question: "Can we override static methods?",
    options: [
      "Yes",
      "No",
      "Sometimes",
      "Only final"
    ],
    correctAnswer: 1,
    explanation: "Static = belongs to class, not object. No object → no overriding. Static methods are hidden, not overridden. Child class can have its own static method with the same name, but it's not polymorphism."
  },
  {
    question: "Difference between final, finally, finalize()?",
    options: [
      "All same",
      "All different",
      "final & finally same",
      "finally & finalize() same"
    ],
    correctAnswer: 1,
    explanation: "final → stop changing ✋\nfinally → always runs 🔁\nfinalize() → before garbage collection 🗑️\n\nThree completely different concepts with similar names!"
  },
  {
    question: "Which keyword prevents inheritance?",
    options: [
      "static",
      "private",
      "final",
      "protected"
    ],
    correctAnswer: 2,
    explanation: "final class = 'No kids allowed' 👶❌\n\nWhen a class is marked final, no other class can extend it. It's like saying 'This design is complete - no one can modify it.'"
  },
  {
    question: "Can constructor be final?",
    options: [
      "Yes",
      "No",
      "Only private",
      "Only static"
    ],
    correctAnswer: 1,
    explanation: "Constructors cannot be inherited → no need for final. Constructors are never inherited anyway, so making them final would be meaningless. Java doesn't allow it."
  },
  {
    question: "What is default value of instance variable?",
    options: [
      "garbage",
      "null",
      "0 / false / null",
      "Undefined"
    ],
    correctAnswer: 2,
    explanation: "Java is polite → it gives defaults.\n\nNumbers → 0\nboolean → false\nObjects → null\n\nJava automatically initializes instance variables, but not local variables."
  },
  {
    question: "What about local variables default value?",
    options: [
      "0",
      "null",
      "Depends",
      "No default"
    ],
    correctAnswer: 3,
    explanation: "Local variables = your responsibility 😤\n\nJava doesn't give default values to local variables. You must initialize them before use, or you'll get a compile error."
  },
  {
    question: "Which collection allows duplicates?",
    options: [
      "Set",
      "Map",
      "List",
      "None"
    ],
    correctAnswer: 2,
    explanation: "List = attendance register → names can repeat.\n\nLists allow duplicate elements, Sets don't, Maps have unique keys but duplicate values are allowed."
  },
  {
    question: "Which collection is unordered?",
    options: [
      "ArrayList",
      "LinkedList",
      "HashSet",
      "TreeSet"
    ],
    correctAnswer: 2,
    explanation: "HashSet = throw items in bucket 🪣\n\nHashSet doesn't maintain insertion order. ArrayList and LinkedList maintain order, TreeSet maintains sorted order."
  },
  {
    question: "HashMap allows?",
    options: [
      "Duplicate keys",
      "Duplicate values",
      "Null keys only",
      "No nulls"
    ],
    correctAnswer: 1,
    explanation: "Keys = unique 🔑\nValues = whatever 😎\n\nHashMap allows duplicate values but not duplicate keys. It allows one null key and multiple null values."
  },
  {
    question: "How many null keys in HashMap?",
    options: [
      "0",
      "1",
      "Many",
      "Depends on JVM"
    ],
    correctAnswer: 1,
    explanation: "Only one key can be null.\n\nHashMap allows exactly one null key. If you try to put another null key, it will replace the existing one."
  },
  {
    question: "Which is thread-safe?",
    options: [
      "ArrayList",
      "HashMap",
      "Vector",
      "HashSet"
    ],
    correctAnswer: 2,
    explanation: "Vector = old but safe 🧓🛡️\n\nVector is synchronized (thread-safe) but slower. ArrayList, HashMap, and HashSet are not thread-safe by default."
  },
  {
    question: "What is JVM?",
    options: [
      "Compiler",
      "OS",
      "Virtual machine",
      "Hardware"
    ],
    correctAnswer: 2,
    explanation: "JVM = middleman that runs Java code.\n\nJVM (Java Virtual Machine) is an abstract computing machine that enables your computer to run Java programs, making Java platform-independent."
  },
  {
    question: "What happens if exception not handled?",
    options: [
      "Program continues",
      "JVM ignores",
      "Program crashes",
      "Compiler fixes"
    ],
    correctAnswer: 2,
    explanation: "Unhandled problem → program stops 🚨\n\nWhen an exception is not caught and handled, JVM prints stack trace and terminates the program abruptly."
  },
  {
    question: "Can try exist without catch?",
    options: [
      "No",
      "Yes",
      "Only finally",
      "Only checked"
    ],
    correctAnswer: 1,
    explanation: "try {\n   // code\n} finally {\n   // always runs\n}\n\nYes! try can exist with finally but without catch. finally block always executes, whether exception occurs or not."
  },
  {
    question: "Output?\nSystem.out.println(10 + 20 + \"Java\");",
    options: [
      "Java30",
      "1020Java",
      "30Java",
      "Compile error"
    ],
    correctAnswer: 2,
    explanation: "Java reads left to right\n10 + 20 = 30 → then \"Java\" joins → 30Java"
  },
  {
    question: "Output?\nSystem.out.println(\"Java\" + 10 + 20);",
    options: [
      "Java30",
      "Java1020",
      "1020Java",
      "Compile error"
    ],
    correctAnswer: 1,
    explanation: "Once String comes → everything becomes String 🍜"
  },
  {
    question: "Output?\nint x = 10;\nSystem.out.println(x++);",
    options: [
      "11",
      "10",
      "9",
      "Compile error"
    ],
    correctAnswer: 1,
    explanation: "Post-increment = print first, increase later"
  },
  {
    question: "Output?\nint x = 10;\nSystem.out.println(++x);",
    options: [
      "10",
      "11",
      "9",
      "Compile error"
    ],
    correctAnswer: 1,
    explanation: "Pre-increment = increase first, print later"
  },
  {
    question: "Is Java 100% object-oriented?",
    options: [
      "Yes",
      "No",
      "Sometimes",
      "Depends on JVM"
    ],
    correctAnswer: 1,
    explanation: "Primitive types (int, double) are not objects."
  },
  {
    question: "Can interface have methods with body?",
    options: [
      "No",
      "Yes, from Java 8",
      "Only static",
      "Only private"
    ],
    correctAnswer: 1,
    explanation: "Java 8 added default methods."
  },
  {
    question: "Can interface have variables?",
    options: [
      "No",
      "Yes, any type",
      "Only final",
      "public static final only"
    ],
    correctAnswer: 3,
    explanation: "Interface variables = constants only"
  },
  {
    question: "Which one breaks encapsulation?",
    options: [
      "private variables",
      "public getters",
      "public variables",
      "setters"
    ],
    correctAnswer: 2,
    explanation: "Public variable = open underwear in public 😐"
  },
  {
    question: "Which is faster?",
    options: [
      "String",
      "StringBuffer",
      "StringBuilder",
      "All same"
    ],
    correctAnswer: 2,
    explanation: "String → slow\nStringBuffer → safe but slow\nStringBuilder → fast but unsafe"
  },
  {
    question: "Which is synchronized?",
    options: [
      "String",
      "StringBuilder",
      "StringBuffer",
      "None"
    ],
    correctAnswer: 2,
    explanation: "Synchronized = thread-safe 🛡️"
  },
  {
    question: "Can we create object without new?",
    options: [
      "No",
      "Yes",
      "Only reflection",
      "Only clone"
    ],
    correctAnswer: 1,
    explanation: "Ways:\nclone()\nreflection\ndeserialization"
  },
  {
    question: "What is marker interface?",
    options: [
      "Interface with methods",
      "Interface with variables",
      "Empty interface",
      "Abstract class"
    ],
    correctAnswer: 2,
    explanation: "Marker interface = tag only (example: Serializable)"
  },
  {
    question: "Can abstract class have constructor?",
    options: [
      "No",
      "Yes",
      "Only default",
      "Only private"
    ],
    correctAnswer: 1,
    explanation: "Constructor is for child object creation"
  },
  {
    question: "Can abstract method be static?",
    options: [
      "Yes",
      "No",
      "Sometimes",
      "Only public"
    ],
    correctAnswer: 1,
    explanation: "Abstract = needs override\nStatic = cannot override\n❌ conflict"
  },
  {
    question: "What happens if constructor throws exception?",
    options: [
      "Object created",
      "JVM ignores",
      "Object not created",
      "Partial object"
    ],
    correctAnswer: 2,
    explanation: "No constructor success = no object 🧱❌"
  },
  {
    question: "Can we overload constructor?",
    options: [
      "No",
      "Yes",
      "Only once",
      "Only private"
    ],
    correctAnswer: 1,
    explanation: "Different parameters = different constructors."
  },
  {
    question: "Difference: Array vs ArrayList?",
    options: [
      "Same",
      "Array is dynamic",
      "ArrayList is fixed",
      "Array is fixed, ArrayList is dynamic"
    ],
    correctAnswer: 3,
    explanation: "Array = rigid steel\nArrayList = rubber band"
  },
  {
    question: "What is transient keyword?",
    options: [
      "Temporary variable",
      "Skip serialization",
      "Final variable",
      "Static variable"
    ],
    correctAnswer: 1,
    explanation: "Transient = \"Don't save me\" 💾❌"
  },
  {
    question: "What is serialization?",
    options: [
      "Object to file",
      "File to object",
      "Object to byte stream",
      "Database storage"
    ],
    correctAnswer: 2,
    explanation: "Object → bytes → save/send 📦"
  },
  {
    question: "What happens if return inside finally?",
    options: [
      "Exception thrown",
      "Return from try",
      "Return from finally",
      "Compile error"
    ],
    correctAnswer: 2,
    explanation: "finally is boss 😎\nIt overrides everything."
  },
  {
    question: "🧠 41. Output?\nInteger a = 100;\nInteger b = 100;\nSystem.out.println(a == b);",
    options: [
      "A. true",
      "B. false",
      "C. Compile error",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nJava caches Integer values from -128 to 127.\nSame number → same object."
  },
  {
    question: "🧠 42. Output?\nInteger a = 200;\nInteger b = 200;\nSystem.out.println(a == b);",
    options: [
      "A. true",
      "B. false",
      "C. Compile error",
      "D. Runtime error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n200 is outside cache → new objects → different boxes 📦📦"
  },
  {
    question: "🧠 43. Output?\nSystem.out.println(10.0 / 0);",
    options: [
      "A. Infinity",
      "B. 0",
      "C. ArithmeticException",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nFloating point has Infinity, integers don't."
  },
  {
    question: "🧠 44. Output?\nSystem.out.println(10 % 0);",
    options: [
      "A. 0",
      "B. Infinity",
      "C. ArithmeticException",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nInteger divide by zero = 💥 crash."
  },
  {
    question: "🧠 45. Can this() and super() be together?",
    options: [
      "A. Yes",
      "B. No",
      "C. Only in static",
      "D. Only in abstract"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nOnly one constructor call allowed, and first line only."
  },
  {
    question: "🧠 46. Can constructor be static?",
    options: [
      "A. Yes",
      "B. No",
      "C. Only private",
      "D. Only default"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nConstructor = object creation\nStatic = class level\n❌ no match."
  },
  {
    question: "🧠 47. Which block runs first?",
    options: [
      "A. main()",
      "B. static block",
      "C. constructor",
      "D. instance block"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nClass loads → static runs first 🚀"
  },
  {
    question: "🧠 48. Order of execution?\nstatic → instance → constructor → main",
    options: [
      "A. static → instance → constructor → main",
      "B. main → static → constructor → instance",
      "C. static → main → constructor → instance",
      "D. main → constructor → static → instance"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nLoad class → create object → run main 🏃"
  },
  {
    question: "🧠 49. What is tight coupling?",
    options: [
      "A. Using interface",
      "B. Using inheritance",
      "C. Direct object creation",
      "D. Using abstraction"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nInterface = plug & play 🔌\nLoose coupling = easy changes."
  },
  {
    question: "🧠 50. Best way to achieve loose coupling?",
    options: [
      "A. new keyword",
      "B. inheritance",
      "C. interfaces",
      "D. static methods"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nInterface = freedom 🔌\nLoose coupling = easy maintenance."
  },
  {
    question: "🧠 51. Which keyword is used to prevent method overriding?",
    options: [
      "A. static",
      "B. final",
      "C. private",
      "D. abstract"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nfinal method = 'This recipe is locked, no remixing.' Child classes cannot override it."
  },
  {
    question: "🧠 52. Can we have multiple catch blocks for one try?",
    options: [
      "A. No",
      "B. Yes",
      "C. Only two",
      "D. Only for checked exceptions"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nOne try, many nets 🥅🥅 — catch blocks are checked top to bottom, most specific first."
  },
  {
    question: "🧠 53. What is the parent class of all exceptions?",
    options: [
      "A. Error",
      "B. Exception",
      "C. Throwable",
      "D. RuntimeException"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nThrowable is the grandparent 👴 — both Error and Exception extend it."
  },
  {
    question: "🧠 54. Difference between checked and unchecked exceptions?",
    options: [
      "A. Checked caught at compile time, unchecked at runtime",
      "B. Both same",
      "C. Unchecked needs try-catch always",
      "D. Checked extends RuntimeException"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nChecked = compiler nags you 📢 to handle it. Unchecked = compiler stays quiet, crashes at runtime instead."
  },
  {
    question: "🧠 55. Output?\nList<Integer> list = new ArrayList<>();\nlist.add(1); list.add(2); list.add(3);\nlist.remove(1);\nSystem.out.println(list);",
    options: [
      "A. [1, 2, 3]",
      "B. [1, 3]",
      "C. [2, 3]",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nremove(int) with an Integer literal removes by index, not value! Index 1 = the '2' → removed. Sneaky overload trap 🪤"
  },
  {
    question: "🧠 56. Which interface does HashMap implement for iteration order guarantees?",
    options: [
      "A. HashMap guarantees no order",
      "B. Map",
      "C. Collection",
      "D. Comparable"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nHashMap makes zero promises about order 🎲. Want order? Use LinkedHashMap or TreeMap."
  },
  {
    question: "🧠 57. What does the 'volatile' keyword do?",
    options: [
      "A. Makes variable constant",
      "B. Ensures visibility across threads",
      "C. Makes variable thread-local",
      "D. Prevents garbage collection"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nvolatile = 'everyone reads the latest update, no stale cached copies' 📡 across threads."
  },
  {
    question: "🧠 58. Can we instantiate an abstract class?",
    options: [
      "A. Yes",
      "B. No",
      "C. Only with new()",
      "D. Only if it has no methods"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nAbstract class = incomplete blueprint 📐. You need a finished house (subclass) to actually live in it."
  },
  {
    question: "🧠 59. What is method overloading based on?",
    options: [
      "A. Return type only",
      "B. Number/type of parameters",
      "C. Access modifier",
      "D. Method name only"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nSame name, different costume 🎭 — parameters must differ in number or type."
  },
  {
    question: "🧠 60. What is the size of an empty ArrayList's default capacity in Java?",
    options: [
      "A. 0",
      "B. 10",
      "C. 16",
      "D. Depends on JVM"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nDefault internal array capacity is 10, but size() shows 0 until you add elements."
  },
  {
    question: "🧠 61. Which loop is guaranteed to execute at least once?",
    options: [
      "A. for",
      "B. while",
      "C. do-while",
      "D. for-each"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\ndo-while checks the condition AFTER running the body once 🚪 — enter first, ask questions later."
  },
  {
    question: "🧠 62. What does 'this' keyword refer to?",
    options: [
      "A. Parent class object",
      "B. Current class object",
      "C. Static context",
      "D. Interface reference"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n'this' = pointing at yourself in the mirror 🪞, referring to the current instance."
  },
  {
    question: "🧠 63. Output?\nSystem.out.println(1 == 1.0);",
    options: [
      "A. true",
      "B. false",
      "C. Compile error",
      "D. Runtime error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nJava widens int to double before comparing → 1.0 == 1.0 → true."
  },
  {
    question: "🧠 64. Which collection maintains sorted order automatically?",
    options: [
      "A. HashSet",
      "B. TreeSet",
      "C. LinkedHashSet",
      "D. ArrayDeque"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nTreeSet = the organized friend 📚 who always keeps things sorted, backed by a Red-Black tree."
  },
  {
    question: "🧠 65. What happens when you divide two integers in Java, e.g. 7 / 2?",
    options: [
      "A. 3.5",
      "B. 3",
      "C. 4",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nInteger division truncates the decimal 🔪 — no rounding, just chops it off."
  },
  {
    question: "🧠 66. Can a class implement multiple interfaces?",
    options: [
      "A. No",
      "B. Yes",
      "C. Only two",
      "D. Only with abstract methods"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nJava has no multiple class inheritance, but interfaces? Stack as many as you want 🧩🧩🧩."
  },
  {
    question: "🧠 67. What is autoboxing?",
    options: [
      "A. Converting primitive to wrapper automatically",
      "B. Converting wrapper to primitive manually",
      "C. Boxing arrays",
      "D. Casting objects"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nint → Integer happens automatically 📦, Java quietly wraps it for you."
  },
  {
    question: "🧠 68. What is the output?\nStringBuilder sb = new StringBuilder(\"abc\");\nsb.reverse();\nSystem.out.println(sb);",
    options: [
      "A. abc",
      "B. cba",
      "C. Compile error",
      "D. null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nStringBuilder is mutable, so reverse() flips it in place → 'cba'."
  },
  {
    question: "🧠 69. Which access modifier is most restrictive?",
    options: [
      "A. public",
      "B. protected",
      "C. default",
      "D. private"
    ],
    correctAnswer: 3,
    explanation: "✅ Correct: D\n\n🫏 Explanation:\nprivate = 'only I can see this' 🔒 — visible only within the same class."
  },
  {
    question: "🧠 70. FINAL DONKEY SUMMARY PART 2 🫏",
    options: [
      "final method can't be overridden",
      "Throwable is the parent of all exceptions",
      "ArrayList default capacity is 10",
      "TreeSet keeps things sorted",
      "Integer division truncates",
      "Interfaces allow multiple inheritance",
      "private is most restrictive",
      "do-while runs at least once"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 ArrayList default capacity is 10"
  },
  {
    question: "🧠 71. What is the purpose of generics in Java?",
    options: [
      "A. Faster execution",
      "B. Type safety at compile time",
      "C. Less memory usage",
      "D. Multiple inheritance"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nGenerics = a labeled box 📦 that only accepts one type of item, catching mismatches before runtime."
  },
  {
    question: "🧠 72. Output?\nList<String> list = new ArrayList<>();\nlist.add(\"A\");\nlist.add(1, \"B\");\nSystem.out.println(list);",
    options: [
      "A. [A, B]",
      "B. [B, A]",
      "C. IndexOutOfBoundsException",
      "D. Compile error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nadd(index, element) inserts 'B' at position 1 → right after 'A' → [A, B]."
  },
  {
    question: "🧠 73. Which is true about enum in Java?",
    options: [
      "A. Enum can extend a class",
      "B. Enum values are implicitly public static final",
      "C. Enum cannot have methods",
      "D. Enum cannot implement interfaces"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nEach enum constant is a fixed, unchangeable object 🪨 — public static final under the hood."
  },
  {
    question: "🧠 74. What is the contract between equals() and hashCode()?",
    options: [
      "A. No relation",
      "B. Equal objects must have equal hashCodes",
      "C. hashCode must always be unique",
      "D. equals() calls hashCode() internally"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf two objects are 'equal', they MUST report the same hashCode 🔑 — break this and HashMap/HashSet behave weirdly."
  },
  {
    question: "🧠 75. What does the 'synchronized' keyword do?",
    options: [
      "A. Speeds up threads",
      "B. Allows only one thread to access a block at a time",
      "C. Makes variables final",
      "D. Prevents object creation"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nsynchronized = 'one person in the bathroom at a time' 🚪🔒 — other threads wait their turn."
  },
  {
    question: "🧠 76. Output?\nint x = 5;\nString result = (x > 3) ? \"big\" : \"small\";\nSystem.out.println(result);",
    options: [
      "A. big",
      "B. small",
      "C. true",
      "D. Compile error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nTernary operator = a one-line if-else 🎯. 5 > 3 is true → 'big'."
  },
  {
    question: "🧠 77. Can you have a method with variable number of arguments?",
    options: [
      "A. No",
      "B. Yes, using varargs (...)",
      "C. Only with arrays",
      "D. Only in interfaces"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nvoid greet(String... names) — varargs let you pass 0, 1, or a bunch of arguments like a buffet 🍽️."
  },
  {
    question: "🧠 78. What is a nested static class also called?",
    options: [
      "A. Inner class",
      "B. Static nested class",
      "C. Anonymous class",
      "D. Local class"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nA static nested class doesn't need an outer object to exist — it's independent, unlike a true inner class."
  },
  {
    question: "🧠 79. Output?\nfor (int i = 0; i < 3; i++) {\n  if (i == 1) continue;\n  System.out.print(i);\n}",
    options: [
      "A. 012",
      "B. 02",
      "C. 01",
      "D. 0"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ncontinue skips the rest of that iteration only ⏭️ — i=1 gets skipped, loop keeps going → 0, then 2."
  },
  {
    question: "🧠 80. What is a labeled break used for?",
    options: [
      "A. Breaking only the innermost loop",
      "B. Breaking out of a specific outer loop",
      "C. Breaking a switch statement",
      "D. Breaking a method"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nlabeled break = 'exit the whole building, not just this room' 🏢 — jumps out of the named outer loop directly."
  },
  {
    question: "🧠 81. Which of these is NOT a functional interface?",
    options: [
      "A. Runnable",
      "B. Comparator",
      "C. Collection",
      "D. Callable"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nCollection has many abstract methods, not just one. Functional interfaces need exactly one abstract method for lambdas to work."
  },
  {
    question: "🧠 82. Output?\nInteger a = null;\nint b = a;",
    options: [
      "A. b = 0",
      "B. NullPointerException",
      "C. Compile error",
      "D. b = null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nUnboxing null into a primitive tries to call a.intValue() on nothing 💥 → NPE, a classic autoboxing trap."
  },
  {
    question: "🧠 83. What is the diamond problem, and how does Java avoid it with interfaces?",
    options: [
      "A. Java doesn't allow multiple interface inheritance",
      "B. Default methods force explicit override on conflict",
      "C. Java picks the first interface automatically",
      "D. Java doesn't have this problem"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf two interfaces give conflicting default methods, Java refuses to guess 🤷 — you must override it yourself to resolve the clash."
  },
  {
    question: "🧠 84. Which collection is best for LIFO operations?",
    options: [
      "A. Queue",
      "B. Stack / Deque",
      "C. List",
      "D. Set"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nLIFO = Last In First Out, like a stack of plates 🍽️ — Stack or ArrayDeque handle this cleanly."
  },
  {
    question: "🧠 85. Output?\nSystem.out.println(Integer.parseInt(\"10\") + \"20\");",
    options: [
      "A. 1020",
      "B. 30",
      "C. Compile error",
      "D. NumberFormatException"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nparseInt(\"10\") gives int 10 first, then + \"20\" triggers String concatenation → \"1020\"."
  },
  {
    question: "🧠 86. What does the 'instanceof' operator check?",
    options: [
      "A. If two objects are equal",
      "B. If an object is an instance of a given type",
      "C. If a class is abstract",
      "D. If a variable is null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ninstanceof = 'are you actually a Dog, or just something pretending?' 🐕 — checks the real type at runtime."
  },
  {
    question: "🧠 87. Can a switch statement work with String in Java?",
    options: [
      "A. No, only int",
      "B. Yes, since Java 7",
      "C. Only with enums",
      "D. Only with char"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nJava 7 added String switch support — under the hood it uses hashCode() + equals() to match."
  },
  {
    question: "🧠 88. What happens to a thread when you call sleep()?",
    options: [
      "A. It dies permanently",
      "B. It pauses execution for a given time",
      "C. It releases all locks",
      "D. It starts a new thread"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nsleep() = 'taking a nap' 😴 for a set duration, but it does NOT release any locks it's holding."
  },
  {
    question: "🧠 89. What is the difference between ArrayList and LinkedList for insertion?",
    options: [
      "A. Both are equally fast everywhere",
      "B. ArrayList is faster for insert at start, LinkedList for random access",
      "C. LinkedList is faster for insert/delete at start, ArrayList for random access",
      "D. Neither supports insertion"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nLinkedList = chain of boxes 🔗, easy to snip and insert at the ends. ArrayList = numbered shelf 📚, instant lookup by index but costly shifting on insert."
  },
  {
    question: "🧠 90. FINAL DONKEY SUMMARY PART 3 🫏",
    options: [
      "Generics give compile-time type safety",
      "equals() and hashCode() must stay consistent",
      "Unboxing null throws NPE",
      "String switch works since Java 7",
      "LinkedList is better for insert/delete at ends",
      "synchronized allows one thread at a time",
      "Functional interfaces have exactly one abstract method",
      "sleep() pauses but doesn't release locks"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Unboxing null throws NullPointerException"
  },
  {
    question: "🧠 91. What does list.add(index, element) throw if index is out of range?",
    options: [
      "A. ArrayIndexOutOfBoundsException",
      "B. IndexOutOfBoundsException",
      "C. NullPointerException",
      "D. No exception"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nArrayList throws IndexOutOfBoundsException (not the raw array version) when index < 0 or index > size()."
  },
  {
    question: "🧠 92. Time complexity of ArrayList.get(index)?",
    options: [
      "A. O(1)",
      "B. O(n)",
      "C. O(log n)",
      "D. O(n log n)"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nArrayList is backed by an array 📐 — direct index access is instant, O(1)."
  },
  {
    question: "🧠 93. Amortized time complexity of ArrayList.add(element) at the end?",
    options: [
      "A. O(n)",
      "B. O(1) amortized",
      "C. O(log n)",
      "D. O(n²)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nMost adds are instant, occasional resizing costs O(n) — averaged out (amortized) it's O(1)."
  },
  {
    question: "🧠 94. Time complexity of list.add(0, element) — inserting at the front?",
    options: [
      "A. O(1)",
      "B. O(log n)",
      "C. O(n)",
      "D. O(n²)"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nEvery existing element must shift right by one 🚚 to make room → O(n)."
  },
  {
    question: "🧠 95. Time complexity of ArrayList.remove(index) in the middle?",
    options: [
      "A. O(1)",
      "B. O(n)",
      "C. O(log n)",
      "D. O(1) amortized"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nRemoving shifts every element after it one step left 👈 to close the gap → O(n)."
  },
  {
    question: "🧠 96. What does ArrayList.contains(element) rely on internally?",
    options: [
      "A. hashCode() only",
      "B. equals()",
      "C. compareTo()",
      "D. == operator"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ncontains() walks the list and calls equals() on each element 🔍 — no hashing involved, so it's O(n)."
  },
  {
    question: "🧠 97. Output?\nList<Integer> list = new ArrayList<>(List.of(5, 10, 15));\nSystem.out.println(list.indexOf(20));",
    options: [
      "A. 0",
      "B. -1",
      "C. NoSuchElementException",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nindexOf() returns -1 when the element isn't found 🙅 — the classic 'not here' signal."
  },
  {
    question: "🧠 98. Difference between list.remove(1) and list.remove(Integer.valueOf(1)) on List<Integer>?",
    options: [
      "A. Both remove by value",
      "B. Both remove by index",
      "C. First removes by index, second removes by value",
      "D. Compile error"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nremove(int) is treated as the index overload; remove(Object) — triggered by boxing with valueOf() — removes the matching value 🪤."
  },
  {
    question: "🧠 99. What happens internally when an ArrayList exceeds its current capacity?",
    options: [
      "A. Throws OutOfMemoryError immediately",
      "B. A new larger array is allocated and elements are copied",
      "C. Old elements are dropped",
      "D. It stays the same size and overwrites"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nJava grows the backing array (typically ~1.5x) and copies everything over 📦➡️📦 — invisible to you, but not free."
  },
  {
    question: "🧠 100. Which method converts an ArrayList into a plain array?",
    options: [
      "A. asArray()",
      "B. toArray()",
      "C. convert()",
      "D. getArray()"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ntoArray() hands you a snapshot array copy 📸 — modifying it later won't affect the original list."
  },
  {
    question: "🧠 101. What exception is thrown if you modify a List.of() immutable list?",
    options: [
      "A. IllegalStateException",
      "B. UnsupportedOperationException",
      "C. ConcurrentModificationException",
      "D. No exception"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nList.of() (Java 9+) is truly immutable 🔒 — any add/remove/set call throws UnsupportedOperationException."
  },
  {
    question: "🧠 102. Output?\nList<Integer> list = new ArrayList<>(List.of(1,2,3));\nfor (Integer i : list) {\n  if (i == 2) list.remove(i);\n}",
    options: [
      "A. [1, 3]",
      "B. ConcurrentModificationException",
      "C. [1, 2, 3]",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nModifying a list mid for-each (which uses an Iterator internally) trips the fail-fast check 🚨 → ConcurrentModificationException."
  },
  {
    question: "🧠 103. Safe way to remove elements from a list while iterating?",
    options: [
      "A. Use a normal for-each loop",
      "B. Use Iterator.remove() or removeIf()",
      "C. Use list.remove() inside for-each",
      "D. There is no safe way"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIterator.remove() tells the iterator itself to adjust ✋ — no ConcurrentModificationException. removeIf() (Java 8+) does this cleanly too."
  },
  {
    question: "🧠 104. What does list.subList(1, 3) return?",
    options: [
      "A. A new independent list",
      "B. A view backed by the original list",
      "C. An array",
      "D. A copy sorted list"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nsubList() is a live window 🪟 into the original list — changes to one reflect in the other."
  },
  {
    question: "🧠 105. What does list.clear() do to the internal array capacity?",
    options: [
      "A. Shrinks capacity to 0",
      "B. Capacity stays the same, only size resets to 0",
      "C. Capacity doubles",
      "D. Throws exception"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nclear() just nulls out references and sets size to 0 🧹 — the backing array's capacity is untouched (use trimToSize() to shrink it)."
  },
  {
    question: "🧠 106. Which is generally faster for frequent random access — ArrayList or LinkedList?",
    options: [
      "A. LinkedList",
      "B. ArrayList",
      "C. Both equal",
      "D. Depends on JVM version"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nArrayList jumps straight to the index 🎯. LinkedList must walk node by node from the start (or end) → O(n)."
  },
  {
    question: "🧠 107. StringBuilder append(int num) — what does it do?",
    options: [
      "A. Throws compile error since int isn't a String",
      "B. Converts the int to its String form and appends it",
      "C. Appends the raw byte value",
      "D. Only works with Integer, not int"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nStringBuilder has overloaded append() methods for every primitive type 🔄 — it auto-converts to String for you."
  },
  {
    question: "🧠 108. What is the default capacity of a no-arg StringBuilder?",
    options: [
      "A. 10",
      "B. 16",
      "C. 0",
      "D. 32"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nnew StringBuilder() starts with room for 16 characters before it needs to grow."
  },
  {
    question: "🧠 109. Initial capacity of new StringBuilder(\"hello\")?",
    options: [
      "A. 16",
      "B. 5",
      "C. str.length() + 16 = 21",
      "D. 0"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nWhen built from a String, capacity = string's length + 16 buffer room 🧵 for future appends."
  },
  {
    question: "🧠 110. Output?\nStringBuilder sb = new StringBuilder(\"Hello\");\nsb.insert(5, \" World\");\nSystem.out.println(sb);",
    options: [
      "A. Hello World",
      "B. World Hello",
      "C. HelloWorld",
      "D. Compile error"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\ninsert(index, str) squeezes the text in at that exact position ✏️ → 'Hello World'."
  },
  {
    question: "🧠 111. Output?\nStringBuilder sb = new StringBuilder(\"Hello\");\nsb.deleteCharAt(0);\nSystem.out.println(sb);",
    options: [
      "A. Hello",
      "B. ello",
      "C. Hell",
      "D. IndexOutOfBoundsException"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ndeleteCharAt(0) snips out just the 'H' ✂️ → remaining is 'ello'."
  },
  {
    question: "🧠 112. Output?\nStringBuilder sb = new StringBuilder(\"HelloWorld\");\nsb.delete(5, 10);\nSystem.out.println(sb);",
    options: [
      "A. Hello",
      "B. World",
      "C. HelloWorld",
      "D. IndexOutOfBoundsException"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\ndelete(start, end) removes chars from index 5 (inclusive) to 10 (exclusive) ✂️ → 'World' is gone, leaving 'Hello'."
  },
  {
    question: "🧠 113. Output?\nStringBuilder sb = new StringBuilder(\"Hello\");\nsb.replace(0, 1, \"J\");\nSystem.out.println(sb);",
    options: [
      "A. Jello",
      "B. JHello",
      "C. ello",
      "D. Hello"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nreplace(start, end, str) swaps out that range for new text 🔄 — 'H' becomes 'J' → 'Jello'."
  },
  {
    question: "🧠 114. What does sb.setCharAt(index, ch) do if the StringBuilder is empty?",
    options: [
      "A. Silently does nothing",
      "B. Appends the character",
      "C. Throws StringIndexOutOfBoundsException",
      "D. Returns null"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nsetCharAt() requires an existing valid index to overwrite 🎯 — on an empty builder there's nothing there, so it throws."
  },
  {
    question: "🧠 115. Difference between sb.length() and sb.capacity()?",
    options: [
      "A. They're always equal",
      "B. length() is characters used, capacity() is total buffer size",
      "C. capacity() is characters used, length() is buffer size",
      "D. length() only works after toString()"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nThink of capacity() as the size of the container 🪣 and length() as how much water is actually in it."
  },
  {
    question: "🧠 116. What does sb.toString() return, and is it linked to the original StringBuilder afterward?",
    options: [
      "A. A String, and it stays linked (mutations of sb affect it)",
      "B. A new independent immutable String",
      "C. A reference to the same char array",
      "D. null"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ntoString() bakes a fresh, standalone immutable String 🍞 — further sb changes won't touch it."
  },
  {
    question: "🧠 117. Which technique commonly uses StringBuilder in DSA for checking a palindrome?",
    options: [
      "A. Sorting the characters",
      "B. Reversing with reverse() and comparing to original",
      "C. Using a HashMap",
      "D. Using recursion only"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nnew StringBuilder(s).reverse().toString().equals(s) is the classic one-liner palindrome check 🪞."
  },
  {
    question: "🧠 118. Output?\nStringBuilder sb = new StringBuilder(\"banana\");\nSystem.out.println(sb.indexOf(\"na\"));",
    options: [
      "A. 1",
      "B. 2",
      "C. 3",
      "D. -1"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n'banana' → b-a-n-a-n-a, the first 'na' starts at index 2 🔍."
  },
  {
    question: "🧠 119. What's the main reason to use StringBuilder instead of String concatenation (+=) inside a loop?",
    options: [
      "A. StringBuilder is thread-safe",
      "B. Avoids creating many throwaway intermediate String objects, improving performance",
      "C. String += doesn't compile in loops",
      "D. StringBuilder uses less syntax"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nEach += on a String silently creates a brand-new object 🗑️. In a loop that's wasteful — StringBuilder mutates one buffer instead."
  },
  {
    question: "🧠 120. sb.reverse() — does it mutate the original StringBuilder or return a new one?",
    options: [
      "A. Returns a new StringBuilder, original unchanged",
      "B. Mutates the original object in place",
      "C. Returns a String",
      "D. Throws UnsupportedOperationException"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nreverse() flips the internal char array directly 🔃 — it also returns 'this' for chaining, but the same object is mutated."
  },
  {
    question: "🧠 121. What does HashSet.add(element) return?",
    options: [
      "A. void always",
      "B. boolean — true if added, false if it was already present",
      "C. The element itself",
      "D. The new size of the set"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nadd() reports whether the insert actually happened 📋 — false means a duplicate was silently rejected."
  },
  {
    question: "🧠 122. What data structure backs a HashSet internally?",
    options: [
      "A. ArrayList",
      "B. A HashMap (elements stored as keys)",
      "C. LinkedList",
      "D. TreeMap"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nHashSet is basically a thin wrapper around a HashMap 🎁 — every element becomes a key mapped to a dummy constant value."
  },
  {
    question: "🧠 123. Does HashSet allow null elements?",
    options: [
      "A. No, never",
      "B. Yes, exactly one null element",
      "C. Yes, unlimited nulls",
      "D. Only if using LinkedHashSet"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nSince it's backed by a HashMap, and HashMap allows one null key, HashSet allows exactly one null element."
  },
  {
    question: "🧠 124. What two methods does HashSet.contains() rely on to find a match?",
    options: [
      "A. compareTo() and toString()",
      "B. hashCode() and equals()",
      "C. equals() only",
      "D. hashCode() only"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nhashCode() narrows down the right bucket fast ⚡, then equals() confirms the exact match within that bucket."
  },
  {
    question: "🧠 125. Average time complexity of HashSet add/remove/contains?",
    options: [
      "A. O(n)",
      "B. O(log n)",
      "C. O(1)",
      "D. O(n log n)"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nWith a good hash function and few collisions, these operations jump straight to the right bucket → average O(1)."
  },
  {
    question: "🧠 126. Worst-case time complexity of HashSet operations (heavy hash collisions)?",
    options: [
      "A. O(1)",
      "B. O(log n)",
      "C. O(n) (or O(log n) with Java 8+ treeified buckets)",
      "D. O(n²) always"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nIf everything collides into one bucket, it degrades to a linked-list scan O(n) — though Java 8+ treeifies large buckets, capping worst case at O(log n)."
  },
  {
    question: "🧠 127. Which Set implementation preserves insertion order?",
    options: [
      "A. HashSet",
      "B. TreeSet",
      "C. LinkedHashSet",
      "D. None of them"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nLinkedHashSet = HashSet's speed 🏎️ + a linked list threading through it to remember insertion order."
  },
  {
    question: "🧠 128. In DSA, HashSet is most commonly used for which task?",
    options: [
      "A. Sorting elements",
      "B. Fast duplicate detection / existence checks",
      "C. Maintaining a priority queue",
      "D. Storing key-value pairs"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n'Have I seen this before?' → HashSet.contains() in O(1) is the go-to pattern for duplicate detection 🕵️."
  },
  {
    question: "🧠 129. Which HashSet operation computes the intersection of two sets?",
    options: [
      "A. addAll()",
      "B. retainAll()",
      "C. removeAll()",
      "D. containsAll()"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nretainAll(otherSet) keeps only the elements present in BOTH sets 🤝 — that's exactly set intersection."
  },
  {
    question: "🧠 130. Which HashSet operation computes the union of two sets?",
    options: [
      "A. addAll()",
      "B. retainAll()",
      "C. removeAll()",
      "D. clear()"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\naddAll(otherSet) merges every element from both sets together ➕ (duplicates auto-collapse) → union."
  },
  {
    question: "🧠 131. Which HashSet operation computes set difference (A - B)?",
    options: [
      "A. addAll()",
      "B. retainAll()",
      "C. removeAll()",
      "D. equals()"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nsetA.removeAll(setB) strips out anything setA and setB have in common 🚫, leaving only what's unique to A."
  },
  {
    question: "🧠 132. What's the default initial capacity of a HashMap?",
    options: [
      "A. 10",
      "B. 16",
      "C. 32",
      "D. 0"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nHashMap starts with 16 buckets by default — a power of 2, which helps with efficient index calculation."
  },
  {
    question: "🧠 133. What's the default load factor of a HashMap?",
    options: [
      "A. 0.5",
      "B. 0.75",
      "C. 1.0",
      "D. 0.9"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n0.75 balances space vs speed ⚖️ — once 75% full, the map resizes to avoid excessive collisions."
  },
  {
    question: "🧠 134. When does a HashMap trigger a resize (rehash)?",
    options: [
      "A. Every time put() is called",
      "B. When size exceeds capacity × loadFactor",
      "C. Only when explicitly called",
      "D. Never, capacity is fixed"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nOnce entries cross the threshold (capacity × 0.75) 📈, the map doubles its bucket array and redistributes everything."
  },
  {
    question: "🧠 135. What does map.put(key, value) return if the key already existed?",
    options: [
      "A. null",
      "B. The new value",
      "C. The previous value associated with that key",
      "D. true"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nput() hands you back whatever was there before it got overwritten 🔄 — or null if the key was new."
  },
  {
    question: "🧠 136. What does map.get(key) return if the key isn't present?",
    options: [
      "A. Throws NoSuchElementException",
      "B. null",
      "C. Empty string",
      "D. 0"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nMissing key → get() politely hands you null 🤷 instead of crashing (use getOrDefault() to avoid null checks)."
  },
  {
    question: "🧠 137. What does map.getOrDefault(key, defaultVal) do?",
    options: [
      "A. Always inserts defaultVal if key missing",
      "B. Returns the value if key exists, else returns defaultVal without inserting",
      "C. Throws exception if key missing",
      "D. Removes the key if missing"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIt's a safe read 👀 — gives you a fallback value on a miss, but never modifies the map itself."
  },
  {
    question: "🧠 138. What does map.putIfAbsent(key, value) do if the key already has a non-null value?",
    options: [
      "A. Overwrites it anyway",
      "B. Does nothing, keeps the existing value",
      "C. Throws an exception",
      "D. Deletes the key"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nputIfAbsent() only fills in a value when the spot is genuinely empty 🈳 — existing values are left untouched."
  },
  {
    question: "🧠 139. Which HashMap method is the classic one-liner for frequency counting?\nmap.merge(word, 1, Integer::sum);",
    options: [
      "A. put()",
      "B. merge()",
      "C. remove()",
      "D. containsKey()"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nmerge() inserts 1 if the key is new, or applies the combining function (sum) to bump the existing count 🔢 — perfect for frequency maps."
  },
  {
    question: "🧠 140. What does map.computeIfAbsent(key, k -> new ArrayList<>()) do?",
    options: [
      "A. Always creates a new list, overwriting any existing one",
      "B. Creates and inserts a value only if the key is missing, then returns it",
      "C. Removes the key if present",
      "D. Throws exception if key exists"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nCommon in DSA for grouping (e.g. adjacency lists, anagram groups) — lazily initializes a value only when needed 🏗️, then hands it back for you to use."
  },
  {
    question: "🧠 141. map.keySet() returns what kind of collection?",
    options: [
      "A. An independent copy of keys",
      "B. A live view backed by the map",
      "C. A sorted array",
      "D. A List<String> always"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nkeySet() is a window into the map itself 🪟 — removing a key from that Set actually removes the entry from the map."
  },
  {
    question: "🧠 142. Which is the most efficient way to iterate both keys and values of a HashMap together?",
    options: [
      "A. Loop over keySet() and call get() each time",
      "B. Loop over entrySet()",
      "C. Loop over values() then find keys separately",
      "D. Convert to ArrayList first"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nentrySet() hands you key AND value together in one Map.Entry 📦 per step — avoids a redundant get() lookup for every key."
  },
  {
    question: "🧠 143. Can map.values() contain duplicate entries?",
    options: [
      "A. No, values must be unique",
      "B. Yes, values can repeat even though keys can't",
      "C. Only in TreeMap",
      "D. Only if using LinkedHashMap"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nOnly keys are guaranteed unique 🔑 — multiple different keys can happily map to the exact same value."
  },
  {
    question: "🧠 144. Which Map implementation throws NullPointerException if you try to insert a null key?",
    options: [
      "A. HashMap",
      "B. LinkedHashMap",
      "C. TreeMap",
      "D. All of them"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nTreeMap needs to compare keys to keep them sorted 📊 — comparing against null has no meaning, so it throws NPE. HashMap/LinkedHashMap allow one null key."
  },
  {
    question: "🧠 145. Which Map implementation guarantees keys in sorted order during iteration?",
    options: [
      "A. HashMap",
      "B. LinkedHashMap",
      "C. TreeMap",
      "D. IdentityHashMap"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nTreeMap is backed by a Red-Black tree 🌳 — iterating always walks keys in natural (or comparator-defined) sorted order."
  },
  {
    question: "🧠 146. What is the classic DSA use case for LinkedHashMap over HashMap?",
    options: [
      "A. Faster lookups",
      "B. Implementing an LRU cache (access/insertion order tracking)",
      "C. Sorting keys automatically",
      "D. Allowing duplicate keys"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nLinkedHashMap can be set to track access order 🕰️, making it the standard building block for LRU cache implementations."
  },
  {
    question: "🧠 147. What happens when two different keys produce the same hashCode() (a collision) in HashMap?",
    options: [
      "A. The second key silently overwrites the first",
      "B. Both are stored in the same bucket as a linked list (or tree)",
      "C. An exception is thrown",
      "D. The map refuses the second insert"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nCollisions are expected 🎲 — HashMap chains entries in the same bucket and uses equals() to tell them apart when searching."
  },
  {
    question: "🧠 148. Since Java 8, what happens to a HashMap bucket when it accumulates too many colliding entries (default threshold 8)?",
    options: [
      "A. Nothing changes, stays a linked list",
      "B. It converts to a Red-Black tree for that bucket",
      "C. The map throws an exception",
      "D. The whole map converts to a TreeMap"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\n'Treeification' 🌲 caps worst-case lookup in a bad bucket at O(log n) instead of a slow O(n) linked-list scan."
  },
  {
    question: "🧠 149. Why must you override hashCode() whenever you override equals() for a custom key class?",
    options: [
      "A. It's just a style convention, not required",
      "B. Equal objects must produce equal hashCodes, or HashMap/HashSet will misbehave",
      "C. hashCode() is called automatically by equals()",
      "D. Java won't compile without both"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nBreak this contract and two 'equal' objects can land in different buckets 🪣🪣 — the map won't recognize them as the same key, causing weird duplicate bugs."
  },
  {
    question: "🧠 150. Classic DSA problem: Two Sum. What's the time complexity using a HashMap approach vs brute force?",
    options: [
      "A. HashMap: O(n²), Brute force: O(n)",
      "B. HashMap: O(n), Brute force: O(n²)",
      "C. Both O(n log n)",
      "D. Both O(n)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nStoring seen numbers in a HashMap lets you check 'target - num' in O(1) per element 🎯 → one pass, O(n) total, versus O(n²) nested loops."
  },
  {
    question: "🧠 151. Classic DSA problem: Find duplicates in an array. Best approach using Sets, and its time complexity?",
    options: [
      "A. Sort first, O(n log n)",
      "B. Use a HashSet, add each element, check add()'s boolean return — O(n)",
      "C. Nested loop comparison — O(n²)",
      "D. Use TreeSet — O(n log n)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf set.add(x) returns false, you've already seen x before 🚨 — single pass, O(n) time, O(n) space."
  },
  {
    question: "🧠 152. Classic DSA problem: Group Anagrams. Which data structure combo is typically used?",
    options: [
      "A. TreeSet<String>",
      "B. HashMap<String, List<String>> keyed by sorted characters",
      "C. ArrayList<ArrayList<String>> with brute-force comparison",
      "D. PriorityQueue<String>"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nSort each word's letters to get a canonical key (e.g. 'eat' → 'aet') 🔑, then group original words under that key in a HashMap."
  },
  {
    question: "🧠 153. What's a common way to count character frequency in a string for DSA problems?",
    options: [
      "A. Sort the string first, always",
      "B. HashMap<Character, Integer> (or a fixed-size int array for ASCII/lowercase letters)",
      "C. Convert to ArrayList<Character> and use indexOf()",
      "D. Use recursion only"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nA HashMap<Character,Integer> works generally 🗺️; for lowercase-only strings, an int[26] array is even faster since hashing is skipped entirely."
  },
  {
    question: "🧠 154. What does Arrays.asList(array) return, and can you add/remove elements from it?",
    options: [
      "A. A regular resizable ArrayList — full add/remove support",
      "B. A fixed-size list backed by the array — add()/remove() throw UnsupportedOperationException",
      "C. An immutable empty list",
      "D. A HashSet"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nArrays.asList() is just a thin List wrapper over the original array 🎁 — its size is locked, so structural changes are rejected."
  },
  {
    question: "🧠 155. How do you properly convert an array into a fully resizable ArrayList?",
    options: [
      "A. Arrays.asList(array) directly",
      "B. new ArrayList<>(Arrays.asList(array))",
      "C. (ArrayList) array",
      "D. array.toList()"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nWrapping Arrays.asList() in a real ArrayList constructor copies the elements into a genuinely resizable list 📋."
  },
  {
    question: "🧠 156. What is the time complexity of HashMap.size()?",
    options: [
      "A. O(n)",
      "B. O(log n)",
      "C. O(1)",
      "D. O(n log n)"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nHashMap keeps a running count internally 🔢 — size() just reads that stored value, no counting needed."
  },
  {
    question: "🧠 157. What does map.remove(key) return if the key doesn't exist?",
    options: [
      "A. Throws NoSuchElementException",
      "B. false",
      "C. null",
      "D. 0"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nJust like get(), a missing-key remove() quietly returns null 🤷 instead of the removed value."
  },
  {
    question: "🧠 158. Is the iteration order of a plain HashMap guaranteed to stay the same across multiple runs?",
    options: [
      "A. Yes, always insertion order",
      "B. Yes, always sorted order",
      "C. No — order is unspecified and can change, especially after resizing",
      "D. Yes, always reverse insertion order"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nHashMap makes zero ordering guarantees 🎲 — internal bucket layout (and thus iteration order) can shift after a resize/rehash."
  },
  {
    question: "🧠 159. What problem can arise in a HashSet if a custom object's equals()/hashCode() contract is broken?",
    options: [
      "A. The set will refuse to compile",
      "B. 'Duplicate' objects (by equals()) might both get added since their hashCodes differ",
      "C. The set becomes automatically sorted",
      "D. No problem, HashSet ignores equals()"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf equals() says two objects are the same but hashCode() disagrees, they can land in different buckets 🪣🪣 — the set won't catch the 'duplicate' at all."
  },
  {
    question: "🧠 160. In the classic 'Sliding Window' technique for substring problems, which structure is commonly paired with it to track character counts?",
    options: [
      "A. TreeSet",
      "B. HashMap (or fixed-size array) for frequency counting",
      "C. Stack",
      "D. PriorityQueue"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nAs the window slides, a HashMap tracks how many of each character are currently inside 🪟 — O(1) updates as you expand/shrink the window."
  },
  {
    question: "🧠 161. What does list.ensureCapacity(n) do to an ArrayList?",
    options: [
      "A. Limits the list to n elements",
      "B. Pre-allocates internal array space for at least n elements, avoiding repeated resizing",
      "C. Sorts the list",
      "D. Removes elements beyond index n"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nIf you know you'll add ~10,000 elements, calling ensureCapacity(10000) upfront 📦 avoids many incremental resize-and-copy operations."
  },
  {
    question: "🧠 162. What does list.trimToSize() do?",
    options: [
      "A. Increases capacity for future growth",
      "B. Shrinks the internal array's capacity down to match the current size",
      "C. Removes duplicate elements",
      "D. Sorts and trims null values"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ntrimToSize() reclaims wasted memory 🧹 by shrinking the backing array to exactly fit the elements actually stored."
  },
  {
    question: "🧠 163. Output?\nList<Integer> a = new ArrayList<>(List.of(1,2,3));\nList<Integer> b = new ArrayList<>(List.of(2,3,4));\na.retainAll(b);\nSystem.out.println(a);",
    options: [
      "A. [1, 2, 3]",
      "B. [2, 3]",
      "C. [1, 4]",
      "D. []"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nretainAll() keeps only the common elements 🤝 — 2 and 3 exist in both lists, so [1] gets dropped → [2, 3]."
  },
  {
    question: "🧠 164. What does list.removeIf(x -> x % 2 == 0) do?",
    options: [
      "A. Removes odd numbers",
      "B. Removes even numbers using a lambda condition",
      "C. Throws compile error",
      "D. Sorts the list first"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nremoveIf() (Java 8+) safely strips out every element matching the predicate 🧮 — no manual iterator needed."
  },
  {
    question: "🧠 165. Which sorting method modifies a List in place using natural ordering?",
    options: [
      "A. Arrays.sort(list)",
      "B. Collections.sort(list) or list.sort(null)",
      "C. list.toArray().sort()",
      "D. Stream.sorted() only"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nCollections.sort(list) (or the equivalent list.sort(null)) sorts the actual list in place 🔀 using Comparable's natural order."
  },
  {
    question: "🧠 166. What algorithm does Collections.binarySearch() require the list to satisfy first?",
    options: [
      "A. The list must contain no duplicates",
      "B. The list must already be sorted",
      "C. The list must be a LinkedList",
      "D. No precondition needed"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nBinary search only works correctly on sorted data 📊 — running it on an unsorted list gives undefined/wrong results."
  },
  {
    question: "🧠 167. Time complexity of Collections.binarySearch() on an ArrayList?",
    options: [
      "A. O(n)",
      "B. O(log n)",
      "C. O(1)",
      "D. O(n log n)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nEach comparison halves the search space ✂️ — classic O(log n), since ArrayList supports fast random access via get()."
  },
  {
    question: "🧠 168. Which StringBuilder method lets you extract a portion of the built string without converting the whole thing first?",
    options: [
      "A. subSequence() / substring()",
      "B. slice()",
      "C. cut()",
      "D. StringBuilder has no such method"
    ],
    correctAnswer: 0,
    explanation: "✅ Correct: A\n\n🫏 Explanation:\nsb.substring(start, end) returns just that piece as a String 🍰, without needing sb.toString() first."
  },
  {
    question: "🧠 169. Output?\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 3; i++) sb.append(i);\nSystem.out.println(sb);",
    options: [
      "A. 0 1 2",
      "B. 012",
      "C. [0, 1, 2]",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nEach append(int) just tacks the digit's string form onto the buffer with no separator 🧵 → '012'."
  },
  {
    question: "🧠 170. Why is StringBuilder generally preferred over StringBuffer in single-threaded DSA problem solving?",
    options: [
      "A. StringBuilder has more methods",
      "B. StringBuilder skips synchronization overhead, making it faster",
      "C. StringBuffer is deprecated",
      "D. StringBuilder is immutable"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nStringBuffer locks every method call for thread safety 🔒 — unnecessary overhead when you're just solving a problem on one thread."
  },
  {
    question: "🧠 171. Given a HashSet<Integer> set, what does set.retainAll(Collections.emptyList()) result in?",
    options: [
      "A. No change",
      "B. The set becomes empty",
      "C. Throws exception",
      "D. Doubles the set"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nretainAll() keeps only elements also found in the other collection 🤝 — since the other list is empty, nothing survives → set becomes empty."
  },
  {
    question: "🧠 172. What's the key difference between HashSet and TreeSet in terms of allowed element types?",
    options: [
      "A. No difference",
      "B. TreeSet requires elements to be Comparable (or a Comparator supplied)",
      "C. HashSet requires Comparable",
      "D. TreeSet allows any object, HashSet doesn't"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nTreeSet needs a way to order elements 📏 — without natural ordering (Comparable) or a Comparator, it throws ClassCastException on insert."
  },
  {
    question: "🧠 173. What is the time complexity of TreeSet's add/remove/contains operations?",
    options: [
      "A. O(1)",
      "B. O(log n)",
      "C. O(n)",
      "D. O(n log n)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nTreeSet is backed by a self-balancing Red-Black tree 🌳 — every operation is a tree traversal, giving O(log n)."
  },
  {
    question: "🧠 174. In a HashMap<String, Integer> word frequency counter, what does map.getOrDefault(word, 0) + 1 achieve when paired with put()?",
    options: [
      "A. Resets the count to 1 every time",
      "B. Safely increments the count without a null check or containsKey() call",
      "C. Throws NullPointerException on first occurrence",
      "D. Deletes the word"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nmap.put(word, map.getOrDefault(word, 0) + 1) is the classic manual frequency-counting idiom 🔢, cleaner than checking containsKey() first."
  },
  {
    question: "🧠 175. Which of these correctly checks if a HashMap contains a specific value (not key)?",
    options: [
      "A. map.contains(value)",
      "B. map.containsValue(value)",
      "C. map.hasValue(value)",
      "D. map.indexOf(value)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ncontainsValue() scans all values 🔍 — unlike containsKey() (O(1) via hashing), this is O(n) since values aren't hashed for lookup."
  },
  {
    question: "🧠 176. What is the time complexity of HashMap.containsKey()?",
    options: [
      "A. O(n)",
      "B. O(1) average",
      "C. O(log n) always",
      "D. O(n log n)"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nLike get(), containsKey() hashes the key straight to its bucket ⚡ — O(1) on average."
  },
  {
    question: "🧠 177. Classic DSA problem: detecting a cycle in a graph using DFS. Which structure tracks 'currently in recursion stack'?",
    options: [
      "A. ArrayList",
      "B. HashSet (visiting set)",
      "C. TreeMap",
      "D. StringBuilder"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nA HashSet tracking nodes currently 'on the stack' 🧗 gives O(1) checks — if you revisit a node still in that set, you've found a cycle."
  },
  {
    question: "🧠 178. Classic DSA problem: Longest Substring Without Repeating Characters. Which structure is typically used to track the last seen index of each character?",
    options: [
      "A. ArrayList<Character>",
      "B. HashMap<Character, Integer>",
      "C. TreeSet<Character>",
      "D. StringBuilder"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nStoring each character's last-seen index in a HashMap 🗺️ lets the sliding window jump forward instantly when a repeat is found."
  },
  {
    question: "🧠 179. What is the space complexity of using a HashSet to detect duplicates in an array of n elements?",
    options: [
      "A. O(1)",
      "B. O(log n)",
      "C. O(n)",
      "D. O(n²)"
    ],
    correctAnswer: 2,
    explanation: "✅ Correct: C\n\n🫏 Explanation:\nIn the worst case (no duplicates until the very end), the set may end up storing all n elements 📦 → O(n) space."
  },
  {
    question: "🧠 180. What does Collections.frequency(list, element) return?",
    options: [
      "A. The index of the first occurrence",
      "B. The number of times the element appears in the list",
      "C. A boolean",
      "D. Always -1 if not comparable"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nA handy built-in counter 🔢 that walks the list and tallies matches using equals() — O(n) time."
  },
  {
    question: "🧠 181. What does map.entrySet().iterator().remove() allow you to safely do?",
    options: [
      "A. Nothing special, same as map.remove()",
      "B. Remove entries from the map while iterating, without ConcurrentModificationException",
      "C. Sort the map",
      "D. Clear the entire map instantly"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nJust like list iterators, the entrySet's iterator has its own remove() 🧭 that safely deletes the current entry mid-loop."
  },
  {
    question: "🧠 182. What is the output?\nHashSet<Integer> set = new HashSet<>();\nset.add(1); set.add(1); set.add(2);\nSystem.out.println(set.size());",
    options: [
      "A. 3",
      "B. 2",
      "C. 1",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nThe second add(1) is silently rejected as a duplicate 🚫 — only unique elements {1, 2} remain → size 2."
  },
  {
    question: "🧠 183. What happens when you call map.compute(key, (k, v) -> v == null ? 1 : v + 1)?",
    options: [
      "A. Throws exception if key missing",
      "B. Computes a new value based on the current one (or null), and updates the map with the result",
      "C. Only works if key already exists",
      "D. Removes the key"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\ncompute() gives you the current value (or null) and lets you decide the new one 🧮 — another clean way to implement frequency counting."
  },
  {
    question: "🧠 184. In terms of memory, why might a HashMap<Integer, Integer> be less memory-efficient than a plain int[] array for dense integer keys 0..n?",
    options: [
      "A. HashMap is always more efficient",
      "B. HashMap has overhead per entry (boxing, hash buckets, object headers) vs a compact contiguous array",
      "C. Arrays can't store integers",
      "D. There's no difference"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nBoxing each int into an Integer object plus per-entry bucket/node overhead 📦📦📦 adds up — a plain array is far leaner when keys are small, dense integers."
  },
  {
    question: "🧠 185. What does list.toArray(new String[0]) do differently from list.toArray()?",
    options: [
      "A. Nothing, identical behavior",
      "B. Returns a correctly-typed String[] array instead of an Object[]",
      "C. Throws exception",
      "D. Sorts the array"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nPlain toArray() gives you an Object[] 📦 — passing a typed array template lets Java hand back a properly typed String[] instead."
  },
  {
    question: "🧠 186. Which is more efficient for repeatedly checking 'does this element exist' — an ArrayList or a HashSet?",
    options: [
      "A. ArrayList, O(1) always",
      "B. HashSet, O(1) average vs ArrayList's O(n)",
      "C. Both are equal",
      "D. Depends only on element type"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nArrayList.contains() must scan linearly 🚶 (O(n)); HashSet.contains() hashes straight to the bucket (O(1) average) — a common DSA optimization swap."
  },
  {
    question: "🧠 187. Classic pattern: converting a List<Integer> to a HashSet<Integer> to remove duplicates — what happens to element order?",
    options: [
      "A. Order is always preserved",
      "B. Order is not guaranteed with plain HashSet (use LinkedHashSet to preserve it)",
      "C. Elements get sorted",
      "D. Compile error"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nA plain HashSet reshuffles elements based on hash buckets 🎲 — wrap with LinkedHashSet instead if you need to keep the original order while deduplicating."
  },
  {
    question: "🧠 188. What's the risk of using a mutable object as a HashMap key after it's already inserted?",
    options: [
      "A. No risk, HashMap tracks mutations automatically",
      "B. If the key's hashCode changes after insertion, the entry can become unreachable ('lost')",
      "C. The map automatically re-sorts",
      "D. Java prevents mutable keys at compile time"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nHashMap places the entry based on the hashCode at insertion time 📍. Mutate the key afterward and its hashCode changes — future lookups go to the wrong bucket, effectively losing the entry."
  },
  {
    question: "🧠 189. What does StringBuilder.append(charArray, offset, len) let you do?",
    options: [
      "A. Append the whole array only",
      "B. Append only a specific portion of a char array, starting at offset for len characters",
      "C. Reverse the array before appending",
      "D. Throws UnsupportedOperationException"
    ],
    correctAnswer: 1,
    explanation: "✅ Correct: B\n\n🫏 Explanation:\nThis overload lets you selectively append a slice of a char[] ✂️ without first converting that slice into its own String."
  },
  {
    question: "🧠 190. FINAL DONKEY SUMMARY — ArrayList, StringBuilder, HashSet & HashMap 🫏",
    options: [
      "ArrayList.get() is O(1), add/remove in middle is O(n)",
      "StringBuilder is mutable and avoids extra object creation in loops",
      "HashSet is backed by a HashMap and offers O(1) average add/contains",
      "HashMap default capacity 16, load factor 0.75, resizes automatically"
    ],
    correctAnswer: 0,
    explanation: "✅ All of these are true — merge()/computeIfAbsent() power frequency counting and grouping, mutating a key's hashCode after insertion can 'lose' a HashMap entry, TreeSet/TreeMap give O(log n) sorted operations, and Two Sum / duplicate-detection are the textbook HashMap/HashSet DSA patterns. 🫏"
  }
];