"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import type { Contact } from "@/types/contact";
import { CONTACT_TITLES, CONTACT_CATEGORIES } from "@/types/contact";

// Zod schema for contact form validation
const contactFormSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms"] as const).optional(),
  firstName: z.string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z.string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
  email: z.string()
    .email({ message: "Invalid email format" })
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .min(1, { message: "Phone number is required" })
    .regex(/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/, { message: "Invalid phone number format" }),
  alternativePhone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone) return true; // Optional field
      const phoneRegex = /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/;
      return phoneRegex.test(phone);
    }, { message: "Invalid phone number format" }),
  company: z.string()
    .max(100, { message: "Company name must not exceed 100 characters" })
    .optional(),
  jobTitle: z.string()
    .max(100, { message: "Job title must not exceed 100 characters" })
    .optional(),
  location: z.string()
    .min(1, { message: "Location is required" })
    .max(100, { message: "Location must not exceed 100 characters" }),
  address: z.string()
    .max(200, { message: "Address must not exceed 200 characters" })
    .optional(),
  city: z.string()
    .max(50, { message: "City must not exceed 50 characters" })
    .optional(),
  state: z.string()
    .max(50, { message: "State must not exceed 50 characters" })
    .optional(),
  country: z.string()
    .max(50, { message: "Country must not exceed 50 characters" })
    .optional(),
  postalCode: z.string()
    .max(20, { message: "Postal code must not exceed 20 characters" })
    .optional(),
  notes: z.string()
    .max(1000, { message: "Notes must not exceed 1000 characters" })
    .optional(),
  tags: z.array(z.string().min(1).max(30))
    .optional(),
  category: z.enum(["friends", "family", "colleagues", "business", "clients", "vendors", "personal", "other"] as const),
  important: z.boolean(),
  favorite: z.boolean(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function ContactForm({
  contact,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<ContactFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
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
      category: "personal",
      important: false,
      favorite: false,
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
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
        category: contact.category || "personal",
        important: contact.important,
        favorite: contact.favorite,
      });
    } else if (isOpen) {
      // Reset form for new contact
      form.reset({
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
        category: "personal",
        important: false,
        favorite: false,
      });
    }
    setTagInput("");
    setTagError("");
  }, [contact, isOpen, form]);

  const handleSubmitForm = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const contactData = {
        ...data,
        email: data.email || "",
        alternativePhone: data.alternativePhone || "",
        company: data.company || "",
        jobTitle: data.jobTitle || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        postalCode: data.postalCode || "",
        notes: data.notes || "",
        tags: data.tags || [],
        important: data.important,
        favorite: data.favorite,
      };

      console.log("Submitting contact with category:", contactData.category);
      await onSubmit(contactData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    setTagError("");

    if (!trimmedTag) {
      setTagError("Please enter a tag");
      return;
    }

    if (trimmedTag.length > 30) {
      setTagError("Tag must not exceed 30 characters");
      return;
    }

    const currentTags = form.getValues("tags") ?? [];
    
    if (currentTags.includes(trimmedTag)) {
      setTagError("This tag already exists");
      return;
    }

    form.setValue("tags", [...currentTags, trimmedTag]);
    setTagInput("");
    setTagError("");
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") ?? [];
    form.setValue("tags", currentTags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl border-b border-gray-200 pb-2">
            {contact ? "Edit Contact" : "Create Contact"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-600">Essential contact details</p>
              </div>
              
              {/* Name Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Title</FormLabel>
                      <Select 
                        value={field.value || "none"} 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="none">None</SelectItem>
                          {CONTACT_TITLES.map((title) => (
                            <SelectItem key={title} value={title!}>
                              {title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">First Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Last Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information - Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Alternative Phone and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="alternativePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8901"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional secondary phone number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {CONTACT_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Work Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
                <p className="text-sm text-gray-600">Company and job details</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Inc."
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Software Engineer"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
                <p className="text-sm text-gray-600">Address and location details</p>
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="New York, NY"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NY"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="United States"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10001"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, Apt 4B"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                <p className="text-sm text-gray-600">Tags, notes, and preferences</p>
              </div>

              {/* Flags */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="important"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Mark as Important</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favorite"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Add to Favorites</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tags</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setTagError("");
                        }}
                        placeholder="Add tag"
                        className="h-9"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
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
                    {tagError && (
                      <p className="text-destructive text-sm">{tagError}</p>
                    )}
                    {field.value && field.value?.length && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {field.value.map((tag) => (
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
                    <FormDescription>
                      Add tags to categorize and organize contacts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this contact..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes or additional information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-3">
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
                  `${contact ? "Update" : "Create"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}