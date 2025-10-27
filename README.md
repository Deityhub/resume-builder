# Resume Builder

A modern, open-source resume builder built with Svelte 5, TypeScript, and Tailwind CSS. Create professional resumes with an intuitive drag-and-drop interface, featuring advanced ruler boundaries and real-time editing capabilities.

![CI](https://github.com/Deityhub/resume-builder/workflows/CI/badge.svg)
![PR Checks](https://github.com/Deityhub/resume-builder/workflows/PR%20Checks/badge.svg)

## 🚀 Features

### Core Features

- **Drag-and-Drop Interface**: Intuitive canvas-based resume creation with real-time preview
- **Multiple Element Types**: Text, shapes, and images with full customization
- **Real-time Editing**: Live preview with instant updates and inline text editing
- **Multi-page Support**: Create resumes with unlimited pages
- **Nested Elements**: Elements can contain other elements (hierarchical structure)
- **UUID-based IDs**: Cryptographically secure unique identifiers for all elements

### Advanced Canvas Tools

- **Professional Ruler System**:
  - Horizontal and vertical rulers with tick marks (major, minor, tiny)
  - Draggable triangle markers for boundary adjustment
  - Google Docs/Word-style design
  - Real-time boundary visualization
- **Smart Element Positioning**:
  - Snap-to-grid with 10px threshold
  - Boundary enforcement (elements stay within defined areas)
  - Dynamic sizing based on drop position
  - Automatic element reparenting on drag

- **Advanced Resize Tool**:
  - 4 edge handles for width/height adjustment
  - 4 corner handles for proportional resize
  - Minimum size enforcement (20px)
  - Visual feedback with hover states

### Element Management

- **Text Elements**:
  - Inline contenteditable text
  - Font family, size, weight, and style customization
  - Color picker
  - Full typography control

- **Shape Elements**:
  - Horizontal and vertical lines
  - Customizable stroke color and width
  - Perfect for dividers and visual organization

- **Image Elements**:
  - URL-based image loading
  - Alt text support
  - Responsive sizing

### Visual Feedback System

- **Element Highlighting**:
  - Blue ring: Selected element
  - Yellow ring: Elements underneath (overlapping)
  - Green ring: Element being hovered during drag
  - Purple dashed outline: Drag preview
- **Drag Operations**:
  - Real-time drag preview
  - ESC key to cancel drag
  - Automatic cleanup on drag leave
  - Parent detection and highlighting

### Property Panel

- **Position & Size**: Precise X, Y, width, height controls
- **Typography**: Font family, size, weight, style, color
- **Shape Properties**: Type, stroke color, stroke width
- **Image Properties**: URL, alt text
- **Element Actions**: Delete button with confirmation

## 🛠️ Technology Stack

- **Framework**: Svelte 5 (SvelteKit)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest + Playwright
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel (ready)

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **Yarn** (recommended) or npm
- **Git**

## 🚀 Quick Start

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/resume-builder.git
   cd resume-builder
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Start development server**

   ```bash
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
# Build the application
yarn build

# Preview production build
yarn preview
```

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── Button.svelte
│   │   ├── Tooltip.svelte
│   │   └── index.ts
│   ├── const/              # Application constants
│   │   ├── dimension.ts    # Canvas dimensions
│   │   └── font.ts         # Font options
│   ├── stores/             # State management
│   │   └── appStore.svelte.ts
│   ├── types/              # TypeScript type definitions
│   │   └── resume.ts
│   └── utils/              # Utility functions
│       └── properties.ts
├── routes/
│   ├── +layout.svelte      # Root layout
│   ├── +page.svelte        # Landing page
│   ├── about/              # About page
│   └── create/             # Resume builder
│       ├── +page.svelte    # Main builder interface
│       └── (components)/   # Builder components
│           ├── Toolbar.svelte
│           ├── Canvas.svelte
│           ├── CanvasElement.svelte
│           ├── Ruler.svelte
│           └── PropertyPanel.svelte
└── app.html                # HTML template
```

## 🎨 Key Components

### Canvas

The main canvas component that handles:

- Element rendering with zIndex sorting
- Drag-and-drop with real-time preview
- Boundary enforcement and snapping
- Ruler integration and visualization
- Element reparenting on drag
- Nested element flattening for display

### Ruler System

Professional boundary controls featuring:

- Horizontal and vertical rulers (Google Docs style)
- Draggable triangle markers (blue for start, red for end)
- Three-tier tick marks:
  - Major ticks (12px) every 100px
  - Minor ticks (8px) every 50px
  - Tiny ticks (4px) every 10px
- Real-time boundary updates with reactive effects
- Coordinate scaling for accurate positioning

### Property Panel

Comprehensive styling interface for:

- Position and dimensions (X, Y, width, height)
- Typography (7 font families, 12 font sizes)
- Font weight (normal, bold) and style (normal, italic)
- Color picker for text and shapes
- Element-specific properties
- Delete functionality

### Resize Tool

Advanced resize system with:

- **4 Edge Handles**: 60px × 4px bars for width/height
- **4 Corner Handles**: 12px circles for proportional resize
- **8 Resize Directions**: n, s, e, w, nw, ne, sw, se
- Visual feedback with hover states
- Boundary-aware resizing

### Store Architecture

Reactive state management with:

- Svelte 5 runes ($state, $derived, $effect)
- Nested element structure (Record<string, TCanvasElement>)
- Recursive element operations (find, move, flatten)
- UUID-based identifiers (crypto.randomUUID())
- Automatic zIndex management
- Boundary constraint enforcement

## 🔧 Development

### Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn dev -- --open    # Open browser automatically

# Building
yarn build           # Production build
yarn preview         # Preview production build

# Code Quality
yarn lint            # Run ESLint
yarn format          # Format code with Prettier
yarn check           # Type checking

# Testing
yarn test            # Run all tests
yarn test:unit       # Unit tests only
yarn test:e2e        # End-to-end tests
```

### Code Style

This project follows:

- **Prettier** for code formatting
- **ESLint** for linting
- **TypeScript** for type safety
- **Svelte 5** syntax and patterns

### Key Development Patterns

1. **State Management**: Uses Svelte 5 runes (`$state`, `$derived`)
2. **Component Architecture**: Functional components with clear props
3. **TypeScript**: Full type safety across the application
4. **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🎯 Usage Guide

### Creating a Resume

1. **Navigate to Builder**: Click "Create Your Resume" from the homepage
2. **Add Elements**: Drag text, shapes, or images from the toolbar
3. **Customize Elements**: Select elements to edit properties in the panel
4. **Adjust Boundaries**: Drag ruler markers to set canvas boundaries
5. **Multi-page Support**: Add additional pages as needed

### Element Manipulation

- **Move**: Click and drag elements on the canvas
- **Resize**: Use corner handles on selected elements
- **Edit**: Select elements to modify properties in the panel
- **Delete**: Use the delete button in the property panel

### Boundary System

- **Set Boundaries**: Drag triangle markers on rulers
- **Snap-to-Grid**: Elements automatically align to boundaries
- **Boundary Enforcement**: Elements cannot move outside defined areas
- **Auto-constrain**: Elements automatically adjust when boundaries change

## 🧪 Testing

This project has comprehensive test coverage for all features.

### Unit Tests

```bash
yarn test:unit
```

**Test Coverage:**

- ✅ Page Management (create, delete, UUID generation)
- ✅ Ruler Boundaries (initialization, updates, validation)
- ✅ Element Management (add, update, delete, UUID generation)
- ✅ Element Selection (select, deselect)
- ✅ Nested Elements (parent-child relationships, finding, moving)
- ✅ zIndex Management (automatic assignment)
- ✅ Store State Management (reactive updates)

**Total Unit Tests**: 20+ tests covering all store functionality

### End-to-End Tests

```bash
yarn test:e2e
```

**Test Coverage:**

- ✅ Navigation (home, create, about pages)
- ✅ Page Management (add pages, page counter)
- ✅ Drag and Drop (text, shape, image elements)
- ✅ Element Selection (select, deselect)
- ✅ Element Manipulation (resize handles, delete)
- ✅ Property Updates (font size, font family)
- ✅ UI Components (toolbar, canvas, property panel, rulers)
- ✅ Boundary Visualization (rulers, boundary box)
- ✅ Multi-element Workflows (adding multiple elements)

**Total E2E Tests**: 14 comprehensive workflow tests

### Run All Tests

```bash
yarn test
```

This runs both unit and e2e tests sequentially.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Automatic Deployments**: Every push to main branch triggers deployment
3. **Environment Variables**: Configure any required environment variables

### Manual Deployment

1. **Build**: `yarn build`
2. **Serve**: Use any static file server to serve the `build/` directory

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Getting Started

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `yarn install`
5. **Start** development: `yarn dev`

### Contribution Guidelines

1. **Code Style**: Follow existing patterns and run `yarn format`
2. **Tests**: Add tests for new features
3. **Documentation**: Update README for significant changes
4. **Pull Requests**: Use clear, descriptive titles

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Run the test suite: `yarn test`
5. Format code: `yarn format`
6. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Svelte 5](https://svelte.dev/) and [SvelteKit](https://svelte.dev/docs/kit)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Typography powered by [Inter](https://fonts.google.com/specimen/Inter)

## 📞 Support

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Contributing**: See our contributing guidelines above

---

**Made with ❤️ for job seekers everywhere**
