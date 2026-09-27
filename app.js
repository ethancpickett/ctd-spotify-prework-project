// Credentials from Spotify Developer Dashboard
const CLIENT_ID = '0eb6f4a6351c4eaebc2820666a885772'; 
const CLIENT_SECRET = '1e91b5832cf0456991d7fcbdf1952e4e';

// Grab HTML elements from the DOM
const searchBtn = document.getElementById('search-btn');
const artistInput = document.getElementById('artist-input');
const artistContainer = document.getElementById('artist-container');
const tracksContainer = document.getElementById('tracks-container');

// 1. Fetch an Access Token from Spotify
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

// 2. Fetch Endpoint 1: Search for an Artist
async function searchArtist(artistName) {
  try {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const searchData = await response.json();
    
    // Handle case where no artist is found
    if (!searchData.artists.items || searchData.artists.items.length === 0) {
      artistContainer.innerHTML = `<p style="color: red;">No artist found matching "${artistName}".</p>`;
      return;
    }

    const artist = searchData.artists.items[0];
    displayArtist(artist);

  } catch (error) {
    console.error('Error fetching artist data:', error);
    artistContainer.innerHTML = `<p style="color: red;">Error fetching data from Spotify.</p>`;
  }
}

// 3. Fetch Endpoint 2: Get Top Tracks for Selected Artist
async function fetchTopTracks(artistId) {
  try {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const trackData = await response.json();
    displayTopTracks(trackData.tracks);

  } catch (error) {
    console.error('Error fetching top tracks:', error);
    tracksContainer.innerHTML = `<p style="color: red;">Error loading top tracks.</p>`;
  }
}

// 4. Render Artist Data onto the Webpage (Error-Proofed Edition)
function displayArtist(artist) {
  // Clear previous results
  artistContainer.innerHTML = '';
  tracksContainer.innerHTML = '';

  // Safely check for images using optional chaining
  const imageUrl = (artist.images && artist.images.length > 0) 
    ? artist.images[0].url 
    : 'https://via.placeholder.com/200?text=No+Image';

  // Safely check for genres
  const genres = (artist.genres && artist.genres.length > 0) 
    ? artist.genres.join(', ') 
    : 'Not specified';

  // Safely handle follower count
  const followerCount = artist.followers?.total 
    ? artist.followers.total.toLocaleString() 
    : 'N/A';

  // Inject HTML into the artist-container <div>
  artistContainer.innerHTML = `
    <div class="artist-card" style="border: 1px solid #333; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; background-color: #181818;">
      <img src="${imageUrl}" alt="${artist.name}" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover;">
      <h2>${artist.name}</h2>
      <p><strong>Genres:</strong> ${genres}</p>
      <p><strong>Followers:</strong> ${followerCount}</p>
      <button onclick="fetchTopTracks('${artist.id}')" style="margin-top: 10px; padding: 10px 15px; background-color: #1db954; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">View Top Tracks</button>
    </div>
  `;
}

// 5. Render Top Tracks onto the Webpage
function displayTopTracks(tracks) {
  tracksContainer.innerHTML = '<h3 style="margin-top: 30px; text-align: center;">Top Tracks</h3>';

  if (!tracks || tracks.length === 0) {
    tracksContainer.innerHTML += '<p style="text-align: center;">No top tracks found for this artist.</p>';
    return;
  }

  let listHTML = '<ul style="list-style: none; padding: 0; max-width: 500px; margin: 0 auto;">';

  tracks.forEach((track, index) => {
    listHTML += `
      <li style="background: #282828; margin: 8px 0; padding: 12px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
        <span><strong>${index + 1}.</strong> ${track.name}</span>
        <span style="color: #b3b3b3; font-size: 0.9em;">${track.album.name}</span>
      </li>
    `;
  });

  listHTML += '</ul>';
  tracksContainer.innerHTML += listHTML;
}

// 6. Listen for User Input
searchBtn.addEventListener('click', () => {
  const query = artistInput.value.trim();
  if (query) {
    searchArtist(query);
  }
});

// Also trigger search when hitting "Enter" in the input field
artistInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const query = artistInput.value.trim();
    if (query) {
      searchArtist(query);
    }
  }
});