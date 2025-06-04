import { useState, useEffect, useCallback, useRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar, FileSpreadsheet, FileIcon as FilePdf, RefreshCw, IndianRupee, Users, ShoppingBag } from "lucide-react"
import Sidebar from "./components/Sidebar"
import axiosInstance from "../../utils/axiosInstance"


const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [organizers, setOrganizers] = useState([])
  const [selectedOrganizer, setSelectedOrganizer] = useState("")
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState(null)
  const organizerTimeoutRef = useRef(null)
  const dateTimeoutRef = useRef(null)

  useEffect(() => {
    fetchFilterOptions()
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (organizerTimeoutRef.current) {
      clearTimeout(organizerTimeoutRef.current)
    }
    organizerTimeoutRef.current = setTimeout(() => {
      fetchDashboardData()
    }, 3000)

    return () => {
      if (organizerTimeoutRef.current) {
        clearTimeout(organizerTimeoutRef.current)
      }
    }
  }, [selectedOrganizer])

  useEffect(() => {
    if (dateTimeoutRef.current) {
      clearTimeout(dateTimeoutRef.current)
    }
    if (startDate && endDate) {
      dateTimeoutRef.current = setTimeout(() => {
        fetchDashboardData()
      }, 3000)
    } else if (!startDate && !endDate) {
      fetchDashboardData()
    }
    return () => {
      if (dateTimeoutRef.current) {
        clearTimeout(dateTimeoutRef.current)
      }
    }
  }, [startDate, endDate])
  useEffect(() => {
    return () => {
      if (organizerTimeoutRef.current) {
        clearTimeout(organizerTimeoutRef.current)
      }
      if (dateTimeoutRef.current) {
        clearTimeout(dateTimeoutRef.current)
      }
    }
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await axiosInstance.get("/admin/dashboard/filters/")
      if (response.data.success) {
        setOrganizers(response.data.data.organizers)
      } else {
        setError("Failed to load filter options")
      }
    } catch (err) {
      console.error("Error fetching filter options:", err)
      setError("Failed to load filter options. Please try again later.")
    }
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (selectedOrganizer) {
        params.append("organizer_id", selectedOrganizer)
      }
      if (startDate) {
        params.append("start_date", formatDate(startDate))
      }
      if (endDate) {
        params.append("end_date", formatDate(endDate))
      }

      const response = await axiosInstance.get(`/admin/dashboard/?${params.toString()}`)
      
      if (response.data.success) {
        setDashboardData(response.data.data)
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
  }, [selectedOrganizer, startDate, endDate])

  const handleDownloadReport = async (format) => {
    try {
      setDownloadingReport(true)
      setDownloadFormat(format)

      const params = new URLSearchParams()
      params.append("format", format)
      if (selectedOrganizer) {
        params.append("organizer_id", selectedOrganizer)
      }
      if (startDate) {
        params.append("start_date", formatDate(startDate))
      }
      if (endDate) {
        params.append("end_date", formatDate(endDate))
      }

      let response = null
      if (format === "pdf") {
        response = await axiosInstance.get(`/admin/dashboard/download_report_pdf/`, {
          responseType: "blob",
        })
      }
      else if (format === "excel") {
        response = await axiosInstance.get(`/admin/dashboard/download_report_excel/`, {
          responseType: "blob",
        })
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url

      const date = new Date().toISOString().split("T")[0]
      link.setAttribute("download", `revenue_report_${date}.${format === "excel" ? "xlsx" : "pdf"}`)

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`Error downloading ${format} report:`, err)
      setError(`Failed to download ${format} report. Please try again later.`)
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

  const prepareChartData = () => {
    if (!dashboardData || !dashboardData.revenue || !dashboardData.revenue.daily_breakdown) {
      return []
    }

    return dashboardData.revenue.daily_breakdown.map((item) => ({
      date: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: item.revenue,
      bookings: item.bookings_count,
    }))
  }

  return (
    <div className="flex h-screen bg-gray-50 pt-16">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor revenue, bookings, and event performance</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                  <select
                    value={selectedOrganizer}
                    onChange={(e) => setSelectedOrganizer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#333333]"
                  >
                    <option value="">All Organizers</option>
                    {organizers.map((organizer) => (
                      <option key={organizer.user_id} value={organizer.user_id}>
                        {organizer.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full md:w-2/5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#333333]">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      maxDate={new Date()} // Prevent selecting future dates
                      isClearable={true}
                      placeholderText="Select date range"
                      className="w-full focus:outline-none"
                      dateFormat="MMM d, yyyy"
                    />
                  </div>
                  {startDate && !endDate && (
                    <p className="text-xs text-gray-500 mt-1">Please select an end date to apply filter</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 md:mt-6">
                  <button
                    onClick={() => handleDownloadReport("excel")}
                    disabled={downloadingReport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                  >
                    {downloadingReport && downloadFormat === "excel" ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    )}
                    Excel
                  </button>

                  <button
                    onClick={() => handleDownloadReport("pdf")}
                    disabled={downloadingReport}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300"
                  >
                    {downloadingReport && downloadFormat === "pdf" ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FilePdf className="h-4 w-4 mr-2" />
                    )}
                    PDF
                  </button>
                </div>
              </div>
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(dashboardData.summary.total_revenue)}
                    icon={<IndianRupee className="h-6 w-6 text-green-600" />}
                    bgColor="bg-green-50"
                    textColor="text-green-700"
                  />

                  <StatCard
                    title="Total Bookings"
                    value={dashboardData.summary.total_bookings}
                    icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-700"
                  />

                  <StatCard
                    title="Total Events"
                    value={dashboardData.summary.total_events}
                    icon={<Calendar className="h-6 w-6 text-purple-600" />}
                    bgColor="bg-purple-50"
                    textColor="text-purple-700"
                  />

                  <StatCard
                    title="Total Organizers"
                    value={dashboardData.summary.total_organizers}
                    icon={<Users className="h-6 w-6 text-orange-600" />}
                    bgColor="bg-orange-50"
                    textColor="text-orange-700"
                  />
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prepareChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
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
                          formatter={(value) => [`₹${value}`, "Revenue"]}
                          labelFormatter={(label) => `Date: ${label}`}
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
                          dataKey="revenue"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          name="Revenue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Organizers */}
                {dashboardData.organizers && dashboardData.organizers.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Top Organizers</h2>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Organizer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Events
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bookings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Revenue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.organizers.slice(0, 5).map((organizer) => (
                            <tr key={organizer.user_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                                    {organizer.full_name.charAt(0)}
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">{organizer.full_name}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{organizer.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {organizer.total_events}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {organizer.total_bookings}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(organizer.total_revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Categories */}
                {dashboardData.categories && dashboardData.categories.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dashboardData.categories.slice(0, 6).map((category) => (
                        <div
                          key={category.category_id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-medium text-gray-900 mb-2">{category.category_name}</h3>
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Events:</span>
                            <span>{category.total_events}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Bookings:</span>
                            <span>{category.total_bookings}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium text-green-600 mt-2">
                            <span>Revenue:</span>
                            <span>{formatCurrency(category.total_revenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${textColor}`}>{value}</h3>
        </div>
        <div className="p-2 rounded-full bg-white shadow-sm">{icon}</div>
      </div>
    </div>
  )
}

export default AdminDashboard