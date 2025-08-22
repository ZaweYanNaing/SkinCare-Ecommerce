import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted?: () => void;
}

function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [reviewText, setReviewText] = useState('');
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [rating, setRating] = useState<number>(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Comment', reviewText);
    formData.append('Rating', rating.toString());
    formData.append('CID', user.id); // Placeholder: Replace with actual customer ID from context or auth
    formData.append('productID', productId.toString());
    if (beforeImage) formData.append('BeforeImg', beforeImage);
    if (afterImage) formData.append('AfterImg', afterImage);

    try {
      const response = await fetch('http://localhost/review/add.php', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        toast('Review submitted successfully!');
        setReviewText('');
        setBeforeImage(null);
        setAfterImage(null);
        setRating(0);
        // Trigger refresh of reviews
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.error('Failed to submit review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred while submitting the review.');
    }
  };

  const handleCancel = () => {
    setReviewText('');
    setBeforeImage(null);
    setAfterImage(null);
    setRating(0);
  };

  const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBeforeImage(e.target.files[0]);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAfterImage(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl py-10 ps-30 pe-50">
      <h2 className="mb-6 text-2xl font-bold">Submit Your Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="review" className="sr-only">
            Your Review
          </label>
          <textarea
            id="review"
            className="w-full rounded-lg border border-gray-300 p-3 outline-0"
            rows={6}
            placeholder="Your Review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="beforeImage">Upload Before image</label>
          <input
            type="file"
            id="beforeImage"
            className="w-full rounded-lg border border-gray-300 p-3 file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
            accept="image/*"
            onChange={handleBeforeImageChange}
            placeholder="Upload Before image"
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label htmlFor="afterImage">Upload After image</label>
          <input
            type="file"
            id="afterImage"
            className="w-full rounded-lg border border-gray-300 p-3 file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
            accept="image/*"
            onChange={handleAfterImageChange}
            placeholder="Upload After image"
          />
        </div>

        <div className="flex max-w-xl flex-col gap-y-2">
          <label>Rating</label>
          <div className="relative h-10 w-full overflow-hidden rounded-lg border border-white/20 bg-gray-700/50 p-0 shadow-lg backdrop-blur-md">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 opacity-80 transition-all duration-300"
              style={{ width: `${(rating / 5) * 100}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-around text-white">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`z-10 w-1/5 cursor-pointer border-e-2 py-5 text-sm font-medium ${rating === value ? 'text-gray-700' : 'text-white'} hover:text-green-200`}
                  onClick={() => setRating(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-start gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer rounded-lg border border-green-600 px-6 py-3 text-green-600 transition-colors duration-300 hover:bg-green-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-green-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-green-700"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
