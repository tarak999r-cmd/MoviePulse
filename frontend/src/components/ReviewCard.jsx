import React, { useState } from 'react';
import { Star, Heart, RefreshCw, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ReviewCard.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

const ReviewCard = ({ review, reviewAuthor }) => {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const navigate = useNavigate();

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
    likesCount,
    isLiked,
    createdAt,
    watchedDate,
    rewatch,
    isRewatch,
    tags
  } = review;

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
           
           {tags && tags.length > 0 && (
               <div className="review-tags" style={{ display: 'flex', alignItems: 'center', marginTop: '4px', gap: '6px' }}>
                    <Tag size={12} color="#556677" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {tags.map((tag, idx) => (
                            <span 
                                key={idx} 
                                style={{ fontSize: '0.75rem', color: '#678', cursor: 'pointer' }}
                                onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                                onMouseOver={(e) => e.target.style.color = '#00e054'}
                                onMouseOut={(e) => e.target.style.color = '#678'}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
               </div>
           )}
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
            <div className="review-likes-container" style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', color: '#99aabb', fontSize: '0.8rem' }}>
                <Heart size={14} fill={isLiked ? "#ff5c5c" : "#99aabb"} color={isLiked ? "#ff5c5c" : "#99aabb"} style={{ marginRight: '5px' }} />
                <span>{likesCount || 0} likes</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
