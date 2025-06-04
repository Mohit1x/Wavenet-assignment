import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
  }) => Promise<void>;
}

export function CreateInvoiceDialog({ open, onOpenChange, onCreate }: Props) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    invoiceAmount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      invoiceAmount: parseFloat(formData.invoiceAmount),
    });
    setFormData({ invoiceNumber: "", invoiceDate: "", invoiceAmount: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Add a new invoice with proper validation rules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) =>
                setFormData({ ...formData, invoiceDate: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceAmount">Invoice Amount</Label>
            <Input
              id="invoiceAmount"
              type="number"
              step="0.01"
              value={formData.invoiceAmount}
              onChange={(e) =>
                setFormData({ ...formData, invoiceAmount: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create Invoice
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
