export function saveObject(key: string, object: Object): void
{
  const json = JSON.stringify(object);
  const b64 = btoa(json);
  window.localStorage.setItem(key, b64);
}

export function loadObject(key: string): Object
{
  const b64 = window.localStorage.getItem(key);
  if (!b64)
  {
    return {};
  }
  const json = atob(b64);
  return JSON.parse(json);
}