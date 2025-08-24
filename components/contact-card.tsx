"use client";

import {
  User,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  Flag,
  Eye,
  PhoneCall,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Contact } from "@/types/contact";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onView?: (contact: Contact) => void;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
  onToggleImportant?: (id: string, important: boolean) => void;
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onView,
  onToggleFavorite,
  onToggleImportant,
}: Readonly<ContactCardProps>) {
  const fullName = `${contact.title ? contact.title + " " : ""}${contact.firstName} ${contact.lastName}`;

  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardHeader className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Header Row with Name and Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg tracking-tight truncate">
                    {fullName}
                  </h3>
                  {contact.jobTitle && contact.company && (
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.jobTitle} at {contact.company}
                    </p>
                  )}
                  {contact.jobTitle && !contact.company && (
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.jobTitle}
                    </p>
                  )}
                  {!contact.jobTitle && contact.company && (
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                {contact.important && (
                  <Badge variant="destructive" className="text-xs">
                    <Flag className="h-3 w-3 mr-1" />
                    Important
                  </Badge>
                )}

                {contact.favorite && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Favorite
                  </Badge>
                )}

                {contact.tags && contact.tags.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {contact.tags.length} tag{contact.tags.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <TooltipProvider>
              <div className="flex items-center gap-1 shrink-0">
                {onView && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => onView(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View details</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => onEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit contact</p>
                  </TooltipContent>
                </Tooltip>

                {onToggleFavorite && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 transition-colors ${
                          contact.favorite
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20"
                        }`}
                        onClick={() => onToggleFavorite(contact.id, !contact.favorite)}
                      >
                        <Star className={`h-4 w-4 ${contact.favorite ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{contact.favorite ? "Remove from favorites" : "Add to favorites"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {onToggleImportant && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 transition-colors ${
                          contact.important
                            ? "text-red-500 hover:text-red-600"
                            : "hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                        }`}
                        onClick={() => onToggleImportant(contact.id, !contact.important)}
                      >
                        <Flag className={`h-4 w-4 ${contact.important ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{contact.important ? "Remove from important" : "Mark as important"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeleteConfirmDialog
                      itemName={fullName}
                      itemType="contact"
                      onConfirm={() => onDelete(contact.id)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteConfirmDialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete contact</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div className="space-y-3">
          {/* Contact Information Grid */}
          <div className="grid gap-3">
            {/* Phone */}
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{contact.phone}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Primary phone</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:bg-primary/10"
                    onClick={() => handlePhoneCall(contact.phone)}
                  >
                    <PhoneCall className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Email */}
            {contact.email && (
              <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.email}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-primary/10"
                      onClick={() => handleEmail(contact.email!)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-medium">{contact.location}</p>
                <p className="text-xs text-muted-foreground">Location</p>
              </div>
            </div>

            {/* Company */}
            {contact.company && (
              <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
                <Building className="h-4 w-4 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{contact.company}</p>
                  <p className="text-xs text-muted-foreground">Company</p>
                </div>
              </div>
            )}

            {/* Alternative Phone */}
            {contact.alternativePhone && (
              <div className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.alternativePhone}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Alternative phone</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-primary/10"
                      onClick={() => handlePhoneCall(contact.alternativePhone!)}
                    >
                      <PhoneCall className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="p-2.5 bg-secondary/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="p-2.5 bg-secondary/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{contact.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}