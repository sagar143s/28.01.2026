import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  image: String,
  parentId: {
    type: String,
    ref: 'Category',
    default: null
  }
}, {
  timestamps: true
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
