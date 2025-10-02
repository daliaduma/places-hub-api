import HttpError from "../models/http-error.js";
import {S3} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { MIME_TYPE_MAP } from "../middleware/file-upload.js";

const upload = async (req, res, next) => {
	const file = req.file;

	if (!file.buffer) {
		const error = new HttpError('Could not read image, unsupported media file.', 415);
		return next(error);
	}

	const s3 = new S3({
		region: process.env.AWS_BUCKET_REGION,
		credentials: {
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			accessKeyId: process.env.AWS_USER_ACCESS_KEY
		}
	});

	const ext = MIME_TYPE_MAP[file.mimetype];
	const fileName = uuidv4() + '.' + ext;

	try {
		await s3.putObject({
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: fileName,
			Body: file.buffer,
			ContentType: req.file.mimetype,
		});
	} catch (err) {
		const error = new HttpError(err.message, 500);
		return next(error);
	}
	res.status(201).json({url: process.env.FILE_UPLOAD_ASSET_URL + '/' +fileName});
}

export default {
	upload
}
