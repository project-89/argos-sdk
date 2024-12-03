# Contributing to Argos SDK

We love your input! We want to make contributing to Argos SDK as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Package Publishing

While this is an open source project, the npm package `@project89/argos-sdk` is maintained and published by the Project89 team. This ensures package quality and security. If you have changes that you'd like to see published:

1. Submit your changes via a pull request
2. Once approved and merged, the Project89 team will handle the npm publishing
3. Package versions follow semantic versioning (MAJOR.MINOR.PATCH)

## Development Setup

1. Fork the repo and create your branch from `main`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   - Copy `.env.example` to `.env`
   - Configure the environment variables:
     ```bash
     # API Configuration
     ARGOS_API_URL=https://api.argos.project89.io  # Your Argos API endpoint

     # Development Settings
     DEBUG=true                 # Enable debug logging during development
     HEARTBEAT_INTERVAL=30000   # Presence update interval in milliseconds

     # Optional: Test Configuration
     TEST_API_URL=http://localhost:3000  # Local test API endpoint
     ```
4. If you've added code that should be tested, add tests.
5. If you've changed APIs, update the documentation.
6. Ensure the test suite passes:
   ```bash
   npm test
   ```
7. Make sure your code lints:
   ```bash
   npm run lint
   ```
8. Issue that pull request!

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/project-89/argos-sdk/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/project-89/argos-sdk/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License
By contributing, you agree that your contributions will be licensed under its MIT License. 