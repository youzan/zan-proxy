#!/bin/bash

projectPath=`pwd`
RED='\033[0;31m'
NC='\033[0m'
LGREEN='\033[1;32m'
my_dir="$(dirname "$0")"

# cd to hooks folder
cd ./.felint/hooks

printf '\n========== init hook ==========\n'
hooks="${projectPath}/.git/hooks/"
rm -f "${hooks}/pre-commit" "${hooks}/pre-push" "${hooks}/commit-msg"
ln -s ../../.felint/hooks/pre-commit "$hooks"
ln -s ../../.felint/hooks/pre-push "$hooks"
ln -s ../../.felint/hooks/pre-commit "$hooks"
printf '\n========== chmod hook ==========\n'
chmod -R a+x $hooks
printf '\n========== chmod hook done ==========\n'

printf '\n========== init hook done ==========\n'

printf '\n========== ALL DONE, THANKS\n'
