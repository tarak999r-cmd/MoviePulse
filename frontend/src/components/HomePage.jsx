import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Star, Heart, MessageSquare, RefreshCw, AlignLeft, Tag, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const API_BASE_URL = 'http://localhost:8080';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch(`${API_BASE_URL}/api/reviews/friends`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setReviews(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [user]);

    const handleLikeReview = async (e, reviewId, isLiked) => {
        e.stopPropagation();
        try {
            const method = isLiked ? 'DELETE' : 'POST';
            const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/like`, {
                method: method,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (res.ok) {
                setReviews(prev => prev.map(r => {
                    if (r.id === reviewId) {
                        return { ...r, isReviewLiked: !isLiked };
                    }
                    return r;
                }));
            } else {
                console.error("Failed to like/unlike review");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="landing-container" style={{ minHeight: '100vh', backgroundColor: '#14181c' }}>
            <Navbar />
            
            <main className="main-layout" style={{ paddingTop: '80px', maxWidth: '950px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ marginBottom: '20px', color: '#99aabb', fontSize: '1.2rem' }}>
                        Welcome back, <span style={{ color: '#fff', fontWeight: 'bold' }}>{user?.name}</span>. Here’s what your friends have been watching...
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #445566', paddingBottom: '10px' }}>
                        <h2 style={{ fontSize: '0.9rem', color: '#99aabb', letterSpacing: '0.075em', fontWeight: 'normal', margin: 0 }}>NEW FROM FRIENDS</h2>
                        <span style={{ fontSize: '0.8rem', color: '#667788', cursor: 'pointer' }}>⚡ ALL ACTIVITY</span>
                    </div>

                    {loading ? (
                        <div style={{ color: '#99aabb' }}>Loading activity...</div>
                    ) : reviews.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                            {reviews.map(review => (
                                <div key={review.id} style={{ width: '100%' }}>
                                    {/* Poster Card */}
                                    <div 
                                        style={{ 
                                            position: 'relative', 
                                            aspectRatio: '2/3', 
                                            borderRadius: '4px', 
                                            overflow: 'hidden',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            border: '1px solid #2c3440',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                                        }}
                                        onClick={() => navigate(`/movie/${review.movieId}/activity?userId=${review.user.id}&tab=REVIEWS`)}
                                        title={review.movieTitle}
                                    >
                                        <img 
                                            src={review.moviePosterUrl ? `${IMAGE_BASE_URL}${review.moviePosterUrl}` : 'https://via.placeholder.com/150x225'} 
                                            alt={review.movieTitle}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        
                                        {/* User Overlay Bar */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '8px',
                                            background: 'rgba(20, 24, 28, 0.8)',
                                            backdropFilter: 'blur(2px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            borderTop: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <img 
                                                src={review.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=random`} 
                                                alt={review.user?.name}
                                                style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                                            />
                                            <span style={{ 
                                                color: '#fff', 
                                                fontSize: '0.75rem', 
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {review.user?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meta Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {/* Stars */}
                                            <div style={{ position: 'relative', display: 'inline-block', width: '60px', height: '12px' }}>
                                                {/* Background Stars (Grey) */}
                                                <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex' }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={`bg-${star}`} size={12} fill="#2c3440" color="#2c3440" strokeWidth={0} />
                                                    ))}
                                                </div>
                                                {/* Foreground Stars (Green) */}
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    display: 'flex', 
                                                    width: `${(review.rating / 5) * 100}%`, 
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={`fg-${star}`} size={12} fill="#00e054" color="#00e054" strokeWidth={0} />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Like Icon */}
                                            {review.isLiked && (
                                                <Heart size={12} fill="#ff5c5c" color="#ff5c5c" style={{ marginLeft: '2px' }} />
                                            )}
                                            
                                            {/* Review Text Icon */}
                                            {review.content && (
                                                <AlignLeft size={12} color="#89a" style={{ marginLeft: '2px' }} />
                                            )}
                                            
                                            {/* Rewatch Icon */}
                                            {review.rewatch && (
                                                <RefreshCw size={10} color="#00e054" style={{ marginLeft: '2px' }} />
                                            )}
                                        </div>
                                        
                                        <span style={{ fontSize: '0.75rem', color: '#667788' }}>
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#667788', backgroundColor: '#1c222b', borderRadius: '8px' }}>
                            <p>No activity from friends yet.</p>
                            <button 
                                onClick={() => navigate('/search')}
                                style={{
                                    marginTop: '10px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Find friends to follow
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HomePage;