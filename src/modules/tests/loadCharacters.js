const myAppId = '3rhiucgu7avOD8E9hBq1';

export const fetchCharacters = async () => {
  try {
    const response = await fetch('https://rickandmortyapi.com/api/character');
    const data = await response.json();
    return data.results;
  } catch (error) {
    return [];
  }
};

export const updateLocalStorage = (characterId, likeCount) => {
  const storedLikes = JSON.parse(localStorage.getItem('likes')) || {};
  storedLikes[characterId] = likeCount;
  localStorage.setItem('likes', JSON.stringify(storedLikes));
};

export const addLike = async (characterId) => {
  try {
    const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${myAppId}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_id: characterId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add like');
    }

    const likeCountElement = document.querySelector(`[data-id="${characterId}"] + .like-count`);

    if (likeCountElement) {
      const currentLikes = parseInt(likeCountElement.textContent, 10);
      const newLikes = currentLikes + 1;
      likeCountElement.textContent = `${newLikes} Like${newLikes === 1 ? '' : 's'}`;
      updateLocalStorage(characterId, newLikes);
    }
  } catch (error) {
    throw new Error('Error adding like');
  }
};

export const fetchLikesFromInvolvementAPI = async (characters) => {
  const likes = {};
  const characterIds = characters.map((character) => character.id);

  await Promise.all(characterIds.map(async (characterId) => {
    try {
      const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${myAppId}/likes?item_id=${characterId}`);
      if (response.ok) {
        const data = await response.json();
        likes[characterId] = data.likes;
      }
    } catch (error) {
      throw new Error(`Error fetching likes for character ${characterId}: ${error}`);
    }
  }));

  return likes;
};

export const fetchCharacterDetails = async (characterId) => {
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
      comments: ['Comment 1', 'Comment 2', 'Comment 3'],
    };
  } catch (error) {
    return null;
  }
};

export const updateUIWithLikeCounts = (likes) => {
  const likeCountElements = document.querySelectorAll('.like-count');
  likeCountElements.forEach((likeCountElement) => {
    const characterId = likeCountElement.parentElement.querySelector('.fa-heart')?.getAttribute('data-id');
    const likeCount = likes[characterId] || 0;
    likeCountElement.textContent = `${likeCount} Like${likeCount === 1 ? '' : 's'}`;
  });
};

let cWithDetails = [];

export const loadCharacters = async () => {
  const characters = await fetchCharacters();
  const [storedLikes, likes] = await Promise.all([
    JSON.parse(localStorage.getItem('likes')) || {},
    fetchLikesFromInvolvementAPI(characters),
  ]);
  const mergedLikes = { ...likes, ...storedLikes };
  updateUIWithLikeCounts(mergedLikes);

  const characterPromises = characters.map(async (character) => {
    const characterDetails = await fetchCharacterDetails(character.id);
    character.comments = characterDetails.comments;
    return character;
  });

  const cWithDetails = await Promise.all(characterPromises);

  return cWithDetails;
};

export const renderCharacters = (charactersWithDetails) => {
  const charactersContainer = document.querySelector('.all-characters');
  charactersContainer.innerHTML = '';

  charactersWithDetails.forEach((character) => {
    const characterElement = document.createElement('div');
    characterElement.className = 'character-container';
    characterElement.innerHTML = `
        <img class="character" src="${character.image}" alt="Image of - ${character.name}">
        <div class="below-image">
          <p class="character-name">${character.name}</p>
          <div class="likes">
            <i class="fa-regular fa-heart" data-id="${character.id}"></i>
            <p class="like-count">${mergedLikes[character.id] || 0} Like${
              mergedLikes[character.id] === 0 ? '' : 's'
            }</p>
          </div>
        </div>
        <div class="reactions">
          <span class="comment" data-id="${character.id}" data-bs-toggle="modal" data-bs-target="#modal-container">Comments</span>
          <span class="reservation">Reservations</span>
        </div>
      `;

    charactersContainer.appendChild(characterElement);
  });
};


export const countCharacters = async () => {
  const characters = await fetchCharacters();
  const characterCountElement = document.getElementById('character-count');
  characterCountElement.textContent = `Characters(${characters.length})`;
};

export const countComments = async (data) => {
  const commentCountElement = document.getElementById('comment-counter');
  commentCountElement.textContent = `Comments(${data.length < 1 ? 0 : data.length})`;
};

export const fetchComments = async (appId, characterId) => {
  try {
    const queryString = `?item_id=${characterId}`;
    const url = `https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${appId}/comments${queryString}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      countComments(data);
      return data.map((comment) => {
        const formattedDate = new Date(comment.creation_date).toLocaleDateString();
        return `${formattedDate} ${comment.username}: ${comment.comment}`;
      });
    }
    const errorMessage = await response.text();
    throw new Error(`Failed to fetch comments: ${errorMessage}`);
  } catch (error) {
    return [];
  }
};

export const updateModalContent = async (character) => {
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

  const commentsList = modalBody.querySelector('.comment-body');
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

  try {
    const updatedComments = await fetchComments(myAppId, character.id);
    commentsList.innerHTML = '';
    updatedComments.forEach((comment) => {
      const commentItem = document.createElement('li');
      commentItem.className = 'comment-';
      commentItem.textContent = comment;
      commentsList.appendChild(commentItem);
    });
  } catch (error) {
    throw new Error('Error updating comments:', error);
  }
};

export const addComment = async (characterId, name, comment) => {
  try {
    const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/${myAppId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_id: characterId,
        username: name,
        comment,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
  } catch (error) {
    throw new Error('Error adding comment');
  }
};

const button = document.getElementById('button');
const nameInput = document.querySelector('.nameInput');
const insight = document.querySelector('.insightInput');

export const insertComment = async (event) => {
  const commentButton = event.target;
  const characterId = commentButton.getAttribute('data-id');

  const modalBody = document.querySelector('.modal-body');
  if (!modalBody) {
    throw new Error('Modal body not found');
  }

  try {
    await addComment(characterId, nameInput.value, insight.value);

    const updatedComments = await fetchComments(myAppId, characterId);

    const commentList = modalBody.querySelector('.comment-body');
    if (!commentList) {
      throw new Error('Comments list not found');
    }

    commentList.innerHTML = '';
    updatedComments.forEach((comment) => {
      const commentItem = document.createElement('li');
      commentItem.className = 'comment-';
      commentItem.textContent = comment;
      commentList.appendChild(commentItem);
    });
  } catch (error) {
    throw new Error('Error adding comment:', error);
  }

  nameInput.value = '';
  insight.value = '';
};

// Attach the event listener on window load
window.addEventListener('load', () => {
  button.addEventListener('click', insertComment);
  window.addComment = addComment; // Expose the addComment function globally
});

let isInitialized = false;
let modalBody;
let modal;

export const initialize = async (charactersContainer) => {
  if (!isInitialized) {
    console.log('Initializing...');
    await loadCharacters();
    countCharacters();
    // const charactersContainer = document.querySelector('.all-characters');

    charactersContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('fa-heart')) {
        event.stopImmediatePropagation();

        const characterId = event.target.getAttribute('data-id');
        event.target.classList.add('disabled');
        try {
          await addLike(characterId);
        } finally {
          event.target.classList.remove('disabled');
        }
      }

      if (event.target.classList.contains('comment')) {
        const characterId = event.target.getAttribute('data-id');
        button.setAttribute('data-id', characterId);
        if (characterId) {
          const card = cWithDetails.find((card) => card.id.toString() === characterId);

          if (card) {
            await updateModalContent(card);

            modalBody = document.querySelector('.modal-body');

            if (!modalBody) {
              throw new Error('Modal body not found');
            }

            const commentsList = modalBody.querySelector('.comment-body');
            if (commentsList) {
              try {
                const updatedComments = await fetchComments(myAppId, characterId);

                commentsList.innerHTML = '';
                updatedComments.forEach((comment) => {
                  const commentItem = document.createElement('li');
                  commentItem.className = 'comment-';
                  commentItem.textContent = comment;
                  commentsList.appendChild(commentItem);
                });
              } catch (error) {
                throw new Error('Error updating comments:', error);
              }
            }

            modal.show();
          }
        } else {
          throw new Error('Character ID not found in clicked element');
        }
      }
    });

    modal = new bootstrap.Modal(document.getElementById('modal-container'));

    isInitialized = true;
  }
};

window.addEventListener('load', initialize);