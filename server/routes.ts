import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateToken, authMiddleware, adminMiddleware } from "./auth";
import ExcelJS from "exceljs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.json({
        user: { id: user.id, username: user.username, role: user.role },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Products (protected routes)
  app.get("/api/products", authMiddleware, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/products", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { name, category, rate, gstPercentage, comments } = req.body;
      
      if (!name || !rate || !gstPercentage) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const product = await storage.createProduct({
        name,
        category: category || null,
        rate,
        gstPercentage,
        comments: comments || null,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, category, rate, gstPercentage, comments } = req.body;

      const product = await storage.updateProduct(id, {
        name,
        category: category || null,
        rate,
        gstPercentage,
        comments: comments || null,
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Invoices (protected routes)
  app.get("/api/invoices/next-number", authMiddleware, async (req, res) => {
    try {
      const type = req.query.type as "B2C" | "B2B";
      if (!type || (type !== "B2C" && type !== "B2B")) {
        return res.status(400).json({ message: "Invalid invoice type" });
      }

      const invoiceNumber = await storage.getNextInvoiceNumber(type);
      res.json({ invoiceNumber });
    } catch (error) {
      console.error("Get next invoice number error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/invoices", authMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const invoices = await storage.getInvoices({
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/invoices/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceWithItems(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Get invoice error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invoices", authMiddleware, async (req, res) => {
    try {
      const { invoiceType, customerName, customerPhone, customerGst, paymentMode, items } = req.body;

      if (!invoiceType || !customerName || !customerPhone || !paymentMode || !items || items.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const invoiceNumber = await storage.getNextInvoiceNumber(invoiceType);

      // Calculate totals
      let subtotal = 0;
      let totalGst = 0;

      const invoiceItems = items.map((item: any) => {
        const rate = parseFloat(item.rate) || 0;
        const qty = item.quantity || 0;
        const gstPercentage = parseFloat(item.gstPercentage) || 0;

        let itemSubtotal = 0;
        let itemGst = 0;

        if (paymentMode === "Cash") {
          const itemTotal = rate * qty;
          itemGst = (itemTotal * gstPercentage) / (100 + gstPercentage);
          itemSubtotal = itemTotal - itemGst;
        } else {
          itemSubtotal = rate * qty;
          itemGst = (itemSubtotal * gstPercentage) / 100;
        }

        subtotal += itemSubtotal;
        totalGst += itemGst;

        return {
          productId: item.productId ? parseInt(item.productId) : null,
          itemName: item.itemName,
          rate: rate.toString(),
          quantity: qty,
          gstPercentage: gstPercentage.toString(),
          gstAmount: itemGst.toString(),
          total: (itemSubtotal + itemGst).toString(),
        };
      });

      const grandTotal = subtotal + totalGst;

      const invoice = await storage.createInvoice(
        {
          invoiceNumber,
          invoiceType,
          customerName,
          customerPhone,
          customerGst: customerGst || null,
          paymentMode,
          subtotal: subtotal.toString(),
          gstAmount: totalGst.toString(),
          grandTotal: grandTotal.toString(),
        },
        invoiceItems
      );

      res.status(201).json(invoice);
    } catch (error) {
      console.error("Create invoice error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/invoices/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { customerName, customerPhone, customerGst, paymentMode, items } = req.body;

      // Recalculate totals if items are provided
      let updateData: any = {};

      if (items) {
        let subtotal = 0;
        let totalGst = 0;

        const invoiceItems = items.map((item: any) => {
          const rate = parseFloat(item.rate) || 0;
          const qty = item.quantity || 0;
          const gstPercentage = parseFloat(item.gstPercentage) || 0;

          let itemSubtotal = 0;
          let itemGst = 0;

          if (paymentMode === "Cash") {
            const itemTotal = rate * qty;
            itemGst = (itemTotal * gstPercentage) / (100 + gstPercentage);
            itemSubtotal = itemTotal - itemGst;
          } else {
            itemSubtotal = rate * qty;
            itemGst = (itemSubtotal * gstPercentage) / 100;
          }

          subtotal += itemSubtotal;
          totalGst += itemGst;

          return {
            productId: item.productId ? parseInt(item.productId) : null,
            itemName: item.itemName,
            rate: rate.toString(),
            quantity: qty,
            gstPercentage: gstPercentage.toString(),
            gstAmount: itemGst.toString(),
            total: (itemSubtotal + itemGst).toString(),
          };
        });

        const grandTotal = subtotal + totalGst;

        updateData = {
          customerName,
          customerPhone,
          customerGst: customerGst || null,
          paymentMode,
          subtotal: subtotal.toString(),
          gstAmount: totalGst.toString(),
          grandTotal: grandTotal.toString(),
        };

        const invoice = await storage.updateInvoice(id, updateData, invoiceItems);

        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(invoice);
      } else {
        updateData = { customerName, customerPhone, customerGst, paymentMode };
        const invoice = await storage.updateInvoice(id, updateData);

        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(invoice);
      }
    } catch (error) {
      console.error("Update invoice error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Expenses (admin only)
  app.get("/api/expenses", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses = await storage.getExpenses({
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json(expenses);
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/expenses", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { description, amount, category } = req.body;

      if (!description || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const expense = await storage.createExpense({
        description,
        amount: amount.toString(),
        category: category || null,
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error("Create expense error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/expenses/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { description, amount, category } = req.body;

      const expense = await storage.updateExpense(id, {
        description,
        amount: amount?.toString(),
        category: category || null,
      });

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      console.error("Update expense error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/expenses/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpense(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete expense error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin Stats (admin only)
  app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const stats = await storage.getSalesStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Sales Report (admin only)
  app.get("/api/reports/sales", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Missing date range" });
      }

      const invoices = await storage.getInvoices({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      // Calculate summary data
      const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
      const b2bSales = invoices
        .filter((inv) => inv.invoiceType === "B2B")
        .reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
      const b2cSales = invoices
        .filter((inv) => inv.invoiceType === "B2C")
        .reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
      const cashSales = invoices
        .filter((inv) => inv.paymentMode === "Cash")
        .reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
      const onlineSales = invoices
        .filter((inv) => inv.paymentMode === "Online")
        .reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      // Add title
      worksheet.mergeCells("A1:F1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `Sales Report (${startDate} to ${endDate})`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: "center" };

      // Add summary section
      worksheet.addRow([]);
      worksheet.addRow(["Summary"]);
      worksheet.addRow(["Total Sales", totalSales.toFixed(2)]);
      worksheet.addRow(["B2B Sales", b2bSales.toFixed(2)]);
      worksheet.addRow(["B2C Sales", b2cSales.toFixed(2)]);
      worksheet.addRow(["Cash Sales", cashSales.toFixed(2)]);
      worksheet.addRow(["Online Sales", onlineSales.toFixed(2)]);
      worksheet.addRow(["Total Invoices", invoices.length]);

      // Add invoice details section
      worksheet.addRow([]);
      worksheet.addRow([]);
      const headerRow = worksheet.addRow([
        "Invoice Number",
        "Date",
        "Customer",
        "Type",
        "Payment Mode",
        "Amount",
      ]);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add invoice data
      invoices.forEach((inv) => {
        worksheet.addRow([
          inv.invoiceNumber,
          new Date(inv.createdAt).toLocaleDateString("en-IN"),
          inv.customerName,
          inv.invoiceType,
          inv.paymentMode,
          parseFloat(inv.grandTotal).toFixed(2),
        ]);
      });

      // Auto-fit columns
      if (worksheet.columns) {
        worksheet.columns.forEach((column) => {
          if (column) {
            let maxLength = 0;
            column.eachCell({ includeEmpty: false }, (cell) => {
              const cellValue = cell.value ? cell.value.toString() : "";
              maxLength = Math.max(maxLength, cellValue.length);
            });
            column.width = Math.min(Math.max(maxLength + 2, 12), 40);
          }
        });
      }

      // Generate buffer and send
      const buffer = await workbook.xlsx.writeBuffer();
      
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=sales-report-${startDate}-to-${endDate}.xlsx`);
      res.send(buffer);
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
