"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import type { Contact, ContactTitle } from "@/types/contact";
import { CONTACT_TITLES } from "@/types/contact";

interface ContactFormProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

interface FormData {
  title?: ContactTitle;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternativePhone: string;
  company: string;
  jobTitle: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  notes: string;
  tags: string[];
  important: boolean;
  favorite: boolean;
}

export function ContactForm({
  contact,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<ContactFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: undefined,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternativePhone: "",
    company: "",
    jobTitle: "",
    location: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    notes: "",
    tags: [],
    important: false,
    favorite: false,
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (contact) {
      setFormData({
        title: contact.title,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || "",
        phone: contact.phone,
        alternativePhone: contact.alternativePhone || "",
        company: contact.company || "",
        jobTitle: contact.jobTitle || "",
        location: contact.location,
        address: contact.address || "",
        city: contact.city || "",
        state: contact.state || "",
        country: contact.country || "",
        postalCode: contact.postalCode || "",
        notes: contact.notes || "",
        tags: contact.tags || [],
        important: contact.important,
        favorite: contact.favorite,
      });
    } else {
      // Reset form for new contact
      setFormData({
        title: undefined,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        alternativePhone: "",
        company: "",
        jobTitle: "",
        location: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        notes: "",
        tags: [],
        important: false,
        favorite: false,
      });
    }
    setTagInput("");
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const contactData = {
        ...formData,
      };

      await onSubmit(contactData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (
      tagInput.trim() &&
      !formData.tags.includes(tagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const updateField = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {contact ? "Edit Contact" : "Create Contact"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <p className="text-sm text-gray-600">Essential contact details</p>
            </div>
            
            {/* Name Section */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-sm">Title</Label>
                <Select
                  value={formData.title || "none"}
                  onValueChange={(value: string) => updateField("title", value === "none" ? undefined : value as ContactTitle)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {CONTACT_TITLES.map((title) => (
                      <SelectItem key={title} value={title!}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="John"
                  required
                  className="h-9"
                />
              </div>
              <div className="sm:col-span-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Doe"
                  required
                  className="h-9"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john@example.com"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  required
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="alternativePhone">Alternative Phone</Label>
              <Input
                id="alternativePhone"
                type="tel"
                value={formData.alternativePhone}
                onChange={(e) => updateField("alternativePhone", e.target.value)}
                placeholder="+1 234 567 8901"
                className="h-9"
              />
            </div>
          </div>

          {/* Work Information Section */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
              <p className="text-sm text-gray-600">Company and job details</p>
            </div>
            
            {/* Work Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="Acme Inc."
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  placeholder="Software Engineer"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
              <p className="text-sm text-gray-600">Address and location details</p>
            </div>
            
            {/* Location Information */}
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="New York, NY"
                required
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="New York"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="NY"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="United States"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="10001"
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="123 Main St, Apt 4B"
                className="h-9"
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              <p className="text-sm text-gray-600">Tags, notes, and preferences</p>
            </div>

            {/* Flags */}
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="important"
                  checked={formData.important}
                  onCheckedChange={(checked) => updateField("important", checked)}
                />
                <Label htmlFor="important" className="text-sm">Mark as Important</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorite"
                  checked={formData.favorite}
                  onCheckedChange={(checked) => updateField("favorite", checked)}
                />
                <Label htmlFor="favorite" className="text-sm">Add to Favorites</Label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  className="h-9"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Additional notes about this contact..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {contact ? "Updating..." : "Creating..."}
                </>
              ) : (
                `${contact ? "Update" : "Create"} Contact`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}