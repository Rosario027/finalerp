import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Printer, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvoiceItem {
  productId: number | null;
  itemName: string;
  rate: string;
  quantity: number;
  gstPercentage: string;
}

export default function CreateInvoice() {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online">("Cash");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoiceNumber();
    fetchProducts();
  }, []);

  const fetchInvoiceNumber = async () => {
    try {
      const response = await fetch("/api/invoices/next-number?type=B2C");
      const data = await response.json();
      setInvoiceNumber(data.invoiceNumber);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate invoice number",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: null, itemName: "", rate: "", quantity: 1, gstPercentage: "18" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId" && value) {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        newItems[index].itemName = product.name;
        newItems[index].rate = product.rate;
        newItems[index].gstPercentage = product.gstPercentage;
      }
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = item.quantity || 0;
      const gst = parseFloat(item.gstPercentage) || 0;
      
      if (paymentMode === "Cash") {
        const itemTotal = rate * qty;
        const gstAmount = (itemTotal * gst) / (100 + gst);
        subtotal += itemTotal - gstAmount;
        totalGst += gstAmount;
      } else {
        const baseAmount = rate * qty;
        const gstAmount = (baseAmount * gst) / 100;
        subtotal += baseAmount;
        totalGst += gstAmount;
      }
    });

    return { subtotal, totalGst, grandTotal: subtotal + totalGst };
  };

  const { subtotal, totalGst, grandTotal } = calculateTotals();

  const handleSave = async () => {
    if (!customerName || !customerPhone || items.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceType: "B2C",
          customerName,
          customerPhone,
          paymentMode,
          items: items.map((item) => ({
            productId: item.productId,
            itemName: item.itemName,
            rate: item.rate,
            quantity: item.quantity,
            gstPercentage: item.gstPercentage,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to save invoice");

      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });

      setCustomerName("");
      setCustomerPhone("");
      setItems([]);
      fetchInvoiceNumber();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Create Invoice</h1>
        <p className="text-muted-foreground">Generate a new customer invoice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Invoice Details</CardTitle>
                <Badge variant="secondary" className="text-base font-semibold" data-testid="text-invoice-number">
                  {invoiceNumber}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="h-12"
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-sm font-medium">
                    Customer Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="h-12"
                    data-testid="input-customer-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMode" className="text-sm font-medium">
                  Payment Mode <span className="text-destructive">*</span>
                </Label>
                <Select value={paymentMode} onValueChange={(value: "Cash" | "Online") => setPaymentMode(value)}>
                  <SelectTrigger className="h-12" data-testid="select-payment-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {paymentMode === "Cash" ? "GST included in total" : "GST added to base amount"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Items</Label>
                  <Button type="button" size="sm" onClick={addItem} data-testid="button-add-item">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <Label className="text-sm font-medium">Product</Label>
                        <Select
                          value={item.productId?.toString() || ""}
                          onValueChange={(value) => updateItem(index, "productId", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-sm font-medium">Rate (₹)</Label>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(index, "rate", e.target.value)}
                          placeholder="0.00"
                          className="h-12"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                          min="1"
                          className="h-12"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">GST%</Label>
                        <Input
                          type="number"
                          value={item.gstPercentage}
                          onChange={(e) => updateItem(index, "gstPercentage", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                          data-testid={`button-remove-item-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No items added yet. Click "Add Item" to start.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST:</span>
                  <span className="font-medium">₹{totalGst.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Grand Total:</span>
                    <span className="text-2xl font-bold text-primary" data-testid="text-grand-total">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  className="w-full h-12"
                  onClick={handleSave}
                  disabled={loading}
                  data-testid="button-save-invoice"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Bill"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={handlePrint}
                  data-testid="button-print-invoice"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
