"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Trash, Search, Package, DollarSign, CheckCircle, AlertCircle, X } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertModal } from "@/components/modals/alert-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Define a more specific type for the product data we expect from the API
type ProductWithDetails = {
    id: string;
    name: string;
    barCode: string;
    price: number;
    category: { name: string };
    size: { name: string };
    color: { name: string };
};

export default function UpdatePricesPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<ProductWithDetails[]>([]);
    const [stagedProducts, setStagedProducts] = useState<ProductWithDetails[]>([]);
    const [newPrices, setNewPrices] = useState<Record<string, string>>({});
    const [priceErrors, setPriceErrors] = useState<Record<string, string>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // --- 1. SEARCH LOGIC ---
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        try {
            setSearchLoading(true);
            const response = await axios.get(`/api/${params.storeId}/products/search?q=${searchTerm}`);
            setSearchResults(response.data);
            setShowSearchResults(true);
        } catch (error) {
            toast({ 
                title: "Search Failed", 
                description: "Unable to search products. Please try again.", 
                variant: "destructive" 
            });
        } finally {
            setSearchLoading(false);
        }
    };

    // --- 2. STAGING LOGIC ---
    const addProductToStage = (product: ProductWithDetails) => {
        if (stagedProducts.find(p => p.id === product.id)) {
            toast({ 
                title: "Product Already Added", 
                description: "This product is already in your update list.",
                variant: "default" 
            });
            return;
        }
        setStagedProducts(prev => [...prev, product]);
        toast({
            title: "Product Added",
            description: `${product.name} has been added to your update list.`,
        });
    };
    
    const removeProductFromStage = (productId: string) => {
        setStagedProducts(prev => prev.filter(p => p.id !== productId));
        setNewPrices(prev => {
            const updatedPrices = { ...prev };
            delete updatedPrices[productId];
            return updatedPrices;
        });
        setPriceErrors(prev => {
            const updatedErrors = { ...prev };
            delete updatedErrors[productId];
            return updatedErrors;
        });
    };
    
    const handlePriceChange = (productId: string, value: string) => {
        // Allow empty string, numbers, and decimal points
        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            setNewPrices(prev => ({ ...prev, [productId]: value }));
            
            // Validate price
            const numValue = parseFloat(value);
            if (value !== "" && (isNaN(numValue) || numValue <= 0)) {
                setPriceErrors(prev => ({ ...prev, [productId]: "Price must be greater than 0" }));
            } else {
                setPriceErrors(prev => {
                    const updatedErrors = { ...prev };
                    delete updatedErrors[productId];
                    return updatedErrors;
                });
            }
        }
    };

    // --- 3. SUBMIT LOGIC ---
    const onBulkUpdate = async () => {
        try {
            setLoading(true);
            // Filter out products without a new price and format the payload
            const payload = Object.entries(newPrices)
                .filter(([_, price]) => price.trim() !== "")
                .map(([productId, price]) => ({
                    id: productId,
                    price: parseFloat(price)
                }));
            
            if (payload.length === 0) {
                toast({ 
                    title: "No Changes to Save", 
                    description: "Please enter a new price for at least one product.", 
                    variant: "destructive" 
                });
                return;
            }

            await axios.patch(`/api/${params.storeId}/products/bulk-update`, { products: payload });
            toast({ 
                title: "Prices Updated Successfully", 
                description: `${payload.length} product prices have been updated.`,
                variant: "default"
            });
            
            // Clear the state after successful update
            setStagedProducts([]);
            setNewPrices({});
            setPriceErrors({});

        } catch (error) {
            toast({ 
                title: "Update Failed", 
                description: "Failed to update prices. Please try again.", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
            setIsConfirmModalOpen(false);
        }
    };

    // Calculate summary statistics
    const validPriceChanges = Object.entries(newPrices).filter(([_, price]) => {
        const numValue = parseFloat(price);
        return price.trim() !== "" && !isNaN(numValue) && numValue > 0;
    });
    
    const totalPriceIncrease = validPriceChanges.reduce((total, [productId, newPrice]) => {
        const product = stagedProducts.find(p => p.id === productId);
        if (product) {
            return total + (parseFloat(newPrice) - product.price);
        }
        return total;
    }, 0);

    const hasErrors = Object.keys(priceErrors).length > 0;

    return (
        <>
            <AlertModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={onBulkUpdate}
                loading={loading}
            />
            
            <div className="flex-col">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <Heading 
                            title="Bulk Price Update" 
                            description="Search and update prices for multiple products efficiently." 
                        />
                        {stagedProducts.length > 0 && (
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-sm">
                                    {stagedProducts.length} Products Staged
                                </Badge>
                                {validPriceChanges.length > 0 && (
                                    <Badge variant={totalPriceIncrease >= 0 ? "default" : "destructive"} className="text-sm">
                                        {totalPriceIncrease >= 0 ? "+" : ""}₱{totalPriceIncrease.toFixed(2)} Total Change
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                    <Separator />

                    {/* Search Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search Products
                            </CardTitle>
                            <CardDescription>
                                Search by product name or barcode to add items to your update list.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or barcode..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                        disabled={searchLoading}
                                    />
                                </div>
                                <Button 
                                    onClick={handleSearch} 
                                    disabled={searchLoading || !searchTerm.trim()}
                                    className="min-w-[100px]"
                                >
                                    {searchLoading ? "Searching..." : "Search"}
                                </Button>
                                {searchTerm && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSearchResults([]);
                                            setShowSearchResults(false);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            {/* Search Results */}
                            {showSearchResults && (
                                <div className="border rounded-lg">
                                    {searchLoading ? (
                                        <div className="p-4 space-y-3">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="max-h-60 overflow-y-auto">
                                            {searchResults.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                    onClick={() => addProductToStage(product)}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{product.name}</span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {product.barCode} • {product.category.name} • ₱{product.price.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold">No Products Found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Try adjusting your search terms or check the spelling.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Staged Products Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Price Updates ({stagedProducts.length})
                            </CardTitle>
                            <CardDescription>
                                Review and modify prices for selected products before applying changes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stagedProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Products Staged</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Search for products above to begin updating prices.
                                    </p>
                                </div>
                            ) : (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[40%]">Product Details</TableHead>
                                                <TableHead className="w-[15%]">Current Price</TableHead>
                                                <TableHead className="w-[20%]">New Price</TableHead>
                                                <TableHead className="w-[15%]">Change</TableHead>
                                                <TableHead className="w-[10%]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stagedProducts.map(product => {
                                                const newPrice = newPrices[product.id] || "";
                                                const numNewPrice = parseFloat(newPrice);
                                                const hasValidPrice = newPrice !== "" && !isNaN(numNewPrice) && numNewPrice > 0;
                                                const priceChange = hasValidPrice ? numNewPrice - product.price : 0;
                                                const hasError = priceErrors[product.id];

                                                return (
                                                    <TableRow key={product.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {product.barCode} • {product.category.name}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono">₱{product.price.toFixed(2)}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <Input
                                                                    type="text"
                                                                    value={newPrice}
                                                                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                                    className={cn(
                                                                        "w-28 font-mono",
                                                                        hasError && "border-destructive focus:border-destructive"
                                                                    )}
                                                                    placeholder="₱0.00"
                                                                    disabled={loading}
                                                                />
                                                                {hasError && (
                                                                    <p className="text-xs text-destructive">{hasError}</p>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {hasValidPrice && (
                                                                <div className={cn(
                                                                    "flex items-center gap-1 font-mono text-sm",
                                                                    priceChange > 0 && "text-green-600",
                                                                    priceChange < 0 && "text-red-600",
                                                                    priceChange === 0 && "text-muted-foreground"
                                                                )}>
                                                                    {priceChange > 0 && "+"}₱{priceChange.toFixed(2)}
                                                                    {priceChange !== 0 && (
                                                                        <span className="text-xs">
                                                                            ({((priceChange / product.price) * 100).toFixed(1)}%)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                onClick={() => removeProductFromStage(product.id)} 
                                                                disabled={loading}
                                                                className="h-8 w-8"
                                                            >
                                                                <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                            </Button>
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

                    {/* Action Section */}
                    {stagedProducts.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {hasErrors ? (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            ) : validPriceChanges.length > 0 ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="font-medium">
                                                {validPriceChanges.length} of {stagedProducts.length} products ready for update
                                            </span>
                                        </div>
                                        {validPriceChanges.length > 0 && !hasErrors && (
                                            <p className="text-sm text-muted-foreground">
                                                Total price change: {totalPriceIncrease >= 0 ? "+" : ""}₱{totalPriceIncrease.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="outline"
                                            onClick={() => {
                                                setStagedProducts([]);
                                                setNewPrices({});
                                                setPriceErrors({});
                                            }}
                                            disabled={loading}
                                        >
                                            Clear All
                                        </Button>
                                        <Button 
                                            onClick={() => setIsConfirmModalOpen(true)} 
                                            disabled={loading || validPriceChanges.length === 0 || hasErrors}
                                            className="min-w-[140px]"
                                        >
                                            {loading ? "Updating..." : `Update ${validPriceChanges.length} Prices`}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}