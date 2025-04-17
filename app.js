// Supabase URL and anon key (Replace with your actual credentials)
const supabaseUrl = 'https://kghqkcbrxnbytmchilcj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaHFrY2JyeG5ieXRtY2hpbGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4ODIxMDYsImV4cCI6MjA2MDQ1ODEwNn0.Ya4M9Kmmpj_zfIqyiSj6avIqpvLOeuj8b2AoTU0N6Mc';  // Replace with your new anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const imageGallery = document.getElementById('imageGallery');

// Upload function to Supabase Storage
async function uploadImage() {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an image to upload.');
    return;
  }

  // Upload image to Supabase storage in 'images' folder
  const { data, error } = await supabase.storage
    .from('images')
    .upload(`public/${file.name}`, file);

  if (error) {
    alert('Error uploading image: ' + error.message);
    return;
  }

  // Insert metadata into the database
  const { data: insertedData, error: dbError } = await supabase
    .from('wallpapers')
    .insert([
      { url: file.name, likes: 0, downloads: 0 }
    ]);

  if (dbError) {
    alert('Error inserting metadata: ' + dbError.message);
    return;
  }

  alert('Image uploaded successfully!');
  fetchImages(); // Fetch updated images after upload
}

// Fetch and display images from Supabase
async function fetchImages() {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*');

  if (error) {
    alert('Error fetching images: ' + error.message);
    return;
  }

  imageGallery.innerHTML = ''; // Clear existing images

  data.forEach(image => {
    const imageUrl = `https://kghqkcbrxnbytmchilcj.supabase.co/storage/v1/object/public/images/${image.url}`;

    // Create an image item
    const imageItem = document.createElement('div');
    imageItem.classList.add('image-item');
    
    // Image element
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'Uploaded Image';
    imgElement.classList.add('gallery-img');
    
    // Image info with like and download buttons
    const imageInfo = document.createElement('div');
    imageInfo.classList.add('image-info');
    imageInfo.innerHTML = `
      <span>Likes: ${image.likes}</span> | 
      <span>Downloads: ${image.downloads}</span>
      <br>
      <span class="like-download-btn" onclick="likeImage('${image.id}')">❤️ Like</span>
      <span class="like-download-btn" onclick="downloadImage('${image.id}')">⬇️ Download</span>
    `;
    
    imageItem.appendChild(imgElement);
    imageItem.appendChild(imageInfo);
    
    // Append the image item to the gallery
    imageGallery.appendChild(imageItem);
  });
}

// Like button functionality
async function likeImage(id) {
  const { data, error } = await supabase
    .from('wallpapers')
    .update({ likes: supabase.raw('likes + 1') })
    .eq('id', id);

  if (error) {
    alert('Error liking image: ' + error.message);
    return;
  }

  alert('Image liked!');
  fetchImages(); // Refresh the gallery after liking
}

// Download button functionality
async function downloadImage(id) {
  const { data, error } = await supabase
    .from('wallpapers')
    .update({ downloads: supabase.raw('downloads + 1') })
    .eq('id', id);

  if (error) {
    alert('Error downloading image: ' + error.message);
    return;
  }

  alert('Image downloaded!');
  fetchImages(); // Refresh the gallery after download
}

// Event listener for the upload button
uploadBtn.addEventListener('click', uploadImage);

// Fetch images when the page loads
fetchImages();
