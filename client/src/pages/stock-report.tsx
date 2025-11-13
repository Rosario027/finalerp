import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface StockReportProduct {
  id: number;
  name: string;
  hsnCode: string;
  category: string | null;
  rate: string;
  gstPercentage: string;
  quantity: number;
  qtySold: number;
}

export default function StockReport() {
  const { toast } = useToast();
  
  // Initialize date range to current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split("T")[0]);

  const { data: products = [], isLoading } = useQuery<StockReportProduct[]>({
    queryKey: ["/api/reports/stock", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) {
        return [];
      }
      
      const response = await fetch(
        `/api/reports/stock?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch stock report");
      }
      
      return response.json();
    },
    enabled: !!startDate && !!endDate,
  });

  const lowStockThreshold = 10;
  const lowStockProducts = products.filter(p => p.quantity <= lowStockThreshold);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Report</h1>
        <p className="text-muted-foreground mt-1">View inventory levels and quantity sold by date range</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12"
                data-testid="input-stock-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12"
                data-testid="input-stock-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {lowStockProducts.length} {lowStockProducts.length === 1 ? "product has" : "products have"} low stock (≤{lowStockThreshold} units)
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stock Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading stock data...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products found in inventory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="font-semibold">HSN Code</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold text-right">Rate (₹)</TableHead>
                    <TableHead className="font-semibold text-center">GST %</TableHead>
                    <TableHead className="font-semibold text-center">Stock Qty</TableHead>
                    <TableHead className="font-semibold text-center">Qty Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover-elevate" data-testid={`row-stock-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.hsnCode}</TableCell>
                      <TableCell>
                        {product.category ? (
                          <span className="text-sm">{product.category}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">₹{parseFloat(product.rate).toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{product.gstPercentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold" data-testid={`text-quantity-${product.id}`}>
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-center font-bold" data-testid={`text-qty-sold-${product.id}`}>
                        {product.qtySold}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
