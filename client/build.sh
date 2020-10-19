#!bin/bash

if [ -d node_modules ] ; then
cp build/index*.html htmlDir

npm run build

rm htmlDir/index.html

mv htmlDir/*.html build

else
npm install
npm run build
fi