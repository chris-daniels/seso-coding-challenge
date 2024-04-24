"use strict";

const MinHeap = require("heap-js");

// Print all entries, across all of the *async* sources, in chronological order.

// NOTE: This solution uses a min heap to maintain the next log entry from each source in chronological order.
// Given more time, we could consider holding an entire batch of logs in memory and fetching each log in the batch in parallel.
// This would reduce the amount of time we spend waiting around for popAsync to resolve. 

module.exports = (logSources, printer) => {
  return new Promise((resolve, reject) => {
    // Maintain a min heap of the log entries. Each entry contains a log source and the latest log entry from that source. 
    // Using a heap lets us pop the smallest log entry in O(log n) time, where n is the number of log sources.
    // This way, we can then publish each new log entry in O(log n) time, instead of searching through every log source each time.
    const heap = new MinHeap.Heap((a, b) => a.log.date - b.log.date);

    // Initialize the heap with the first log entry from each source. Use Promise.all to wait for all log entries to be resolved.
    Promise.all(logSources.map(async (source) => {
      const log = await source.popAsync();
      if (log) {
        heap.push({ log, source });
      }
    })).then(() => {
      // Async function to get the next log from the heap.
      // If the heap has logs, pop the smallest log from the heap, print it, and push the next log from the same source.
      // Use async to wait for the next log to be resolved.
      // Keep calling getNextLog until the heap is empty.
      // If the heap is empty, resolve the parent promise.
      const getNextLog = async () => {
        if (heap.size() > 0) {
          const { log, source } = heap.pop();
          printer.print(log);
          const nextLog = await source.popAsync();
          if (nextLog) {
            heap.push({ log: nextLog, source });
          }
          getNextLog();
        } else {
          resolve(console.log("Async sort complete."));
          printer.done();
        }
      };

      // Get the first log from the heap. This will start the process of printing logs in chronological order.
      getNextLog();
    });
  });
};
