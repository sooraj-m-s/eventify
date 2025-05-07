import { useState } from "react"
import { useEffect } from "react"
import axiosInstance from "../../utils/axiosInstance"
import heroBackground from "../../assets/home-banner.jpg"


const HeroSection = () => {
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories/")
        setCategories(response.data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Searching for:", { category, location })
    } catch (error) {
      console.error("Error searching events:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative h-[400px] md:h-[500px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
          Love in Every Detail, Planned for You
        </h1>

        <form onSubmit={handleSearch} className="w-full max-w-3xl flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <select
              className="w-full px-4 py-3 rounded-md text-black"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <select
              className="w-full px-4 py-3 rounded-md text-black"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Location</option>
              <option value="india">India</option>
              <option value="usa">USA</option>
              <option value="uk">UK</option>
              <option value="dubai">Dubai</option>
              <option value="germany">Germany</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors disabled:bg-gray-300"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default HeroSection