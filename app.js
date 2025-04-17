// Supabase URL and anon key
const supabaseUrl = 'https://kghqkcbrxnbytmchilcj.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const fileInput = document.getElementById('file');
const uploadButton = document.getElementById('uploadButton');
const uploadStatus = document.getElementById('uploadStatus');
const wallpapersDiv = document.getElementById('wallpapers');

// Upload function to Supabase Storage
async function uploadWallpaper() {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }

  uploadStatus.textContent = 'Uploading...';

  try {
    // Upload image to Supabase storage in 'wallpapers' folder
    const { data, error } = await supabase.storage
      .from('wallpapers')
      .upload(`public/${file.name}`, file);

    if (error) {
      uploadStatus.textContent = `Error: ${error.message}`;
      return;
    }

    // Insert metadata into the wallpapers table
    await insertWallpaperMetadata(file.name);
    uploadStatus.textContent = 'Upload successful!';
    fetchWallpapers(); // Fetch the latest wallpapers
  } catch (error) {
    uploadStatus.textContent = `Error: ${error.message}`;
  }
}

// Insert wallpaper metadata into Supabase database
async function insertWallpaperMetadata(fileName) {
  const { data, error } = await supabase
    .from('wallpapers')
    .insert([
      { url: fileName, likes: 0, downloads: 0 }
    ]);
  if (error) {
    alert('Error inserting metadata: ' + error.message);
  }
}

// Fetch and display wallpapers from Supabase
async function fetchWallpapers() {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*');

  if (error) {
    alert('Error fetching wallpapers: ' + error.message);
    return;
  }

  wallpapersDiv.innerHTML = ''; // Clear existing wallpapers
  data.forEach(wallpaper => {
    const wallpaperElement = document.createElement('div');
    wallpaperElement.classList.add('wallpaper-card');
    wallpaperElement.innerHTML = `
      <img src="https://kghqkcbrxnbytmchilcj.supabase.co/storage/v1/object/public/wallpapers/${wallpaper.url}" class="wallpaper-image">
      <button onclick="likeWallpaper('${wallpaper.id}')">Like</button>
      <button onclick="downloadWallpaper('${wallpaper.url}')">Download</button>
    `;
    wallpapersDiv.appendChild(wallpaperElement);
  });
}

// Like functionality
async function likeWallpaper(wallpaperId) {
  const { data, error } = await supabase
    .from('wallpapers')
    .update({ likes: supabase.raw('likes + 1') })
    .eq('id', wallpaperId);

  if (error) {
    alert('Error liking wallpaper: ' + error.message);
  }
  fetchWallpapers();
}

// Download wallpaper
async function downloadWallpaper(url) {
  const { data, error } = await supabase
    .from('wallpapers')
    .update({ downloads: supabase.raw('downloads + 1') })
    .eq('url', url);

  if (error) {
    alert('Error tracking download: ' + error.message);
  }
  window.location.href = `https://kghqkcbrxnbytmchilcj.supabase.co/storage/v1/object/public/wallpapers/${url}`;
}

// Fetch wallpapers when the page loads
fetchWallpapers();

// Event listeners
uploadButton.addEventListener('click', uploadWallpaper);
