import { useState, useEffect } from "react"
import { Search, Calendar, ChevronLeft, ChevronRight, ArrowUpRight,
        ArrowDownLeft, RefreshCw, Wallet} from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import Sidebar from "./components/Sidebar"


const AdminWallet = () => {
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState({
    current_balance: 0,
    total_credits: 0,
    total_withdrawals: 0,
  })
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    search: "",
  })

  useEffect(() => {
    fetchWalletData(1)
  }, [])

  const fetchWalletData = async (page) => {
    try {
      setLoading(true)
      const { search } = filters

      let url = `/admin/wallet/?page=${page}`
      if (search) url += `&search=${search}`

      const response = await axiosInstance.get(url)
      
      if (response.data.success) {
        setWalletData({
          current_balance: response.data.current_balance,
          total_credits: response.data.total_credits,
          total_withdrawals: response.data.total_withdrawals,
        })
        setTransactions(response.data.transactions)
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10),
        })
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchWalletData(newPage)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFilters = () => {
    fetchWalletData(1)
  }

  const resetFilters = () => {
    setFilters({
      search: "",
    })
    fetchWalletData(1)
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "CREDIT":
        return <ArrowUpRight className="h-5 w-5 text-green-500" />
      case "WITHDRAWAL":
        return <ArrowDownLeft className="h-5 w-5 text-red-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case "CREDIT":
        return "text-green-600"
      case "WITHDRAWAL":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTransactionPrefix = (type) => {
    switch (type) {
      case "CREDIT":
        return "+"
      case "WITHDRAWAL":
        return "-"
      default:
        return ""
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Wallet</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium opacity-90">Current Balance</h2>
                <div className="text-3xl font-bold mt-1">{formatCurrency(walletData.current_balance)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg font-semibold mb-4 md:mb-0">Transaction History</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search by event..."
                  value={filters.search}
                  name="search"
                  onChange={handleFilterChange}
                  onKeyPress={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Transaction
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Event
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reference ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.wallet_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-full mr-3">
                              {getTransactionIcon(transaction.transaction_type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {transaction.transaction_type === "CREDIT" ? "Credit" : "Withdrawal"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.formatted_created_at}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.event_title || "N/A"}</div>
                          {transaction.event_date && (
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.event_date).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{transaction.reference_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                            {getTransactionPrefix(transaction.transaction_type)}
                            {formatCurrency(transaction.transaction_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.total_balance)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.previous}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.next}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.currentPage - 1) * 5 + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(pagination.currentPage * 5, pagination.count)}</span> of{" "}
                      <span className="font-medium">{pagination.count}</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.previous}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {/* Page numbers */}
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        let pageNumber
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (pagination.currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNumber = pagination.totalPages - 4 + i
                        } else {
                          pageNumber = pagination.currentPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.currentPage === pageNumber
                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.next}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminWallet