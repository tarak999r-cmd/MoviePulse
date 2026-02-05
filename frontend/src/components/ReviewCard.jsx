import React, { useState, useEffect } from 'react';
import { Star, Heart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ReviewCard.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ReviewCard = ({ review, reviewAuthor }) => {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLikedState, setIsLikedState] = useState(review?.isLiked || false);
  const [likesCountState, setLikesCountState] = useState(review?.likesCount || 0);

  useEffect(() => {
    if (review) {
      setIsLikedState(!!review.isLiked);
      setLikesCountState(review.likesCount || 0);
    }
  }, [review?.isLiked, review?.likesCount, review]);

  if (!review) return null;

  const {
    movieId,
    movieTitle,
    moviePosterPath,
    moviePosterUrl,
    movieYear,
    rating,
    content,
    containsSpoiler,
    likesCount = 0,
    isLiked = false,
    createdAt,
    watchedDate,
    rewatch,
    isRewatch
  } = review;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
        navigate('/signin');
        return;
    }

    // Optimistic update
    const previousIsLiked = isLikedState;
    const previousLikesCount = likesCountState;

    setIsLikedState(!previousIsLiked);
    setLikesCountState(prev => previousIsLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
        const url = `${API_BASE_URL}/api/reviews/${review.id}/${previousIsLiked ? 'unlike' : 'like'}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!res.ok) {
            // Revert if failed
            setIsLikedState(previousIsLiked);
            setLikesCountState(previousLikesCount);
        }
    } catch (err) {
        console.error("Error toggling like:", err);
        setIsLikedState(previousIsLiked);
        setLikesCountState(previousLikesCount);
    }
  };

  const wasRewatched = rewatch || isRewatch;
  const displayDate = watchedDate || createdAt;
  const formattedDate = new Date(displayDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const poster = moviePosterPath || moviePosterUrl;

  const handleMovieClick = () => {
    if (movieId) {
      const targetUserId = review.user?.id || review.userId || reviewAuthor?.id;
      const userParam = targetUserId ? `&userId=${targetUserId}` : '';
      navigate(`/movie/${movieId}/activity?tab=REVIEWS${userParam}`);
    }
  };

  return (
    <div className="review-card">
      <div className="review-card-poster" onClick={handleMovieClick} style={{ cursor: 'pointer' }}>
        <img 
          src={poster ? `${IMAGE_BASE_URL}${poster}` : 'https://via.placeholder.com/70x105'} 
          alt={movieTitle} 
        />
      </div>
      
      <div className="review-card-content">
        <div className="review-card-header">
           <h3 className="review-movie-title" onClick={handleMovieClick} style={{ cursor: 'pointer', display: 'inline-block' }}>
             {movieTitle} <span className="review-movie-year">{movieYear}</span>
           </h3>
           <div className="review-card-meta">
             {wasRewatched && (
                <div title="Rewatch" style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                    <RefreshCw size={16} color="#00e054" strokeWidth={2} />
                </div>
             )}
             <div className="review-rating">
               {[1, 2, 3, 4, 5].map(star => (
                   <div key={star} style={{ position: 'relative', display: 'inline-block', width: '14px', height: '14px', marginRight: '1px' }}>
                       <Star 
                           size={14} 
                           fill="none"
                           color="#678" 
                           strokeWidth={1.5}
                           style={{ position: 'absolute', top: 0, left: 0 }}
                       />
                       <div style={{ 
                           position: 'absolute', 
                           top: 0, 
                           left: 0, 
                           width: star <= Math.floor(rating) ? '100%' : (star === Math.ceil(rating) && rating % 1 !== 0) ? '50%' : '0%', 
                           overflow: 'hidden',
                           height: '100%'
                       }}>
                           <Star 
                               size={14} 
                               fill="#00e054" 
                               color="#00e054" 
                               strokeWidth={0}
                               style={{ position: 'absolute', top: 0, left: 0 }}
                           />
                       </div>
                   </div>
               ))}
             </div>
             <span className="review-date">Watched {formattedDate}</span>
           </div>
        </div>

        <div className="review-body">
          {containsSpoiler && !showSpoiler ? (
            <div className="spoiler-warning">
              <p>This review contains spoilers.</p>
              <button className="spoiler-reveal-btn" onClick={() => setShowSpoiler(true)}>
                I can handle the truth (View Spoiler)
              </button>
            </div>
          ) : (
            <div className={`review-text ${containsSpoiler ? 'revealed-spoiler' : ''}`}>
               {content}
            </div>
          )}
        </div>

        <div className="review-card-footer">
            <div 
                className="review-likes-container" 
                onClick={handleLike}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginTop: 'auto', 
                    color: '#99aabb', 
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <Heart size={14} fill={isLikedState ? "#FF8000" : "#99aabb"} color={isLikedState ? "#FF8000" : "#99aabb"} style={{ marginRight: '5px' }} />
                <span>{likesCountState} likes</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
