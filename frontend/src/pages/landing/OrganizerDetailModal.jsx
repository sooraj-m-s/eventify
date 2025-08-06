import { X, MapPin, Phone, Mail, Calendar, Users, Eye, Star } from "lucide-react"


const OrganizerDetailModal = ({ organizer, isOpen, onClose, onViewEvents, averageRating }) => {
  if (!isOpen || !organizer) return null

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>,
        )
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />)
      }
    }

    return stars
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Organizer Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            {/* Profile Image */}
            <div className="relative w-32 h-32 mx-auto md:mx-0">
              <img
                src={organizer.user.profile_image || "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif"}
                alt={organizer.user.full_name}
                className="w-full h-full object-cover rounded-full border-4 border-gray-100 shadow-lg"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif";
                }}
              />
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{organizer.user.full_name}</h3>

              <div className="flex items-center justify-center md:justify-start text-gray-600 mb-2">
                <Users size={16} className="mr-2" />
                <span>Event Organizer</span>
              </div>

              {/* Rating Section */}
              {averageRating !== null && averageRating !== undefined && (
                <div className="flex items-center justify-center md:justify-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">{renderStars(averageRating)}</div>
                    <span className="text-lg font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({averageRating === 0 ? "No reviews yet" : "Average rating"})
                    </span>
                  </div>
                </div>
              )}

              {organizer.place && (
                <div className="flex items-center justify-center md:justify-start text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span>{organizer.place}</span>
                </div>
              )}

              <div className="flex items-center justify-center md:justify-start text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>Member since {new Date(organizer.user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Mail size={18} className="mr-3 text-gray-500" />
                <span>{organizer.user.email}</span>
              </div>

              {organizer.user.mobile && (
                <div className="flex items-center text-gray-700">
                  <Phone size={18} className="mr-3 text-gray-500" />
                  <span>{organizer.user.mobile}</span>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          {organizer.about && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
              <p className="text-gray-700 leading-relaxed">{organizer.about}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onViewEvents(organizer.user.user_id)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye size={18} />
              View Events
            </button>

            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizerDetailModal