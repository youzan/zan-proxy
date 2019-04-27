export default function isJson(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
