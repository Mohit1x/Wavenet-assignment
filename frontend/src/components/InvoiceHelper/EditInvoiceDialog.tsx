import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string | null;
  invoiceDate: string;
  invoiceAmount: string;
  onChange: (data: { invoiceDate: string; invoiceAmount: string }) => void;
  onUpdate: () => Promise<void>;
}

export function EditInvoiceDialog({
  open,
  onOpenChange,
  invoiceNumber,
  invoiceDate,
  invoiceAmount,
  onChange,
  onUpdate,
}: Props) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update invoice details for {invoiceNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-invoiceDate">Invoice Date</Label>
            <Input
              id="edit-invoiceDate"
              type="date"
              value={invoiceDate}
              onChange={(e) =>
                onChange({ invoiceDate: e.target.value, invoiceAmount })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-invoiceAmount">Invoice Amount</Label>
            <Input
              id="edit-invoiceAmount"
              type="number"
              step="0.01"
              value={invoiceAmount}
              onChange={(e) =>
                onChange({ invoiceDate, invoiceAmount: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Update Invoice
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
