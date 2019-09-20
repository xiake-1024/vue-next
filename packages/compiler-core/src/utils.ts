import { SourceLocation, Position } from './ast'

export function getInnerRange(
  loc: SourceLocation,
  offset: number,
  length?: number
): SourceLocation {
  const source = loc.source.substr(offset, length)
  const newLoc: SourceLocation = {
    source,
    start: advancePositionBy(loc.start, loc.source, offset),
    end: loc.end
  }

  if (length != null) {
    newLoc.end = advancePositionBy(loc.start, loc.source, offset + length)
  }

  return newLoc
}

export function advancePositionBy(
  pos: Position,
  source: string,
  numberOfCharacters: number
): Position {
  return advancePositionWithMutation({ ...pos }, source, numberOfCharacters)
}

// advance by mutation without cloning (for performance reasons), since this
// gets called a lot in the parser
export function advancePositionWithMutation(
  pos: Position,
  source: string,
  numberOfCharacters: number
): Position {
  __DEV__ && assert(numberOfCharacters <= source.length)

  let linesCount = 0
  let lastNewLinePos = -1
  for (let i = 0; i < numberOfCharacters; i++) {
    if (source.charCodeAt(i) === 10 /* newline char code */) {
      linesCount++
      lastNewLinePos = i
    }
  }

  pos.offset += numberOfCharacters
  pos.line += linesCount
  pos.column =
    lastNewLinePos === -1
      ? pos.column + numberOfCharacters
      : Math.max(1, numberOfCharacters - lastNewLinePos - 1)

  return pos
}

export function assert(condition: boolean, msg?: string) {
  if (!condition) {
    throw new Error(msg || `unexpected parser condition`)
  }
}