import mongoose from "mongoose";
const Schema = mongoose.Schema;

const budgetSchema = new mongoose.Schema({
  title: String,
  category: String,
  amount: Number,
  date: Date,
  description: String,
  userId: String,
  type: String,
});

export const BudgetModel = mongoose.model("Budget", budgetSchema);
