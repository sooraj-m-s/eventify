import { useState, useEffect } from "react"
import { X, Calendar, Clock, MapPin, Loader, ChevronDown, Tag, Check, Wallet } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/utils/axiosInstance"
import { useNavigate } from "react-router-dom"


const BookingModal = ({ event, onClose, user }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [bookingName, setBookingName] = useState("")
  const [notes, setNotes] = useState("")
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCouponDropdown, setShowCouponDropdown] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [fetchingCoupons, setFetchingCoupons] = useState(false)
  const [walletBalance, setWalletBalance] = useState(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletChecked, setWalletChecked] = useState(false)
  const originalAmount = event.pricePerTicket
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0
  const finalAmount = Math.max(0, originalAmount - discountAmount)

  useEffect(() => {
    if (event?.hostedBy) {
      fetchAvailableCoupons()
    }
  }, [event])

  const fetchAvailableCoupons = async () => {
    try {
      setFetchingCoupons(true)
      const organizerId = event.hostedBy
      const response = await axiosInstance.get(`/coupon/organizer_coupon/?organizerId=${organizerId}`)

      const couponsData = response.data.results || response.data || []
      setAvailableCoupons(couponsData)
    } catch (error) {
      console.error("Error fetching coupons:", error)

      if (error.response?.status === 401) {
        toast.error("Please login to view available coupons")
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to view coupons")
      } else {
        console.log("Failed to fetch coupons, but continuing without error toast")
      }

      setAvailableCoupons([])
    } finally {
      setFetchingCoupons(false)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      setWalletLoading(true)
      const response = await axiosInstance.get("/wallet/balance/")

      if (response.data.success) {
        setWalletBalance(response.data.balance)
        setWalletChecked(true)
      } else {
        toast.error("Failed to get wallet balance")
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      toast.error("Failed to get wallet balance")

      setWalletBalance(0)
      setWalletChecked(true)
    } finally {
      setWalletLoading(false)
    }
  }

  const getWalletButtonText = () => {
    if (walletLoading) {
      return "Checking Balance..."
    }
    if (!walletChecked) {
      return "Get Wallet Balance"
    }
    if (walletBalance >= finalAmount) {
      return `Pay with Wallet (₹${finalAmount})`
    } else {
      return "Not Enough Money"
    }
  }

  const getWalletButtonAction = () => {
    if (!walletChecked) {
      return fetchWalletBalance
    }
    if (walletBalance >= finalAmount) {
      return () => handleBooking("wallet")
    }
    return null
  }

  const validateAndApplyCoupon = async (code) => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setCouponLoading(true)
    try {
      const response = await axiosInstance.post("/coupon/coupons/apply/", {
        eventId: event.eventId,
        code: code.trim().toUpperCase(),
      })

      if (response.data.success && response.data.coupon) {
        setAppliedCoupon(response.data.coupon)
        toast.success("Coupon applied successfully!")
        setShowCouponDropdown(false)
        setCouponCode("")

        if (walletChecked) {
          setWalletChecked(false)
          setWalletBalance(null)
        }
      } else {
        toast.error("Failed to apply coupon")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to apply coupon"
      toast.error(errorMessage)
      console.error("Coupon apply error:", error)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleCouponSelect = (coupon) => {
    setCouponCode(coupon.code)
    validateAndApplyCoupon(coupon.code)
  }

  const handleManualCouponApply = () => {
    validateAndApplyCoupon(couponCode)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast.info("Coupon removed")

    if (walletChecked) {
      setWalletChecked(false)
      setWalletBalance(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ""
    const [hourStr, minute] = timeStr.split(":")
    let hour = Number.parseInt(hourStr)
    const period = hour >= 12 ? "PM" : "AM"
    hour = hour % 12 || 12
    return `${hour}:${minute} ${period}`
  }

  function handleBooking(paymentMethod = "stripe") {
    try {
      setLoading(true)

      const bookingData = {
        event_id: event.eventId,
        booking_name: bookingName.trim() || null,
        notes: notes,
        payment_method: paymentMethod,
      }

      if (appliedCoupon) {
        bookingData.coupon_code = appliedCoupon.code
      }

      axiosInstance.post("/booking/book/", bookingData)
        .then((response) => {
          if (paymentMethod === "wallet") {
            toast.success("Booking successful! Payment completed using wallet.")
            onClose()
          } else {
            const bookingId = response.data.booking.booking_id
            toast.success("Booking created! Redirecting to payment...")
            navigate(`/payment/${bookingId}`)
          }
        }).catch((error) => {
          console.error("Booking error:", error)
          toast.error(error.response?.data?.error || "Failed to book tickets. Please try again.")
          setLoading(false)
        })
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Failed to book tickets. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Book Tickets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  {event.posterImage ? (
                    <img
                      src={event.posterImage || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-gray-600">{event.category_name}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{formatTime(event.time)}</span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{event.location || "N/A"}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bookingName" className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Name
                    </label>
                    <input
                      id="bookingName"
                      type="text"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder={user?.full_name || "Enter booking name"}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use your account name</p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests or Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Any special requests or notes for the organizer"
                    />
                  </div>

                  {/* Wallet Balance Display */}
                  {walletChecked && walletBalance !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Wallet Balance</span>
                        </div>
                        <span className="text-sm font-medium text-blue-800">₹{walletBalance}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>1 ticket × ₹{event.pricePerTicket}</span>
                    <span>₹{originalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>₹0</span>
                  </div>

                  {/* Coupon Section */}
                  <div className="border-t pt-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Have a coupon?</span>
                        {fetchingCoupons && <Loader className="h-4 w-4 animate-spin text-gray-500" />}
                      </div>

                      {appliedCoupon ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-800">{appliedCoupon.code} Applied</span>
                            </div>
                            <button onClick={removeCoupon} className="text-red-600 hover:text-red-800 text-sm">
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Manual Coupon Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleManualCouponApply}
                              disabled={couponLoading || !couponCode.trim()}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {couponLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Apply"}
                            </button>
                          </div>

                          {/* Available Coupons Section */}
                          <div>
                            {fetchingCoupons ? (
                              <div className="text-center py-3 text-sm text-gray-500 border border-gray-200 rounded-md">
                                <Loader className="h-4 w-4 animate-spin inline mr-2" />
                                Loading available coupons...
                              </div>
                            ) : availableCoupons.length > 0 ? (
                              <div className="relative">
                                <button
                                  onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                                  className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <div className="flex items-center">
                                    <Tag className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>Select from {availableCoupons.length} available coupons</span>
                                  </div>
                                  <ChevronDown
                                    className={`h-4 w-4 text-gray-500 transition-transform ${showCouponDropdown ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {showCouponDropdown && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                                    {availableCoupons.map((coupon) => (
                                      <button
                                        key={coupon.couponId}
                                        onClick={() => handleCouponSelect(coupon)}
                                        disabled={couponLoading}
                                        className="w-full text-left px-3 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-sm">{coupon.code}</span>
                                          <span className="text-green-600 text-sm font-medium">
                                            ₹{coupon.discount_amount} off
                                          </span>
                                        </div>
                                        {coupon.minimum_purchase_amt > 0 && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Min. purchase: ₹{coupon.minimum_purchase_amt}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                          Valid till: {new Date(coupon.valid_to).toLocaleDateString()}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-sm text-gray-500 border border-gray-200 rounded-md">
                                No coupons available for this event
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Discount Display */}
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 bg-green-50 px-3 py-2 rounded-md">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span className="font-medium">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className={appliedCoupon ? "text-green-600" : ""}>₹{finalAmount}</span>
                  </div>

                  {appliedCoupon && originalAmount !== finalAmount && (
                    <div className="text-right">
                      <span className="text-sm text-gray-500 line-through">₹{originalAmount}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-6">
                  <p>* All prices are inclusive of taxes</p>
                  <p>* {event.termsAndConditions}</p>
                  <p>* Cancellation: {event.cancellationAvailable ? "Available" : "Not Available"}</p>
                </div>

                <h4 className="text-lg font-bold mb-4">Complete Your Payment</h4>

                {/* Wallet Payment Button */}
                <button
                  onClick={getWalletButtonAction()}
                  disabled={walletLoading || loading || (walletChecked && walletBalance < finalAmount)}
                  className={`w-full py-3 rounded-md flex items-center justify-center font-medium mb-3 transition-colors ${
                    walletChecked && walletBalance >= finalAmount
                      ? "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
                      : walletChecked && walletBalance < finalAmount
                        ? "bg-red-500 text-white cursor-not-allowed"
                        : "bg-purple-500 text-white hover:bg-purple-600 disabled:bg-purple-300"
                  }`}
                >
                  {walletLoading || loading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {walletLoading ? "Checking..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      {getWalletButtonText()}
                    </>
                  )}
                </button>

                {/* Stripe Payment Button */}
                <button
                  onClick={() => handleBooking("stripe")}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Proceed to Payment (₹{finalAmount})</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingModal