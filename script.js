const canvas = new fabric.Canvas('thumbnailCanvas');
     let currentImage = null;
     const apiKey = window.YOUTUBE_API_KEY || '';
     let isPremium = false;

     // Handle image upload
     document.getElementById('imageInput').addEventListener('change', function(e) {
         const file = e.target.files[0];
         if (file) {
             const reader = new FileReader();
             reader.onload = function(event) {
                 fabric.Image.fromURL(event.target.result, function(img) {
                     img.scaleToWidth(1280);
                     img.scaleToHeight(720);
                     canvas.clear();
                     canvas.add(img);
                     currentImage = img;
                     canvas.renderAll();
                 });
             };
             reader.readAsDataURL(file);
         }
     });

     // Add text to canvas
     window.addText = function() {
         const text = document.getElementById('textInput').value;
         const fontSize = parseInt(document.getElementById('fontSize').value);
         const color = document.getElementById('textColor').value;
         if (text) {
             const textObj = new fabric.Text(text, {
                 left: 50, /* Adjusted for smaller canvas */
                 top: 50,
                 fontSize: fontSize,
                 fill: color,
                 fontFamily: 'Arial',
                 selectable: true
             });
             canvas.add(textObj);
             canvas.setActiveObject(textObj);
             canvas.renderAll();
         }
     };

     // Download thumbnail
     window.downloadThumbnail = function() {
         const dataURL = canvas.toDataURL({
             format: 'png',
             quality: 1
         });
         const link = document.createElement('a');
         link.href = dataURL;
         link.download = 'thumbnail.png';
         link.click();
     };

     // Analyze YouTube video
     window.analyzeVideo = function() {
         if (!apiKey) {
             alert('API key is missing. Please contact support.');
             return;
         }
         const videoUrl = document.getElementById('videoUrl').value;
         const videoId = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
         if (!videoId) {
             alert('Please enter a valid YouTube video URL');
             return;
         }

         fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`)
             .then(response => response.json())
             .then(data => {
                 if (data.items.length === 0) {
                     alert('Video not found');
                     return;
                 }
                 const video = data.items[0].snippet;
                 const thumbnailUrl = video.thumbnails.maxres?.url || video.thumbnails.high.url;
                 const title = video.title;

                 // Load thumbnail into canvas
                 fabric.Image.fromURL(thumbnailUrl, function(img) {
                     img.scaleToWidth(1280);
                     img.scaleToHeight(720);
                     canvas.clear();
                     canvas.add(img);
                     currentImage = img;
                     canvas.renderAll();
                 });

                 // Suggest text based on title
                 document.getElementById('textInput').value = title.slice(0, 30) + '...';
             })
             .catch(error => {
                 console.error('Error:', error);
                 alert('Failed to fetch video data. Please try again later.');
             });
     };

     // Handle template selection
     document.getElementById('templateSelect').addEventListener('change', function(e) {
         const template = e.target.value;
         if (template === 'gaming' && !isPremium) {
             alert('Please purchase the Premium Templates to use this!');
             e.target.value = 'none';
             return;
         }
         if (template === 'gaming') {
             fabric.Image.fromURL('gaming-template.jpg', function(img) {
                 img.scaleToWidth(1280);
                 img.scaleToHeight(720);
                 canvas.clear();
                 canvas.add(img);
                 currentImage = img;
                 canvas.renderAll();
             });
         }
     });

     // Check if premium purchased
     if (window.location.search.includes('premium=success')) {
         isPremium = true;
         document.getElementById('templateSelect').querySelector('option[value="gaming"]').disabled = false;
         alert('Premium Templates Unlocked!');
     }