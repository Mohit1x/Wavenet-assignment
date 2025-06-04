const Invoice = require("../models/Invoice");
const { getFinancialYear } = require("../utils/financialYear");

const createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, invoiceDate, invoiceAmount } = req.body;

    if (!invoiceNumber || !invoiceDate || !invoiceAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const date = new Date(invoiceDate);
    const financialYear = getFinancialYear(date);

    const existingInvoice = await Invoice.findOne({
      invoiceNumber,
      financialYear,
    });

    if (existingInvoice) {
      return res.status(409).json({
        message: "Invoice number already exists in this financial year",
      });
    }

    const invoicesInFY = await Invoice.find({ financialYear }).sort({
      invoiceNumber: 1,
    });

    let prevInvoice = null;
    let nextInvoice = null;

    for (let i = 0; i < invoicesInFY.length; i++) {
      const currentInvoiceNum = Number.parseInt(invoicesInFY[i].invoiceNumber);
      const newInvoiceNum = Number.parseInt(invoiceNumber);

      if (currentInvoiceNum < newInvoiceNum) {
        prevInvoice = invoicesInFY[i];
      } else if (currentInvoiceNum > newInvoiceNum && !nextInvoice) {
        nextInvoice = invoicesInFY[i];
        break;
      }
    }

    if (prevInvoice && date < prevInvoice.invoiceDate) {
      return res.status(400).json({
        message: `Invoice date should be after ${prevInvoice.invoiceDate.toDateString()} (Invoice ${
          prevInvoice.invoiceNumber
        })`,
      });
    }

    if (nextInvoice && date > nextInvoice.invoiceDate) {
      return res.status(400).json({
        message: `Invoice date should be before ${nextInvoice.invoiceDate.toDateString()} (Invoice ${
          nextInvoice.invoiceNumber
        })`,
      });
    }

    const newInvoice = await Invoice.create({
      invoiceNumber,
      invoiceDate: date,
      invoiceAmount,
      financialYear,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      financialYear,
      search,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (financialYear) {
      query.financialYear = financialYear;
    }

    if (search) {
      query.invoiceNumber = { $regex: search, $options: "i" };
    }

    if (startDate && endDate) {
      query.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const invoices = await Invoice.find(query)
      .populate("createdBy", "name userId")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ invoiceDate: -1 });

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get Invoices Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const { invoiceDate, invoiceAmount } = req.body;

    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const updateData = {};
    if (invoiceDate) updateData.invoiceDate = new Date(invoiceDate);
    if (invoiceAmount) updateData.invoiceAmount = invoiceAmount;

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { invoiceNumber },
      updateData,
      { new: true }
    ).populate("createdBy", "name userId");

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;

    const deletedInvoice = await Invoice.findOneAndDelete({ invoiceNumber });

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteMultipleInvoices = async (req, res) => {
  try {
    const { invoiceNumbers } = req.body;

    if (!invoiceNumbers || !Array.isArray(invoiceNumbers)) {
      return res
        .status(400)
        .json({ message: "Invoice numbers array is required" });
    }

    const result = await Invoice.deleteMany({
      invoiceNumber: { $in: invoiceNumbers },
    });

    res.status(200).json({
      message: `${result.deletedCount} invoices deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Multiple Invoices Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  deleteMultipleInvoices,
};
