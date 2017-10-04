#!/bin/sh
npm install -g yarn || exit 1 &&
yarn install || exit 2
