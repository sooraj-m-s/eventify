import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  Search, Filter, ChevronLeft, ChevronRight, Loader, Calendar,
  MapPin, Users, IndianRupee, X, SlidersHorizontal
} from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"


const AdvancedSearchEvents = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [organizers, setOrganizers] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [priceRange, setPriceRange] = useState({ min_price: 0, max_price: 10000 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)

  const [filters, setFilters] = useState({
    search: "",
    organizer: "",
    category: "",
    location: "",
    startDate: null,
    endDate: null,
    minPrice: "",
    maxPrice: "",
    quickDate: "",
  })
  const [inputValues, setInputValues] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const debounceTimeoutRef = useRef(null)

  const quickDateOptions = [
    { value: "", label: "All Dates" },
    { value: "this_week", label: "This Week" },
    { value: "next_week", label: "Next Week" },
    { value: "this_month", label: "This Month" },
  ]

  const fetchEvents = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true)
      setIsSearching(false)
      const params = new URLSearchParams()
      params.append("page", page)

      if (currentFilters.search) params.append("search", currentFilters.search)
      if (currentFilters.organizer) params.append("organizer", currentFilters.organizer)
      if (currentFilters.category) params.append("category", currentFilters.category)
      if (currentFilters.location) params.append("location", currentFilters.location)
      if (currentFilters.startDate && !currentFilters.quickDate) {
        params.append("start_date", formatDate(currentFilters.startDate))
      }
      if (currentFilters.endDate && !currentFilters.quickDate) {
        params.append("end_date", formatDate(currentFilters.endDate))
      }
      if (currentFilters.minPrice) params.append("min_price", currentFilters.minPrice)
      if (currentFilters.maxPrice) params.append("max_price", currentFilters.maxPrice)
      if (currentFilters.quickDate) params.append("date_filter", currentFilters.quickDate)

      const response = await axiosInstance.get(`/events/?${params.toString()}`)

      if (response.data) {
        setEvents(response.data.events || [])
        setOrganizers(response.data.organizers || [])
        setCategories(response.data.categories || [])
        setLocations(response.data.locations || [])
        setPriceRange(response.data.price_range || { min_price: 0, max_price: 10000 })
        setTotalEvents(response.data.count || 0)

        const pageSize = 12
        setTotalPages(Math.ceil((response.data.count || 0) / pageSize))
        setError(null)
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError("Failed to load events. Please try again later.")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedUpdate = (newFilters, page = 1) => {
    setIsSearching(true)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setFilters(newFilters)
      setCurrentPage(page)
      fetchEvents(page, newFilters)
    }, 3000)
  }

  const handleSearchChange = (value) => {
    setInputValues((prev) => ({ ...prev, search: value }))
    const newFilters = { ...filters, search: value }
    debouncedUpdate(newFilters, 1)
  }

  const handleFilterChange = (filterType, value) => {
    let newFilters = { ...filters, [filterType]: value }
    if (filterType === "quickDate" && value) {
      newFilters = { ...newFilters, startDate: null, endDate: null }
    }

    setFilters(newFilters)
    debouncedUpdate(newFilters, 1)
  }

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates
    const newFilters = {
      ...filters,
      startDate: start,
      endDate: end,
      quickDate: start || end ? "" : filters.quickDate,
    }
    setFilters(newFilters)
    if (start && end) {
      debouncedUpdate(newFilters, 1)
    }
  }

  const handlePriceChange = (type, value) => {
    setInputValues((prev) => ({ ...prev, [type]: value }))
    const newFilters = { ...filters, [type]: value }
    debouncedUpdate(newFilters, 1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchEvents(page, filters)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleEventClick = (eventId) => {
    navigate(`/event_detial/${eventId}`)
  }

  const clearAllFilters = () => {
    const emptyFilters = {
      search: "",
      organizer: "",
      category: "",
      location: "",
      startDate: null,
      endDate: null,
      minPrice: "",
      maxPrice: "",
      quickDate: "",
    }
    const emptyInputs = {
      search: "",
      minPrice: "",
      maxPrice: "",
    }

    setFilters(emptyFilters)
    setInputValues(emptyInputs)
    setCurrentPage(1)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    fetchEvents(1, emptyFilters)
  }

  const formatDate = (date) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.organizer ||
      filters.category ||
      filters.location ||
      filters.startDate ||
      filters.endDate ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.quickDate
    )
  }

  useEffect(() => {
    fetchEvents(1)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Discover Events</h1>

      {/* Main Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search and Quick Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={inputValues.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search events by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter size={18} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={18} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Quick Date Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Date Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickDateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange("quickDate", option.value)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  filters.quickDate === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Organizer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer
                </label>
                <select
                  value={filters.organizer}
                  onChange={(e) => handleFilterChange("organizer", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Organizers</option>
                  {organizers.map((organizer) => (
                    <option key={organizer.user_id} value={organizer.user_id}>
                      {organizer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="mt-6">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <SlidersHorizontal size={18} />
                {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Custom Date Range */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Date Range
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <DatePicker
                        selectsRange={true}
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        onChange={handleDateRangeChange}
                        minDate={new Date()}
                        isClearable={true}
                        placeholderText="Select date range"
                        className="w-full focus:outline-none"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                    {filters.quickDate && (
                      <p className="text-xs text-gray-500 mt-1">Clear quick date filter to use custom range</p>
                    )}
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <IndianRupee
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="number"
                          value={inputValues.minPrice}
                          onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                          placeholder={`Min (₹${priceRange.min_price || 0})`}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="relative">
                        <IndianRupee
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="number"
                          value={inputValues.maxPrice}
                          onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                          placeholder={`Max (₹${priceRange.max_price || 10000})`}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{totalEvents} events found</span>
              {isSearching && (
                <span className="text-sm text-blue-600 flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Updating in 3s...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={() => fetchEvents(currentPage)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && events.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters()
              ? "Try adjusting your filters to find more events"
              : "There are no upcoming events at the moment"}
          </p>
          {hasActiveFilters() && (
            <button onClick={clearAllFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && events.length > 0 && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {events.length} of {totalEvents} events
            </div>
            {hasActiveFilters() && (
              <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <div
                key={event.eventId}
                onClick={() => handleEventClick(event.eventId)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.posterImage || `/placeholder.svg?height=200&width=300&query=event`}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {event.category_name && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {event.category_name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={16} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{event.location || "Online"}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Users size={16} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{event.organizer_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600 text-lg">₹{event.pricePerTicket}</span>
                    <span className="text-sm text-gray-500">{event.tickets_available} tickets left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdvancedSearchEvents