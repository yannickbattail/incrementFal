#!/bin/bash

rm -Rf temp_dir
rm incrementFal.zip
mkdir temp_dir

mkdir temp_dir/fal
cp index.html temp_dir/fal/
cp *.js temp_dir/fal/
cp -R images temp_dir/fal/
cp -R styles temp_dir/fal/

cp incrementum-ludus/json3.min.js temp_dir/

mkdir temp_dir/Engine
cp incrementum-ludus/Engine/*.js temp_dir/Engine/
mkdir temp_dir/Engine/implementations
cp incrementum-ludus/Engine/implementations/*.js temp_dir/Engine/implementations/

mkdir temp_dir/NodeUpdate
cp incrementum-ludus/NodeUpdate/NodeUpdate.js temp_dir/NodeUpdate/

echo "open file fal/index.html" >> temp_dir/readme.txt
echo "sources can be found here https://github.com/yannickbattail/incrementum-ludus" >> temp_dir/readme.txt

cd temp_dir
zip incrementFal ./*
#7z a incrementFal.zip ./
cd ..

rm -Rf temp_dir
