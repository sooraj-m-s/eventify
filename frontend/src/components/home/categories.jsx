import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/categories/")
        console.log(response.data);
        
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

  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { categoryId: "1", categoryName: "Conferences/Tech Meetups", image: "/placeholder.svg?height=200&width=300" },
          {
            categoryId: "2",
            categoryName: "Startup & Innovation Pitches",
            image: "/placeholder.svg?height=200&width=300",
          },
          { categoryId: "3", categoryName: "Tech Networking Events", image: "/placeholder.svg?height=200&width=300" },
          { categoryId: "4", categoryName: "Training Sessions", image: "/placeholder.svg?height=200&width=300" },
        ]

  const totalPages = Math.ceil(displayCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentCategories = displayCategories.slice(startIndex, startIndex + itemsPerPage)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Browse By Category</h2>
        <div className="text-sm">View all ({displayCategories.length})</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentCategories.map((category) => (
          <div key={category.categoryId} className="relative group cursor-pointer">
            <div className="overflow-hidden rounded-lg">
              <img
                src={category.image || `/placeholder.svg?height=200&width=300`}
                alt={category.categoryName}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="mt-2 text-center font-medium">{category.categoryName}</h3>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`w-8 h-8 flex items-center justify-center rounded-full border ${
              currentPage === 1 ? "text-gray-400 border-gray-200" : "text-black border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentPage === i + 1 ? "bg-black text-white" : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded-full border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-black border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Categories