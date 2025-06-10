import { X, Calendar, Clock, MapPin, FileText, Loader, MessageSquare, Star, Edit2 } from "lucide-react"
import { useState, useEffect } from "react"
import CancellationConfirmationModal from "./CancellationConfirmationModal"
import { toast } from "sonner"
import ChatModal from "@/components/ChatModal"
import { createReview, getSingleReview, startChatWithOrganizer, updateReview } from "@/api/user"


const UserBookingDetailsModal = ({
  booking,
  onClose,
  onCancel,
  cancellingId,
  isBookingCancellable,
  formatDate,
  formatTime,
}) => {
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [startingChat, setStartingChat] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatRoomId, setChatRoomId] = useState(null)
  const [existingReview, setExistingReview] = useState(null)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [isLoadingReview, setIsLoadingReview] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const otheruser = { full_name: booking.event.organizer_name }

  // Check if event is completed and fetch review if it exists
  useEffect(() => {
    if (booking?.event?.is_completed) {
      fetchUserReview()
    }
  }, [booking])

  const fetchUserReview = async () => {
    try {
      setIsLoadingReview(true)
      const data = await getSingleReview(booking.user, booking.event.eventId);
      if (data) {
        setExistingReview(data)
        setReviewTitle(data.title || "")
        setReviewComment(data.comment || "")
        setReviewRating(data.rating || 5)
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching review:", error)
      }
    } finally {
      setIsLoadingReview(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error("Please provide a comment for your review")
      return
    }

    try {
      setIsSubmittingReview(true)

      const reviewData = {
        user: booking.user,
        organizer: booking.event.hostedBy,
        event: booking.event.eventId,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        rating: reviewRating,
      }

      let data
      if (existingReview) {
        // Update existing review
        data = await updateReview(existingReview.id, reviewData);
        toast.success("Review updated successfully")
      } else {
        // Create new review
        data = await createReview(reviewData);
        toast.success("Review submitted successfully")
      }

      setExistingReview(data)
      setIsEditingReview(false)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error(error.response?.data?.detail || "Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleCancelClick = () => {
    setShowCancellationModal(true)
  }
  const handleConfirmCancel = () => {
    onCancel(booking.booking_id)
    setShowCancellationModal(false)
  }
  const handleCancelModal = () => {
    setShowCancellationModal(false)
  }

  const handleChatWithOrganizer = async () => {
    try {
      setStartingChat(true)
      const data = await startChatWithOrganizer(booking.event.hostedBy);
      if (data) {
        setChatRoomId(data.room.room_id)
        setShowChatModal(true)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      toast.error("Failed to start chat", {
        description: "Please try again later",
      })
    } finally {
      setStartingChat(false)
    }
  }

  // Render stars for rating input
  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none">
            <Star className={`h-6 w-6 ${star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    )
  }

  // Render static stars for display
  const renderStaticStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  {booking.event.posterImage ? (
                    <img
                      src={booking.event.posterImage || "/placeholder.svg"}
                      alt={booking.event.title}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{booking.event.title}</h4>
                    <p className="text-sm text-gray-600">{booking.event.category_name}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{formatDate(booking.event.date)}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Event Time: {formatTime(booking.event.date)}</span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{booking.event.location || "Online"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">Chat with Organizer</span>
                    </div>
                    <button
                      onClick={handleChatWithOrganizer}
                      disabled={startingChat}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {startingChat ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {booking.event.description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Event Description</h4>
                  <p className="text-sm text-gray-700">{booking.event.description}</p>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{booking.booking_id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Name:</span>
                  <span className="font-medium">{booking.booking_name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium">{formatDate(booking.booking_date)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Time:</span>
                  <span className="font-medium">{formatTime(booking.booking_date)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-medium">₹{booking.total_price}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span
                    className={`font-medium ${
                      booking.payment_status === "confirmed"
                        ? "text-green-600"
                        : booking.payment_status === "cancelled"
                          ? "text-red-600"
                          : booking.payment_status === "pending"
                            ? "text-yellow-600"
                            : "text-blue-600"
                    }`}
                  >
                    {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                  </span>
                </div>

                {booking.payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium">{booking.payment_id}</span>
                  </div>
                )}

                {booking.notes && (
                  <div className="pt-2 border-t">
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Notes:</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Section - Only show for completed events */}
              {booking.event.is_completed && (
                <div className="mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-lg mb-3">Event Review</h4>

                    {isLoadingReview ? (
                      <div className="flex justify-center py-4">
                        <Loader className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : existingReview && !isEditingReview ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>{renderStaticStars(existingReview.rating)}</div>
                          <button
                            onClick={() => setIsEditingReview(true)}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit Review
                          </button>
                        </div>

                        {existingReview.title && <h5 className="font-medium">{existingReview.title}</h5>}

                        <p className="text-gray-700">{existingReview.comment}</p>

                        <div className="text-xs text-gray-500">
                          Reviewed on {new Date(existingReview.created_at).toLocaleDateString()}
                          {existingReview.updated_at !== existingReview.created_at &&
                            ` (Updated on ${new Date(existingReview.updated_at).toLocaleDateString()})`}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          {renderStarRating()}
                        </div>

                        <div>
                          <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            id="reviewTitle"
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="Add a title for your review"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                          </label>
                          <textarea
                            id="reviewComment"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={3}
                            placeholder="Share your experience about this event and organizer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          {isEditingReview && (
                            <button
                              onClick={() => {
                                setIsEditingReview(false)
                                setReviewTitle(existingReview.title || "")
                                setReviewComment(existingReview.comment || "")
                                setReviewRating(existingReview.rating || 5)
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                          >
                            {isSubmittingReview ? (
                              <>
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                {existingReview ? "Updating..." : "Submitting..."}
                              </>
                            ) : (
                              <>{existingReview ? "Update Review" : "Submit Review"}</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 space-y-4">
                {isBookingCancellable(booking) ? (
                  <button
                    onClick={handleCancelClick}
                    disabled={cancellingId === booking.booking_id}
                    className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center justify-center"
                  >
                    {cancellingId === booking.booking_id ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Booking"
                    )}
                  </button>
                ) : (
                  booking.payment_status === "cancelled" && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center text-red-800">
                      This booking has been cancelled
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cancellation Confirmation Modal */}
      {showCancellationModal && (
        <CancellationConfirmationModal
          booking={booking}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelModal}
          isLoading={cancellingId === booking.booking_id}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          roomId={chatRoomId}
          otherUser={otheruser}
        />
      )}
    </div>
  )
}

export default UserBookingDetailsModal