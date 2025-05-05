type ObjectWStrings = {
  [key: string]: string;
}

export function swapKeyValueStrings(data: ObjectWStrings): ObjectWStrings {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [value, key])
  );
}
