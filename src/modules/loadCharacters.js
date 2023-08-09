// Fetch Characters data from API
export async function fetchCharacters() {
  try {
    const response = await fetch('https://rickandmortyapi.com/api/character');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching characters:', error);
    return [];
  }
}

// Load characters to UI
export async function loadCharacters() {
  const charactersContainer = document.querySelector('.all-characters');
  const characterCountElement = document.getElementById('character-count');
  const characters = await fetchCharacters();

  //Display Character counts 
  characterCountElement.textContent = `Characters(${characters.length})`;

  characters.forEach((character) => {
    const characterElement = document.createElement('div');
    characterElement.setAttribute('class', 'character-container');
    characterElement.innerHTML = `
        <img class="character" src="${character.image}" alt="Image of - ${character.name}">
        <div class="below-image">
          <p class="character-name">${character.name}</p>
          <div class="likes">
            <i class="fa-regular fa-heart"></i>
            <p>Likes</p>
          </div>
        </div>
        <div class="reactions">
          <span class="comment">Comments</span>
          <span class="reservation">Reservations</span>
        </div>
      `;
  
      charactersContainer.appendChild(characterElement);
    });
  }