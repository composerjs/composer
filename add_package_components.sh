#!/usr/bin/env bash

components=(".npmrc" ".nvmrc" "tsconfig.json")

for dir in $(find packages ! -path packages -maxdepth 1 -type d); do
  for component in ${components[@]}; do
    cp ./${component} ${dir}/${component}
  done
done
