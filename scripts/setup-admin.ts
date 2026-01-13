
import { connectMongoDB } from "../server/mongodb";
import { AdminUser } from "../server/schemas";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    await connectMongoDB();
    console.log("Connected to MongoDB");

    const username = "admin";
    const password = "password123";
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await AdminUser.findOne({ username });
    if (existing) {
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log(`Admin '${username}' password updated to '${password}'`);
    } else {
      await AdminUser.create({
        username,
        passwordHash,
        name: "Super Admin",
        role: "admin"
      });
      console.log(`Admin '${username}' created with password '${password}'`);
    }

  } catch (error) {
    console.error("Error setting up admin:", error);
  } finally {
    process.exit(0);
  }
}

main();
