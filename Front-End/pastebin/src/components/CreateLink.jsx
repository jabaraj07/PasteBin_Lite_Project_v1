import React, {useState} from 'react'
import { PasteApi } from '../api/config'
import './CreateLink.css'

const CreateLink = () => {
    const [data, setData] = useState(
        {
            "content": "",
            "ttl_seconds": "",
            "max_views": "",
            error: '',
            loading: false,
            url: '',
            pasteId: ''
        }
    )
    

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
            error: ''  // Clear error when user starts typing
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!data.content.trim()){
            setData({
                ...data,
                error:'Content is required'
            })
            return;
        }

        // Check content length limit (1MB = 1,048,576 characters)
        const MAX_CONTENT_LENGTH = 1048576;
        if(data.content.length > MAX_CONTENT_LENGTH){
            setData({
                ...data,
                error:`Content is too long. Maximum length is ${MAX_CONTENT_LENGTH.toLocaleString()} characters (1MB).`
            })
            return;
        }

        // TTL and max_views are optional, but if provided, must be >= 1
        // Only validate if the field has a non-empty value
        const ttlValue = data.ttl_seconds?.toString().trim();
        if(ttlValue && ttlValue !== ''){
            const ttlNum = parseInt(ttlValue);
            if(isNaN(ttlNum) || ttlNum < 1){
                setData({
                    ...data,
                    error:'ttl_seconds must be an integer >= 1'
                })
                return;
            }
        }

        const maxViewsValue = data.max_views?.toString().trim();
        if(maxViewsValue && maxViewsValue !== ''){
            const maxViewsNum = parseInt(maxViewsValue);
            if(isNaN(maxViewsNum) || maxViewsNum < 1){
                setData({
                    ...data,
                    error:'max_views must be an integer >= 1'
                })
                return;
            }
        }

        setData({...data, loading: true, error: ''});
        
        // Prepare data for API - only include ttl_seconds and max_views if they have values
        const apiData = {
            content: data.content,
        };
        
        // Only add ttl_seconds if it has a valid value (reuse ttlValue from validation above)
        if(ttlValue && ttlValue !== ''){
            apiData.ttl_seconds = parseInt(ttlValue);
        }
        
        // Only add max_views if it has a valid value (reuse maxViewsValue from validation above)
        if(maxViewsValue && maxViewsValue !== ''){
            apiData.max_views = parseInt(maxViewsValue);
        }
        
        try {
            console.log('Sending request to create paste:', apiData);
            const Response = await PasteApi.createPaste(apiData);
            console.log('Response received:', Response.data);

            if(!Response.data.id){
                setData({
                    ...data,
                    loading: false,
                    error: Response.data.error || 'Failed to create paste'
                })
                return;
            }

            // Construct the URL properly - if backend returns undefined, use frontend origin
            let pasteUrl = Response.data.url;
            if (!pasteUrl || pasteUrl.startsWith('undefined/')) {
                // If URL is invalid, construct it from frontend origin
                const frontendOrigin = window.location.origin;
                pasteUrl = `${frontendOrigin}/p/${Response.data.id}`;
            } else if (pasteUrl.startsWith('/')) {
                // If it's a relative URL, prepend origin
                pasteUrl = `${window.location.origin}${pasteUrl}`;
            }

            setData({
                ...data,
                loading: false,
                url: pasteUrl,
                pasteId: Response.data.id,
                error: ''
            })
        } catch (error) {
            console.error('Error creating paste:', error);
            if(error.response){
                // Server responded with error
                const status = error.response.status;
                const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create paste';
                setData({
                    ...data,
                    loading: false,
                    error: `Error ${status}: ${errorMessage}`
                })
            } else if(error.request){
                // Request was made but no response received
                setData({
                    ...data,
                    loading: false,
                    error: 'Cannot connect to server. Please check if the backend is running on http://localhost:5000'
                })
            } else {
                // Something else happened
                setData({
                    ...data,
                    loading: false,
                    error: error.message || 'Failed to create paste'
                })
            }
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.url);
        alert('URL copied to clipboard!');
    }

    const resetForm = () => {
        setData({
            "content": "",
            "ttl_seconds": "",
            "max_views": "",
            error: '',
            loading: false,
            url: '',
            pasteId: ''
        });
    }

    return (
        <div className="container">
            <div className="form-wrapper">
                <h1 className="title">{data.url ? "Copy and Share" : "Create Link"}</h1>
                <div>
                    {data.error && (
                        <div className="error-message">
                            {data.error}
                        </div>
                    )}
                
                {data.url ? (
                    <div className="success-box">
                        <h3 className="success-title">✓ Paste created successfully!</h3>
                        
                        {/* Paste ID */}
                        {data.pasteId && (
                            <div style={{marginBottom: '15px'}}>
                                <p className="paste-id-label">Paste ID:</p>
                                <p className="paste-id-value">{data.pasteId}</p>
                            </div>
                        )}
                        
                        <p className="share-label">Share this link:</p>
                        <div className="url-container">
                            <input 
                                type="text" 
                                value={data.url} 
                                readOnly
                                className="url-input"
                            />
                            <button 
                                type="button"
                                onClick={copyToClipboard}
                                className="copy-button"
                            >
                                Copy
                            </button>
                        </div>
                        
                        <div className="action-buttons">
                            <a 
                                href={data.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="action-link"
                            >
                                Open in new tab →
                            </a>
                            <button 
                                type="button"
                                onClick={resetForm}
                                className="action-button"
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="content" className="form-label">
                                Content <span className="required-star">*</span>
                            </label>
                            <textarea 
                                required 
                                name="content" 
                                id="content" 
                                rows="8" 
                                placeholder='Enter your text here...'
                                maxLength={1048576}
                                value={data.content}
                                onChange={handleChange}
                                className="textarea"
                            />
                            <p className="char-counter">
                                {data.content.length.toLocaleString()} / 1,048,576 characters
                            </p>
                        </div>

                        <div className="options-grid">
                            <div className="form-group">
                                <label htmlFor="ttl" className="form-label">
                                    TTL Seconds <span className="optional-text">(optional)</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="ttl" 
                                    name="ttl_seconds"
                                    placeholder="e.g., 3600"
                                    value={data.ttl_seconds}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="view" className="form-label">
                                    Max Views <span className="optional-text">(optional)</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="view" 
                                    name="max_views"
                                    placeholder="e.g., 10"
                                    value={data.max_views}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={data.loading}
                            className="submit-button"
                        >
                            {data.loading ? 'Creating...' : 'Create Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    </div>)
}

export default CreateLink


