"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomOTPGenerator = void 0;
const randomOTPGenerator = (min, max) => Math.floor(Math.random() * (max - min)) + min;
exports.randomOTPGenerator = randomOTPGenerator;
