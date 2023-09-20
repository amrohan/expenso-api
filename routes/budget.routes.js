import { BudgetModel } from "../models/budget.js";
import { DateTime } from "luxon";

const getAllBudgets = async (request, reply) => {
  try {
    const budgets = await BudgetModel.find({}).sort({ date: -1 });

    let totalExpense = 0;
    let totalIncome = 0;

    budgets.forEach((budget) => {
      if (budget.type === "expense") {
        totalExpense += budget.amount;
      } else if (budget.type === "income") {
        totalIncome += budget.amount;
      }
    });

    reply.status(200).send({
      budgets,
      totalExpense,
      totalIncome,
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};
// get only post by user id
const getAllBudgetsOfUser = async (request, reply) => {
  try {
    const userId = request.query.userId;

    if (!userId) {
      reply.status(400).send({ error: "User Id is requestuired" });
    } else {
      const budgets = await BudgetModel.find({
        userId,
      });
      reply.status(200).send({ budgets });
    }
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};

const getCurrentMonthBudgetsOfUser = async (request, reply) => {
  try {
    let totalExpense = 0;
    let totalIncome = 0;
    const userId = request.query.userId;
    let timezone = reply.getHeader("set-timezone");
    if (timezone === undefined) {
      timezone = "Asia/Kolkata";
    }
    if (!userId) {
      reply.status(400).send({ error: "User Id is requestuired" });
    } else {
      const currentMonth = DateTime.now().setZone(timezone).month;
      const budgets = await BudgetModel.aggregate([
        {
          $match: {
            userId,
            $expr: {
              $eq: [
                {
                  $month: {
                    $toDate: {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$date",
                        timezone,
                      },
                    },
                  },
                },
                currentMonth,
              ],
            },
          },
        },
        {
          $sort: {
            date: -1, // Sort by the date field in descending order
          },
        },
      ]);

      budgets.forEach((budget) => {
        if (budget.type === "expense") {
          totalExpense += budget.amount;
        } else if (budget.type === "income") {
          totalIncome += budget.amount;
        }
      });

      reply.status(200).send({ budgets, totalExpense, totalIncome });
    }
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};

// const getPerticularMonthData = async (request, reply) => {
//   try {
//     const userId = request.query.userId;
//     let timezone = reply.getHeader("set-timezone");
//     if (!timezone) {
//       timezone = "Asia/Kolkata";
//     }
//     const startDate = DateTime.fromISO(request.query.startDate).toUTC(); // Parse and convert to UTC
//     const endDate = DateTime.fromISO(request.query.endDate).toUTC(); // Parse and convert to UTC

//     const startOfMonthIST = startDate
//       .set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
//       .setZone(timezone);

//     const endOfMonthIST = endDate
//       .set({ day: 1, month: startDate.month, year: startDate.year })
//       .plus({ months: 1 })
//       .minus({ days: 1 })
//       .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
//       .setZone(timezone);

//     const budgets = await BudgetModel.find({
//       userId,
//       date: { $gte: startOfMonthIST, $lte: endOfMonthIST },
//     });
//     reply.status(200).send({ budgets });
//   } catch (error) {
//     reply.status(500).send({ error: error.message });
//   }
// };

const getPerticularMonthData = async (request, reply) => {
  try {
    let totalExpense = 0;
    let totalIncome = 0;
    const userId = request.query.userId;
    let timezone = reply.getHeader("set-timezone");
    if (!timezone) {
      timezone = "Asia/Kolkata";
    }
    const monthName = request.query.monthName;
    const year = new Date().getFullYear(); // Get the current year

    const monthNamelist = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = monthNamelist.indexOf(monthName);

    if (monthIndex === -1) {
      reply.status(400).send({ error: "Invalid month name" });
      return;
    }

    const startOfMonthIST = DateTime.fromObject({
      year,
      month: monthIndex + 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).setZone(timezone);

    const endOfMonthIST = startOfMonthIST
      .plus({ months: 1 })
      .minus({ days: 1 })
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
      .setZone(timezone);

    let budgets = await BudgetModel.find({
      userId,
      date: { $gte: startOfMonthIST, $lte: endOfMonthIST },
    }).sort({ date: -1 });

    budgets.forEach((budget) => {
      if (budget.type === "expense") {
        totalExpense += budget.amount;
      } else if (budget.type === "income") {
        totalIncome += budget.amount;
      }
    });

    reply.status(200).send({ budgets, totalExpense, totalIncome });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};

const createBudget = async (request, reply) => {
  try {
    const budget = new BudgetModel(request.body);
    await budget.save();

    console.log(`Budget created with ID: ${budget._id}`);
    reply.status(201).send({ id: budget._id });
  } catch (error) {
    console.error("Error creating budget:", error);
    reply.status(500).send({
      error: "An error occurred while creating the budget",
      details: error.message,
    });
  }
};

const getBudgetById = async (request, reply) => {
  try {
    const budget = await BudgetModel.findById(request.params.id);
    if (!budget) {
      return reply.status(404).send({ error: "Budget not found" });
    }
    reply.status(200).send({ budget });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};

const updateBudget = async (request, res) => {
  try {
    const budget = await BudgetModel.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
      }
    );

    if (!budget) {
      return reply.status(404).send({ error: "Budget not found" });
    }

    reply.status(200).send({ budget });
  } catch (error) {
    console.error("Error updating budget:", error);

    reply.status(500).send({
      error: "An error occurred while updating the budget",
      details: error.message,
    });
  }
};

const deleteBudget = async (request, reply) => {
  try {
    const deletedBudget = await BudgetModel.findOneAndDelete({
      _id: request.params.id,
    });

    if (!deletedBudget) {
      return reply.status(404).send({ error: "Budget not found" });
    }

    // Log the deleted budget for auditing purposes
    console.log(`Budget deleted: ${deletedBudget._id}`);

    reply.status(200).send({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    reply.status(500).send({
      error: "An error occurred while deleting the budget",
      details: error.message,
    });
  }
};

// const deleteAllBudget = async (request, res) => {
//   try {
//     await BudgetModel.deleteMany({});
//     res.status(200).json({ message: "All budget deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export {
  getAllBudgets,
  getAllBudgetsOfUser,
  getCurrentMonthBudgetsOfUser,
  getPerticularMonthData,
  createBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
  // deleteAllBudget,
};
