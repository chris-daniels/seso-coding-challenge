"use strict";

// Print all entries, across all of the sources, in chronological order.

const MinHeap = require("heap-js");

module.exports = (logSources, printer) => {
  // Maintain a min heap of the log entries. Each entry contains a log source and the latest log entry from that source. 
  // Using a heap lets us pop the smallest log entry in O(log n) time, where n is the number of log sources.
  // This way, we can then publish each new log entry in O(log n) time, instead of searching through every log source each time.
  const heap = new MinHeap.Heap((a, b) => a.log.date - b.log.date);

  // Initialize the heap with the first log entry from each source
  logSources.forEach((source) => {
    const log = source.pop();
    if (log) {
      heap.push({ log, source });
    }
  });

  // Pop the smallest log from the heap, print it, and push the next log from the same source.
  while (heap.size() > 0) {
    const { log, source } = heap.pop();
    printer.print(log);
    const nextLog = source.pop();
    if (nextLog) {
      heap.push({ log: nextLog, source });
    }
  }
  printer.done();

  return console.log("Sync sort complete.");
};
