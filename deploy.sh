#!/bin/bash
# declare an array called array and define 3 vales
declare -a folders=( "frontend" "backend" "jobs" )
for folder in "${folders[@]}"
do
    echo $folder
    cd $folder
    if [ $folder == "jobs" ]
    then
        docker build . -t ibmcom/backend-job && docker push ibmcom/backend-job
    else
        docker build . -t ibmcom/$folder && docker push ibmcom/$folder
    fi
    cd ..
done
