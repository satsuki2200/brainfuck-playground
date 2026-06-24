export const TAPE_SIZE = 30000;
export const MAX_STEPS = 1_000_000;

export interface BFState {
  tape: number[];
  pointer: number;
  instrPointer: number;
  inputBuffer: string;
  inputIndex: number;
  output: string;
  steps: number;
  status: "idle" | "running" | "paused" | "done" | "error";
  errorMessage?: string;
}

export function createInitialState(input: string = ""): BFState {
  return {
    tape: new Array(TAPE_SIZE).fill(0),
    pointer: 0,
    instrPointer: 0,
    inputBuffer: input,
    inputIndex: 0,
    output: "",
    steps: 0,
    status: "idle",
  };
}

export function buildJumpMap(code: string): Map<number, number> | string {
  const map = new Map<number, number>();
  const stack: number[] = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === "[") {
      stack.push(i);
    } else if (code[i] === "]") {
      if (stack.length === 0) return `Unmatched ] at position ${i}`;
      const open = stack.pop()!;
      map.set(open, i);
      map.set(i, open);
    }
  }
  if (stack.length > 0) return `Unmatched [ at position ${stack[stack.length - 1]}`;
  return map;
}

export function stepBF(
  state: BFState,
  code: string,
  jumpMap: Map<number, number>
): BFState {
  if (state.status === "done" || state.status === "error") return state;

  const ip = state.instrPointer;
  if (ip >= code.length) {
    return { ...state, status: "done" };
  }

  if (state.steps >= MAX_STEPS) {
    return { ...state, status: "error", errorMessage: `最大ステップ数 (${MAX_STEPS.toLocaleString()}) に達しました。無限ループの可能性があります。` };
  }

  const tape = [...state.tape];
  let pointer = state.pointer;
  let instrPointer = ip;
  let output = state.output;
  let inputIndex = state.inputIndex;

  const cmd = code[instrPointer];

  switch (cmd) {
    case ">":
      pointer = (pointer + 1) % TAPE_SIZE;
      break;
    case "<":
      pointer = (pointer - 1 + TAPE_SIZE) % TAPE_SIZE;
      break;
    case "+":
      tape[pointer] = (tape[pointer] + 1) % 256;
      break;
    case "-":
      tape[pointer] = (tape[pointer] - 1 + 256) % 256;
      break;
    case ".":
      output += String.fromCharCode(tape[pointer]);
      break;
    case ",": {
      const ch = state.inputBuffer[inputIndex];
      tape[pointer] = ch !== undefined ? ch.charCodeAt(0) : 0;
      inputIndex++;
      break;
    }
    case "[":
      if (tape[pointer] === 0) {
        instrPointer = jumpMap.get(instrPointer) ?? instrPointer;
      }
      break;
    case "]":
      if (tape[pointer] !== 0) {
        instrPointer = jumpMap.get(instrPointer) ?? instrPointer;
      }
      break;
  }

  instrPointer++;
  const done = instrPointer >= code.length;

  return {
    ...state,
    tape,
    pointer,
    instrPointer,
    inputIndex,
    output,
    steps: state.steps + 1,
    status: done ? "done" : "paused",
  };
}

export function runBF(
  state: BFState,
  code: string,
  jumpMap: Map<number, number>,
  maxSteps: number = MAX_STEPS
): BFState {
  let current: BFState = { ...state, status: "running" };
  let remaining = maxSteps - current.steps;
  while (remaining > 0 && current.instrPointer < code.length) {
    current = stepBF(current, code, jumpMap);
    if (current.status === "error" || current.status === "done") break;
    remaining--;
  }
  return current;
}
