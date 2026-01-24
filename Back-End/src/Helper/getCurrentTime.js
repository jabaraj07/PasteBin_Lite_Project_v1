function getCurrentTime(req) {
    const isTestMode = process.env.TEST_MODE === "1";
    const hasTestHeader = req.headers['x-test-now-ms'];
    
    if (isTestMode && hasTestHeader) {
        return parseInt(req.headers['x-test-now-ms']);
    }
    
    // Otherwise use real system time
    return Date.now();
}

  export default getCurrentTime