#!/bin/bash


N=10

for f in $(ls ./.metros_all);
do
  gzip -cd .metros_all/$f | head -n $N | gzip -c > .metros_sub/$f
done
