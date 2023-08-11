import {
  loadCharacters, fetchCharacterDetails, updateModalContent,
} from './modules/loadCharacters.js';
import myDateTime from './modules/date-time.js';

document.addEventListener('DOMContentLoaded', async () => {
  myDateTime();
  await loadCharacters();

  // Add event listener to each "Comments" span
  const commentSpans = document.querySelectorAll('.comment');
  commentSpans.forEach((commentSpan) => {
    commentSpan.addEventListener('click', async () => {
      const characterId = commentSpan.getAttribute('data-id');
      const character = await fetchCharacterDetails(characterId);

      if (character) {
        updateModalContent(character);
      }
    });
  });
});