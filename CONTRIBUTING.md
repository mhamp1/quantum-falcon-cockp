# Contributing to Quantum Falcon Cockpit

Thank you for your interest in contributing to Quantum Falcon! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/quantum-falcon-cockp.git
   cd quantum-falcon-cockp
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000/`

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Code Style

- **TypeScript**: We use strict TypeScript. All new code must be typed.
- **Formatting**: We use ESLint for code quality. Run `npm run lint` before committing.
- **Components**: Use functional components with hooks.
- **Styling**: Use Tailwind CSS classes. Follow the existing cyberpunk theme.

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: Add holographic card component with God Mode variant
```

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features
2. **Add tests** for new functionality
3. **Ensure all tests pass** (`npm run test`)
4. **Ensure linting passes** (`npm run lint`)
5. **Update CHANGELOG.md** with your changes
6. **Create a pull request** with a clear description

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Mobile responsive (if UI changes)
- [ ] God Mode compatibility checked (if applicable)

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Core utilities and logic
├── pages/          # Page components
└── types/          # TypeScript type definitions
```

## Testing Guidelines

- Write unit tests for utilities and hooks
- Write integration tests for complex components
- Aim for >80% code coverage
- Test edge cases and error handling

## Security

- Never commit API keys or secrets
- Sanitize all user input using `sanitizeInput()` from `@/lib/security/sanitize`
- Follow security best practices for authentication

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Quantum Falcon! 🦅

