"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Truck, Euro } from "lucide-react"
import apiService, { Carrier, Rate, CompareRatesParams } from "@/services/api"

export default function RateComparisonCard() {
  // State
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [weight, setWeight] = useState<number>(1)
  const [destinationType, setDestinationType] = useState<'national' | 'international' | 'both'>('national')
  const [destinationCountry, setDestinationCountry] = useState<string>('')
  const [minMargin, setMinMargin] = useState<number>(0)
  
  // Fetch carriers on component mount
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const data = await apiService.getCarriers();
        setCarriers(data);
      } catch (err) {
        console.error('Error fetching carriers:', err);
        setError('Failed to load carriers. Please try again later.');
      }
    };
    
    fetchCarriers();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const params: CompareRatesParams = {
        weight,
        destinationType,
        minMargin
      };
      
      if (destinationType !== 'national' && destinationCountry) {
        params.destinationCountry = destinationCountry;
      }
      
      const data = await apiService.compareRates(params);
      setRates(data);
    } catch (err) {
      console.error('Error comparing rates:', err);
      setError('Failed to compare rates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate delivery time display
  const getDeliveryTimeDisplay = (min: number, max: number) => {
    if (min === max) return `${min} days`;
    return `${min}-${max} days`;
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Rate Comparison Tool</CardTitle>
        <CardDescription>
          Compare shipping rates across carriers to find the best option for your client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Package Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  required
                />
              </div>
              
              <div>
                <Label>Destination Type</Label>
                <RadioGroup
                  value={destinationType}
                  onValueChange={(value) => setDestinationType(value as 'national' | 'international' | 'both')}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="national" id="national" />
                    <Label htmlFor="national">National</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="international" id="international" />
                    <Label htmlFor="international">International</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {destinationType !== 'national' && (
                <div>
                  <Label htmlFor="country">Destination Country</Label>
                  <Input
                    id="country"
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    placeholder="e.g. FR, DE, ES"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="margin">Minimum Margin (%)</Label>
                <div className="pt-4">
                  <Slider
                    id="margin"
                    min={0}
                    max={50}
                    step={1}
                    value={[minMargin]}
                    onValueChange={(value) => setMinMargin(value[0])}
                  />
                  <div className="flex justify-between mt-2">
                    <span>0%</span>
                    <span className="font-medium">{minMargin}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Comparing rates..." : "Compare Rates"}
              </Button>
            </div>
          </div>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {rates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium">Results</h3>
            <Separator className="my-4" />
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Retail Price</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => {
                  const carrier = typeof rate.carrier === 'object' ? rate.carrier : { name: 'Unknown', logoUrl: null };
                  
                  return (
                    <TableRow key={rate._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {carrier.logoUrl ? (
                            <img src={carrier.logoUrl} alt={carrier.name} className="h-6 w-auto" />
                          ) : (
                            <Truck className="h-5 w-5 text-gray-400" />
                          )}
                          <span>{carrier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{rate.serviceName}</div>
                          <div className="text-xs text-gray-500">{rate.serviceCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{getDeliveryTimeDisplay(rate.deliveryTimeMin, rate.deliveryTimeMax)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(rate.purchasePrice)}</TableCell>
                      <TableCell>{formatCurrency(rate.retailPrice)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Euro className="h-4 w-4 text-gray-400" />
                            <span>{formatCurrency(rate.margin)}</span>
                          </div>
                          <Badge variant={rate.marginPercentage >= 30 ? "success" : "default"}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {rate.marginPercentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
