import { spawn } from 'node:child_process';
import { env } from '../config/env.js';

class FfmpegCommand {
  constructor(input) {
    this.input = input;
    this.extraArgs = [];
    this.outputFile = '';
    this.handlers = {};
  }

  outputOptions(options = []) {
    this.extraArgs.push(...options);
    return this;
  }

  output(file) {
    this.outputFile = file;
    return this;
  }

  on(event, handler) {
    this.handlers[event] = handler;
    return this;
  }

  run() {
    const args = ['-y', '-i', this.input, ...this.extraArgs, this.outputFile];
    const child = spawn(env.ffmpeg.path, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      this.handlers.error?.(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        this.handlers.end?.();
        return;
      }

      const error = new Error(stderr || `ffmpeg exited with code ${code}`);
      this.handlers.error?.(error);
    });

    return child;
  }
}

export default function ffmpeg(input) {
  return new FfmpegCommand(input);
}
