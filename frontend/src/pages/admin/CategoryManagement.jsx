import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Search, Plus, Edit, Loader2, Check, X } from "lucide-react"
import AddCategoryModal from "./components/AddCategoryModal"
import EditCategoryModal from "./components/EditCategoryModal"
import AdminHeader from "./components/AdminHeader"
import Sidebar from "./components/Sidebar"
import axiosInstance from "@/utils/axiosInstance"


const CategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/categories/")
      setCategories(response.data.categories || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories. Please try again.")
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const handleAddCategory = () => {
    setShowAddModal(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setShowEditModal(true)
  }

  const handleToggleStatus = async (categoryId, currentStatus) => {
    setUpdatingStatus(categoryId)
    try {
      await axiosInstance.patch(`/categories/update/${categoryId}/`, {
        is_listed: !currentStatus,
      })
      setCategories(
        categories.map((cat) => (cat.categoryId === categoryId ? { ...cat, is_listed: !currentStatus } : cat)),
      )

      toast.success(`Category ${!currentStatus ? "published" : "unpublished"} successfully`)
    } catch (err) {
      console.error("Error updating category status:", err)
      toast.error("Failed to update category status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredCategories = searchTerm
    ? categories.filter((cat) => cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
    : categories

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 pt-16">
        <Sidebar />

        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Category Management</h1>

            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>

          <div className="bg-white rounded-md shadow-sm">
            {/* Search */}
            <div className="p-4 border-b">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 w-full md:w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Loading categories...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? "No categories match your search" : "No categories found"}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.categoryId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.categoryId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            {category.image ? (
                              <img
                                src={category.image || "/placeholder.svg"}
                                alt={category.categoryName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.categoryName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(category.categoryId, category.is_listed)}
                            disabled={updatingStatus === category.categoryId}
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                              category.is_listed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {updatingStatus === category.categoryId ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : category.is_listed ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            {category.is_listed ? "Published" : "Unpublished"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false)
          fetchCategories()
        }}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        category={selectedCategory}
        onSuccess={() => {
          setShowEditModal(false)
          fetchCategories()
        }}
      />
    </div>
  )
}

export default CategoryManagement