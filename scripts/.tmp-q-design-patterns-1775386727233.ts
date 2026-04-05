import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "Explain the Singleton pattern. When would you use it vs when would you avoid it?",
    answer: "Singleton ensures a class has only one instance with global access. Use it for shared config, logging, or DB connections. Avoid it for testable code, distributed systems, or when you need multiple independent instances.",
    explanation: `## What is the Singleton Pattern?

The Singleton pattern restricts a class to instantiation exactly once, providing a single global point of access to that instance. It follows the creational design patterns category.

## Implementation Approaches

\`\`\`typescript
// Lazy initialization (thread-unsafe)
class Database {
  private static instance: Database;
  
  private constructor() {}
  
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// Thread-safe with double-checked locking
class DatabaseSafe {
  private static instance: DatabaseSafe;
  private static readonly lock = new Object();
  
  private constructor() {}
  
  static getInstance(): DatabaseSafe {
    if (!DatabaseSafe.instance) {
      synchronized (DatabaseSafe.lock) {
        if (!DatabaseSafe.instance) {
          DatabaseSafe.instance = new DatabaseSafe();
        }
      }
    }
    return DatabaseSafe.instance;
  }
}
\`\`\`

## When to Use Singleton

- **Configuration managers**: One config object shared across the app
- **Logging services**: Single logger writing to one destination
- **Database connections**: Connection pooling with single instance

## When to Avoid Singleton

- **Testing becomes difficult**: Global state complicates unit tests
- **Tight coupling**: Creates implicit dependencies throughout the codebase
- **Concurrency issues**: In multi-threaded environments without proper locking
- **Memory leaks**: Singleton persists for entire application lifecycle

## Modern Alternatives

Consider using dependency injection instead, which makes testing easier and dependencies more explicit.`,
    eli5: "Singleton is like having one remote control for your TV - no matter where you are in the room, you use the same remote to change channels.",
    difficulty: "beginner",
    tags: JSON.stringify(["design-patterns", "creational", "singleton", "fundamentals"]),
    channel: "design-patterns",
    subChannel: "creational",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "How does the Adapter pattern enable incompatible interfaces to work together? Provide a TypeScript example.",
    answer: "The Adapter wraps an existing class to expose a different interface that clients expect. It acts as a bridge between incompatible types without modifying their source code.",
    explanation: `## The Adapter Pattern Explained

The Adapter pattern is a structural design pattern that allows objects with incompatible interfaces to collaborate. It's particularly useful when integrating legacy code or third-party libraries.

## Real-World Scenario

Imagine your app expects a \`PaymentProcessor\` interface, but you need to integrate a third-party \`StripeGateway\` with a different method signature.

\`\`\`typescript
// Existing interface your app uses
interface PaymentProcessor {
  charge(amount: number, currency: string): Promise<void>;
}

// Third-party library with different interface
class StripeGateway {
  processPayment(amountInCents: number, countryCode: string): void {
    console.log(\`Processing $\${amountInCents/100} in \${countryCode}\`);
  }
}

// Adapter to bridge the gap
class StripeAdapter implements PaymentProcessor {
  private stripe: StripeGateway;
  
  constructor(stripe: StripeGateway) {
    this.stripe = stripe;
  }
  
  async charge(amount: number, currency: string): Promise<void> {
    const amountInCents = Math.round(amount * 100);
    const countryMap: Record<string, string> = {
      'USD': 'US', 'EUR': 'DE', 'GBP': 'GB'
    };
    const countryCode = countryMap[currency] || 'US';
    this.stripe.processPayment(amountInCents, countryCode);
  }
}

// Usage
const stripe = new StripeGateway();
const adapter = new StripeAdapter(stripe);
adapter.charge(29.99, 'USD'); // Works with our interface!
\`\`\`

## Two Types of Adapters

1. **Object Adapter**: Uses composition (shown above)
2. **Class Adapter**: Uses inheritance (requires multiple inheritance in languages that support it)

## When to Use

- Integrating third-party libraries with different APIs
- Working with legacy systems that can't be modified
- Creating reusable components that need to work with multiple interfaces`,
    eli5: "An adapter is like a plug converter - your American laptop works in European outlets because the adapter changes the shape of the plug.",
    difficulty: "intermediate",
    tags: JSON.stringify(["design-patterns", "structural", "adapter", "interfaces"]),
    channel: "design-patterns",
    subChannel: "structural",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Describe the Observer pattern and explain how it differs from the Pub/Sub pattern in message brokers.",
    answer: "Observer is a direct pattern where subjects notify observers directly. Pub/Sub adds a message broker layer, decoupling publishers from subscribers entirely - they never know about each other.",
    explanation: `## The Observer Pattern

The Observer pattern defines a one-to-many dependency where changes to the subject automatically notify all observers. It's fundamental to event-driven programming.

## Classic Observer Implementation

\`\`\`typescript
interface Observer {
  update(data: any): void;
}

interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

class StockExchange implements Subject {
  private observers: Observer[] = [];
  private price: number = 0;
  
  setPrice(price: number): void {
    this.price = price;
    this.notify();
  }
  
  attach(observer: Observer): void {
    this.observers.push(observer);
  }
  
  detach(observer: Observer): void {
    this.observers = this.observers.filter(o => o !== observer);
  }
  
  notify(): void {
    this.observers.forEach(o => o.update({ price: this.price }));
  }
}

class TradingApp implements Observer {
  update(data: any): void {
    console.log(\`TradingApp: Stock now at $\${data.price}\`);
  }
}

class NewsFeed implements Observer {
  update(data: any): void {
    console.log(\`NewsFeed: Breaking - Stock traded at $\${data.price}\`);
  }
}
\`\`\`

## Observer vs Pub/Sub

| Aspect | Observer | Pub/Sub |
|--------|----------|---------|
| Coupling | Subject knows about observers | Publishers and subscribers don't know each other |
| Communication | Direct (push/pull) | Via message broker |
| Scalability | Limited by direct references | Highly scalable, distributed |
| Use Case | In-memory events | Distributed systems, microservices |

\`\`\`typescript
// Pub/Sub with a broker
class MessageBroker {
  private channels: Map<string, Function[]> = new Map();
  
  subscribe(channel: string, callback: Function): void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, []);
    }
    this.channels.get(channel)!.push(callback);
  }
  
  publish(channel: string, message: any): void {
    this.channels.get(channel)?.forEach(cb => cb(message));
  }
}
\`\`\`

Pub/Sub is used in Kafka, RabbitMQ, Redis Pub/Sub, and browser events.`,
    eli5: "Observer is like a teacher calling on raised hands directly. Pub/Sub is like students mailing their questions to a principal who distributes answers - teachers and students never meet.",
    difficulty: "intermediate",
    tags: JSON.stringify(["design-patterns", "behavioral", "observer", "events"]),
    channel: "design-patterns",
    subChannel: "behavioral",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "What problem does the Strategy pattern solve and when would you prefer it over if-else chains?",
    answer: "Strategy lets you define a family of algorithms, encapsulate each one, and make them interchangeable. Use it when you have multiple ways to accomplish the same task and want to select the algorithm at runtime.",
    explanation: `## The Strategy Pattern

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

## The Problem with If-Else

\`\`\`typescript
// Anti-pattern: Growing if-else chain
function calculateShipping(order: Order): number {
  if (order.country === 'US') {
    if (order.weight < 1) return 5;
    if (order.weight < 5) return 8;
    return 12;
  }
  if (order.country === 'UK') {
    return order.weight * 3;
  }
  if (order.country === 'AU') {
    return order.weight * 4 + 10;
  }
  // 50 more countries...
  return 20;
}
\`\`\`

## Strategy Pattern Solution

\`\`\`typescript
interface ShippingStrategy {
  calculate(order: Order): number;
}

class USShipping implements ShippingStrategy {
  calculate(order: Order): number {
    if (order.weight < 1) return 5;
    if (order.weight < 5) return 8;
    return 12;
  }
}

class UKShipping implements ShippingStrategy {
  calculate(order: Order): number {
    return order.weight * 3;
  }
}

class AUShipping implements ShippingStrategy {
  calculate(order: Order): number {
    return order.weight * 4 + 10;
  }
}

class ShippingCalculator {
  private strategy: ShippingStrategy;
  
  constructor(strategy: ShippingStrategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy: ShippingStrategy): void {
    this.strategy = strategy;
  }
  
  calculate(order: Order): number {
    return this.strategy.calculate(order);
  }
}

// Usage
const calculator = new ShippingCalculator(new USShipping());
calculator.calculate(order); // Uses US rates

calculator.setStrategy(new UKShipping());
calculator.calculate(order); // Switches to UK rates
\`\`\`

## When to Use Strategy

- Multiple algorithms for a single task
- Need to switch algorithms at runtime
- Testing individual algorithms in isolation
- Avoiding massive conditional branches

## Benefits

1. **Open/Closed Principle**: Add new strategies without modifying existing code
2. **Single Responsibility**: Each strategy handles one algorithm
3. **Runtime flexibility**: Swap strategies based on context
4. **Testability**: Test each strategy independently`,
    eli5: "Strategy is like having different routes for a road trip - you can choose the scenic route, the fastest route, or the cheapest route depending on your mood.",
    difficulty: "beginner",
    tags: JSON.stringify(["design-patterns", "behavioral", "strategy", "refactoring"]),
    channel: "design-patterns",
    subChannel: "behavioral",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Explain the Decorator pattern using TypeScript decorators and how it differs from class inheritance for adding responsibilities.",
    answer: "Decorators attach additional behaviors to objects dynamically at runtime, unlike inheritance which adds responsibilities at compile time and creates rigid hierarchies. Decorators provide flexibility to add/remove behaviors without modifying existing classes.",
    explanation: `## The Decorator Pattern

The Decorator pattern attaches additional responsibilities to an object dynamically. It provides a flexible alternative to subclassing for extending functionality.

## Traditional Decorator (Composition)

\`\`\`typescript
interface Coffee {
  getCost(): number;
  getDescription(): string;
}

class SimpleCoffee implements Coffee {
  getCost(): number { return 5; }
  getDescription(): string { return 'Simple coffee'; }
}

abstract class CoffeeDecorator implements Coffee {
  protected coffee: Coffee;
  
  constructor(coffee: Coffee) {
    this.coffee = coffee;
  }
  
  getCost(): number { return this.coffee.getCost(); }
  getDescription(): string { return this.coffee.getDescription(); }
}

class MilkDecorator extends CoffeeDecorator {
  getCost(): number { return this.coffee.getCost() + 1.5; }
  getDescription(): string { return this.coffee.getDescription() + ', milk'; }
}

class SugarDecorator extends CoffeeDecorator {
  getCost(): number { return this.coffee.getCost() + 0.5; }
  getDescription(): string { return this.coffee.getDescription() + ', sugar'; }
}

// Usage
let coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
console.log(\`\${coffee.getDescription()} = $\${coffee.getCost()}\`);
// "Simple coffee, milk, sugar = $7"
\`\`\`

## TypeScript Decorators (ES2022+)

\`\`\`typescript
function logged(target: any, context: ClassMethodDecoratorContext) {
  return function(this: any, ...args: any[]) {
    console.log(\`Calling \${String(context.name)} with\`, args);
    const result = target.apply(this, args);
    console.log(\`Result:\`, result);
    return result;
  };
}

class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}
\`\`\`

## Decorator vs Inheritance

| Aspect | Decorator | Inheritance |
|--------|-----------|-------------|
| Flexibility | Add/remove at runtime | Compile-time only |
| Code reuse | Composable | Single inheritance tree |
| Class explosion | Avoided | Creates many subclasses |
| State | Each decorator holds state | Shared via superclass |
| Order dependency | Matters | Doesn't matter |

## Real-World Uses

- **Java I/O streams**: BufferedInputStream, GzipInputStream
- **UI frameworks**: Adding borders, scrollbars, shadows
- **Web middleware**: Logging, authentication, caching layers
- **TypeScript/Angular**: Dependency injection, validation`,
    eli5: "Decorators are like adding toppings to a pizza after it's made. Inheritance is like ordering a different pizza type from the start.",
    difficulty: "advanced",
    tags: JSON.stringify(["design-patterns", "structural", "decorator", "composition"]),
    channel: "design-patterns",
    subChannel: "structural",
    createdAt: new Date().toISOString()
  }
];

async function main() {
  for (const q of questions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [q.id, q.question, q.answer, q.explanation, q.eli5, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, q.createdAt, q.createdAt]
    });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for design-patterns");
}

main().catch(e => { console.error(e.message); process.exit(1); });
