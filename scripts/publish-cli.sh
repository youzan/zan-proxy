#!/bin/bash

cacheDir=".publish-cli"

rm -rf $cacheDir
mkdir $cacheDir
for dir in dist site static resource
do
  cp -R $dir $cacheDir
done
cp package.cli.json $cacheDir/package.json

npm publish

rm -rf $cacheDir
