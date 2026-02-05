import React, { useState } from 'react';
import { Eye, Heart, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Reusable MoviePoster component with hover effects
 */
const MoviePoster = ({ 
    movie, 
    review = null, 
    showTitleTooltip = true, 
    className = '', 
    style = {}, 
    onClick = null
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    
    // State for actions
    const [isLiked, setIsLiked] = useState(false); // Movie like
    const [isWatched, setIsWatched] = useState(false); // Movie watched
    
    // Track previous review to handle prop changes during render
    const [prevReview, setPrevReview] = useState(review);
    const [isReviewLiked, setIsReviewLiked] = useState(() => {
        if (review) {
            return review.isReviewLiked || review.isLiked || false;
        }
        return false;
    }); // Review like

    // Adjust state during render if review prop changes
    if (review !== prevReview) {
        setPrevReview(review);
        const newIsReviewLiked = review ? (review.isReviewLiked || review.isLiked || false) : false;
        if (newIsReviewLiked !== isReviewLiked) {
            setIsReviewLiked(newIsReviewLiked);
        }
    }
    
    const [statusChecked, setStatusChecked] = useState(false);

    const checkStatus = async () => {
        if (!user || statusChecked || review) return; // If review exists, we use review like status primarily for the heart? 
        // Actually, if it's a review card, the heart likes the REVIEW.
        // If it's a movie card, the heart likes the MOVIE.
        
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { 'Authorization': `Bearer ${token}` };

            const [likeRes, watchedRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/likes/${movie.id}/check`, { headers }),
                fetch(`${API_BASE_URL}/api/watched/${movie.id}/check`, { headers })
            ]);

            if (likeRes.ok) {
                const data = await likeRes.json();
                setIsLiked(data.isLiked);
            }
            if (watchedRes.ok) {
                const data = await watchedRes.json();
                setIsWatched(data.isWatched);
            }
            setStatusChecked(true);
        } catch (error) {
            console.error("Error checking movie status:", error);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (user && !review && !statusChecked) {
            checkStatus();
        }
    };

    const handlePosterClick = (e) => {
        if (onClick) {
            onClick(e);
        } else {
            navigate(`/movie/${movie.id}`);
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/signin');
            return;
        }

        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        if (review) {
            // Like/Unlike Review
            try {
                const url = `${API_BASE_URL}/api/reviews/${review.id}/${isReviewLiked ? 'unlike' : 'like'}`;
                // Checking backend controller: 
                // @PostMapping("/{reviewId}/like")
                // @PostMapping("/{reviewId}/unlike")
                // Both are POST.
                
                const res = await fetch(url, { method: 'POST', headers });
                if (res.ok) {
                    setIsReviewLiked(!isReviewLiked);
                }
            } catch (err) {
                console.error("Error liking review:", err);
            }
        } else {
            // Like/Unlike Movie
            try {
                if (isLiked) {
                    await fetch(`${API_BASE_URL}/api/likes/${movie.id}`, { method: 'DELETE', headers });
                    setIsLiked(false);
                } else {
                    await fetch(`${API_BASE_URL}/api/likes`, { 
                        method: 'POST', 
                        headers,
                        body: JSON.stringify({
                            movieId: movie.id,
                            title: movie.title,
                            posterPath: movie.poster_path,
                            voteAverage: movie.vote_average, // Might be undefined if not in movie object
                            releaseDate: movie.release_date
                        })
                    });
                    setIsLiked(true);
                }
            } catch (err) {
                console.error("Error liking movie:", err);
            }
        }
    };

    const handleWatch = async (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/signin');
            return;
        }

        if (review) {
            // If it's a review card, eye icon might mean "View Review" or "Mark Movie Watched"?
            // Let's assume it marks the movie watched, same as normal movie card.
        }

        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            if (isWatched) {
                await fetch(`${API_BASE_URL}/api/watched/${movie.id}`, { method: 'DELETE', headers });
                setIsWatched(false);
            } else {
                await fetch(`${API_BASE_URL}/api/watched`, { 
                    method: 'POST', 
                    headers,
                    body: JSON.stringify({
                        movieId: movie.id,
                        title: movie.title,
                        posterPath: movie.poster_path,
                        voteAverage: movie.vote_average,
                        releaseDate: movie.release_date
                    })
                });
                setIsWatched(true);
            }
        } catch (err) {
            console.error("Error toggling watched:", err);
        }
    };

    const handleMore = (e) => {
        e.stopPropagation();
        // Placeholder for more options
        console.log("More options clicked");
    };

    const posterUrl = (() => {
        if (movie.poster_path) {
            return movie.poster_path.startsWith('http') 
                ? movie.poster_path 
                : `${IMAGE_BASE_URL}${movie.poster_path}`;
        }
        if (movie.posterUrl) {
            return movie.posterUrl.startsWith('http') 
                ? movie.posterUrl 
                : `${IMAGE_BASE_URL}${movie.posterUrl}`;
        }
        return 'https://via.placeholder.com/150x225';
    })();

    const movieTitle = movie.title || movie.movieTitle || 'Unknown Title';
    
    // Determine heart color
    // If review: Orange (#FF8000) if liked, White if not
    // If movie: Pink (#ff5c5c) if liked, White if not
    const heartColor = review 
        ? (isReviewLiked ? "#FF8000" : "#fff") 
        : (isLiked ? "#ff5c5c" : "#fff");
        
    const heartFill = review 
        ? (isReviewLiked ? "#FF8000" : "none") 
        : (isLiked ? "#ff5c5c" : "none");

    const eyeColor = isWatched ? "#00e054" : "#fff";

    return (
        <div 
            className={`movie-poster-container ${className}`}
            style={{ 
                position: 'relative', 
                borderRadius: '4px', 
                overflow: 'visible',
                cursor: 'pointer',
                border: isHovered ? '3px solid #00e054' : '1px solid #2c3440',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                transition: 'border 0.2s ease',
                aspectRatio: '2/3',
                ...style
            }}
            onClick={handlePosterClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Title Tooltip */}
            {isHovered && showTitleTooltip && (
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2c3440',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    border: '1px solid #445566'
                }}>
                    {movieTitle}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid #2c3440'
                    }} />
                </div>
            )}

            <img 
                src={posterUrl} 
                alt={movieTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px', display: 'block' }}
            />
            
            {/* Hover Overlay Options */}
            {isHovered && user && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(2px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    zIndex: 5
                }}>
                    <Eye 
                        size={20} 
                        color={eyeColor} 
                        style={{ cursor: 'pointer' }} 
                        onClick={handleWatch}
                    />
                    <Heart 
                        size={20} 
                        color={heartColor} 
                        fill={heartFill} 
                        style={{ cursor: 'pointer' }} 
                        onClick={handleLike}
                    />
                    <MoreHorizontal 
                        size={20} 
                        color="#fff" 
                        style={{ cursor: 'pointer' }} 
                        onClick={handleMore}
                    />
                </div>
            )}
        </div>
    );
};

export default MoviePoster;
