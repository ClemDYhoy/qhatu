import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
email: { type: String, required: true, unique: true },
telefono: { type: String, unique: true, sparse: true },
nombre: { type: String },
password: { type: String, required: true },
preferencias: [String], // Para analytics futuros
fechaRegistro: { type: Date, default: Date.now },
});

// Hashear password
userSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();
this.password = await bcrypt.hash(this.password, 10);
next();
});

// Comparar password
userSchema.methods.comparePassword = async function (candidatePassword) {
return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);