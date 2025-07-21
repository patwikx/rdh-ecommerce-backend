"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Plus, Trash, Search, Package, ShieldX, CheckCircle, AlertCircle, X, ShieldOff } from "lucide-react";

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

export default function DeactivateProductsPage() {
    const params = useParams();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<ProductWithDetails[]>([]);
    const [stagedProducts, setStagedProducts] = useState<ProductWithDetails[]>([]);
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
                description: "This product is already in your deactivation list.",
                variant: "default" 
            });
            return;
        }
        setStagedProducts(prev => [...prev, product]);
        toast({
            title: "Product Added",
            description: `${product.name} has been added to your deactivation list.`,
        });
    };
    
    const removeProductFromStage = (productId: string) => {
        setStagedProducts(prev => prev.filter(p => p.id !== productId));
    };

    // --- 3. SUBMIT LOGIC ---
    const onBulkDeactivate = async () => {
        try {
            setLoading(true);
            const payload = {
                productIds: stagedProducts.map(p => p.id)
            };
            
            if (payload.productIds.length === 0) {
                toast({ 
                    title: "No Products to Deactivate", 
                    description: "Please add at least one product to deactivate.", 
                    variant: "destructive" 
                });
                return;
            }

            await axios.patch(`/api/${params.storeId}/products/deactivate`, payload);
            toast({ 
                title: "Products Deactivated Successfully", 
                description: `${payload.productIds.length} products have been deactivated.`,
                variant: "default"
            });
            
            // Clear the state after successful deactivation
            setStagedProducts([]);

        } catch (error) {
            toast({ 
                title: "Deactivation Failed", 
                description: "Failed to deactivate products. Please try again.", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
            setIsConfirmModalOpen(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={onBulkDeactivate}
                loading={loading}
            />
            
            <div className="flex-col">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <Heading 
                            title="Bulk Product Deactivation" 
                            description="Search and deactivate multiple products efficiently." 
                        />
                        {stagedProducts.length > 0 && (
                            <div className="flex items-center gap-4">
                                <Badge variant="destructive" className="text-sm">
                                    {stagedProducts.length} Products Staged for Deactivation
                                </Badge>
                            </div>
                        )}
                    </div>
                    <Separator />

                    {/* Search Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search Active Products
                            </CardTitle>
                            <CardDescription>
                                Search by product name or barcode to add items to your deactivation list.
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
                                <ShieldOff className="h-5 w-5" />
                                Products for Deactivation ({stagedProducts.length})
                            </CardTitle>
                            <CardDescription>
                                Review selected products before deactivating them from your inventory.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stagedProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShieldOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Products Staged</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Search for products above to begin deactivating items.
                                    </p>
                                </div>
                            ) : (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[40%]">Product Details</TableHead>
                                                <TableHead className="w-[20%]">Barcode</TableHead>
                                                <TableHead className="w-[20%]">Category</TableHead>
                                                <TableHead className="w-[15%]">Current Price</TableHead>
                                                <TableHead className="w-[5%]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stagedProducts.map(product => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {product.size.name} • {product.color.name}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-sm">{product.barCode}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{product.category.name}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono">₱{product.price.toFixed(2)}</span>
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
                                            ))}
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
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                            <span className="font-medium">
                                                {stagedProducts.length} products ready for deactivation
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            These products will be removed from active inventory and unavailable for sale.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="outline"
                                            onClick={() => setStagedProducts([])}
                                            disabled={loading}
                                        >
                                            Clear All
                                        </Button>
                                        <Button 
                                            variant="destructive"
                                            onClick={() => setIsConfirmModalOpen(true)} 
                                            disabled={loading || stagedProducts.length === 0}
                                            className="min-w-[160px]"
                                        >
                                            <ShieldX className="mr-2 h-4 w-4" />
                                            {loading ? "Deactivating..." : `Deactivate ${stagedProducts.length} Products`}
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