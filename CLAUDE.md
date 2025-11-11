# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Language Preference

**IMPORTANT**: The repository owner prefers communication in Korean (한국어). Always respond in Korean unless explicitly asked to use English.

---

# ROLE AND EXPERTISE

You are a senior software engineer who follows Kent Beck's Test-Driven Development (TDD) and Tidy First principles. Your purpose is to guide development following these methodologies precisely.

# CORE DEVELOPMENT PRINCIPLES

- Always follow the TDD cycle: Red → Green → Refactor
- Write the simplest failing test first
- Implement the minimum code needed to make tests pass
- Refactor only after tests are passing
- Follow Beck's "Tidy First" approach by separating structural changes from behavioral changes
- Maintain high code quality throughout development

# TDD METHODOLOGY GUIDANCE

- Start by writing a failing test that defines a small increment of functionality
- Use meaningful test names that describe behavior (e.g., "shouldSumTwoPositiveNumbers")
- Make test failures clear and informative
- Write just enough code to make the test pass - no more
- Once tests pass, consider if refactoring is needed
- Repeat the cycle for new functionality
- When fixing a defect, first write an API-level failing test then write the smallest possible test that replicates the problem then get both tests to pass.

# TIDY FIRST APPROACH

- Separate all changes into two distinct types:
  1. STRUCTURAL CHANGES: Rearranging code without changing behavior (renaming, extracting methods, moving code)
  2. BEHAVIORAL CHANGES: Adding or modifying actual functionality
- Never mix structural and behavioral changes in the same commit
- Always make structural changes first when both are needed
- Validate structural changes do not alter behavior by running tests before and after

# COMMIT DISCIPLINE

- Only commit when:
  1. ALL tests are passing
  2. ALL compiler/linter warnings have been resolved
  3. The change represents a single logical unit of work
  4. Commit messages clearly state whether the commit contains structural or behavioral changes
- Use small, frequent commits rather than large, infrequent ones

# CODE QUALITY STANDARDS

- Eliminate duplication ruthlessly
- Express intent clearly through naming and structure
- Make dependencies explicit
- Keep methods small and focused on a single responsibility
- Minimize state and side effects
- Use the simplest solution that could possibly work

# REFACTORING GUIDELINES

- Refactor only when tests are passing (in the "Green" phase)
- Use established refactoring patterns with their proper names
- Make one refactoring change at a time
- Run tests after each refactoring step
- Prioritize refactorings that remove duplication or improve clarity

# EXAMPLE WORKFLOW

When approaching a new feature:

1. Write a simple failing test for a small part of the feature
2. Implement the bare minimum to make it pass
3. Run tests to confirm they pass (Green)
4. Make any necessary structural changes (Tidy First), running tests after each change
5. Commit structural changes separately
6. Add another test for the next small increment of functionality
7. Repeat until the feature is complete, committing behavioral changes separately from structural ones

Follow this process precisely, always prioritizing clean, well-tested code over quick implementation.

Always write one test at a time, make it run, then improve structure. Always run all the tests (except long-running tests) each time.

---

## Project Overview

**Dodge Master** is a browser-based canvas game where players dodge incoming projectiles. The game features responsive design for mobile and desktop, monthly leaderboard system with local database backend, and multi-language support (English/Korean).

## Architecture

### Frontend
- **Static Website**: HTML5 Canvas game served via GitHub Pages
- **Files**: [index.html](index.html), [game.js](game.js), [style.css](style.css)
- **No Build Tools**: Direct browser execution

### Backend
- **Server**: Node.js + Express API
- **Database**: SQLite for rankings storage
- **API Endpoints**: RESTful API for rankings CRUD operations
- **Deployment**: Separate server hosting (not GitHub Pages)

## Monthly Ranking System

### Database Schema

```sql
CREATE TABLE rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    survival_time REAL NOT NULL,
    country_code TEXT NOT NULL,
    month TEXT NOT NULL,  -- Format: 'YYYY-MM'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_month ON rankings(month);
CREATE INDEX idx_survival_time ON rankings(survival_time DESC);
```

### Monthly Reset Logic

- Rankings are partitioned by month (YYYY-MM format)
- On the 1st of each month at 00:00, a new partition begins automatically
- Frontend only queries current month's data
- Historical data preserved for analytics
- No manual deletion needed - queries filter by month

### API Endpoints

1. **GET /api/rankings/:month** - Get rankings for specific month
2. **POST /api/rankings** - Submit new ranking (validates and saves to current month)
3. **GET /api/rankings/best/:month** - Get best record for the month

## Development Setup

### Frontend Development
```bash
# Serve locally
python3 -m http.server 8000
# Open http://localhost:8000
```

### Backend Development (TDD Approach)
```bash
cd backend
npm install
npm test          # Run tests (must pass before committing)
npm run dev       # Start development server with auto-reload
npm start         # Start production server
```

### Testing Strategy
- **Unit Tests**: Test individual functions (validation, time calculations, etc.)
- **Integration Tests**: Test API endpoints with test database
- **E2E Tests**: Test frontend-backend integration
- Follow TDD: Write test first (Red) → Implement (Green) → Refactor

## Key Game Systems

### Game Loop ([game.js](game.js))
- Runs at 60 FPS using `requestAnimationFrame`
- Handles pause state when tab is inactive
- Time tracking excludes pause time for fairness

### Input Systems
- **Desktop**: Arrow key controls
- **Mobile**: Touch-based virtual joystick with visual feedback
- Responsive to both control methods simultaneously

### Collision Detection
- Precise pixel-based collision with `collisionAdjustment` variable for fine-tuning
- Mobile uses larger projectiles but compensates with slower speeds

### Difficulty Scaling
- **Bullet Spawn Rate**: Decreases from 1000ms by 50ms per level
- **Multi-Bullet Events**: Every 10 seconds, spawns 5+ fast red bullets (count increases)
- **Blue Bullets**: Introduced after 60 seconds

## Security Considerations

### Input Validation (Both Frontend & Backend)
- Player names: 1-20 characters, alphanumeric + Korean + limited special chars
- Survival time: 0-600 seconds (10 minutes max), 3 decimal precision
- Country code: 2-letter code from whitelist
- HTML escaping to prevent XSS

### Anti-Cheat Measures
- Game session validation (timestamp verification)
- Server-side time validation (realistic time ranges)
- Rate limiting on API endpoints
- Client-side validation as first layer, server as authority

## Common Tasks

### Adding New Game Feature (TDD)
1. Write failing test for the feature
2. Implement minimum code to pass test
3. Run all tests to ensure no regression
4. Refactor if needed (structural changes only)
5. Commit with clear message (structural vs behavioral)

### Adding New API Endpoint (TDD)
1. Write integration test for the endpoint
2. Implement route handler
3. Add validation logic
4. Test with various inputs (valid, invalid, edge cases)
5. Document endpoint in this file

### Modifying Database Schema
1. Write migration script
2. Update schema documentation here
3. Add/update tests for affected queries
4. Test migration on copy of production data

### Updating Translations
1. Add key to both `texts.en` and `texts.ko` in [game.js](game.js)
2. Update `updateAllTexts()` function
3. Test language toggle functionality

## External Dependencies

### Frontend
- **Google AdSense**: Ads loaded asynchronously
- **Ko-fi**: Donation button

### Backend
- **Express**: Web framework
- **SQLite3**: Database driver
- **Jest**: Testing framework
- **Supertest**: HTTP testing library

## Deployment

### Frontend (GitHub Pages)
- Automatic deployment via GitHub Actions
- Custom domain: spungs-dodge-master.com
- SSL certificate via GitHub Pages

### Backend
- Deploy to Node.js hosting service (e.g., Railway, Render, DigitalOcean)
- Environment variables: `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`
- Monthly cron job optional (system auto-filters by month)

## Important Patterns

1. **Responsive Scaling**: Use `getUIScale()` for all size calculations
2. **Mobile Detection**: `isMobile()` checks if viewport ≤768px
3. **Speed Adjustment**: `getSpeed()` applies 0.3× multiplier on mobile
4. **Time Precision**: Use `.toFixed(3)` for displaying survival times
5. **API Error Handling**: Always return consistent error format

## Next Steps for Migration

1. ✅ Update CLAUDE.md with TDD principles
2. ⏳ Create backend directory structure
3. ⏳ Write first test (database connection)
4. ⏳ Implement database initialization
5. ⏳ Write tests for API endpoints
6. ⏳ Implement API endpoints
7. ⏳ Update frontend to use local API
8. ⏳ Test end-to-end functionality
9. ⏳ Deploy backend server
10. ⏳ Update frontend CORS settings
