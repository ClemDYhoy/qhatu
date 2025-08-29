import mongoose from 'mongoose';

const carouselSchema = new mongoose.Schema({
images: [{
    url: String,
    title: String,
    description: String
}],
updatedAt: {
    type: Date,
    default: Date.now
}
});

const Carousel = mongoose.model('Carousel', carouselSchema);

export default Carousel; // Exporta como default