const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  deleteMultipleInvoices,
} = require("../controllers/invoiceController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("ADMIN", "UNIT_MANAGER", "USER"),
  createInvoice
);

router.get("/", authMiddleware, getInvoices);

router.put(
  "/:invoiceNumber",
  authMiddleware,
  roleMiddleware("ADMIN", "UNIT_MANAGER", "USER"),
  updateInvoice
);

router.delete(
  "/:invoiceNumber",
  authMiddleware,
  roleMiddleware("ADMIN", "UNIT_MANAGER", "USER"),
  deleteInvoice
);

router.delete(
  "/many",
  authMiddleware,
  roleMiddleware("ADMIN", "UNIT_MANAGER", "USER"),
  deleteMultipleInvoices
);

module.exports = router;
