// Fetch Characters data from API
export async function fetchCharacters() {
  try {
    const response = await fetch('https://rickandmortyapi.com/api/character');
    const data = await response.json();
    return data.results;
  } catch (error) {
    return [];
  }
}

// Function to update localStorage with new like count
function updateLocalStorage(characterId, likeCount) {
  const storedLikes = JSON.parse(localStorage.getItem('likes')) || {};
  storedLikes[characterId] = likeCount;
  localStorage.setItem('likes', JSON.stringify(storedLikes));
}

// Add a new function to add a like for a character and save it to the Involvement API
export async function addLike(characterId) {
  try {
    const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/3rhiucgu7avOD8E9hBq1/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_id: characterId,
      }),
    });

    if (response.ok) {
      // Update the UI with the new like count
      const likeCountElement = document.querySelector(`[data-id="${characterId}"] + .like-count`);
      if (likeCountElement) {
        const currentLikes = parseInt(likeCountElement.textContent, 10);
        const newLikes = currentLikes + 1;
        likeCountElement.textContent = `${newLikes} Like${newLikes === 1 ? '' : 's'}`;

        // Update localStorage with new like count
        updateLocalStorage(characterId, newLikes);
      }
    } else {
      throw new Error('Failed to add like');
    }
  } catch (error) {
    throw new Error('Error adding like');
  }
}

// Fetch the like counts from the Involvement API
async function fetchLikesFromInvolvementAPI(characters) {
  const likes = {};
  const characterIds = characters.map((character) => character.id);
  await Promise.all(characterIds.map(async (characterId) => {
    try {
      const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/3rhiucgu7avOD8E9hBq1/likes?item_id=${characterId}`);
      if (response.ok) {
        const data = await response.json();
        likes[characterId] = data.likes;
      }
    } catch (error) {
      throw new Error(`Error fetching likes for character ${characterId}: ${error}`);
    }
  }));
  return likes;
}

// Function to fetch additional character details
export async function fetchCharacterDetails(characterId) {
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${characterId}`);
    const data = await response.json();
    return {
      image: data.image,
      name: data.name,
      status: data.status,
      species: data.species,
      gender: data.gender,
      origin: data.origin,
      comments: ['Comment 1', 'Comment 2', 'Comment 3'], // Replace with actual comments data
    };
  } catch (error) {
    return null;
  }
}

// Update the UI with the like counts
function updateUIWithLikeCounts(likes) {
  const characterIds = document.querySelectorAll('[data-id]');
  characterIds.forEach((characterId) => {
    const likeCountElement = characterId.nextElementSibling.querySelector('.like-count');
    const likeCount = likes[characterId.getAttribute('data-id')];
    likeCountElement.textContent = `${likeCount || 0} Like${likeCount === 0 ? '' : 's'}`;
  });
}

// Load characters to UI
export async function loadCharacters() {
  const charactersContainer = document.querySelector('.all-characters');
  const characterCountElement = document.getElementById('character-count');
  const characters = await fetchCharacters();

  // Display Character counts
  characterCountElement.textContent = `Characters(${characters.length})`;

  // Fetch likes from localStorage
  const storedLikes = JSON.parse(localStorage.getItem('likes')) || {};

  // Fetch likes from Involvement API
  const likes = await fetchLikesFromInvolvementAPI(characters);

  // Merge likes from localStorage and Involvement API
  const mergedLikes = { ...likes, ...storedLikes };

  // Update the UI with the like counts
  updateUIWithLikeCounts(mergedLikes);

  // Fetch character details for all characters
  const characterPromises = characters.map(async (character) => {
    const characterDetails = await fetchCharacterDetails(character.id);
    character.comments = characterDetails.comments; // Add comments to the character object
    return character;
  });

  // Wait for all character details to be fetched
  const charactersWithDetails = await Promise.all(characterPromises);

  // Update the UI with characters and their details
  charactersWithDetails.forEach((character) => {
    const characterElement = document.createElement('div');
    characterElement.setAttribute('class', 'character-container');
    characterElement.innerHTML = `
        <img class="character" src="${character.image}" alt="Image of - ${character.name}">
        <div class="below-image">
          <p class="character-name">${character.name}</p>
          <div class="likes">
            <i class="fa-regular fa-heart" data-id="${character.id}"></i>
            <p class="like-count">${mergedLikes[character.id] || 0} Like${mergedLikes[character.id] === 0 ? '' : 's'}</p>
          </div>
        </div>
        <div class="reactions">
          <span class="comment" data-id="${character.id}" data-bs-toggle="modal" data-bs-target="#modal-container">Comments</span>
          <span class="reservation">Reservations</span>
        </div>
      `;

    charactersContainer.appendChild(characterElement);
  });

  // Add event listener to each "Likes" icon
  const likeIcons = document.querySelectorAll('.fa-heart');
  likeIcons.forEach((likeIcon) => {
    likeIcon.addEventListener('click', async () => {
      const characterId = likeIcon.getAttribute('data-id');
      await addLike(characterId);
    });
  });

  return charactersWithDetails; // Return the characters array with details
}

// Function to update modal content with character details
export function updateModalContent(character) {
  const modalBody = document.querySelector('.modal-body');
  if (!modalBody) {
    throw new Error('Modal body not found');
  }

  const characterContainer = modalBody.querySelector('.character-content');
  if (!characterContainer) {
    throw new Error('Character container not found');
  }

  const features1 = modalBody.querySelector('.features-1');
  if (!features1) {
    throw new Error('Features 1 container not found');
  }

  const features2 = modalBody.querySelector('.features-2');
  if (!features2) {
    throw new Error('Features 2 container not found');
  }

  const commentsList = modalBody.querySelector('ul');
  if (!commentsList) {
    throw new Error('Comments list not found');
  }

  characterContainer.querySelector('img').src = character.image;
  characterContainer.querySelector('p').textContent = character.name;

  features1.innerHTML = `
    <p><b>Status:</b> ${character.status || 'Unknown'}</p>
    <p><b>Species:</b> ${character.species || 'Unknown'}</p>
  `;

  features2.innerHTML = `
    <p><b>Gender:</b> ${character.gender || 'Unknown'}</p>
    <p><b>Origin:</b> ${character.origin?.name || 'Unknown'}</p>
  `;

  commentsList.innerHTML = (character.comments || []).map((comment) => `<li>${comment}</li>`).join('');
}

// Load characters and update UI on page load
async function initialize() {
  await loadCharacters();

  // Add event listener to the parent container of "Likes" icons
  const charactersContainer = document.querySelector('.all-characters');
  charactersContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('fa-heart')) {
      const characterId = event.target.getAttribute('data-id');
      event.target.classList.add('disabled'); // Disable the icon temporarily
      await addLike(characterId);
      event.target.classList.remove('disabled'); // Re-enable the icon
    }
  });
}

window.addEventListener('load', initialize);