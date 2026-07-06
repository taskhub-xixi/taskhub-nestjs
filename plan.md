# Code Review Plan — Auth, User, Order Modules

## 1. Auth Module (`src/auth/`)

### Controller (`auth.controller.ts`)
- `console.log(cookie)` at verify endpoint → ganti dengan logger
- `resetPassword` throws `"Something Wrong"` tanpa detail → pakai pesan deskriptif
- Endpoint `reset` seharusnya `reset-password`, `delete` sebaiknya `DELETE` method + params
- Cookie `refresh_token` diambil manual via `req.cookies` → pakai `@Cookie()` custom decorator

### Service (`auth.service.ts`)
- **Inconsistent DB access**: `$executeRaw` untuk insert user, campur dengan `findUnique` → konsisten pakai Prisma `create`
- **Duplicate check**: `resetPassword()` cek `data === null` lalu `data?.email === null` → redundant
- **Dead query**: `delete()` make sure dengan `findUnique` ulang → buang, Prisma `delete` sudah return error
- **Misplaced methods**: `validateUser`, `checkRole`, `getUserByEmail` logic guard campur di service → pindah ke provider terpisah
- Hardcoded bcrypt `rounds=12` di `token.service.ts` → bikin constant

### Module (`auth.module.ts`)
- `JwtModule` global:true tapi `JwtService` tetap di-provide & export → redundant
- `useFactory` pakai `process.env.JWT_SECRET` instead of injected `config` → inconsistent

### Token Service (`token.service.ts`)
- `updateRtHashDatabase` punya 2 behavior beda berdasarkan ada/tidaknya `exp` parameter → refactor jadi 2 method jelas
- Query `ON DUPLICATE KEY UPDATE` → MySQL-specific, kurang portable

### Repository (`auth.repository.ts`)
- Hanya return string SQL hardcoded dengan field `username` yang tidak sesuai schema → hapus atau implementasi bener
- Comment `// LATER` → incomplete, hapus saja

### Interface (`interface/`)
- Nama folder `interface/` → seharusnya `interfaces/` (plural)
- File `dto/payload-interface.ts` berisi interface → pindah ke `interfaces/`

### DTO / Model (`src/model/auth.model.ts`)
- ~100 line commented-out code → hapus
- `UpdateDTO`: `@Min(8)` / `@Max(100)` pada string field → ganti `@MinLength`/`@MaxLength`
- `CookiePayload` pakai `@IsEmpty()` → terbalik, harus `@IsNotEmpty()` atau `@IsString()`

---

## 2. User Module (`src/user/`)

### Controller (`user.controller.ts`)
- **Guard stacking berlebihan**: setiap route punya 5 decorator guard
  - `@Admin()` dan `@Public()` bersamaan → contradictory
  - Refactor: buat composite guard atau guard yang handle multiple roles
- `getUserById` pakai `@Req()` untuk ambil params → harus `@Param('id')`
- Controller `implements IUserRepository` tapi signature method tidak cocok (parameter beda)

### Service (`user.service.ts`)
- **Hardcoded skip**: `skipPage = page * 10` → harusnya `(page - 1) * limit`
- `getUserById` panggil `findUnique` dulu, baru `$queryRaw` ulang → redundant, cukup 1 query
- **Pagination logic fragile**: rumit dan susah dibaca → simplify

### Module (`user.module.ts`)
- **Controller sebagai provider**: `{ provide: IUserRepository, useClass: UserController }` → controller TIDAK boleh didaftarkan sebagai provider
  - Hapus `IUserRepository` binding, controller tidak perlu di-inject
- Import `AuthModule` → potensi circular dependency, pastikan perlu

### Interfaces
- `IUserRepository` signature tidak match dengan implementasi di controller → sinkronkan atau hapus abstraction tak berguna

---

## 3. Order Module (`src/order/`)

### Controller (`order.controller.ts`)
- `getOrderByOrderNumber` pakai `@Req()` → harus `@Param('id')`
- `getOrderWithCoupons()` method public tanpa route handler → pindah ke service saja
- Tidak ada DTO binding / ValidationPipe di endpoints → tambahkan

### Service (`order.service.ts`)
- **Inconsistent DB**: campur Prisma `create`/`findMany`/`findFirst` dengan raw `$queryRaw` → pilih salah satu
- `createOrder` return `items` sebagai object tunggal, tapi response type menyatakan array → fix type
- `getAllOrders` TANPA filter user → security issue, bocorin semua order
- `getOrderById` panggil 3 query terpisah → bisa 1 query JOIN
- `getOrderWithCoupons` return `unknown` tanpa type → tambahkan return type

### Model (`order.model.ts`)
- 213 lines terlalu besar → pisah per file: `order.dto.ts`, `order-response.ts`, `order-query.ts`
- `CreateOrderRequest.shippingAddress` pakai `@IsOptional()` tapi `!` (required) → inconsistent
- `GetOrderRequestService.params.id` coupling ke Express `req.params` → harus plain DTO terpisah
- `GetAllOrderResponse` definisi nested type inline → reuse `OrderResponse` partial

### Module (`order.module.ts`)
- Tidak ada guard global → tambahkan JwtAuthGuard di level controller/module
- Tidak import shared module (AuthModule, UserModule) jika diperlukan

---

## 4. Cross-Cutting Issues

### Keamanan
- **Logging data sensitif**: `logger.info(JSON.stringify(request))` di auth service bisa log password
- **No rate limiting di endpoint sensitif** login/register (meski ThrottlerGuard global sudah ada)
- `getAllOrders` tanpa filter user → data leak

### Architecture
- **Model terpusat**: semua model di `src/model/` → splinter per module lebih baik (domain-driven)
- **Naming**: `src/model/web.mode.ts` → typo, harus `web.model.ts`
- **Global ValidationPipe**: belum kelihatan dipasang → tambahkan di main.ts
- **Naming inconsistency**: `first_name` (DB/response) vs `firstname` (DTO) → pilih standar (camelCase)

### Code Quality
- **Commented-out code**: 100+ lines di `auth.model.ts`, comment block di jwt-auth.guard.ts → hapus
- **Magic numbers**: `10` (skipPage), `12` (bcrypt rounds)
- **Missing types**: `getOrderWithCoupons` return `unknown`
- **Dead code**: `AuthRepositorySQL` hampir tidak terpakai, hanya return string

### Testing
- Tidak ada test files untuk ketiga module → tambahkan unit test & e2e test

---

## Prioritas Perbaikan

| Priority | Item | Module |
|----------|------|--------|
| 🔴 High | `getAllOrders` security leak | Order |
| 🔴 High | Controller sebagai provider | User |
| 🔴 High | Global ValidationPipe missing | All |
| 🔴 High | Guard contradictory (`@Admin` + `@Public`) | User |
| 🟡 Medium | Inconsistent Prisma vs raw SQL | Auth, Order |
| 🟡 Medium | `@Req()` for params → `@Param()` | User, Order |
| 🟡 Medium | Hardcoded magic numbers | Auth, User |
| 🟡 Medium | Model typo `web.mode.ts` | Global |
| 🟢 Low | Commented-out code cleanup | Auth |
| 🟢 Low | Folder naming `interface/` → `interfaces/` | Auth |
| 🟢 Low | `AuthRepositorySQL` dead code | Auth |
