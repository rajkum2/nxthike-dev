# NxtHike Android (Kotlin)

Native Android client for the NxtHike portal + **Hiring CRM**, wired to the FastAPI backend under `BE/`.

## Architecture

| Layer | Pattern |
|-------|---------|
| **Presentation** | Jetpack Compose + MVVM (`ViewModel` + `UiState`) |
| **Domain** | Repository interfaces + single-responsibility use boundaries |
| **Data** | Retrofit APIs, Moshi DTOs, Repository implementations, DataStore session |
| **DI** | Hilt (`@HiltViewModel`, modules) |
| **Errors** | `AppResult` railway / functional result type |
| **Auth** | Bearer JWT via `AuthInterceptor` + DataStore |

```
presentation/  → screens, ViewModels, navigation, theme
domain/        → repository contracts
data/          → api, dto, repositories, TokenStore
di/            → NetworkModule, RepositoryModule
core/          → AppResult, helpers
```

## Features & screens

- **Auth** — login, register, profile edit, logout  
- **Home** — module launcher  
- **Jobs** — list/search/filter, detail, create/update/delete  
- **Events** — full CRUD  
- **Courses** — full CRUD  
- **Companies** — full CRUD  
- **Hiring CRM** — dashboard stats, candidates list/search/filter, candidate detail (status pipeline, star), create/edit/delete, roles CRUD  
- **Admin stats** — `/api/dashboard/stats`  

All list/detail/write paths call the live FastAPI routes under `/api/*`.

## Backend mapping

| App area | API |
|----------|-----|
| Auth | `POST /api/auth/login`, `register`, `GET/PATCH /api/auth/me` |
| Jobs | `GET/POST /api/jobs`, `GET/PUT/DELETE /api/jobs/{id}` |
| Events | `/api/events` |
| Courses | `/api/courses` |
| Companies | `/api/companies` |
| Hiring | `/api/hiring/*` (admin JWT required) |
| Dashboard | `GET /api/dashboard/stats` (admin) |

## Setup

**Default backend is production:** `https://api.nxthike.com/`  
(same host as `https://api.nxthike.com/api/jobs`, etc.)

1. Open **`mobile/`** in Android Studio, or:
   ```bash
   cd mobile && ./gradlew assembleDebug
   # APK → app/build/outputs/apk/debug/app-debug.apk  (also mobile/dist/)
   ```
2. Optional local BE override:
   ```bash
   ./gradlew assembleDebug -PapiBaseUrl=http://10.0.2.2:8010/      # emulator
   ./gradlew assembleDebug -PapiBaseUrl=http://192.168.x.x:8010/  # LAN
   ```

### Admin / Hiring

| Email | `admin@nxthike.com` |
| Password | `admin123` |

(Production API accepts these; same as `BE/.env`.)

## Interview pipeline data

`Interviews.xlsx` is imported into Hiring CRM as role **Interview Pipeline** via:

```bash
cd BE && python -c "import asyncio; from app.import_internshala_listings import import_interviews; asyncio.run(import_interviews())"
```

## Design patterns used

1. **Clean Architecture** — presentation / domain / data boundaries  
2. **MVVM** — Compose observes `StateFlow` from ViewModels  
3. **Repository** — single data access surface per aggregate  
4. **Dependency Injection** — Hilt singleton graph  
5. **Interceptor** — cross-cutting auth headers  
6. **Result type** — no exception-driven control flow at UI boundary  
7. **Unidirectional UI state** — `UiState<T>` sealed hierarchy  
8. **Session store** — DataStore as token SSoT  

## Project path

```
mobile/
  app/src/main/java/com/nxthike/android/
  README.md
```
