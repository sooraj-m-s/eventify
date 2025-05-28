import { useState, useEffect, useCallback, useRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell
} from "recharts"
import {
  Calendar, FileSpreadsheet, FileIcon as FilePdf, RefreshCw, IndianRupee,
  Users, ShoppingBag, TrendingUp, Filter
} from "lucide-react"
import OrganizerSidebar from "./components/OrganizerSidebar"
import axiosInstance from "../../utils/axiosInstance"
import { toast } from "sonner"


const OrganizerDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState("")
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange
  const [eventStatus, setEventStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const filterTimeoutRef = useRef(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current)
    }
    filterTimeoutRef.current = setTimeout(() => {
      fetchDashboardData()
    }, 3000)

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [selectedEvent, startDate, endDate, eventStatus, paymentStatus])

  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (selectedEvent) {
        params.append("event_id", selectedEvent)
      }
      if (startDate) {
        params.append("start_date", formatDate(startDate))
      }
      if (endDate) {
        params.append("end_date", formatDate(endDate))
      }
      if (eventStatus) {
        params.append("event_status", eventStatus)
      }
      if (paymentStatus) {
        params.append("payment_status", paymentStatus)
      }

      const response = await axiosInstance.get(`/organizer/dashboard/?${params.toString()}`)

      if (response.data.success) {
        setDashboardData(response.data.data)
        setEvents(response.data.data.events || [])
        setError(null)
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [selectedEvent, startDate, endDate, eventStatus, paymentStatus])

  const handleDownloadReport = async (format) => {
    try {
      setDownloadingReport(true)
      setDownloadFormat(format)

      const params = new URLSearchParams()
      params.append("format", format)
      if (selectedEvent) {
        params.append("event_id", selectedEvent)
      }
      if (startDate) {
        params.append("start_date", formatDate(startDate))
      }
      if (endDate) {
        params.append("end_date", formatDate(endDate))
      }
      if (paymentStatus) {
        params.append("payment_status", paymentStatus)
      }

      const response = await axiosInstance.get(`/organizer/dashboard/download_report/?${params.toString()}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url

      const date = new Date().toISOString().split("T")[0]
      link.setAttribute("download", `organizer_revenue_report_${date}.${format === "excel" ? "xlsx" : "pdf"}`)

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success(`${format.toUpperCase()} report downloaded successfully!`)
    } catch (err) {
      console.error(`Error downloading ${format} report:`, err)
      toast.error(`Failed to download ${format} report. Please try again later.`)
    } finally {
      setDownloadingReport(false)
      setDownloadFormat(null)
    }
  }

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const prepareMonthlyChartData = () => {
    if (!dashboardData || !dashboardData.monthly_revenue) {
      return []
    }

    return dashboardData.monthly_revenue.slice(-6).map((item) => ({
      month: item.month_name.split(" ")[0],
      total_revenue: item.total_revenue,
      organizer_revenue: item.organizer_revenue,
      bookings: item.bookings_count,
    }))
  }

  const prepareRevenueSplitData = () => {
    if (!dashboardData || !dashboardData.revenue_summary) {
      return []
    }
    const { organizer_revenue, platform_fee } = dashboardData.revenue_summary
    return [
      { name: "Your Share (90%)", value: organizer_revenue, color: "#2E86AB" },
      { name: "Platform Fee (10%)", value: platform_fee, color: "#A23B72" },
    ]
  }

  const clearFilters = () => {
    setSelectedEvent("")
    setDateRange([null, null])
    setEventStatus("")
    setPaymentStatus("")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <OrganizerSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
              <p className="text-gray-600 mt-2">Track your events, bookings, and revenue performance</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? "Hide" : "Show"} Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Event Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event
                      {filterTimeoutRef.current && <span className="ml-2 text-xs text-blue-600">(Loading...)</span>}
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Events</option>
                      {events.map((event) => (
                        <option key={event.eventId} value={event.eventId}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        maxDate={new Date()}
                        isClearable={true}
                        placeholderText="Select date range"
                        className="w-full focus:outline-none text-sm"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                  </div>

                  {/* Event Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Status</label>
                    <select
                      value={eventStatus}
                      onChange={(e) => setEventStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Payments</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Download Reports */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Download Reports</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadReport("excel")}
                        disabled={downloadingReport}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 text-sm"
                      >
                        {downloadingReport && downloadFormat === "excel" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDownloadReport("pdf")}
                        disabled={downloadingReport}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 text-sm"
                      >
                        {downloadingReport && downloadFormat === "pdf" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <FilePdf className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
                  <p className="mt-2 text-gray-600">Loading dashboard data...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Dashboard Content */}
            {!loading && !error && dashboardData && (
              <>
                {/* Revenue Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <RevenueCard
                    title="Total Revenue"
                    value={formatCurrency(dashboardData.revenue_summary.total_revenue)}
                    icon={<IndianRupee className="h-6 w-6 text-blue-600" />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-700"
                    subtitle="Gross earnings"
                  />

                  <RevenueCard
                    title="Your Share (90%)"
                    value={formatCurrency(dashboardData.revenue_summary.organizer_revenue)}
                    icon={<TrendingUp className="h-6 w-6 text-green-600" />}
                    bgColor="bg-green-50"
                    textColor="text-green-700"
                    subtitle="Your earnings"
                  />

                  <RevenueCard
                    title="Platform Fee (10%)"
                    value={formatCurrency(dashboardData.revenue_summary.platform_fee)}
                    icon={<ShoppingBag className="h-6 w-6 text-orange-600" />}
                    bgColor="bg-orange-50"
                    textColor="text-orange-700"
                    subtitle="Service charges"
                  />

                  <RevenueCard
                    title="Total Bookings"
                    value={dashboardData.booking_summary.confirmed_bookings}
                    icon={<Users className="h-6 w-6 text-purple-600" />}
                    bgColor="bg-purple-50"
                    textColor="text-purple-700"
                    subtitle="Confirmed bookings"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Monthly Revenue Trend */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={prepareMonthlyChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorOrganizer" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: "#E5E7EB" }}
                          />
                          <YAxis
                            tickFormatter={(value) => `₹${value}`}
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: "#E5E7EB" }}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              `₹${value}`,
                              name === "total_revenue" ? "Total Revenue" : "Your Share",
                            ]}
                            labelFormatter={(label) => `Month: ${label}`}
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: "0.5rem",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="total_revenue"
                            stroke="#3B82F6"
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            strokeWidth={2}
                            name="Total Revenue"
                          />
                          <Area
                            type="monotone"
                            dataKey="organizer_revenue"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#colorOrganizer)"
                            strokeWidth={2}
                            name="Your Share"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Split Pie Chart */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Split</h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareRevenueSplitData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {prepareRevenueSplitData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your Share:</span>
                        <span className="font-medium text-green-600">90%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fee:</span>
                        <span className="font-medium text-orange-600">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Events */}
                {dashboardData.top_events && dashboardData.top_events.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Events</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bookings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Revenue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Your Share
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.top_events.map((event) => (
                            <tr key={event.eventId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                    <div className="text-sm text-gray-500">{event.category_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(event.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {event.confirmed_bookings}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(event.total_revenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(event.organizer_revenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    event.is_completed
                                      ? "bg-green-100 text-green-800"
                                      : event.on_hold
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {event.is_completed ? "Completed" : event.on_hold ? "On Hold" : "Upcoming"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmed:</span>
                        <span className="font-medium text-green-600">
                          {dashboardData.booking_summary.confirmed_bookings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-medium text-yellow-600">
                          {dashboardData.booking_summary.pending_bookings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cancelled:</span>
                        <span className="font-medium text-red-600">
                          {dashboardData.booking_summary.cancelled_bookings}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Events:</span>
                        <span className="font-medium">{dashboardData.events.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Events:</span>
                        <span className="font-medium text-blue-600">
                          {dashboardData.events.filter((e) => !e.is_completed && !e.on_hold).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium text-green-600">
                          {dashboardData.events.filter((e) => e.is_completed).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Revenue</h3>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">
                        {formatCurrency(dashboardData.revenue_summary.pending_revenue)}
                      </div>
                      <p className="text-sm text-gray-600">Revenue from pending bookings</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Revenue Card Component
const RevenueCard = ({ title, value, icon, bgColor, textColor, subtitle }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${textColor} mb-1`}>{value}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-full bg-white shadow-sm">{icon}</div>
      </div>
    </div>
  )
}

export default OrganizerDashboard