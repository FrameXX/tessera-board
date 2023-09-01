export function getRandomNumber(min: number, max: number) {
  var number = Math.round(Math.random() * (max + 1 - min) + (min - 0.5)) * 1;
  return number === -0 ? 0 : number;
}

export function getRandomId(chars: number = 8) {
  const consonants = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "z",
  ];
  const vowels = ["a", "e", "i", "o", "u", "y"];
  let useConsonant = Boolean(getRandomNumber(0, 1));
  let id = "";
  for (let i = 0; i < chars; i++) {
    if (useConsonant) {
      id = id + consonants[getRandomNumber(0, consonants.length - 1)];
    } else {
      id = id + vowels[getRandomNumber(0, vowels.length - 1)];
    }
    useConsonant = !useConsonant;
  }
  return id;
}

export function capitalizeFirst(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}
