// Standard admin content-loading spinner.
const LoadingSpinner = ({ className = "p-8" }) => (
  <div className={`flex justify-center ${className}`} role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
)

export default LoadingSpinner
