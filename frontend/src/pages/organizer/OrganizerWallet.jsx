import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownLeft, Search, ChevronLeft, ChevronRight, Calendar, Wallet, Download } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import OrganizerSidebar from "./components/OrganizerSidebar"
import { toast } from "sonner"
import WithdrawConfirmationModal from "./components/WithdrawConfirmationModal"
import { Button } from "@/components/ui/button"


const OrganizerWallet = () => {
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    fetchWalletData(currentPage)
  }, [currentPage])

  const fetchWalletData = async (page) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/wallet/organizer/transactions/?page=${page}`)
      
      setWalletData(response.data.results.wallet)
      setTransactions(response.data.results.transactions || [])

      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        current_page: page,
        total_pages: response.data.total_pages || Math.ceil(response.data.count / 10),
      })
    } catch (error) {
      console.error("Error fetching organizer wallet data:", error)
      toast.error("Failed to fetch wallet data")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawAll = async () => {
    try {
      setIsWithdrawing(true)

      const response = await axiosInstance.post("/wallet/withdraw_money/", {
        confirm_withdrawal: true,
      })

      if (response.data) {
        setWalletData(response.data.wallet)
        await fetchWalletData(1)
        setCurrentPage(1)

        toast.success("Withdrawal Successful!", {
          description: `₹${response.data.withdrawal_amount.toLocaleString()} has been withdrawn successfully. It will be credited to your account in 5-7 working days.`,
          duration: 5000,
        })

        setIsWithdrawModalOpen(false)
      }
    } catch (error) {
      console.error("Error withdrawing money:", error)
      const errorMessage = error.response?.data?.error || "Failed to withdraw money. Please try again."
      toast.error("Withdrawal Failed", {
        description: errorMessage,
        duration: 4000,
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "CREDIT":
        return <ArrowUpRight className="h-5 w-5 text-green-500" />
      case "DEBIT":
        return <ArrowDownLeft className="h-5 w-5 text-red-500" />
      case "WITHDRAWAL":
        return <Download className="h-5 w-5 text-orange-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case "CREDIT":
        return "text-green-600"
      case "DEBIT":
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
      case "DEBIT":
      case "WITHDRAWAL":
        return "-"
      default:
        return ""
    }
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const canWithdraw = walletData?.balance > 0

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizerSidebar />
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Organizer Wallet</h1>

          {loading && !walletData ? (
            <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  {" "}
                  <div className="flex items-center">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium opacity-90">Available Balance</h2>
                      <div className="text-3xl font-bold mt-1">₹{walletData?.balance.toLocaleString()}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    disabled={!canWithdraw}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Withdraw All
                  </Button>
                </div>
              </div>

              {/* Withdrawal Confirmation Modal */}
              <WithdrawConfirmationModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                walletBalance={walletData?.balance}
                onConfirm={handleWithdrawAll}
                isLoading={isWithdrawing}
              />

              {/* Transactions Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Transaction History</h2>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search by reference ID or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Transaction List */}
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Wallet className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? "Try a different search term" : "Your transaction history will appear here"}
                    </p>
                  </div>
                ) : (
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
                            Reference ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Event
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-full mr-3">
                                  {getTransactionIcon(transaction.transaction_type)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{transaction.transaction_type}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(transaction.created_at)}</div>
                              <div className="text-xs text-gray-500">{formatTime(transaction.created_at)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{transaction.reference_id || "-"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {transaction.event ? (
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                                    {transaction.event?.title || transaction.event}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div
                                className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type)}`}
                              >
                                {getTransactionPrefix(transaction.transaction_type)}₹
                                {transaction.amount.toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.previous}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.next}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                          <span className="font-medium">{Math.min(currentPage * 10, pagination.count)}</span> of{" "}
                          <span className="font-medium">{pagination.count}</span> results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.previous}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </button>

                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                            let pageNumber
                            if (pagination.total_pages <= 5) {
                              pageNumber = i + 1
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1
                            } else if (currentPage >= pagination.total_pages - 2) {
                              pageNumber = pagination.total_pages - 4 + i
                            } else {
                              pageNumber = currentPage - 2 + i
                            }

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNumber
                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            )
                          })}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
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
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrganizerWallet