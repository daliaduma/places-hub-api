import HttpError from "../models/http-error.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import {validationResult} from "express-validator";
import fs from "node:fs";
import {S3} from "@aws-sdk/client-s3";

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later",
      500,
    );
    return next(error);
  }
  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422),
    );
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500,
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "Could not create user, email already exists.",
      422,
    );
    return next(error);
  }

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError('Could not create user, please try again.', 500);
		return next(error);
	}

	const extension = req.file.filename.split(".").pop();
	const fileName = `${new Date().getTime()}.${extension}`;

	const bufferedImage= await fs.readFileSync(req.file.path);

	const s3 = new S3({
		region: "eu-north-1",
		credentials: {
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			accessKeyId: process.env.AWS_ACCESS_KEY
		}
	});

	try {
		await s3.putObject({
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: fileName,
			Body: bufferedImage,
			ContentType: req.file.mimetype,
		});
	} catch (err) {
		const error = new HttpError("Could not upload image", 500);
		return next(error);
	}

  const createdUser = new User({
    name,
    email,
    image: fileName,
	  password: hashedPassword,
    places: [],
  });

	await fs.unlinkSync(req.file.path);

	try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500,
    );
    return next(error);
  }

	let token;
	try {
		token = jwt.sign(
			{userId: createdUser.id, email: createdUser.email},
			process.env.JWT_KEY,
			{expiresIn: '1h'}
		);
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later",
			500,
		);
		return next(error);
	}

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422),
    );
  }
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later",
      500,
    );
    return next(error);
  }

  if (!existingUser) {
    return next(
      new HttpError(
        "Could not identify user, credentials seem to be wrong ",
        401,
      ),
    );
  }

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		const error = new HttpError('Could not log you in, please check your credentials and try again', 500);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError('Could not log you in, please check your credentials and try again', 403);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{userId: existingUser.id, email: existingUser.email},
				process.env.JWT_KEY,
			{expiresIn: '1h'}
		);
	} catch (err) {
		const error = new HttpError (
			"Logging in failed, please try again later",
			500,
		);
		return next(error);
	}

  res.json({
	  userId: existingUser.id,
	  email: existingUser.email,
	  token
  });
};

// exports.getUsers = getUsers;
// exports.signup = signup;
// exports.login = login;

export default {
	getUsers,
	signup,
	login
}
