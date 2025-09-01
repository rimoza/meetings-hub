"use client";

import {
  Edit,
  Trash2,
  Phone,
  Mail,
  Star,
  Flag,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { CONTACT_CATEGORIES } from "@/types/contact";
import type { Contact } from "@/types/contact";

interface CompactContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onView?: (contact: Contact) => void;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
  onToggleImportant?: (id: string, important: boolean) => void;
}

export function CompactContactCard({
  contact,
  onEdit,
  onDelete,
  onView,
  onToggleFavorite,
  onToggleImportant,
}: Readonly<CompactContactCardProps>) {
  const fullName = `${contact.title ? contact.title + " " : ""}${contact.firstName} ${contact.lastName}`;
  const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
  
  const categoryInfo = CONTACT_CATEGORIES.find(cat => cat.value === (contact.category || "personal"));

  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500", 
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center p-3 bg-card rounded-lg border hover:shadow-md transition-all duration-200 group">
      {/* Avatar */}
      <Avatar className={`h-12 w-12 mr-3 ${getAvatarColor(fullName)}`}>
        <AvatarFallback className="text-white font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{fullName}</h3>
          <div className="flex items-center gap-1">
            {contact.important && (
              <Flag className="h-3 w-3 text-red-500 fill-current" />
            )}
            {contact.favorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {categoryInfo && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {categoryInfo.icon} {categoryInfo.label}
            </Badge>
          )}
          {contact.company && (
            <span className="truncate">{contact.company}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground truncate">
            {contact.phone}
          </span>
          {contact.email && (
            <span className="text-xs text-muted-foreground truncate">
              • {contact.email}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20"
          onClick={() => handlePhoneCall(contact.phone)}
        >
          <Phone className="h-4 w-4" />
        </Button>
        
        {contact.email && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
            onClick={() => handleEmail(contact.email!)}
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(contact)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => onEdit(contact)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {onToggleFavorite && (
              <DropdownMenuItem 
                onClick={() => onToggleFavorite(contact.id, !contact.favorite)}
              >
                <Star className={`h-4 w-4 mr-2 ${contact.favorite ? "fill-current" : ""}`} />
                {contact.favorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
            )}
            
            {onToggleImportant && (
              <DropdownMenuItem 
                onClick={() => onToggleImportant(contact.id, !contact.important)}
              >
                <Flag className={`h-4 w-4 mr-2 ${contact.important ? "fill-current" : ""}`} />
                {contact.important ? "Remove Important" : "Mark Important"}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DeleteConfirmDialog
              itemName={fullName}
              itemType="contact"
              onConfirm={() => onDelete(contact.id)}
            >
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Contact
              </DropdownMenuItem>
            </DeleteConfirmDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}