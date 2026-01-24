import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasteApi } from '../api/config';

const ViewPaste = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [paste, setPaste] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPaste = async () => {
            try {
                setLoading(true);
                const response = await PasteApi.getPaste(id);
                setPaste(response.data);
                setError('');
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Paste not found. It may have expired or reached its view limit.');
                } else {
                    setError('Failed to load paste. Please try again.');
                }
                setPaste(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPaste();
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <p>Loading paste...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                padding: '20px'
            }}>
                <h2 style={{ color: '#d32f2f' }}>Error</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Create New Paste
                </button>
            </div>
        );
    }

    if (!paste) {
        return null;
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh'
        }}>
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #eee'
                }}>
                    <h1 style={{ margin: 0 }}>Paste Content</h1>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Create New
                    </button>
                </div>

                {paste.remaining_views !== null && (
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                        Remaining views: {paste.remaining_views}
                    </p>
                )}

                {paste.expires_at && (
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                        Expires at: {new Date(paste.expires_at).toLocaleString()}
                    </p>
                )}

                <pre style={{
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '15px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: 0
                }}>
                    {paste.content}
                </pre>
            </div>
        </div>
    );
};

export default ViewPaste;

