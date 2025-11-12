import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateToken, authMiddleware, adminMiddleware } from "./auth";

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
      const { name, category, rate, gstPercentage } = req.body;
      
      if (!name || !rate || !gstPercentage) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const product = await storage.createProduct({
        name,
        category: category || null,
        rate,
        gstPercentage,
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
      const { name, category, rate, gstPercentage } = req.body;

      const product = await storage.updateProduct(id, {
        name,
        category: category || null,
        rate,
        gstPercentage,
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

      // Generate Excel-like data structure (simplified for demo)
      const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
      const b2bSales = invoices
        .filter((inv) => inv.invoiceType === "B2B")
        .reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
      const b2cSales = invoices
        .filter((inv) => inv.invoiceType === "B2C")
        .reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);

      const reportData = {
        summary: {
          totalSales,
          b2bSales,
          b2cSales,
          invoiceCount: invoices.length,
        },
        invoices: invoices.map((inv) => ({
          invoiceNumber: inv.invoiceNumber,
          date: inv.createdAt,
          customer: inv.customerName,
          type: inv.invoiceType,
          paymentMode: inv.paymentMode,
          amount: parseFloat(inv.grandTotal),
        })),
      };

      // For now, return JSON. In production, you'd generate actual Excel file
      res.json(reportData);
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
