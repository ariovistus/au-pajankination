#!/bin/sh
mkdir /root/tmploc  
tsc -d -p . --outDir /root/tmploc  
A=`pwd`
cd /root/tmploc
find . -name \*.d.ts | cpio -pdm $A
