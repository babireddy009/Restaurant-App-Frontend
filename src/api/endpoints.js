import api from './client';

// Auth
export const login = (data) => api.post('/auth/login/', data);
export const register = (data) => api.post('/auth/register/', data);
export const registerDriver = (data) => api.post('/auth/driver/register/', data);
export const googleLogin = (token) => api.post('/auth/google/', { token });
export const sendOtp = (data) => api.post('/auth/send-otp/', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp/', data);
export const logout = (refresh) => api.post('/auth/logout/', { refresh });
export const getProfile = () => api.get('/auth/profile/');
export const updateProfile = (data) => api.patch('/auth/profile/', data);

// Menu
export const getCategories = (params) => api.get('/menu/categories/', { params });
export const getMenuItems = (params) => api.get('/menu/items/', { params });
export const getMenuItem = (id) => api.get(`/menu/items/${id}/`);
export const getFeaturedItems = () => api.get('/menu/featured/');
export const getGalleryImages = () => api.get('/menu/gallery/');

// Orders
export const createOrder = (data) => api.post('/orders/', data);
export const getMyOrders = () => api.get('/orders/');
export const getOrderDetail = (id) => api.get(`/orders/${id}/`);

// Payments
export const createPayment = (order_id) => api.post('/payments/create/', { order_id });
export const verifyPayment = (data) => api.post('/payments/verify/', data);
export const getPaymentStatus = (order_id) => api.get(`/payments/status/${order_id}/`);

// Staff
export const getStaffOrders = (params) => api.get('/orders/staff/all/', { params });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status/`, { status });

// Driver
export const getAvailableDeliveries = () => api.get('/orders/driver/available/');
export const getMyDeliveries = () => api.get('/orders/driver/my-deliveries/');
export const assignDriver = (id) => api.post(`/orders/${id}/assign-driver/`);
export const getDriverOrderView = (id) => api.get(`/orders/${id}/driver-view/`);
export const confirmDelivery = (id, otp) => api.post(`/orders/${id}/confirm-delivery/`, { otp });
export const submitReview = (id, data) => api.post(`/orders/${id}/review/`, data);
export const getAnalytics = () => api.get('/orders/analytics/');
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel/`);

