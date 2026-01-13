import { Card } from "@/components/ui/card";

export default function ProductSkeleton() {
    return (
        <Card className="overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-muted rounded w-1/4" />
                    <div className="h-8 bg-muted rounded w-20" />
                </div>
            </div>
        </Card>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
