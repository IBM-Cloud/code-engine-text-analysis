#!/bin/bash
# declare an array called array and define 3 vales
declare -a folders=( "frontend" "backend" "jobs" )
for folder in "${folders[@]}"
do
    echo $folder
    cd $folder
    if [ $folder == "jobs" ]
    then
        docker build . -t $1/backend-job && docker push $1/backend-job
    else
        docker build . -t $1/$folder && docker push $1/$folder
    fi
    cd ..
done
