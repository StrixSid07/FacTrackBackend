const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");

const {
  createThreadChallan,
  getAllThreadChallans,
  getThreadChallanById,
  updateThreadChallan,
  deleteThreadChallan,
} = require("../controllers/thread-challan-controller");

router.post("/", createThreadChallan);
router.get("/", getAllThreadChallans);
router.get("/:id", getThreadChallanById);
router.put("/:id", updateThreadChallan);
router.delete("/:id", deleteThreadChallan);

module.exports = router;
