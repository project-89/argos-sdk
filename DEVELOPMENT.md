# Argos SDK Development Plan

## API Changes Implementation Plan

### 1. Update Test Suite (Current Focus)
- [ ] Create test files for all new endpoints
  - [ ] `FingerprintAPI.test.ts`
  - [ ] `VisitAPI.test.ts`
  - [ ] `RoleAPI.test.ts`
  - [ ] `TagAPI.test.ts`
  - [ ] `APIKeyAPI.test.ts`
  - [ ] `PriceAPI.test.ts`
  - [ ] `RealityStabilityAPI.test.ts`
  - [ ] `DebugAPI.test.ts` (if needed)

### 2. Type Definitions
- [ ] Update existing types
  - [ ] Enhance `User` interface with roles, metadata
  - [ ] Add standardized API response types
- [ ] Add new type definitions
  - [ ] `Fingerprint`
  - [ ] `Visit`
  - [ ] `Role`
  - [ ] `Tag`
  - [ ] `APIKey`
  - [ ] `Price`
  - [ ] `RealityStability`
  - [ ] API request/response types for each endpoint

### 3. API Implementation
- [ ] Create new API classes
  - [ ] `FingerprintAPI`
  - [ ] `VisitAPI`
  - [ ] `RoleAPI`
  - [ ] `TagAPI` (update existing)
  - [ ] `APIKeyAPI`
  - [ ] `PriceAPI`
  - [ ] `RealityStabilityAPI`
- [ ] Update existing API implementations
  - [ ] Update endpoints to match new server paths
  - [ ] Implement standardized error handling
  - [ ] Add proper response typing

### 4. Core SDK Updates
- [ ] Update `ArgosTracker` class
  - [ ] Add API key initialization
  - [ ] Add new tracking capabilities
  - [ ] Update error handling
- [ ] Update `PresenceTracker`
  - [ ] Integrate with new visit endpoints
  - [ ] Add real-time presence features

### 5. React Hooks
- [ ] Update existing hooks
  - [ ] `useArgosPresence`
  - [ ] `useArgosTracker`
- [ ] Add new hooks
  - [ ] `useArgosRoles`
  - [ ] `useArgosTags`
  - [ ] `useArgosVisits`
  - [ ] `useArgosPrice`
  - [ ] `useRealityStability`

### 6. Documentation
- [ ] Update README
- [ ] Add JSDoc comments to all new code
- [ ] Create usage examples for new features
- [ ] Update API reference documentation

### 7. Testing & Quality Assurance
- [ ] Ensure 100% test coverage for new code
- [ ] Add integration tests
- [ ] Add E2E tests with example app
- [ ] Performance testing

### 8. Build & Release
- [ ] Update build configuration
- [ ] Version bump
- [ ] Update changelog
- [ ] Prepare release notes

## Current Status
Starting with test suite implementation to drive the development of new features.

## Notes
- All new implementations should follow the server's standardized response format
- Error handling should be consistent across all API calls
- TypeScript types should be strict and well-documented
- Tests should cover both success and error cases 