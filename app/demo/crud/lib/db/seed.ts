import { getSqlDb, saveDatabase } from "./client";

/**
 * Seed the database with sample data
 * This is called on first initialization
 */
export async function seedDatabase() {
  const sqlDb = await getSqlDb();
  if (!sqlDb) throw new Error("Database not initialized");

  // Check if data already exists
  const result = sqlDb.exec("SELECT COUNT(*) as count FROM users");
  if (
    result.length > 0 &&
    result[0].values &&
    result[0].values[0] &&
    typeof result[0].values[0][0] === "number" &&
    result[0].values[0][0] > 0
  ) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database with sample data...");

  // Create sample users (25 users to exceed minimum requirement)
  const users = [
    ["Alice Johnson", "alice@example.com", 28, "active", new Date().toISOString()],
    ["Bob Smith", "bob@example.com", 35, "active", new Date().toISOString()],
    ["Charlie Brown", "charlie@example.com", 42, "active", new Date().toISOString()],
    ["Diana Prince", "diana@example.com", 31, "inactive", new Date().toISOString()],
    ["Eve Wilson", "eve@example.com", 27, "active", new Date().toISOString()],
    ["Frank Miller", "frank@example.com", 39, "active", new Date().toISOString()],
    ["Grace Lee", "grace@example.com", 33, "active", new Date().toISOString()],
    ["Henry Davis", "henry@example.com", 45, "inactive", new Date().toISOString()],
    ["Iris Chen", "iris@example.com", 29, "active", new Date().toISOString()],
    ["Jack Thompson", "jack@example.com", 38, "active", new Date().toISOString()],
    ["Kate Martinez", "kate@example.com", 26, "active", new Date().toISOString()],
    ["Leo Garcia", "leo@example.com", 41, "active", new Date().toISOString()],
    ["Maya Patel", "maya@example.com", 32, "inactive", new Date().toISOString()],
    ["Nathan Kim", "nathan@example.com", 36, "active", new Date().toISOString()],
    ["Olivia White", "olivia@example.com", 30, "active", new Date().toISOString()],
    ["Peter Adams", "peter@example.com", 44, "active", new Date().toISOString()],
    ["Quinn Roberts", "quinn@example.com", 25, "active", new Date().toISOString()],
    ["Rachel Green", "rachel@example.com", 34, "inactive", new Date().toISOString()],
    ["Sam Taylor", "sam@example.com", 37, "active", new Date().toISOString()],
    ["Tina Moore", "tina@example.com", 28, "active", new Date().toISOString()],
    ["Uma Singh", "uma@example.com", 40, "active", new Date().toISOString()],
    ["Victor Cruz", "victor@example.com", 43, "active", new Date().toISOString()],
    ["Wendy Hall", "wendy@example.com", 31, "inactive", new Date().toISOString()],
    ["Xavier Lopez", "xavier@example.com", 35, "active", new Date().toISOString()],
    ["Yuki Tanaka", "yuki@example.com", 29, "active", new Date().toISOString()],
  ];

  users.forEach((user) => {
    sqlDb.run("INSERT INTO users (name, email, age, status, created_at) VALUES (?, ?, ?, ?, ?)", user);
  });
  console.log(`Created ${users.length} users`);

  // Create sample transactions (30 transactions with proper foreign key references)
  const transactions = [
    [1, 100.5, new Date().toISOString(), "completed", "credit", "Initial deposit"],
    [1, 25.0, new Date().toISOString(), "completed", "debit", "Coffee shop payment"],
    [2, 500.0, new Date().toISOString(), "completed", "credit", "Salary deposit"],
    [2, 50.0, new Date().toISOString(), "pending", "debit", "Pending withdrawal"],
    [3, 1000.0, new Date().toISOString(), "failed", "credit", "Failed deposit"],
    [3, 75.5, new Date().toISOString(), "completed", "debit", "Transfer to savings"],
    [4, 200.0, new Date().toISOString(), "completed", "credit", "Bonus payment"],
    [5, 150.0, new Date().toISOString(), "completed", "credit", "Refund"],
    [6, 300.0, new Date().toISOString(), "completed", "credit", "Freelance payment"],
    [6, 120.0, new Date().toISOString(), "completed", "debit", "Utility bill payment"],
    [7, 450.0, new Date().toISOString(), "completed", "credit", "Contract payment"],
    [7, 85.0, new Date().toISOString(), "pending", "debit", "Subscription renewal"],
    [8, 175.0, new Date().toISOString(), "failed", "debit", "Failed transaction"],
    [9, 600.0, new Date().toISOString(), "completed", "credit", "Commission earned"],
    [10, 95.0, new Date().toISOString(), "completed", "debit", "Online purchase"],
    [11, 250.0, new Date().toISOString(), "completed", "credit", "Gift received"],
    [12, 400.0, new Date().toISOString(), "completed", "credit", "Investment return"],
    [13, 65.0, new Date().toISOString(), "pending", "debit", "Restaurant payment"],
    [14, 800.0, new Date().toISOString(), "completed", "credit", "Consulting fee"],
    [15, 150.0, new Date().toISOString(), "completed", "debit", "Groceries"],
    [16, 550.0, new Date().toISOString(), "completed", "credit", "Side project payment"],
    [17, 90.0, new Date().toISOString(), "failed", "debit", "Card declined"],
    [18, 325.0, new Date().toISOString(), "completed", "credit", "Reimbursement"],
    [19, 275.0, new Date().toISOString(), "completed", "debit", "Electronics purchase"],
    [20, 700.0, new Date().toISOString(), "completed", "credit", "Performance bonus"],
    [21, 125.0, new Date().toISOString(), "pending", "debit", "Gym membership"],
    [22, 450.0, new Date().toISOString(), "completed", "credit", "Client payment"],
    [23, 85.0, new Date().toISOString(), "completed", "debit", "Software subscription"],
    [24, 950.0, new Date().toISOString(), "completed", "credit", "Annual bonus"],
    [25, 200.0, new Date().toISOString(), "completed", "debit", "Home repairs"],
  ];

  transactions.forEach((txn) => {
    sqlDb.run(
      "INSERT INTO transactions (user_id, amount, date, status, type, description) VALUES (?, ?, ?, ?, ?, ?)",
      txn
    );
  });
  console.log(`Created ${transactions.length} transactions`);

  // Create sample goods (25 products across diverse categories)
  const goods = [
    ["Laptop Pro 15", "High-performance laptop with 16GB RAM", 1299.99, "Electronics", 15, "PRO-LPT-001", new Date().toISOString()],
    ["Wireless Mouse", "Ergonomic wireless mouse", 29.99, "Accessories", 50, "ACC-MS-001", new Date().toISOString()],
    ["USB-C Hub", "7-in-1 USB-C hub with HDMI", 49.99, "Accessories", 30, "ACC-HUB-001", new Date().toISOString()],
    ["Office Chair", "Ergonomic office chair with lumbar support", 299.99, "Furniture", 10, "FRN-CHR-001", new Date().toISOString()],
    ["Standing Desk", "Adjustable height standing desk", 599.99, "Furniture", 5, "FRN-DSK-001", new Date().toISOString()],
    ["4K Monitor", "27-inch 4K UHD monitor", 399.99, "Electronics", 12, "ELC-MON-001", new Date().toISOString()],
    ["Mechanical Keyboard", "RGB mechanical gaming keyboard", 149.99, "Accessories", 25, "ACC-KBD-001", new Date().toISOString()],
    ["Webcam HD", "1080p HD webcam with microphone", 89.99, "Electronics", 20, "ELC-CAM-001", new Date().toISOString()],
    ["Desk Lamp", "LED desk lamp with adjustable brightness", 39.99, "Office", 40, "OFF-LMP-001", new Date().toISOString()],
    ["Notebook Set", "Pack of 3 premium notebooks", 19.99, "Office", 100, "OFF-NTB-001", new Date().toISOString()],
    ["Wireless Earbuds", "Noise-cancelling wireless earbuds", 129.99, "Electronics", 35, "ELC-EAR-001", new Date().toISOString()],
    ["Phone Stand", "Adjustable aluminum phone stand", 24.99, "Accessories", 60, "ACC-STD-001", new Date().toISOString()],
    ["Cable Organizer", "Cable management box", 14.99, "Accessories", 80, "ACC-ORG-001", new Date().toISOString()],
    ["Desk Mat", "Extended desk mat 900x400mm", 34.99, "Accessories", 45, "ACC-MAT-001", new Date().toISOString()],
    ["Portable SSD", "1TB portable SSD with USB-C", 179.99, "Electronics", 18, "ELC-SSD-001", new Date().toISOString()],
    ["Bookshelf", "5-tier wooden bookshelf", 149.99, "Furniture", 8, "FRN-SHF-001", new Date().toISOString()],
    ["Table Lamp", "Modern table lamp with touch control", 59.99, "Furniture", 22, "FRN-LMP-001", new Date().toISOString()],
    ["Storage Box", "Stackable storage box set of 3", 29.99, "Office", 55, "OFF-BOX-001", new Date().toISOString()],
    ["Whiteboard", "Magnetic dry-erase whiteboard 36x24", 79.99, "Office", 15, "OFF-WBD-001", new Date().toISOString()],
    ["Printer Paper", "Ream of 500 sheets A4 paper", 24.99, "Office", 120, "OFF-PPR-001", new Date().toISOString()],
    ["Bluetooth Speaker", "Portable Bluetooth speaker", 69.99, "Electronics", 28, "ELC-SPK-001", new Date().toISOString()],
    ["Monitor Arm", "Adjustable monitor arm mount", 99.99, "Accessories", 16, "ACC-ARM-001", new Date().toISOString()],
    ["Footrest", "Ergonomic adjustable footrest", 44.99, "Furniture", 32, "FRN-FTR-001", new Date().toISOString()],
    ["Desk Organizer", "Mesh desk organizer with drawers", 34.99, "Office", 48, "OFF-ORG-001", new Date().toISOString()],
    ["Laptop Stand", "Aluminum laptop stand with cooling", 54.99, "Accessories", 38, "ACC-LPS-001", new Date().toISOString()],
  ];

  goods.forEach((item) => {
    sqlDb.run(
      "INSERT INTO goods (name, description, price, category, stock_quantity, sku, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      item
    );
  });
  console.log(`Created ${goods.length} goods`);

  // Save database to file
  await saveDatabase();
  console.log("Database seeded successfully!");
}
