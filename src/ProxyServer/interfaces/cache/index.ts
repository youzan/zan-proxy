export interface Cache {
  get(key);
  set(key, value);
  has(has): boolean;
  del(key);
}
