import multer from 'multer';

export const MIME_TYPE_MAP = {
	'image/png': "png",
	'image/jpeg': "jpeg",
	'image/jpg': "jpg",
}

const fileFilter = (req, file, cb) => {
	const isValid = !!MIME_TYPE_MAP[file.mimetype];
	let error = isValid ? null : new Error('Invalid mimetype!')
	cb(error, isValid);
};

const storage = multer.memoryStorage();
const fileUpload = multer({ storage, fileFilter });

export default fileUpload;
