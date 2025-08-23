import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
    trim: true
},
description: {
    type: String,
    required: true
},
price: {
    type: Number,
    required: true,
    min: 0
},
image: {
    type: String,
    required: true
},
category: {
    type: String,
    required: true
},
features: [{
    type: String
}],
stock: {
    type: Number,
    required: true,
    min: 0
},
rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
},
isActive: {
    type: Boolean,
    default: true
}
}, {
timestamps: true
});

// Asegúrate de exportar el modelo CORRECTAMENTE
export default mongoose.model('Product', productSchema);