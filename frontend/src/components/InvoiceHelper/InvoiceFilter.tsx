import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  fyFilter: string;
  onFyFilterChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  setPage: (page: number) => void;
}

export function InvoiceFilters({
  searchTerm,
  onSearchChange,
  fyFilter,
  onFyFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  setPage,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice number..."
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setPage(1);
          }}
          className="pl-8"
        />
      </div>
      <Select
        value={fyFilter}
        onValueChange={(value) => {
          onFyFilterChange(value);
          setPage(1);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by FY" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Financial Years</SelectItem>
          <SelectItem value="2023-2024">2023-2024</SelectItem>
          <SelectItem value="2024-2025">2024-2025</SelectItem>
          <SelectItem value="2025-2026">2025-2026</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => {
          onStartDateChange(e.target.value);
          setPage(1);
        }}
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => {
          onEndDateChange(e.target.value);
          setPage(1);
        }}
      />
    </div>
  );
}
