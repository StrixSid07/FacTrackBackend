const express = require("express");
const router = express.Router();

const {
  createThreadCuttingDataList,
  getAllThreadCuttingDataLists,
  getThreadCuttingDataListById,
  updateThreadCuttingDataList,
  deleteThreadCuttingDataList,
} = require("../controllers/thread-cutting-price-data-list-controller");

// Create a new Thread Cutting Data List & Get all lists
router.route("/")
  .post(createThreadCuttingDataList)
  .get(getAllThreadCuttingDataLists);

// Get, update, or delete a single Thread Cutting Data List by id
router.route("/:id")
  .get(getThreadCuttingDataListById)
  .put(updateThreadCuttingDataList)
  .delete(deleteThreadCuttingDataList);

module.exports = router;
