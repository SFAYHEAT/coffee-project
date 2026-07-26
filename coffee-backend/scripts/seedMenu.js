const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const Topping = require("../models/Topping");

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    name: "Espresso",
    price: 3.5,
    category: "Coffee",
    description: "A bold, concentrated shot of pure coffee flavor.",
    origin: "Ethiopia",
    roastLevel: 8,
    tastingNotes: ["Bold", "Bitter", "Intense"],
  },
  {
    name: "Cappuccino",
    price: 4.5,
    category: "Coffee",
    description: "Creamy foam and rich espresso in perfect balance.",
    origin: "Brazil",
    roastLevel: 6,
    tastingNotes: ["Creamy", "Balanced"],
  },
  {
    name: "Caramel Latte",
    price: 5.0,
    category: "Latte",
    description: "Smooth milk coffee with rich caramel swirls.",
    origin: "Colombia",
    roastLevel: 5,
    tastingNotes: ["Sweet", "Caramel", "Smooth"],
  },
  {
    name: "Vanilla Latte",
    price: 5.0,
    category: "Latte",
    description: "Classic latte infused with sweet vanilla.",
    origin: "Colombia",
    roastLevel: 5,
    tastingNotes: ["Vanilla", "Sweet"],
  },
  {
    name: "Iced Tea",
    price: 3.0,
    category: "Tea",
    description: "Refreshing chilled tea, perfect for hot days.",
    origin: "Sri Lanka",
    roastLevel: 1,
    tastingNotes: ["Fresh", "Light"],
  },
  {
    name: "Green Tea",
    price: 3.0,
    category: "Tea",
    description: "Light and healthy antioxidant-rich tea.",
    origin: "Japan",
    roastLevel: 1,
    tastingNotes: ["Grassy", "Light"],
  },
  {
    name: "Chocolate Dessert",
    price: 6.2,
    category: "Dessert",
    description: "A decadent chocolate treat to pair with your coffee.",
    origin: "",
    roastLevel: 1,
    tastingNotes: ["Chocolate", "Rich"],
  },
  {
    name: "Cheesecake",
    price: 5.5,
    category: "Dessert",
    description: "Creamy classic cheesecake slice.",
    origin: "",
    roastLevel: 1,
    tastingNotes: ["Creamy", "Sweet"],
  },
];

const toppings = [
  { name: "Cake Slice", price: 2.5 },
  { name: "Cookie", price: 1.5 },
  { name: "Extra Shot", price: 1.0 },
  { name: "Whipped Cream", price: 0.5 },
  { name: "Caramel Drizzle", price: 0.5 },
  { name: "Chocolate Syrup", price: 0.5 },
];

async function seed() {
  try {
    await Product.deleteMany({});
    await Topping.deleteMany({});

    await Product.insertMany(products);
    await Topping.insertMany(toppings);

    console.log("Seeded", products.length, "products and", toppings.length, "toppings");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();