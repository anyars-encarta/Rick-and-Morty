import 'bootstrap/dist/js/bootstrap.bundle';
import { fireEvent } from '@testing-library/dom'; // Import fireEvent
import {
  countCharacters,
  countComments,
  initialize,
  fetchCharacters, // Import fetchCharacters function
} from 'loadCharacters';

let mockCharactersContainer: HTMLDivElement; // Declare it here
let mockFetchComments: jest.Mock; // Declare it here

// Mock the fetchCharacters function
const fetchCharactersMock = jest.fn(() => Promise.resolve([{}, {}, {}]));
jest.mock('loadCharacters', () => {
  const actualLoadCharacters = jest.requireActual('loadCharacters');
  return {
    ...actualLoadCharacters,
    fetchCharacters: fetchCharactersMock,
  };
});

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => {
      resolve();
    });
  });
});

describe('countCharacters', () => {
  it('should update the character count element with the correct count', async () => {
    // Set up fetchCharacters mock implementation
    fetchCharactersMock.mockResolvedValue([{}, {}, {}]);

    // Mock the characterCountElement
    const characterCountElement = document.createElement('span');
    characterCountElement.id = 'character-count';
    document.body.appendChild(characterCountElement);

    // Call the function
    await countCharacters();

    // Assert
    expect(fetchCharacters).toHaveBeenCalled();
    expect(characterCountElement.textContent).toBe(`Characters(${fetchCharactersMock.mock.results[0].value.length})`);

    // Clean up
    document.body.removeChild(characterCountElement);
    // delete window.fetchCharacters;
  }, 10000);
});

describe('countComments', () => {
  it('should update the comment count element with the correct count', async () => {
    // Mock fetchComments function
    const fetchCommentsMock = jest.fn(() => ['Comment 1', 'Comment 2', 'Comment 3']);
    window.fetchComments = fetchCommentsMock;

    // Mock the commentCountElement
    const commentCountElement = document.createElement('span');
    commentCountElement.id = 'comment-counter';
    document.body.appendChild(commentCountElement);

    // Call the function
    await countComments(['Comment 1', 'Comment 2', 'Comment 3']);

    // Assert
    expect(fetchCommentsMock).toHaveBeenCalled();
    expect(commentCountElement.textContent).toBe(`Comments(${fetchCommentsMock().length})`);

    // Clean up
    document.body.removeChild(commentCountElement);
    // delete window.fetchComments;
  }, 10000);

  it('should handle no comments gracefully', async () => {
    // Arrange
    const commentCountElement = document.createElement('span');
    commentCountElement.id = 'comment-counter';
    document.body.appendChild(commentCountElement);

    // Mock fetchComments function
    const fetchCommentsMock = jest.fn(() => []); // Mocking no comments
    window.fetchComments = fetchCommentsMock;

    // Act
    await countComments([]); // For the case with no comments

    // Assert
    expect(fetchCommentsMock).toHaveBeenCalled();
    expect(commentCountElement.textContent).toBe('Comments(0)');

    // Clean up
    document.body.removeChild(commentCountElement);
    // delete window.fetchComments;
  }, 10000);

  it('should handle undefined comments gracefully', async () => {
    // Arrange
    const commentCountElement = document.createElement('span');
    commentCountElement.id = 'comment-counter';
    document.body.appendChild(commentCountElement);

    // Mocking the fetchComments function without returning any comments
    window.fetchComments = jest.fn(() => undefined);

    // Act
    await countComments([]); // For the case with undefined comments

    // Assert
    expect(window.fetchComments).toHaveBeenCalled();
    expect(commentCountElement.textContent).toBe('Comments(0)');

    // Clean up
    document.body.removeChild(commentCountElement);
    // delete window.fetchComments;
  }, 10000);
});

describe('insertComment', () => {
  let mockNameInput: HTMLInputElement;
  let mockInsightInput: HTMLInputElement;
  let mockButton: HTMLButtonElement;

  beforeEach(() => {
    mockNameInput = document.createElement('input');
    mockNameInput.classList.add('nameInput');
    document.body.appendChild(mockNameInput);

    // Mock the modal body and related elements
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    document.body.appendChild(modalBody);

    // ... Mock other modal-related elements (character-content, features-1, features-2, comment-body) ...
    
    // Mock the characters container
    mockCharactersContainer = document.createElement('div');
    document.body.appendChild(mockCharactersContainer);

    // Mock the button
    mockButton = document.createElement('button');
    mockButton.id = 'button';
    document.body.appendChild(mockButton);
  });

  afterEach(() => {
    document.body.removeChild(mockNameInput);
    document.body.removeChild(mockInsightInput);

    // Remove the modal container
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      document.body.removeChild(modalContainer);
    }

    // Clean up other mocks
    // delete window.fetchComments;
    // delete window.addComment;
  });

  it('should handle button click event and add comment', async () => {
    // Mock the fetchCharacters function
    fetchCharactersMock.mockResolvedValue([{}, {}, {}]);

    // Mock the addComment function
    const mockAddComment = jest.fn();
    window.addComment = mockAddComment;

    // Mock the fetchComments function
    mockFetchComments = jest.fn();
    window.fetchComments = mockFetchComments;
    
    /// Call the initialize function with the mocked characters container
    initialize(mockCharactersContainer);

    // Simulate a click event on the button
    fireEvent.click(mockButton); // Use mockButton here
    
    // Assert
    expect(mockAddComment).toHaveBeenCalledWith(
      expect.any(String), // Mocked character ID
      expect.any(String), // Mocked name input value
      expect.any(String)  // Mocked insight input value
    );
    expect(mockFetchComments).toHaveBeenCalledWith(
      expect.any(String), // Mocked app ID
      expect.any(String)  // Mocked character ID
    );
  }, 10000);
});