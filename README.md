# Tic Tac Toe Game Documentation

## Overview

This documentation covers the implementation details of our Tic Tac Toe game built using React, TypeScript, and Tailwind CSS.

## Components

### Game Component (`Game.tsx`)
```typescript
interface GameState {
  squares: Array<'X' | 'O' | null>;
  xIsNext: boolean;
  winner: string | null;
}
```

The Game component is the main container that:
- Manages the game state
- Handles player turns
- Determines the winner
- Controls game reset

### Board Component (`Board.tsx`)
```typescript
interface BoardProps {
  squares: Array<'X' | 'O' | null>;
  onClick: (i: number) => void;
}
```

The Board component:
- Renders the 3x3 grid
- Manages the layout using Tailwind CSS grid classes
- Passes click events to individual squares

### Square Component (`Square.tsx`)
```typescript
interface SquareProps {
  value: 'X' | 'O' | null;
  onClick: () => void;
}
```

The Square component:
- Renders individual cells
- Handles click events
- Applies hover and active states using Tailwind

## Game Logic

### Winner Calculation
```typescript
function calculateWinner(squares: Array<'X' | 'O' | null>): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
```

## Styling

### Tailwind Classes

Board Container:
```html
<div class="grid grid-cols-3 gap-2 w-64 mx-auto mt-8">
```

Square Button:
```html
<button class="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
```

Game Status:
```html
<div class="text-xl font-bold text-center mt-4">
```

## TypeScript Types

```typescript
// Game Types
type Player = 'X' | 'O';
type Square = Player | null;

interface GameHistory {
  squares: Square[];
  currentPlayer: Player;
}

// Component Props
interface BoardProps {
  squares: Square[];
  onClick: (index: number) => void;
}

interface SquareProps {
  value: Square;
  onClick: () => void;
}
```

## State Management

The game state is managed using React's useState hook:

```typescript
const [history, setHistory] = useState<GameHistory[]>([{
  squares: Array(9).fill(null),
  currentPlayer: 'X'
}]);

const [stepNumber, setStepNumber] = useState(0);
```

## Event Handlers

### Handle Click
```typescript
const handleClick = (i: number) => {
  const currentHistory = history.slice(0, stepNumber + 1);
  const current = currentHistory[currentHistory.length - 1];
  const squares = current.squares.slice();

  if (calculateWinner(squares) || squares[i]) {
    return;
  }

  squares[i] = current.currentPlayer;
  setHistory([...currentHistory, {
    squares: squares,
    currentPlayer: current.currentPlayer === 'X' ? 'O' : 'X'
  }]);
  setStepNumber(currentHistory.length);
};
```

### Reset Game
```typescript
const resetGame = () => {
  setHistory([{
    squares: Array(9).fill(null),
    currentPlayer: 'X'
  }]);
  setStepNumber(0);
};
```

## Testing

To run tests:
```bash
npm run test
```

Example test case:
```typescript
describe('Game Component', () => {
  it('should render empty board initially', () => {
    const { getAllByRole } = render(<Game />);
    const squares = getAllByRole('button');
    squares.forEach(square => {
      expect(square.textContent).toBe('');
    });
  });
});
```

## Performance Considerations

- Use React.memo for Square components to prevent unnecessary re-renders
- Implement useCallback for event handlers
- Use CSS Grid for optimal layout performance
- Minimize state updates using batch updates

## Accessibility

- All interactive elements are keyboard accessible
- Proper ARIA labels are implemented
- Color contrast meets WCAG guidelines
- Focus states are clearly visible

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
