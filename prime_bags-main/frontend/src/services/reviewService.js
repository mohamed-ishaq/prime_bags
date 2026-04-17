import api from './api';

const getAllReviews = async () => {
    const response = await api.get('/reviews');
    return response.data;
};

const reviewService = {
    getAllReviews,
};

export default reviewService;

