const axios = require('axios');
const Vibrant = require('node-vibrant');
const fs = require('fs');

// Replace 'YOUR_ACCESS_TOKEN' with your actual access token
const accessToken ='YOUR_ACCESS_TOKEN';

// Set up the request headers
const headers = {
  'Authorization': `Bearer ${accessToken}`,
};

// Make the GET request to the Spotify API
axios.get('https://api.spotify.com/v1/me/player/currently-playing', { headers })
  .then(async (response) => {
    // Handle the response here
    const currentlyPlayingTrack = response.data;

    if (currentlyPlayingTrack && currentlyPlayingTrack.item) {
      // Extract the track image URL
      const imageUrl = currentlyPlayingTrack.item.album.images[0].url;

      // Fetch the track image and extract the dominant color
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');

      Vibrant.from(imageBuffer)
        .getPalette()
        .then((palette) => {
          // The `palette` object contains various color values, including the dominant color
          const dominantColorHex = palette.Vibrant.getHex();

          // Update the CSS file with the dominant color hex
          updateCSSFile(dominantColorHex);

          console.log('Currently playing track:', currentlyPlayingTrack);
          console.log('Track Image URL:', imageUrl);
          console.log('Dominant Color:', dominantColorHex);
        })
        .catch((error) => {
          console.error('Error analyzing image:', error);
        });
    } else {
      console.log('No track is currently playing.');
    }
  })
  .catch((error) => {
    // Handle any errors here
    console.error('Error:', error);
  });

// Function to update the CSS file with the dominant color hex
function updateCSSFile(dominantColorHex) {
  const cssFilePath = '//'; // Replace with the actual path to your CSS file

  fs.readFile(cssFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSS file:', err);
      return;
    }

    // Replace the background color variable in the CSS with the dominant color hex
    const updatedCSS = data
  .replace(/--background-accent: #[0-9a-fA-F]+;/, `--background-accent: ${dominantColorHex};`)
  .replace(/--background-secondary: #[0-9a-fA-F]+;/, `--background-secondary: ${dominantColorHex};`)

    // Write the updated CSS back to the file
    fs.writeFile(cssFilePath, updatedCSS, 'utf8', (err) => {
      if (err) {
        console.error('Error writing updated CSS file:', err);
        return;
      }
      console.log('CSS file updated with the dominant color:', dominantColorHex);
    });
  });
}
