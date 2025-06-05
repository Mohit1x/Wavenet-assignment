import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CreateInvoiceDialog } from "@/components/InvoiceHelper/CreateInvoiceDialog";
import { InvoiceFilters } from "@/components/InvoiceHelper/InvoiceFilter";
import { InvoiceTable } from "@/components/InvoiceHelper/InvoiceTable";
import { EditInvoiceDialog } from "@/components/InvoiceHelper/EditInvoiceDialog";
import { toast } from "sonner";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: number;
  financialYear: string;
  createdBy: {
    name: string;
    userId: string;
  };
  createdAt: string;
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [fyFilter, setFyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [editFormData, setEditFormData] = useState({
    invoiceDate: "",
    invoiceAmount: "",
  });

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, fyFilter, startDate, endDate, page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (fyFilter && fyFilter !== "all")
        params.append("financialYear", fyFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await axios.get(`${baseURL}/invoices?${params}`, {
        withCredentials: true,
      });

      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (data: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
  }) => {
    try {
      await axios.post(`${baseURL}/invoices/create`, data, {
        withCredentials: true,
      });
      setCreateDialogOpen(false);
      fetchInvoices();
      toast.success("invoice created");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await axios.put(
        `${baseURL}/invoices/${selectedInvoice.invoiceNumber}`,
        {
          invoiceDate: editFormData.invoiceDate,
          invoiceAmount: parseFloat(editFormData.invoiceAmount),
        },
        { withCredentials: true }
      );
      setEditDialogOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();

      toast.success("invoice updated");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const handleDeleteInvoice = async (invoiceNumber: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`${baseURL}/invoices/${invoiceNumber}`, {
        withCredentials: true,
      });
      fetchInvoices();
      toast.success("invoice deleted");
    } catch (error) {
      console.error(error);
    }
  };

  const openEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditFormData({
      invoiceDate: invoice.invoiceDate.split("T")[0],
      invoiceAmount: invoice.invoiceAmount.toString(),
    });
    setEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const handleSelectInvoice = (invoiceNumber: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceNumber)
        ? prev.filter((num) => num !== invoiceNumber)
        : [...prev, invoiceNumber]
    );
  };

  const handleSelectAllInvoices = (checked: boolean) => {
    if (checked) {
      const all = invoices.map((inv) => inv.invoiceNumber);
      setSelectedInvoices(all);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleDeleteMultipleInvoices = async () => {
    if (selectedInvoices.length === 0) {
      toast.warning("No invoices selected");
      return;
    }

    if (!confirm(`Delete ${selectedInvoices.length} invoices?`)) return;

    try {
      await axios.post(
        `${baseURL}/invoices/delete-multiple`,
        { invoiceNumbers: selectedInvoices },
        { withCredentials: true }
      );
      toast.success("Selected invoices deleted");
      setSelectedInvoices([]);
      fetchInvoices();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoice Management</h1>
        <CreateInvoiceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateInvoice}
        />
      </div>

      <InvoiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        fyFilter={fyFilter}
        onFyFilterChange={setFyFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        setPage={setPage}
      />

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        selected={selectedInvoices}
        onSelect={handleSelectInvoice}
        onSelectAll={handleSelectAllInvoices}
        onEdit={openEditDialog}
        onDelete={handleDeleteInvoice}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {selectedInvoices.length > 0 && (
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleDeleteMultipleInvoices}>
            Delete Selected ({selectedInvoices.length})
          </Button>
        </div>
      )}

      <EditInvoiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoiceNumber={selectedInvoice?.invoiceNumber ?? null}
        invoiceDate={editFormData.invoiceDate}
        invoiceAmount={editFormData.invoiceAmount}
        onChange={(data) => setEditFormData(data)}
        onUpdate={handleUpdateInvoice}
      />

      {/* Pagination buttons */}
      <div className="flex justify-center space-x-2">
        <Button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="px-4 py-2">
          {page} / {totalPages}
        </span>
        <Button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
