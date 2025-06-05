import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/pages/UserManagement";

interface EditUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formData: { role: string };
  setFormData: React.Dispatch<React.SetStateAction<{ role: string }>>;
  onUpdate: (e: React.FormEvent) => void;
  selectedUser: User | null;
  getAvailableRoles: () => string[];
}

export default function EditUserDialog({
  open,
  setOpen,
  formData,
  setFormData,
  onUpdate,
  selectedUser,
  getAvailableRoles,
}: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Update the role for {selectedUser?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((d) => ({ ...d, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles()?.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Update User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
