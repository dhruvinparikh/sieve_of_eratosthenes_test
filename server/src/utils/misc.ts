// Get the port that Express should be listening on
export function getListeningPort(): number {
  const port = parseInt(process.env.PORT || "3000", 10);
  return port;
}

export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

// Returns median numbers/s
export function median(values: Array<number>): Array<number> {
  const result = [];
  if (values.length === 0) {
    result[0] = 0;
    return result;
  }

  values.sort(function (a, b) {
    return a - b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2) {
    result[0] = values[half];
    return result;
  }
  result[0] = values[half - 1];
  result[1] = values[half];
  return result;
}
