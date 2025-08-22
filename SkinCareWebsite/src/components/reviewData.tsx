import { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Fullscreen } from 'lucide-react';

interface Review {
  id: number;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  beforeImg: string | null;
  afterImg: string | null;
}

interface ApiReview {
  ReviewID: string;
  CName: string;
  Date: string;
  Rating: string;
  Comment: string;
  BeforeImg: string | null;
  AfterImg: string | null;
}

interface ReviewDataProps {
  productId: number;
  refreshTrigger?: number;
}

function ReviewData({ productId, refreshTrigger }: ReviewDataProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost/review/show.php?pid=${productId}`);
        const data = await response.json();

        if (data.success) {
          // Map API data to component interface
          const mappedReviews: Review[] = data.data.map((apiReview: ApiReview) => ({
            id: parseInt(apiReview.ReviewID),
            userName: apiReview.CName,
            date: apiReview.Date,
            rating: parseInt(apiReview.Rating),
            comment: apiReview.Comment,
            beforeImg: apiReview.BeforeImg,
            afterImg: apiReview.AfterImg,
          }));
          setReviews(mappedReviews);
        } else {
          setError(data.message || 'Failed to fetch reviews');
        }
      } catch (err) {
        setError('Error fetching reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, refreshTrigger]);

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(
          <span key={i} className="text-xl text-green-400">
            <FaStar />
          </span>,
        );
      } else {
        stars.push(
          <span key={i} className="text-xl text-gray-300">
            <FaRegStar />
          </span>,
        );
      }
    }
    return stars;
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="my-10 space-y-10 px-30 py-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="py-8 text-center">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-10 space-y-10 px-30 py-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="py-8 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="my-10 space-y-10 px-30 py-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="py-8 text-center text-gray-500">No reviews yet for this product.</div>
      </div>
    );
  }

  return (
    <div className="my-10 space-y-10 px-30 py-4">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
              <div className="flex h-full w-full items-center justify-center text-gray-500">{review.userName.charAt(0)}</div>
            </div>
            <div className="flex w-full flex-col gap-y-2 py-3">
              <div className="flex gap-x-20">
                <h3 className="text-lg font-semibold">{review.userName}</h3>
                {!!review.beforeImg && (
                  <HoverCard>
                    <HoverCardTrigger className="cursor-pointer">
                      <Fullscreen />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div className="flex gap-x-5">
                        {review.beforeImg && (
                          <div className="text-center">
                            <p className="mb-2 text-sm font-medium text-gray-700">Before</p>
                            <img src={`../../src/assets/review/${review.beforeImg}`} alt="Before" className="rounded object-cover" />
                          </div>
                        )}
                        {review.afterImg && (
                          <div className="text-center">
                            <p className="mb-2 text-sm font-medium text-gray-700">After</p>
                            <img src={`../../src/assets/review/${review.afterImg}`} alt="After" className="rounded object-cover" />
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
              <div className="flex items-center gap-10">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 px-15">
            <p className="text-gray-700">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReviewData;
