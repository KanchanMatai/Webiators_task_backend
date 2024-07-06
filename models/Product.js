
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    metaTitle: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productUrlSlug: {
        type: String,
        required: true,
        unique: true
    },
    galleryImages: {
        type: [String], // Array of strings (image URLs)
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signup', // Reference to the Signup model for createdBy field
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model based on the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
