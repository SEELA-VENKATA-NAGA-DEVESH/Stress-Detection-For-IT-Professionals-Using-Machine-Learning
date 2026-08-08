/* eslint-disable no-unused-vars */
const UNSPLASH_ACCESS_KEY = "ZeUwzgv5K9M48yW3LsEFQBmuuZ36c8rocSeKcQiCuBo";

// Function to fetch a random image from Unsplash
async function fetchRandomImage() {
  const query = "stress by IT employees";
  const url = `https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const imageUrl = data.urls.full;
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return null;
  }
}

// Apply the random image as background to the #root element
document.addEventListener("DOMContentLoaded", async () => {
  const rootElement = document.getElementById("root");
  // const randomImage = await fetchRandomImage();
  const randomImage = "https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/rZJIMvhmliwmde8a6/videoblocks-busy-people-working-in-office-team-of-workers-typing-on-laptops-huge-windows-background_roojacuy7_thumbnail-1080_01.png"
  if (randomImage) {
    rootElement.style.backgroundImage = `url(${randomImage})`;
  }
});
