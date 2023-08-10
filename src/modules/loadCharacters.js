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

// Add a new function to add a like for a character
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
      const likeCountElement = document.querySelector(`[data-id="${characterId}"] + .like-count`);
      if (likeCountElement) {
        const currentLikes = parseInt(likeCountElement.textContent, 10); // Specify radix parameter
        likeCountElement.textContent = `${currentLikes + 1} Like${currentLikes === 0 ? '' : 's'}`;
      }
    } else {
      throw new Error('Failed to add like');
    }
  } catch (error) {
    throw new Error('Error adding like');
  }
}

// Load characters to UI
export async function loadCharacters() {
  const charactersContainer = document.querySelector('.all-characters');
  const characterCountElement = document.getElementById('character-count');
  const characters = await fetchCharacters();

  // Display Character counts
  characterCountElement.textContent = `Characters(${characters.length})`;

  characters.forEach((character) => {
    const characterElement = document.createElement('div');
    characterElement.setAttribute('class', 'character-container');
    characterElement.innerHTML = `
        <img class="character" src="${character.image}" alt="Image of - ${character.name}">
        <div class="below-image">
          <p class="character-name">${character.name}</p>
          <div class="likes">
            <i class="fa-regular fa-heart" data-id="${character.id}"></i>
            <p class="like-count">0 Likes</p>
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
  return characters; // Return the characters array
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

// Function to update modal content with character details
export function updateModalContent(character) {
  const modalBody = document.querySelector('.modal-body');
  if (!modalBody) {
    throw new Error('Modal body not found');
    // return;
  }

  const characterContainer = modalBody.querySelector('.character-content');
  if (!characterContainer) {
    throw new Error('Character container not found');
    // return;
  }

  const features1 = modalBody.querySelector('.features-1');
  if (!features1) {
    throw new Error('Features 1 container not found');
    // return;
  }

  const features2 = modalBody.querySelector('.features-2');
  if (!features2) {
    throw new Error('Features 2 container not found');
    // return;
  }

  const commentsList = modalBody.querySelector('ul'); // Directly target the <ul> element
  if (!commentsList) {
    throw new Error('Comments list not found');
    // return;
  }

  characterContainer.querySelector('img').src = character.image;
  characterContainer.querySelector('p').textContent = character.name;

  features1.innerHTML = `
    <p><b>Status:</b> ${character.status}</p>
    <p><b>Species:</b> ${character.species}</p>
  `;

  features2.innerHTML = `
    <p><b>Gender:</b> ${character.gender}</p>
    <p><b>Origin:</b> ${character.origin.name}</p>
  `;

  commentsList.innerHTML = character.comments.map((comment) => `<li>${comment}</li>`).join('');
}