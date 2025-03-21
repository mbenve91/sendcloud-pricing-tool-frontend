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
import { Edit, MoreHorizontal, Trash2, ExternalLink, Tag } from "lucide-react"
import Link from "next/link"

// Mock data for services
const services = [
  {
    id: "1",
    name: "Express",
    code: "BRT-EXP",
    description: "Next day delivery service",
    destinationType: "national",
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    isActive: true,
    ratesCount: 12,
  },
  {
    id: "2",
    name: "Standard",
    code: "BRT-STD",
    description: "Standard delivery service",
    destinationType: "national",
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    isActive: true,
    ratesCount: 15,
  },
  {
    id: "3",
    name: "Economy",
    code: "BRT-ECO",
    description: "Budget-friendly delivery option",
    destinationType: "national",
    deliveryTimeMin: 72,
    deliveryTimeMax: 96,
    isActive: true,
    ratesCount: 10,
  },
  {
    id: "4",
    name: "International Express",
    code: "BRT-INTL-EXP",
    description: "Fast international shipping",
    destinationType: "international",
    deliveryTimeMin: 48,
    deliveryTimeMax: 96,
    isActive: true,
    ratesCount: 18,
  },
  {
    id: "5",
    name: "Return Service",
    code: "BRT-RET",
    description: "Service for handling returns",
    destinationType: "national",
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    isActive: false,
    ratesCount: 9,
  },
]

export function CarrierServicesList({ carrierId }: { carrierId: string }) {
  const [filteredServices] = useState(services)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.code}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {service.destinationType}
                  </Badge>
                </TableCell>
                <TableCell>
                  {service.deliveryTimeMin}-{service.deliveryTimeMax} hours
                </TableCell>
                <TableCell>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{service.ratesCount}</span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/rates?service=${service.id}`}>
                        <Tag className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/services/${service.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/services/${service.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/rates?service=${service.id}`}>
                          <Tag className="mr-2 h-4 w-4" />
                          <span>View Rates</span>
                        </Link>
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

