const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'v75tv7wk',
  api_key: '697216148227581',
  api_secret: 'wxo_pzFgH27hsPu0Q2cyvKHwXQM'
});

async function uploadVideos() {
  try {
    console.log("Uploading Hero pc.mp4...");
    const pcRes = await cloudinary.uploader.upload_large('public/videos/Hero pc.mp4', {
      resource_type: 'video',
      folder: 'fajasab-hero'
    });
    console.log("PC Video uploaded successfully:", pcRes.secure_url);

    console.log("Uploading Hero responsive.mp4...");
    const mobileRes = await cloudinary.uploader.upload_large('public/videos/Hero responsive.mp4', {
      resource_type: 'video',
      folder: 'fajasab-hero'
    });
    console.log("Mobile Video uploaded successfully:", mobileRes.secure_url);

  } catch (error) {
    console.error("Error uploading videos:", error);
  }
}

uploadVideos();
