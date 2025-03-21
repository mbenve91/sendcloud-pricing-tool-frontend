"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, Eye } from "lucide-react"

// Mock data for knowledge base items
const knowledgeBaseItems = [
  {
    id: "1",
    title: "Shipping Guidelines",
    content: "Detailed guidelines for shipping with BRT",
    category: "shipping",
    isActive: true,
    createdAt: "2023-02-10T10:30:00Z",
  },
  {
    id: "2",
    title: "Return Policy",
    content: "Information about return procedures and policies",
    category: "returns",
    isActive: true,
    createdAt: "2023-03-15T14:45:00Z",
  },
  {
    id: "3",
    title: "Tracking Information",
    content: "How to track shipments and interpret tracking statuses",
    category: "tracking",
    isActive: true,
    createdAt: "2023-04-20T09:15:00Z",
  },
  {
    id: "4",
    title: "Pricing Structure",
    content: "Explanation of pricing tiers and additional fees",
    category: "pricing",
    isActive: false,
    createdAt: "2023-05-05T11:30:00Z",
  },
  {
    id: "5",
    title: "Contact Information",
    content: "Customer service and support contact details",
    category: "general",
    isActive: true,
    createdAt: "2023-06-12T16:20:00Z",
  },
]

export function KnowledgeBaseList({ carrierId }: { carrierId: string }) {
  const [items] = useState(knowledgeBaseItems)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

