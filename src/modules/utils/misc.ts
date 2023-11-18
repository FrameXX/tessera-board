import type { BoardPosition } from "../board_manager";

export function getRandomNumber(min: number, max: number) {
  const number = Math.round(Math.random() * (max + 1 - min) + (min - 0.5)) * 1;
  return number + 0;
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

export interface MinSecTime {
  mins: number;
  secs: number;
}

export function getMinsAndSecsTime(secs: number): MinSecTime {
  const mins = Math.trunc(secs / 60);
  const secsRest = secs % 60;
  return { mins, secs: secsRest };
}

export function getDigitStr(number: number, digits: number = 2) {
  let str = number.toString();
  while (str.length < digits) {
    str = "0" + str;
  }
  return str;
}

export function sumPositions(
  pos1: BoardPosition,
  pos2: BoardPosition
): BoardPosition {
  return { row: pos1.row + pos2.row, col: pos1.col + pos2.col };
}

export function isEven(number: number) {
  return number % 2 === 0;
}

export function getPixelsPerCm() {
  const el = document.createElement("div");
  el.style.width = "1cm";
  el.style.height = "1cm";
  const body = document.getElementsByTagName("body")[0];
  body.append(el);
  const pixelsPerCm = el.offsetWidth;
  el.remove();
  return pixelsPerCm;
}

export function getRandomArrayValue<T>(array: T[]) {
  return array[getRandomNumber(0, array.length - 1)];
}
