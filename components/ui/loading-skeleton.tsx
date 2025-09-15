"use client"

import { Card, CardContent } from "@/components/ui/card"

export function SaleSectionSkeleton() {
  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Image skeleton */}
                  <div className="relative mb-4">
                    <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="absolute top-2 left-2 h-6 w-12 bg-gray-300 rounded animate-pulse"></div>
                  </div>

                  {/* Content skeleton */}
                  <div className="flex-1 flex flex-col">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                    
                    {/* Supplier skeleton */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* Price skeleton */}
                    <div className="mb-3">
                      <div className="h-5 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>

                    {/* Stock skeleton */}
                    <div className="mb-4">
                      <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>

                    {/* Buttons skeleton */}
                    <div className="flex gap-2 mt-auto">
                      <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Image skeleton */}
        <div className="relative mb-4">
          <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
          
          {/* Supplier skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Price skeleton */}
          <div className="mb-3">
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>

          {/* Stock skeleton */}
          <div className="mb-4">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-2 mt-auto">
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}