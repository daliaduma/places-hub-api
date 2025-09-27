import express from "express";
import * as path from "node:path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fs from "node:fs";
import placesRoutes from "./routes/places-routes.js";
import usersRoutes from "./routes/users-routes.js";
import HttpError from "./models/http-error.js";

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
	next();
})

app.get('/', (req, res) => {
	res.json({ message: 'Hello from Express on Vercel!' });
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
		fs.unlink(req.file.path, (err) => {
			console.log(err);
		});
  }
	if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wq74gol.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`,
  )
  .then(() => {
    app.listen(port, () => {
	    console.log(`App listening to port ${port}`);
    });
  })
  .catch((err) => console.log(err));

export default app;
