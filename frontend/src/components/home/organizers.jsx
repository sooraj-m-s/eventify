import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axiosInstance"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"


const Organizers = () => {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/users/organizers/")
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

  return (
    <div className="my-16 relative">
      <h2 className="text-2xl font-semibold mb-8 text-center relative">
        <span className="relative z-10 bg-white px-4">Our Organizers</span>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-0"></div>
      </h2>

      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {organizers.length > 0 ? (
            organizers.map((organizer) => (
              <CarouselItem key={organizer.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
                <div className="p-1 cursor-pointer group">
                  <div className="overflow-hidden rounded-lg h-64">
                    <img
                      src={organizer.user.profile_image || `/placeholder.svg?height=300&width=200`}
                      alt={organizer.user.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-2 text-center font-medium">{organizer.user.full_name}</h3>
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="p-1 text-center">Nothing to show</div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  )
}

export default Organizers