import express from "express";
import ffmpeg from "fluent-ffmpeg";
import { promiseHooks } from "v8";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  uploadProcessedVideo,
} from "./storage";

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Bad request: missing file name.");
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

  await downloadRawVideo(inputFileName);

  try {
    await convertVideo(inputFileName, outputFileName);
  } catch {
    await Promise.all([
      deleteProcessedVideo(outputFileName),
      deleteRawVideo(inputFileName),
    ]);
    return res
      .status(500)
      .send("Internal Server Error: video processing failed.");
  }

  await uploadProcessedVideo(outputFileName);
  await Promise.all([
    deleteProcessedVideo(outputFileName),
    deleteRawVideo(inputFileName),
  ]);
  return res.status(200).send("Processing successful!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
