# Resume Builder

A modern, open-source resume builder built with Svelte 5, TypeScript, and Tailwind CSS. Create professional resumes with an intuitive drag-and-drop interface, featuring advanced ruler boundaries and real-time editing capabilities.

## 🚀 Features

### Core Features
- **Drag-and-Drop Interface**: Intuitive canvas-based resume creation
- **Multiple Element Types**: Text, shapes, and images
- **Real-time Editing**: Live preview with instant updates
- **Multi-page Support**: Create resumes with multiple pages
- **Responsive Design**: Works on desktop and tablet devices

### Advanced Tools
- **Ruler System**: Professional boundary controls with draggable anchors
- **Snap-to-Grid**: Elements automatically align to boundaries
- **Property Panel**: Comprehensive styling options for each element
- **Element Manipulation**: Resize, move, and customize all elements
- **Boundary Enforcement**: Elements stay within defined canvas boundaries

### Element Types
- **Text Elements**: Rich text editing with font customization
- **Shape Elements**: Lines and dividers for visual organization
- **Image Elements**: Support for images with alt text

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
│           ├── ResumeCanvas.svelte
│           ├── ResumeElement.svelte
│           ├── Ruler.svelte
│           └── PropertyPanel.svelte
└── app.html                # HTML template
```

## 🎨 Key Components

### ResumeCanvas
The main canvas component that handles:
- Element rendering and positioning
- Drag-and-drop functionality
- Boundary enforcement
- Ruler integration

### Ruler System
Professional boundary controls featuring:
- Horizontal and vertical rulers
- Draggable triangle markers
- Three-tier tick marks (major, minor, tiny)
- Real-time boundary updates

### Property Panel
Comprehensive styling interface for:
- Position and dimensions
- Typography (fonts, sizes, weights)
- Colors and styling
- Element-specific properties

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

### Unit Tests
```bash
yarn test:unit
```

Tests cover:
- Store functionality
- Boundary calculations
- Element manipulation
- Component rendering

### End-to-End Tests
```bash
yarn test:e2e
```

Tests cover:
- Complete user workflows
- Canvas interactions
- Element creation and editing

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
