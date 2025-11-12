import { SHOP_INFO } from "@shared/shopInfo";
import logoImg from "@assets/1762677792449-0d76ba93-0eba-48fa-927f-62011c24e28f_1_1762963626825.jpg";

interface InvoiceReceiptProps {
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  date?: Date;
  items: Array<{
    itemName: string;
    quantity: number;
    rate: string;
  }>;
  subtotal: number;
  grandTotal: number;
  paid?: number;
}

export function InvoiceReceipt({
  invoiceNumber,
  customerName,
  customerPhone,
  date = new Date(),
  items,
  subtotal,
  grandTotal,
  paid = 0,
}: InvoiceReceiptProps) {
  const balance = grandTotal - paid;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="hidden print:block" data-testid="invoice-receipt">
      <style>
        {`
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print\\:block {
              display: block !important;
            }
            .hidden {
              display: none !important;
            }
          }
        `}
      </style>
      
      <div className="receipt-container" style={{
        width: "80mm",
        maxWidth: "300px",
        margin: "0 auto",
        padding: "10px",
        fontFamily: "monospace",
        fontSize: "12px",
        lineHeight: "1.4",
        color: "#000",
        backgroundColor: "#fff",
      }}>
        {/* Header with Logo */}
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img 
            src={logoImg} 
            alt={SHOP_INFO.name}
            style={{
              maxWidth: "60px",
              maxHeight: "60px",
              margin: "0 auto 8px",
              display: "block",
            }}
          />
          <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
            {SHOP_INFO.name}
          </div>
          <div style={{ fontSize: "10px", marginBottom: "2px" }}>
            {SHOP_INFO.fullAddress}
          </div>
          <div style={{ fontSize: "10px", marginBottom: "2px" }}>
            Email: {SHOP_INFO.email}
          </div>
          <div style={{ fontSize: "10px", marginBottom: "2px" }}>
            Phone: {SHOP_INFO.phone}
          </div>
          {SHOP_INFO.additionalPhones.length > 0 && (
            <div style={{ fontSize: "10px", marginBottom: "2px" }}>
              {SHOP_INFO.additionalPhones.join(", ")}
            </div>
          )}
          <div style={{ fontSize: "10px", marginBottom: "8px" }}>
            GST: {SHOP_INFO.gstNumber}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px dashed #000",
          margin: "8px 0",
        }} />

        {/* Invoice Details */}
        <div style={{ marginBottom: "8px", fontSize: "11px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontWeight: "bold" }}>Invoice: {invoiceNumber}</span>
          </div>
          <div style={{ marginBottom: "2px" }}>
            Customer: {customerName}
          </div>
          {customerPhone && (
            <div style={{ marginBottom: "2px" }}>
              Phone: {customerPhone}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span>Date: {formatDate(date)}</span>
            <span>Time: {formatTime(date)}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px dashed #000",
          margin: "8px 0",
        }} />

        {/* Items Table */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{
            display: "flex",
            fontWeight: "bold",
            fontSize: "11px",
            borderBottom: "1px solid #000",
            paddingBottom: "4px",
            marginBottom: "4px",
          }}>
            <div style={{ flex: "2" }}>Description</div>
            <div style={{ width: "40px", textAlign: "center" }}>Qty</div>
            <div style={{ width: "60px", textAlign: "right" }}>Amount</div>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                fontSize: "11px",
                marginBottom: "4px",
              }}
            >
              <div style={{ flex: "2", wordBreak: "break-word" }}>
                {item.itemName}
              </div>
              <div style={{ width: "40px", textAlign: "center" }}>
                {item.quantity}
              </div>
              <div style={{ width: "60px", textAlign: "right" }}>
                ₹{(parseFloat(item.rate) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px dashed #000",
          margin: "8px 0",
        }} />

        {/* Totals */}
        <div style={{ fontSize: "11px", marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            fontWeight: "bold",
            fontSize: "13px",
          }}>
            <span>Grand Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          {paid > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Paid:</span>
                <span>₹{paid.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Balance:</span>
                <span>₹{balance.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{
          borderTop: "1px dashed #000",
          margin: "8px 0",
        }} />

        {/* Footer Message */}
        <div style={{
          textAlign: "center",
          fontSize: "11px",
          fontStyle: "italic",
          marginTop: "8px",
        }}>
          {SHOP_INFO.footerMessage}
        </div>
      </div>
    </div>
  );
}
