import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"

const Organizers = () => {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const sliderRef = useRef(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance("/users/organizers/")
        setOrganizers(response.data || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching organizers:", err)
        setError("Failed to load organizers. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizers()
  }, [])

  if (loading) {
    return (
      <div className="my-16">
        <h2 className="text-2xl font-semibold mb-8 text-center relative">
          <span className="relative z-10 bg-white px-4">Our Organizers</span>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-0"></div>
        </h2>
        <div className="flex gap-4 overflow-hidden px-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[200px] bg-gray-200 animate-pulse h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-16">
        <h2 className="text-2xl font-semibold mb-8 text-center relative">
          <span className="relative z-10 bg-white px-4">Our Organizers</span>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-0"></div>
        </h2>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    )
  }

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2

      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })

      setScrollPosition(scrollTo)
    }
  }

  const handleScroll = () => {
    if (sliderRef.current) {
      setScrollPosition(sliderRef.current.scrollLeft)
    }
  }

  return (
    <div className="my-16 relative">
      <h2 className="text-2xl font-semibold mb-8 text-center relative">
        <span className="relative z-10 bg-white px-4">Our Organizers</span>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-0"></div>
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          { organizers.length > 0 ? (
              organizers.map((organizer) => (
                <div key={organizer.id} className="min-w-[200px] flex-shrink-0 cursor-pointer group">
                  <div className="overflow-hidden rounded-lg h-64">
                    <img
                      src={organizer.user.profile_image || `/placeholder.svg?height=300&width=200`}
                      alt={organizer.user.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-2 text-center font-medium">{organizer.user.full_name}</h3>
                </div>
              ))
            ) : 'Nothin to show'
          }
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}

export default Organizers