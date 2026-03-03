function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      out[key] = cloneValue(nested);
    }
    return out;
  }
  return value;
}

function mergeInto(target, source) {
  if (!isPlainObject(source)) return target;

  for (const [key, value] of Object.entries(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      target[key] = value.map(cloneValue);
      continue;
    }

    if (isPlainObject(value)) {
      const current = isPlainObject(target[key]) ? target[key] : {};
      target[key] = mergeInto({ ...current }, value);
      continue;
    }

    target[key] = value;
  }

  return target;
}

// Deep-merge plain objects, skip undefined values, and replace arrays by source value.
export function deepMergeDefined(...sources) {
  const out = {};
  for (const source of sources) {
    mergeInto(out, source);
  }
  return out;
}
