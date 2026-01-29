import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import './PersonDetails.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PersonDetails = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [person, setPerson] = useState(null);
    const [credits, setCredits] = useState({ cast: [], crew: [] });
    const [loading, setLoading] = useState(true);
    const [activeDepartment, setActiveDepartment] = useState(location.state?.department || 'Acting'); 
    const [sortBy, setSortBy] = useState('rating'); // Default sort by rating
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                
                // Fetch Person Details
                const personRes = await fetch(`${API_BASE_URL}/api/movies/person/${id}`, { headers });
                const personData = await personRes.json();
                
                // Fetch Movie Credits
                const creditsRes = await fetch(`${API_BASE_URL}/api/movies/person/${id}/movie_credits`, { headers });
                const creditsData = await creditsRes.json();
                
                setPerson(personData);
                setCredits(creditsData);
                
                // Determine initial active department logic
                const requestedDept = location.state?.department;
                let validDept = null;

                const hasActing = creditsData.cast && creditsData.cast.length > 0;
                const crewDepts = creditsData.crew ? [...new Set(creditsData.crew.map(c => c.department))] : [];

                if (requestedDept) {
                    if (requestedDept === 'Acting' && hasActing) {
                        validDept = 'Acting';
                    } else if (crewDepts.includes(requestedDept)) {
                        validDept = requestedDept;
                    }
                }

                if (!validDept) {
                    if (hasActing) {
                        validDept = 'Acting';
                    } else if (crewDepts.length > 0) {
                        validDept = crewDepts[0];
                    }
                }

                if (validDept) {
                    setActiveDepartment(validDept);
                }
                
            } catch (error) {
                console.error("Failed to fetch person details", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id, token]);

    const getFilteredAndSortedCredits = () => {
        let list = [];
        
        if (activeDepartment === 'Acting') {
            list = credits.cast || [];
        } else {
            list = (credits.crew || []).filter(c => c.department === activeDepartment);
        }
        
        // Remove duplicates (same movie, multiple roles in same department might happen)
        const uniqueList = Array.from(new Map(list.map(item => [item.id, item])).values());
        
        return uniqueList.sort((a, b) => {
            if (sortBy === 'rating') {
                return (b.vote_average || 0) - (a.vote_average || 0);
            } else if (sortBy === 'newest') {
                return new Date(b.release_date || 0) - new Date(a.release_date || 0);
            } else if (sortBy === 'oldest') {
                return new Date(a.release_date || 0) - new Date(b.release_date || 0);
            } else if (sortBy === 'popularity') {
                return (b.popularity || 0) - (a.popularity || 0);
            }
            return 0;
        });
    };

    if (loading) return <div className="person-details-container">Loading...</div>;
    if (!person) return <div className="person-details-container">Person not found</div>;

    const availableDepartments = new Set();
    if (credits.cast && credits.cast.length > 0) availableDepartments.add('Acting');
    if (credits.crew) {
        credits.crew.forEach(c => availableDepartments.add(c.department));
    }
    // Convert to array and sort: Active department first, then alphabetical
    const departmentsList = Array.from(availableDepartments).sort((a, b) => {
        if (a === activeDepartment) return -1;
        if (b === activeDepartment) return 1;
        // Keep Acting near top if not active? 
        // User requested: "when clicked in cast acting should be first block , when we click in the crew as director directing block should be first one"
        // So prioritizing activeDepartment is the key.
        return a.localeCompare(b);
    });

    const filteredCredits = getFilteredAndSortedCredits();

    return (
        <div className="landing-container">
            <Navbar />
            <div className="person-details-content">
                <div className="person-header">
                    <div className="person-poster">
                        <img 
                            src={person.profile_path 
                                ? `https://image.tmdb.org/t/p/w500${person.profile_path}` 
                                : "https://via.placeholder.com/300x450?text=No+Image"} 
                            alt={person.name} 
                        />
                    </div>
                    <div className="person-info">
                        <h1>{person.name}</h1>
                        <div className="person-bio">
                            <h3>Biography</h3>
                            <p>{person.biography || "No biography available."}</p>
                        </div>
                        <div className="person-stats">
                            <div><strong>Born:</strong> {person.birthday} {person.place_of_birth && `in ${person.place_of_birth}`}</div>
                            {person.deathday && <div><strong>Died:</strong> {person.deathday}</div>}
                            <div><strong>Known For:</strong> {person.known_for_department}</div>
                        </div>
                    </div>
                </div>

                <div className="credits-section">
                    <div className="credits-controls">
                        <div className="department-tabs">
                            {departmentsList.map(dept => (
                                <button 
                                    key={dept}
                                    className={`dept-tab ${activeDepartment === dept ? 'active' : ''}`}
                                    onClick={() => setActiveDepartment(dept)}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                        <div className="sort-controls">
                            <label>Sort by:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="rating">Highest Rated</option>
                                <option value="popularity">Most Popular</option>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    <div className="credits-grid">
                        {filteredCredits.length > 0 ? (
                            filteredCredits.map(movie => (
                                <div 
                                    key={`${movie.id}-${movie.job || 'cast'}`} 
                                    className="movie-card"
                                    onClick={() => navigate(`/movie/${movie.id}`)}
                                >
                                    <div className="movie-poster">
                                        {movie.poster_path ? (
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                                alt={movie.title} 
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="no-poster-fallback"
                                            style={{
                                                display: movie.poster_path ? 'none' : 'flex',
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: '#1f2937',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                padding: '10px',
                                                textAlign: 'center',
                                                color: '#64748b'
                                            }}
                                        >
                                            <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🎬</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{movie.title}</span>
                                        </div>
                                        <div className="movie-rating">
                                            {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
                                        </div>
                                    </div>
                                    <div className="movie-info">
                                        <div className="movie-title">{movie.title}</div>
                                        <div className="movie-year">
                                            {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                        </div>
                                        <div className="movie-role">
                                            {activeDepartment === 'Acting' ? (movie.character ? `as ${movie.character}` : '') : movie.job}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-credits">No credits found for this department.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonDetails;
