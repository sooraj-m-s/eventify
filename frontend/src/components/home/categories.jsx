import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axiosInstance"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useNavigate } from "react-router-dom"


const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/categories/")

        setCategories(response.data.categories || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to load categories. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Browse By Category</h2>
          <span>Loading categories...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-40 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Browse By Category</h2>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  const handleViewAllClick = () => {
    navigate("/events")
  }

  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Browse By Category</h2>
        <button
          onClick={handleViewAllClick}
          className="text-sm text-black-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
        >
          View all ({categories.length >= 5 ? "5+" : categories.length})
        </button>
      </div>

      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {categories.map((category) => (
            <CarouselItem key={category.categoryId} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
              <div className="relative group cursor-pointer p-1">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={category.image || `/placeholder.svg?height=200&width=300`}
                    alt={category.categoryName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-2 text-center font-medium">{category.categoryName}</h3>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  )
}

export default Categories