import { db } from "./db";
import { users, products } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin@2025", 10);
  await db.insert(users).values({
    username: "admin",
    password: adminPassword,
    role: "admin",
  }).onConflictDoNothing();

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  await db.insert(users).values({
    username: "user",
    password: userPassword,
    role: "user",
  }).onConflictDoNothing();

  // Create sample products
  const sampleProducts = [
    { name: "Laptop", category: "Electronics", rate: "45000.00", gstPercentage: "18" },
    { name: "Mouse", category: "Electronics", rate: "500.00", gstPercentage: "18" },
    { name: "Keyboard", category: "Electronics", rate: "1200.00", gstPercentage: "18" },
    { name: "Monitor", category: "Electronics", rate: "15000.00", gstPercentage: "18" },
    { name: "Desk Chair", category: "Furniture", rate: "8000.00", gstPercentage: "18" },
    { name: "Office Desk", category: "Furniture", rate: "12000.00", gstPercentage: "18" },
    { name: "Notebook", category: "Stationery", rate: "50.00", gstPercentage: "5" },
    { name: "Pen Set", category: "Stationery", rate: "150.00", gstPercentage: "5" },
    { name: "Printer", category: "Electronics", rate: "8500.00", gstPercentage: "18" },
    { name: "USB Drive 64GB", category: "Electronics", rate: "800.00", gstPercentage: "18" },
  ];

  for (const product of sampleProducts) {
    await db.insert(products).values(product).onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
  console.log("Admin user: admin / admin@2025");
  console.log("Regular user: user / user123");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
