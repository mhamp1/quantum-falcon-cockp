# Contributing to Quantum Falcon Mobile

Thank you for your interest in contributing to the Quantum Falcon Mobile app!

## Development Setup

1. **Install Flutter SDK**
   ```bash
   # Download Flutter from https://flutter.dev
   # Add to PATH
   export PATH="$PATH:`pwd`/flutter/bin"
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/mhamp1/quantum-falcon-cockp.git
   cd quantum-falcon-cockp/mobile
   flutter pub get
   ```

3. **Generate Code**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. **Run Tests**
   ```bash
   flutter test
   ```

## Code Standards

- Follow [Dart style guide](https://dart.dev/guides/language/effective-dart/style)
- Run `flutter analyze` before committing
- Ensure all tests pass
- Add tests for new features
- Update documentation

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Update documentation
5. Submit PR with clear description

## Questions?

Open an issue or contact the team.
