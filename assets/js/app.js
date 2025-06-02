function goToStep(step) {
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
  document.getElementById(step).style.display = 'block';

  if (step === 'persona') fetchMLData();
}

async function fetchMLData() {
  const apiUrl = 'https://improvising-spotify-music-recommendation.onrender.com'; // Replace with your actual API URL

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    // Parse Persona
    document.getElementById('persona-text').textContent = data.persona;

    // Mood Bars
    const moodContainer = document.getElementById('mood-bars');
    moodContainer.innerHTML = '';
    const moods = ['Sad', 'Happy'];
    moods.forEach(mood => {
      const value = mood === 'Sad' ? 0.8 : 0.5; // Sample values, or parse from model
      const bar = `<p>${mood}</p>
        <div class="bar"><div class="fill" style="width:${value * 100}%;"></div></div>`;
      moodContainer.innerHTML += bar;
    });

    // Save playlist for next section
    localStorage.setItem('playlistData', JSON.stringify(data.recommendations));
  } catch (err) {
    alert("Failed to load ML data.");
  }
}

window.onload = () => {
  if (window.location.hash === '#playlist') goToStep('playlist');

  // Render playlist if exists
  const playlistData = JSON.parse(localStorage.getItem('playlistData') || '[]');
  const tbody = document.getElementById('playlist-body');
  if (tbody) {
    playlistData.forEach(song => {
      const row = `<tr><td>${song.trackName}</td><td>${song.artistName}</td><td>1:15</td></tr>`;
      tbody.innerHTML += row;
    });
  }
};
