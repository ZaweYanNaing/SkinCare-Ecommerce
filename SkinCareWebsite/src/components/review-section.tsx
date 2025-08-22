import React from 'react';
import { default as oliviaAvatar, default as sophiaAvatar } from '../assets/user-photo.png';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars.push(
        <span key={i} className="text-green-500">
          ★
        </span>,
      ); // Filled star
    } else {
      stars.push(
        <span key={i} className="text-gray-300">
          ★
        </span>,
      ); // Empty star
    }
  }
  return <div className="flex text-2xl">{stars}</div>;
};

const ReviewSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sophia Clark',
      time: '2 months ago',
      avatar: sophiaAvatar,
      rating: 5,
      review:
        "I've been using the Daily Cleansing Foam for a month now, and my skin has never felt better. It's gentle yet effective, leaving my skin feeling clean and refreshed without any dryness.",
    },
    {
      id: 2,
      name: 'Olivia Bennett',
      time: '3 months ago',
      avatar: oliviaAvatar,
      rating: 2,
      review:
        "The Hydrating Face Mask is a game-changer! It leaves my skin feeling incredibly soft and hydrated. I use it twice a week, and it's become a staple in my skincare routine.",
    },
    {
      id: 3,
      name: 'Olivia Bennett',
      time: '3 months ago',
      avatar: oliviaAvatar,
      rating: 4,
      review:
        "The Hydrating Face Mask is a game-changer! It leaves my skin feeling incredibly soft and hydrated. I use it twice a week, and it's become a staple in my skincare routine.",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-full">
        <h2 className="mb-12 text-4xl font-bold text-gray-900">Customer Testimonials</h2>

        <div className="space-y-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <img src={testimonial.avatar} alt={testimonial.name} className="mr-4 h-16 w-16 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.time}</p>
                </div>
              </div>
              <StarRating rating={testimonial.rating} />
              <p className="mt-4 text-gray-700">{testimonial.review}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
