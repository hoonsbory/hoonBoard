#!bin/bash

if [ -d node_modules ] ; then
cp realBuildDir/index*.html htmlDir

npm run build

rm -r realBuildDir/static

rm htmlDir/index.html

mv build/* realBuildDir

mv htmlDir/*.html realBuildDir

else
npm install
npm run build
fi
