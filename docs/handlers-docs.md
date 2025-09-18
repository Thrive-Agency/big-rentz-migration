# Handler Usage Documentation

This document describes how to use the available handlers in `app/callback-functions.js` for mapping and preprocessing data during import.

## Handler Format in Mapping

Handlers are defined in your mapping JSON as an array:

```
"handler": ["handlerName", { /* handler arguments */ }]
```

- `handlerName`: The name of the callback function to use.
- Handler arguments: An object containing named parameters for the handler.

---

## Available Handlers

### 1. `uppercase`
**Description:** Converts a string value to uppercase.
**Usage in mapping:**
```
"handler": ["uppercase"]
```
**Example:**
```js
// Input: "hello world"
// Output: "HELLO WORLD"
```

---

### 2. `trim`
**Description:** Trims whitespace from the beginning and end of a string value.
**Usage in mapping:**
```
"handler": ["trim"]
```
**Example:**
```js
// Input: "  hello world  "
// Output: "hello world"
```

---

### 3. `getTaxonomyTermId`
**Description:** Looks up a WordPress taxonomy term ID by value and taxonomy slug.
**Usage in mapping:**
```
"handler": ["getTaxonomyTermId", { "taxonomy": "state" }]
```
**Example:**
```js
// Input: value = "California", args = { taxonomy: "state" }
// Output: 123 (WordPress term ID for California)
```

---

## How to Add a Handler

1. Define your handler function in `app/callback-functions.js`.
2. Document its usage and arguments in this file.
3. Reference the handler in your mapping JSON as shown above.

## Notes
- Handler arguments should be an object for clarity and future flexibility.
- Handlers can be synchronous or asynchronous (return a Promise).
- The mapping system will pass the value, the full record, and the handler arguments to your handler.

---

For further examples or custom handler requests, update this file and the handler definitions in `app/callback-functions.js`.
