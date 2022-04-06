/*
  JWildfire Swan - fractal flames the playful way, GPU accelerated
  Copyright (C) 2021-2022 Andreas Maschke

  This is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
  General Public License as published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License along with this software;
  if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
*/

export interface ExampleFlame {
  title: string;
  name: string;
  caption: string;
  description?: string;
  modified: Date;
  tags: string[];
}

export enum SortOrder {
  NEWEST_FIRST,
  OLDEST_FIRST,
  RANDOM
}

export const parseExampleFlame=(example: string): ExampleFlame | undefined => {
  try {
    return JSON.parse(example)
  }
  catch(error) {
    console.log('Error parsing example', example)
    return undefined
  }
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffle = (array: ExampleFlame[]) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export const sortExamples = (examples: ExampleFlame[], sortOrder: SortOrder) => {
  console.log("SORT", sortOrder)
  switch (sortOrder) {
    case SortOrder.RANDOM:
      return shuffle([...examples])
    case SortOrder.NEWEST_FIRST:
      return examples.sort((a, b) => -a.name.localeCompare(b.name)  )
    case SortOrder.OLDEST_FIRST:
    default:
      return examples.sort((a, b) => a.name.localeCompare(b.name)  )
  }
}
