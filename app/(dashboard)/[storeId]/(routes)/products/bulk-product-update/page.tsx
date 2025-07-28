"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Plus, Trash, Search, Package, Edit, CheckCircle, AlertCircle, X } from "lucide-react";

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

// This interface now includes all original product details for reference
type ProductWithDetails = {
    id: string;
    name: string;
    barCode: string;
    price: number;
    category: { name: string };
};

// This type defines the shape of our changes. All fields are optional.
type ProductChanges = {
    name?: string;
    barCode?: string;
    price?: string; // Stored as string from input
};

export default function BulkUpdateProductsPage() {
    const params = useParams();
    const { toast } = useToast();

    // --- STATE MANAGEMENT ---
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<ProductWithDetails[]>([]);
    const [stagedProducts, setStagedProducts] = useState<ProductWithDetails[]>([]);
    
    // State to hold all pending changes, keyed by productId
    const [changes, setChanges] = useState<Record<string, ProductChanges>>({});
    // State to hold validation errors, keyed by productId and field name
    const [errors, setErrors] = useState<Record<string, Partial<Record<keyof ProductChanges, string>>>>({});
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // --- 1. SEARCH LOGIC (Unchanged) ---
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
            toast({ title: "Search Failed", description: "Unable to search products.", variant: "destructive" });
        } finally {
            setSearchLoading(false);
        }
    };

    // --- 2. STAGING LOGIC ---
    const addProductToStage = (product: ProductWithDetails) => {
        if (stagedProducts.some(p => p.id === product.id)) {
            toast({ title: "Product Already Staged", description: "This product is already in the update list." });
            return;
        }
        setStagedProducts(prev => [...prev, product]);
        toast({ title: "Product Added", description: `${product.name} has been staged for updates.` });
    };

    const removeProductFromStage = (productId: string) => {
        setStagedProducts(prev => prev.filter(p => p.id !== productId));
        // Also remove any pending changes or errors for that product
        setChanges(prev => {
            const newChanges = { ...prev };
            delete newChanges[productId];
            return newChanges;
        });
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[productId];
            return newErrors;
        });
    };

    // --- 3. DYNAMIC CHANGE AND VALIDATION LOGIC ---
    const handleFieldChange = (productId: string, field: keyof ProductChanges, value: string) => {
        // Update the changes state
        setChanges(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
            }
        }));

        // Perform validation
        let error: string | undefined = undefined;
        if (field === 'name' && value.trim() === '') {
            error = "Name cannot be empty.";
        } else if (field === 'price' && value !== '') {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) {
                error = "Must be a positive number.";
            }
        }
        
        // Update the errors state
        setErrors(prev => {
            const newErrors = { ...prev };
            if (!newErrors[productId]) newErrors[productId] = {};
            if (error) {
                newErrors[productId][field] = error;
            } else {
                delete newErrors[productId][field];
                if (Object.keys(newErrors[productId]).length === 0) {
                    delete newErrors[productId];
                }
            }
            return newErrors;
        });
    };
    
    // --- 4. SUBMIT LOGIC ---
    const onBulkUpdate = async () => {
        setLoading(true);
        try {
            // Transform the `changes` state into the payload for the API
            const payload = Object.entries(changes)
                .map(([productId, changedFields]) => {
                    const parsedFields: { id: string, [key: string]: any } = { id: productId };
                    let hasValidChange = false;

                    // Process each potential change
                    if (changedFields.name?.trim()) {
                        parsedFields.name = changedFields.name.trim();
                        hasValidChange = true;
                    }
                    if (changedFields.barCode?.trim()) {
                        parsedFields.barCode = changedFields.barCode.trim();
                        hasValidChange = true;
                    }
                    if (changedFields.price) {
                        const numPrice = parseFloat(changedFields.price);
                        if (!isNaN(numPrice) && numPrice > 0) {
                            parsedFields.price = numPrice;
                            hasValidChange = true;
                        }
                    }
                    return hasValidChange ? parsedFields : null;
                })
                .filter(p => p !== null);

            if (payload.length === 0) {
                toast({ title: "No Changes", description: "No valid changes to save.", variant: "destructive" });
                return;
            }

            await axios.patch(`/api/${params.storeId}/products/bulk-product-update`, { products: payload });
            toast({ title: "Update Successful", description: `${payload.length} products have been updated.` });

            // Reset state completely
            setStagedProducts([]);
            setChanges({});
            setErrors({});

        } catch (error) {
            toast({ title: "Update Failed", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setLoading(false);
            setIsConfirmModalOpen(false);
        }
    };

    // --- DERIVED STATE & HELPERS ---
    const productsWithValidChanges = Object.keys(changes).filter(id => 
        Object.values(changes[id]).some(val => val && val.trim() !== '') && !errors[id]
    ).length;
    
    const hasErrors = Object.keys(errors).length > 0;

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
                    <Heading 
                        title="Bulk Product Update" 
                        description="Search and efficiently update multiple fields for your products." 
                    />
                    <Separator />

                    {/* --- Search Section (Mostly Unchanged) --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Search /> Search Products</CardTitle>
                            <CardDescription>Search by name or barcode to stage products for editing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                {/* Search Input and Buttons... same as before */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name or barcode..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-10" disabled={searchLoading} />
                                </div>
                                <Button onClick={handleSearch} disabled={searchLoading || !searchTerm.trim()} className="min-w-[100px]">
                                    {searchLoading ? "Searching..." : "Search"}
                                </Button>
                                {searchTerm && <Button variant="outline" size="icon" onClick={() => { setSearchTerm(""); setSearchResults([]); setShowSearchResults(false); }}><X className="h-4 w-4" /></Button>}
                            </div>
                            
                            {/* Search Results... same as before */}
                            {showSearchResults && (
                                <div className="border rounded-lg">
                                    {searchLoading ? <div className="p-4 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div> : 
                                    searchResults.length > 0 ? (
                                        <div className="max-h-60 overflow-y-auto">
                                            {searchResults.map(product => (
                                                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0" onClick={() => addProductToStage(product)}>
                                                    <div>
                                                        <div className="flex items-center gap-2 font-medium"><Package className="h-4 w-4 text-muted-foreground" /> {product.name}</div>
                                                        <div className="text-sm text-muted-foreground mt-1">{product.barCode} • {product.category.name} • ₱{product.price.toFixed(2)}</div>
                                                    </div>
                                                    <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /> <h3 className="font-semibold">No Products Found</h3><p className="text-sm text-muted-foreground">Try adjusting your search terms.</p></div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* --- Staged Products Editable Table --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Edit /> Product Updates ({stagedProducts.length})</CardTitle>
                            <CardDescription>Modify product details below. Only non-empty fields will be updated.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stagedProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Edit className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Products Staged</h3>
                                    <p className="text-muted-foreground mb-4">Search for products to begin editing.</p>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[200px]">Product</TableHead>
                                                <TableHead className="min-w-[200px]">Name</TableHead>
                                                <TableHead className="min-w-[200px]">Barcode</TableHead>
                                                <TableHead className="min-w-[150px]">Price</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stagedProducts.map(product => {
                                                const productChanges = changes[product.id] || {};
                                                const productErrors = errors[product.id] || {};
                                                
                                                return (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="font-medium">
                                                            <div>{product.name}</div>
                                                            <div className="text-xs text-muted-foreground">{product.barCode}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input 
                                                                placeholder={product.name}
                                                                value={productChanges.name ?? ''}
                                                                onChange={(e) => handleFieldChange(product.id, 'name', e.target.value)}
                                                                className={cn(productErrors.name && "border-destructive")}
                                                                disabled={loading}
                                                            />
                                                            {productErrors.name && <p className="text-xs text-destructive mt-1">{productErrors.name}</p>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input 
                                                                placeholder={product.barCode}
                                                                value={productChanges.barCode ?? ''}
                                                                onChange={(e) => handleFieldChange(product.id, 'barCode', e.target.value)}
                                                                disabled={loading}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                             <Input 
                                                                placeholder={product.price.toFixed(2)}
                                                                value={productChanges.price ?? ''}
                                                                onChange={(e) => handleFieldChange(product.id, 'price', e.target.value)}
                                                                className={cn("font-mono", productErrors.price && "border-destructive")}
                                                                disabled={loading}
                                                            />
                                                            {productErrors.price && <p className="text-xs text-destructive mt-1">{productErrors.price}</p>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" onClick={() => removeProductFromStage(product.id)} disabled={loading}>
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

                    {/* --- Action Section --- */}
                    {stagedProducts.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {hasErrors ? <AlertCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
                                        <span className="font-medium">
                                            {hasErrors ? `${Object.keys(errors).length} products have errors` : `${productsWithValidChanges} products ready for update`}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => { setStagedProducts([]); setChanges({}); setErrors({}); }} disabled={loading}>Clear All</Button>
                                        <Button onClick={() => setIsConfirmModalOpen(true)} disabled={loading || productsWithValidChanges === 0 || hasErrors}>
                                            {loading ? "Updating..." : `Update ${productsWithValidChanges} Products`}
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