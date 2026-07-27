import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/);

if (!urlMatch || !keyMatch) {
  console.error("Could not parse .env file");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim().replace(/['"']/g, '');
const supabaseKey = keyMatch[1].trim().replace(/['"']/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

const quizQuestions = [
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
  }
];

async function seed() {
  console.log(`Starting to seed ${quizQuestions.length} questions...`);

  // Clear existing quiz questions if any to prevent duplicates during re-runs
  const { error: deleteError } = await supabase
    .from('java_quiz_questions')
    .delete()
    .neq('id', 0);
  
  if (deleteError) {
    console.error("Error clearing existing questions:", deleteError);
  }

  // Format objects for insert
  const insertData = quizQuestions.map(q => ({
    question: q.question,
    options: JSON.stringify(q.options),
    correct_answer: q.correctAnswer,
    explanation: q.explanation
  }));

  // Supabase bulk insert
  const { data, error } = await supabase
    .from('java_quiz_questions')
    .insert(insertData)
    .select();

  if (error) {
    console.error("Error inserting questions:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} questions!`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Unhandled error during seeding:", err);
  process.exit(1);
});
