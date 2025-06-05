import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: number;
  financialYear: string;
  createdBy: {
    name: string;
  };
}

interface Props {
  invoices: Invoice[];
  loading: boolean;
  selected: string[];
  onSelect: (invoiceNumber: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceNumber: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export function InvoiceTable({
  invoices,
  loading,
  selected,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
}: Props) {
  const allSelected =
    invoices.length > 0 &&
    invoices.every((i) => selected.includes(i.invoiceNumber));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Financial Year</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(invoice.invoiceNumber)}
                    onCheckedChange={() => onSelect(invoice.invoiceNumber)}
                  />
                </TableCell>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell>{formatCurrency(invoice.invoiceAmount)}</TableCell>
                <TableCell>{invoice.financialYear}</TableCell>
                <TableCell>{invoice.createdBy.name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(invoice.invoiceNumber)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
