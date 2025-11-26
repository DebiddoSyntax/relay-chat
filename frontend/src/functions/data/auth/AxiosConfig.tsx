import axios from 'axios';

const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL

const api = axios.create({
    baseURL: `${apiURL}`, 
    withCredentials: true, 
});

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

export const InitializedInterceptor = (refreshAccessToken: () => Promise<string | null | undefined>) => {
    
    // Always eject existing interceptors first
    EjectInterceptors();
    
    console.log("Setting up interceptors");
    
    requestInterceptorId = api.interceptors.request.use(
        (config) => {
            const RequestInterToken = localStorage.getItem('accessToken');
            if (RequestInterToken) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${RequestInterToken}`;
                console.log("Token added to request");
            }
            return config;
        },
        (error) => {
            // console.error("Request interceptor error:", error);
            return Promise.reject(error);
        }
    );

    responseInterceptorId = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            // console.log("Response interceptor triggered");
            
            if (!error.response) {
                // console.error("Network error, no response received");
                return Promise.reject(error);
            }

            const originalRequest = error.config;
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                const token = localStorage.getItem('accessToken');
                
                if (!token) {
                    // console.log("No token found, rejecting request");
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    // console.log("Already refreshing, queueing request");
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
						// console.log('failed request queue with 401', failedQueue)
                    })
                        .then(token => {
                            if (token) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            return api(originalRequest);
                        })
                        .catch(err => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                // console.log("Starting token refresh");

                try {
                    const newToken = await refreshAccessToken();
                    
                    if (newToken) {
                        // console.log("Token refreshed successfully");
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        processQueue(null, newToken);
                        return api(originalRequest);
                    } else {
                        // console.log("Token refresh returned no token");
                        processQueue(new Error('Token refresh failed'), null);
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    // console.error("Token refresh failed", refreshError);
                    processQueue(refreshError as Error, null);
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );

    // console.log("Interceptors initialized with IDs:", requestInterceptorId, responseInterceptorId);
};

export const EjectInterceptors = () => {
    if (requestInterceptorId !== null) {
        api.interceptors.request.eject(requestInterceptorId);
        // console.log("Request interceptor ejected");
        requestInterceptorId = null;
    }
    if (responseInterceptorId !== null) {
        api.interceptors.response.eject(responseInterceptorId);
        // console.log("Response interceptor ejected");
        responseInterceptorId = null;
    }
    isRefreshing = false;
    failedQueue = [];
};

// Check if interceptors are active
export const areInterceptorsActive = () => {
    return requestInterceptorId !== null && responseInterceptorId !== null;
};

export default api;

