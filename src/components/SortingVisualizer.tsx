"use client";

import { useRef, useEffect } from 'react';
import P5 from 'p5';
import * as Tone from 'tone';

type Theme = 'default' | 'tree' | 'space';
type Algorithm = 'bubble' | 'quick' | 'merge' | 'heap' | 'selection' | 'insertion';

interface SortingVisualizerProps {
  theme: Theme;
  algorithm: Algorithm;
  speed: number;
  size: number;
  start: boolean;
  reset: boolean;
  onResetComplete: () => void;
}

const SortingVisualizer: React.FC<SortingVisualizerProps> = ({ theme, algorithm, speed, size, start, reset, onResetComplete }) => {
  const sketchRef = useRef<HTMLDivElement>(null);
  let values: number[] = [];
  let i = 0;
  let j = 0;
  let frameCount = 0;
  let states: any[] = [];
  let heapSize = 0;
  let synth: Tone.Synth | null = null;
  let lastSoundTime = 0;

  const sketch = (p: P5) => {
    p.setup = () => {
      const width = sketchRef.current?.clientWidth || 300;
      const height = Math.min(400, window.innerHeight * 0.6);
      p.createCanvas(width, height);
      resetArray(p);
      Tone.start().then(() => {
        synth = new Tone.Synth().toDestination();
      });
    };

    p.windowResized = () => {
      const width = sketchRef.current?.clientWidth || 300;
      const height = Math.min(400, window.innerHeight * 0.6);
      p.resizeCanvas(width, height);
      resetArray(p);
    };

    p.draw = () => {
      frameCount++;
      drawScene(p);

      if (!start || frameCount % speed !== 0) return;

      if (reset) {
        resetArray(p);
        onResetComplete();
        return;
      }

      switch (algorithm) {
        case 'bubble': bubbleSortStep(p); break;
        case 'quick': quickSortStep(p); break;
        case 'merge': mergeSortStep(p); break;
        case 'heap': heapSortStep(p); break;
        case 'selection': selectionSortStep(p); break;
        case 'insertion': insertionSortStep(p); break;
      }
    };

    const resetArray = (p: P5) => {
      values = new Array(size);
      for (let k = 0; k < values.length; k++) {
        values[k] = theme === 'default' ? p.random(50, p.height - 50) : p.random(10, p.height * 0.15);
      }
      i = 0;
      j = 0;
      states = [];
      heapSize = size;
      lastSoundTime = 0;
      frameCount = 0; // Reset frame count to prevent immediate sorting
    };

    const playSound = (value: number) => {
      if (synth) {
        const freq = p.map(value, 0, p.height, 200, 800);
        const now = Tone.now();
        const scheduledTime = Math.max(now, lastSoundTime + 0.05);
        synth.triggerAttackRelease(freq, '8n', scheduledTime);
        lastSoundTime = scheduledTime;
      }
    };

    const bubbleSortStep = (p: P5) => {
      if (i < values.length - 1) {
        if (j < values.length - i - 1) {
          if (values[j] > values[j + 1]) {
            [values[j], values[j + 1]] = [values[j + 1], values[j]];
            playSound(values[j]);
          }
          j++;
        } else {
          j = 0;
          i++;
        }
      }
    };

    const quickSortStep = (p: P5) => {
      if (states.length === 0) states = [{ low: 0, high: values.length - 1 }];
      if (i < states.length) {
        const { low, high } = states[i];
        if (low < high) {
          let pivot = values[high];
          let partitionIndex = low;
          for (let k = low; k < high; k++) {
            if (values[k] <= pivot) {
              [values[partitionIndex], values[k]] = [values[k], values[partitionIndex]];
              playSound(values[partitionIndex]);
              partitionIndex++;
            }
          }
          [values[partitionIndex], values[high]] = [values[high], values[partitionIndex]];
          playSound(values[partitionIndex]);
          states[i] = { low, high: -1 }; // Mark as done
          if (partitionIndex - 1 > low) states.push({ low, high: partitionIndex - 1 });
          if (partitionIndex + 1 < high) states.push({ low: partitionIndex + 1, high });
          i++;
        } else {
          i++;
        }
      }
    };

    const mergeSortStep = (p: P5) => {
      if (states.length === 0) {
        states = [[...values]];
        let step = 1;
        while (step < values.length) {
          for (let start = 0; start < values.length; start += step * 2) {
            const mid = Math.min(start + step, values.length);
            const end = Math.min(start + step * 2, values.length);
            states.push(merge(values.slice(start, mid), values.slice(mid, end), start, end));
          }
          step *= 2;
        }
      }
      if (i < states.length - 1) {
        values = [...states[i]];
        playSound(values[Math.min(j, values.length - 1)]);
        j = (j + 1) % values.length;
        if (j === 0) i++;
      }
    };

    const merge = (left: number[], right: number[], start: number, end: number) => {
      const result = [...values];
      let l = 0, r = 0, k = start;
      while (l < left.length && r < right.length) {
        result[k++] = left[l] <= right[r] ? left[l++] : right[r++];
      }
      while (l < left.length) result[k++] = left[l++];
      while (r < right.length) result[k++] = right[r++];
      return result;
    };

    const heapSortStep = (p: P5) => {
      if (states.length === 0) {
        heapSize = values.length;
        for (let k = Math.floor(heapSize / 2) - 1; k >= 0; k--) heapify(p, k, heapSize);
        states = [[...values]];
      }
      if (i < values.length - 1) {
        [values[0], values[heapSize - 1]] = [values[heapSize - 1], values[0]];
        playSound(values[0]);
        heapSize--;
        heapify(p, 0, heapSize);
        states.push([...values]);
        i++;
      }
    };

    const heapify = (p: P5, index: number, size: number) => {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < size && values[left] > values[largest]) largest = left;
      if (right < size && values[right] > values[largest]) largest = right;
      if (largest !== index) {
        [values[index], values[largest]] = [values[largest], values[index]];
        playSound(values[index]);
        heapify(p, largest, size);
      }
    };

    const selectionSortStep = (p: P5) => {
      if (i < values.length - 1) {
        let minIndex = i;
        if (j <= values.length - 1) {
          if (values[j] < values[minIndex]) minIndex = j;
          j++;
        }
        if (j > values.length - 1) {
          if (minIndex !== i) {
            [values[i], values[minIndex]] = [values[minIndex], values[i]];
            playSound(values[i]);
          }
          i++;
          j = i + 1;
        }
      }
    };

    const insertionSortStep = (p: P5) => {
      if (i < values.length) {
        if (j > 0 && values[j - 1] > values[j]) {
          [values[j - 1], values[j]] = [values[j], values[j - 1]];
          playSound(values[j]);
          j--;
        } else {
          i++;
          j = i;
        }
      }
    };

    const drawScene = (p: P5) => {
      switch (theme) {
        case 'space': drawSpace(p); break;
        case 'default': drawDefault(p); break;
        case 'tree': drawTree(p); break;
      }
    };

    const drawSpace = (p: P5) => {
      p.background(20, 20, 50);
      const spacing = p.width / values.length;
      for (let k = 0; k < values.length; k++) {
        p.fill(255, 255, 200);
        p.circle(k * spacing + spacing / 2, p.height - values[k], spacing * 0.8);
        if (k === j || k === j - 1 || (algorithm === 'selection' && k === i)) {
          p.fill(255, 100, 100, 180);
          p.circle(k * spacing + spacing / 2, p.height - values[k], spacing);
        }
      }
    };

    const drawDefault = (p: P5) => {
      p.background(50, 50, 70);
      const barWidth = p.width / values.length;
      for (let k = 0; k < values.length; k++) {
        p.fill(p.map(k, 0, values.length, 100, 255), 150, 200);
        p.rect(k * barWidth, p.height - values[k], barWidth - 2, values[k], 5);
        if (k === j || k === j - 1 || (algorithm === 'selection' && k === i)) {
          p.fill(255, 100, 100, 180);
          p.rect(k * barWidth, p.height - values[k], barWidth - 2, values[k], 5);
        }
      }
    };

    const drawTree = (p: P5) => {
      p.background(100, 150, 200);
      p.fill(139, 69, 19);
      p.rect(0, p.height - 50, p.width, 50);
      const treeSpacing = p.width / values.length;
      for (let k = 0; k < values.length; k++) {
        p.fill(34, 139, 34);
        p.triangle(
          k * treeSpacing + treeSpacing / 2 - values[k] / 2, p.height - 50,
          k * treeSpacing + treeSpacing / 2 + values[k] / 2, p.height - 50,
          k * treeSpacing + treeSpacing / 2, p.height - 50 - values[k]
        );
        if (k === j || k === j - 1 || (algorithm === 'selection' && k === i)) {
          p.fill(255, 215, 0, 180);
          p.triangle(
            k * treeSpacing + treeSpacing / 2 - values[k] / 2, p.height - 50,
            k * treeSpacing + treeSpacing / 2 + values[k] / 2, p.height - 50,
            k * treeSpacing + treeSpacing / 2, p.height - 50 - values[k]
          );
        }
      }
    };
  };

  useEffect(() => {
    if (sketchRef.current) {
      const p5Instance = new P5(sketch, sketchRef.current);
      return () => {
        p5Instance.remove();
        if (synth) synth.dispose();
      };
    }
  }, [theme, algorithm, speed, size, start, reset]);

  return <div ref={sketchRef} className="w-full border-4 border-gradient-to-r from-cyan-500 to-purple-500 rounded-xl shadow-2xl overflow-hidden" />;
};

export default SortingVisualizer;